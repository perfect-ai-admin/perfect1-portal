// Migrated from Base44: publishLandingPage
// Auth required — publish a landing page belonging to the authenticated customer

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const payload = await req.json();
    const { landing_page_id } = payload;

    if (!landing_page_id) return errorResponse('Missing landing_page_id', 400);

    // Verify the page belongs to this customer
    const { data: page, error: fetchErr } = await supabaseAdmin
      .from('landing_pages')
      .select('*')
      .eq('id', landing_page_id)
      .single();

    if (fetchErr || !page) return errorResponse('Landing page not found', 404);

    if (page.customer_id !== customer.id) {
      return errorResponse('Forbidden: page does not belong to this customer', 403);
    }

    // Publish the page
    const { data: updatedPage, error: updateErr } = await supabaseAdmin
      .from('landing_pages')
      .update({
        is_published: true,
        published_at: new Date().toISOString()
      })
      .eq('id', landing_page_id)
      .select()
      .single();

    if (updateErr) return errorResponse(updateErr.message);

    // Build subdomain URL
    const subdomainUrl = updatedPage.subdomain
      ? `https://${updatedPage.subdomain}.one-pai.com`
      : null;

    return jsonResponse({
      success: true,
      page: updatedPage,
      url: subdomainUrl,
      public_url: subdomainUrl,
    });
  } catch (error) {
    console.error('publishLandingPage error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
