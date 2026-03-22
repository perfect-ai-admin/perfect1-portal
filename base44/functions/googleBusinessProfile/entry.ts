import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Google Business Profile API Integration (section 4.5.2 & 5.2.1)
const GBP_CLIENT_ID = Deno.env.get('GOOGLE_GBP_CLIENT_ID');
const GBP_CLIENT_SECRET = Deno.env.get('GOOGLE_GBP_CLIENT_SECRET');
const REDIRECT_URI = `${Deno.env.get('BASE44_APP_URL')}/api/gbp-callback`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'getAuthUrl':
        return handleGetAuthUrl();
      
      case 'handleCallback':
        return await handleCallback(params.code, user.id, base44);
      
      case 'getProfile':
        return await getProfile(user.id, base44);
      
      case 'updateProfile':
        return await updateProfile(user.id, params.profileData, base44);
      
      case 'createPost':
        return await createPost(user.id, params.postData, base44);
      
      case 'getReviews':
        return await getReviews(user.id, base44);
      
      case 'respondToReview':
        return await respondToReview(user.id, params.reviewId, params.response, base44);
      
      case 'getInsights':
        return await getInsights(user.id, base44);
      
      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('GBP Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function handleGetAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/business.manage'
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GBP_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  return Response.json({ authUrl });
}

async function handleCallback(code, userId, base44) {
  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GBP_CLIENT_ID,
      client_secret: GBP_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });

  const tokens = await tokenResponse.json();
  
  if (!tokens.access_token) {
    throw new Error('Failed to get access token');
  }

  // Store tokens in user record
  await base44.asServiceRole.entities.User.update(userId, {
    gbp_tokens: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000)
    }
  });

  // Get accounts and locations
  const accountsData = await makeGBPRequest('/accounts', tokens.access_token);
  const accounts = accountsData.accounts || [];
  
  let locations = [];
  if (accounts.length > 0) {
    const locationsData = await makeGBPRequest(`/${accounts[0].name}/locations`, tokens.access_token);
    locations = locationsData.locations || [];
  }

  return Response.json({ 
    success: true, 
    accounts,
    locations 
  });
}

async function getProfile(userId, base44) {
  const tokens = await getValidTokens(userId, base44);
  
  const accountsData = await makeGBPRequest('/accounts', tokens.access_token);
  const accounts = accountsData.accounts || [];
  
  if (accounts.length === 0) {
    return Response.json({ error: 'No accounts found' }, { status: 404 });
  }

  const locationsData = await makeGBPRequest(`/${accounts[0].name}/locations`, tokens.access_token);
  const locations = locationsData.locations || [];

  return Response.json({ accounts, locations });
}

async function updateProfile(userId, profileData, base44) {
  const tokens = await getValidTokens(userId, base44);
  
  // Update location profile
  const response = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${profileData.locationName}?updateMask=title,phoneNumbers,websiteUri,regularHours,profile`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData.updates)
    }
  );

  const result = await response.json();
  return Response.json({ success: true, result });
}

async function createPost(userId, postData, base44) {
  const tokens = await getValidTokens(userId, base44);
  
  const post = {
    languageCode: 'he',
    summary: postData.summary,
    callToAction: postData.callToAction ? {
      actionType: postData.callToAction.type,
      url: postData.callToAction.url
    } : undefined,
    media: postData.media ? [{
      mediaFormat: 'PHOTO',
      sourceUrl: postData.media
    }] : undefined,
    topicType: postData.topicType || 'STANDARD'
  };

  const response = await fetch(
    `https://mybusiness.googleapis.com/v4/${postData.locationName}/localPosts`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    }
  );

  const result = await response.json();
  return Response.json({ success: true, result });
}

async function getReviews(userId, base44) {
  const tokens = await getValidTokens(userId, base44);
  
  const user = await base44.entities.User.get(userId);
  const locations = user.gbp_locations || [];
  
  if (locations.length === 0) {
    return Response.json({ reviews: [] });
  }

  const reviews = await makeGBPRequest(
    `/${locations[0]}/reviews`,
    tokens.access_token
  );

  return Response.json({ reviews: reviews.reviews || [] });
}

async function respondToReview(userId, reviewId, response, base44) {
  const tokens = await getValidTokens(userId, base44);
  
  const result = await fetch(
    `https://mybusiness.googleapis.com/v4/${reviewId}/reply`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment: response })
    }
  );

  const data = await result.json();
  return Response.json({ success: true, data });
}

async function getInsights(userId, base44) {
  const tokens = await getValidTokens(userId, base45);
  
  const user = await base44.entities.User.get(userId);
  const locations = user.gbp_locations || [];
  
  if (locations.length === 0) {
    return Response.json({ insights: {} });
  }

  // Get insights for last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const insights = await makeGBPRequest(
    `/${locations[0]}/insights:report?` +
    `startDate.year=${startDate.getFullYear()}&` +
    `startDate.month=${startDate.getMonth() + 1}&` +
    `startDate.day=${startDate.getDate()}&` +
    `endDate.year=${endDate.getFullYear()}&` +
    `endDate.month=${endDate.getMonth() + 1}&` +
    `endDate.day=${endDate.getDate()}&` +
    `metrics=QUERIES_DIRECT&metrics=QUERIES_INDIRECT&metrics=VIEWS_MAPS&metrics=VIEWS_SEARCH&metrics=ACTIONS_WEBSITE&metrics=ACTIONS_PHONE`,
    tokens.access_token
  );

  return Response.json({ insights });
}

async function getValidTokens(userId, base44) {
  const user = await base44.entities.User.get(userId);
  const tokens = user.gbp_tokens;
  
  if (!tokens) {
    throw new Error('No GBP tokens found. Please connect your account.');
  }

  // Check if token expired and refresh if needed
  if (Date.now() >= tokens.expires_at) {
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GBP_CLIENT_ID,
        client_secret: GBP_CLIENT_SECRET,
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token'
      })
    });

    const newTokens = await refreshResponse.json();
    
    tokens.access_token = newTokens.access_token;
    tokens.expires_at = Date.now() + (newTokens.expires_in * 1000);
    
    await base44.asServiceRole.entities.User.update(userId, {
      gbp_tokens: tokens
    });
  }

  return tokens;
}

async function makeGBPRequest(path, accessToken) {
  const baseUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1';
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GBP API Error: ${error}`);
  }

  return response.json();
}