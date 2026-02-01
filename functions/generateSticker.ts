import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // 1. Setup Base44 Client
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me(); // Optional: Check if user is logged in if needed

    // 2. Parse Payload
    const { prompt, colors, width, height } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('STOCKIMG_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    // 3. Construct Payload for StockImg
    // Docs: https://stockimg.ai/api-docs/models/sticker
    const payload = {
      prompt: prompt.trim(),
      // Some StockImg endpoints accept 'colors', some rely on prompt. 
      // We'll pass it if we have it, but usually best to bake into prompt for stickers if the API ignores it.
      // We'll keep it here just in case, similar to the logo endpoint.
      colors: (Array.isArray(colors) && colors.length > 0) ? colors.filter(c => c && c.startsWith('#')) : undefined,
      image_size: {
        width: parseInt(width) || 1024,
        height: parseInt(height) || 1024
      },
      safety_checker: true,
      image_format: "png" 
    };

    console.log('[STOCKIMG-STICKER] Request payload:', JSON.stringify(payload, null, 2));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    // 4. Call StockImg API
    const response = await fetch('https://api.stockimg.ai/v1/text-to-image/sticker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[STOCKIMG-STICKER] API error:', response.status, errorText);
      return Response.json({ 
        ok: false, 
        error_code: 'STOCKIMG_API_ERROR', 
        message: 'Image generation service error: ' + errorText 
      });
    }

    const data = await response.json();
    console.log('[STOCKIMG-STICKER] Response:', JSON.stringify(data).slice(0, 200) + '...');

    // 5. Validate Response
    if (!data || !data.data || !data.data.images || !Array.isArray(data.data.images) || data.data.images.length === 0) {
      return Response.json({ 
        ok: false, 
        error_code: 'STOCKIMG_INVALID_RESPONSE', 
        message: 'Image service returned invalid response' 
      });
    }

    const image = data.data.images[0];
    if (!image.url) {
      return Response.json({ 
        ok: false, 
        error_code: 'STOCKIMG_NO_URL', 
        message: 'No image URL in response' 
      });
    }

    // 6. Return Result
    return Response.json({
      ok: true,
      image_url: image.url,
      seed: data.data.seed
    });

  } catch (error) {
    console.error('[STOCKIMG-STICKER] Error:', error);
    return Response.json({ 
      ok: false, 
      error_code: 'INTERNAL_ERROR', 
      message: error.message 
    });
  }
});