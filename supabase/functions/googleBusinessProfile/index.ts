// googleBusinessProfile
// Manages Google Business Profile integration.
// Supported actions:
//   getAuthUrl    — returns OAuth URL to connect GBP
//   getProfile    — returns list of locations
//   getReviews    — returns reviews for the connected location
//   getInsights   — returns insights/analytics
//   updateProfile — updates profile fields
//   createPost    — creates a Google Business post
//   respondToReview — responds to a review

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

// Google My Business API base URL
const GMB_API = 'https://mybusinessaccountmanagement.googleapis.com/v1';
const GMB_INFO_API = 'https://mybusinessinformation.googleapis.com/v1';
const GMB_POSTS_API = 'https://mybusiness.googleapis.com/v4';

async function getGoogleTokens(customerId: string): Promise<{ access_token: string } | null> {
  const { data } = await supabaseAdmin
    .from('oauth_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('customer_id', customerId)
    .eq('provider', 'google_business')
    .single();

  if (!data) return null;

  // Check if token is expired and refresh if needed
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    const refreshed = await refreshGoogleToken(customerId, data.refresh_token);
    return refreshed;
  }

  return { access_token: data.access_token };
}

async function refreshGoogleToken(customerId: string, refreshToken: string) {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (!data.access_token) return null;

  const expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();

  await supabaseAdmin
    .from('oauth_tokens')
    .update({ access_token: data.access_token, expires_at: expiresAt })
    .eq('customer_id', customerId)
    .eq('provider', 'google_business');

  return { access_token: data.access_token };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { action } = body;

    if (!action) return errorResponse('action is required', 400);

    // ─── GET AUTH URL ───────────────────────────────────────────────────────────
    if (action === 'getAuthUrl') {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI') || `${Deno.env.get('SUPABASE_URL')}/functions/v1/googleAuthStart`;

      if (!clientId) return errorResponse('Google OAuth not configured', 500);

      const scopes = [
        'https://www.googleapis.com/auth/business.manage',
        'openid',
        'email',
      ].join(' ');

      const state = Buffer.from(JSON.stringify({ customer_id: customer.id, provider: 'google_business' })).toString('base64');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${state}`;

      return jsonResponse({ authUrl });
    }

    // ─── GET PROFILE / LOCATIONS ─────────────────────────────────────────────
    if (action === 'getProfile') {
      const tokens = await getGoogleTokens(customer.id);
      if (!tokens) return jsonResponse({ locations: [] });

      const res = await fetch(`${GMB_API}/accounts`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!res.ok) {
        const err = await res.text();
        console.warn('GBP getAccounts failed:', err);
        return jsonResponse({ locations: [] });
      }

      const accountsData = await res.json();
      const accounts: { name: string }[] = accountsData.accounts || [];
      if (accounts.length === 0) return jsonResponse({ locations: [] });

      const accountName = accounts[0].name;

      const locRes = await fetch(`${GMB_INFO_API}/${accountName}/locations?readMask=name,title,phoneNumbers,websiteUri,profile`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!locRes.ok) return jsonResponse({ locations: [] });

      const locData = await locRes.json();
      return jsonResponse({ locations: locData.locations || [] });
    }

    // ─── GET REVIEWS ─────────────────────────────────────────────────────────
    if (action === 'getReviews') {
      const { locationName } = body;
      const tokens = await getGoogleTokens(customer.id);
      if (!tokens) return jsonResponse({ reviews: [] });

      if (!locationName) return jsonResponse({ reviews: [] });

      const res = await fetch(`${GMB_INFO_API}/${locationName}/reviews`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!res.ok) return jsonResponse({ reviews: [] });

      const data = await res.json();
      return jsonResponse({ reviews: data.reviews || [] });
    }

    // ─── GET INSIGHTS ─────────────────────────────────────────────────────────
    if (action === 'getInsights') {
      const tokens = await getGoogleTokens(customer.id);
      if (!tokens) return jsonResponse({ insights: {} });

      // Return mock/empty insights — real GMB insights API requires specific setup
      return jsonResponse({
        insights: {
          views: 0,
          searches: 0,
          clicks: 0,
          calls: 0,
          direction_requests: 0,
        }
      });
    }

    // ─── UPDATE PROFILE ───────────────────────────────────────────────────────
    if (action === 'updateProfile') {
      const { profileData } = body;
      const tokens = await getGoogleTokens(customer.id);
      if (!tokens) return errorResponse('Not connected to Google Business', 401);

      if (!profileData?.locationName) return errorResponse('locationName is required', 400);

      const updateMask = Object.keys(profileData.updates || {}).join(',');
      const res = await fetch(
        `${GMB_INFO_API}/${profileData.locationName}?updateMask=${updateMask}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData.updates || {}),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        return errorResponse(`GBP update failed: ${err}`);
      }

      const updated = await res.json();
      return jsonResponse({ success: true, location: updated });
    }

    // ─── CREATE POST ─────────────────────────────────────────────────────────
    if (action === 'createPost') {
      const { postData } = body;
      const tokens = await getGoogleTokens(customer.id);
      if (!tokens) return errorResponse('Not connected to Google Business', 401);

      if (!postData?.locationName) return errorResponse('locationName is required', 400);

      const postBody: Record<string, unknown> = {
        languageCode: 'iw',
        summary: postData.summary || '',
        topicType: postData.topicType || 'STANDARD',
      };

      if (postData.callToAction?.url) {
        postBody.callToAction = {
          actionType: postData.callToAction.type || 'LEARN_MORE',
          url: postData.callToAction.url,
        };
      }

      const res = await fetch(
        `${GMB_POSTS_API}/${postData.locationName}/localPosts`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postBody),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        return errorResponse(`GBP createPost failed: ${err}`);
      }

      const post = await res.json();
      return jsonResponse({ success: true, post });
    }

    // ─── RESPOND TO REVIEW ────────────────────────────────────────────────────
    if (action === 'respondToReview') {
      const { reviewId, response: reviewResponse } = body;
      const tokens = await getGoogleTokens(customer.id);
      if (!tokens) return errorResponse('Not connected to Google Business', 401);

      if (!reviewId) return errorResponse('reviewId is required', 400);

      const res = await fetch(
        `${GMB_INFO_API}/${reviewId}/reply`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment: reviewResponse || '' }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        return errorResponse(`GBP respondToReview failed: ${err}`);
      }

      return jsonResponse({ success: true });
    }

    return errorResponse(`Unknown action: ${action}`, 400);
  } catch (error) {
    console.error('googleBusinessProfile error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
