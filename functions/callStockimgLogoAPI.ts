Deno.serve(async (req) => {
  try {
    const { prompt, colors, width, height } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('STOCKIMG_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const payload = {
      prompt: prompt.trim(),
      colors: (Array.isArray(colors) && colors.length > 0) ? colors.filter(c => c && c.startsWith('#')) : ['#1E3A5F', '#3B82F6'],
      image_size: {
        width: parseInt(width) || 1024,
        height: parseInt(height) || 1024
      },
      safety_checker: true
    };

    console.log('[STOCKIMG] Request payload:', JSON.stringify(payload, null, 2));
    console.log('[STOCKIMG] API Key present:', !!apiKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const response = await fetch('https://api.stockimg.ai/v1/text-to-image/logo', {
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
      console.error('[STOCKIMG] API error:', response.status, errorText.slice(0, 200));
      return Response.json({ 
        ok: false,
        error_code: 'STOCKIMG_API_ERROR',
        message: 'Image generation service error'
      });
    }

    const data = await response.json();

    if (!data || !data.data || !data.data.images || !Array.isArray(data.data.images) || data.data.images.length === 0) {
      console.error('[STOCKIMG] Invalid response format:', JSON.stringify(data).slice(0, 200));
      return Response.json({ 
        ok: false,
        error_code: 'STOCKIMG_INVALID_RESPONSE',
        message: 'Image service returned invalid response'
      });
    }

    const hasNsfw = data.data.has_nsfw_concepts && data.data.has_nsfw_concepts[0];

    if (hasNsfw) {
      console.log('[STOCKIMG] NSFW content detected');
      return Response.json({ 
        ok: false,
        error_code: 'NSFW_BLOCKED',
        message: 'Generation blocked by safety filter',
        nsfw_flag: true
      });
    }

    const image = data.data.images[0];

    if (!image.url) {
      console.error('[STOCKIMG] No URL in image data');
      return Response.json({ 
        ok: false,
        error_code: 'STOCKIMG_INVALID_RESPONSE',
        message: 'Image service returned invalid response'
      });
    }

    return Response.json({
      ok: true,
      image_url: image.url,
      seed: data.data.seed,
      content_type: image.content_type,
      width: image.width || 1024,
      height: image.height || 1024,
      timings: data.data.timings,
      nsfw_flag: false
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[STOCKIMG] Request timeout');
      return Response.json({ 
        ok: false,
        error_code: 'STOCKIMG_TIMEOUT',
        message: 'Image generation timed out'
      });
    }
    console.error('[STOCKIMG] Error:', error.message);
    return Response.json({ 
      ok: false,
      error_code: 'STOCKIMG_ERROR',
      message: 'Image generation failed'
    });
  }
});