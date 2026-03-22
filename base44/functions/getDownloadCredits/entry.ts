import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ ok: false, error_code: 'UNAUTHORIZED', message: 'User not authenticated' }, { status: 401 });
    }

    // Get or create user account
    let userAccounts = await base44.entities.UserAccount.filter({ user_id: user.email });
    let userAccount = userAccounts[0];

    if (!userAccount) {
      userAccount = await base44.entities.UserAccount.create({
        user_id: user.email,
        download_credits: 0
      });
    }

    return Response.json({
      ok: true,
      download_credits: userAccount.download_credits,
      total_logo_runs: userAccount.total_logo_runs || 0,
      free_preview_policy: {
        free_previews_limit: 3,
        message: 'You get 3 free previews per logo project'
      }
    });
  } catch (error) {
    console.error('[getDownloadCredits] Error:', error);
    return Response.json({ ok: false, error_code: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }
});