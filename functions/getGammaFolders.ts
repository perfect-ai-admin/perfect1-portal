import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gammaApiKey = Deno.env.get('GAMMA_API_KEY');
    if (!gammaApiKey) {
      return Response.json({ error: 'Gamma API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://public-api.gamma.app/v1.0/folders', {
      headers: {
        'X-API-KEY': gammaApiKey,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Gamma API error:', response.status);
      return Response.json({ 
        error: `Gamma API error: ${response.status}`,
        folders: []
      }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ 
      success: true,
      folders: data.data || []
    });

  } catch (error) {
    console.error('Error fetching Gamma folders:', error);
    return Response.json({ 
      error: error.message,
      folders: []
    }, { status: 500 });
  }
});