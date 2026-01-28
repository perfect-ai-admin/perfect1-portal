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
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
      console.error('[STOCKIMG] Error response:', response.status, errorText);
      console.error('[STOCKIMG] API Key last 4:', apiKey ? apiKey.slice(-4) : 'NO KEY');
      console.error('[STOCKIMG] Payload was:', JSON.stringify(payload));
      return Response.json({ 
        error: `Stockimg API error (${response.status})`, 
        details: errorText,
        payload: payload
      }, { status: 400 });
    }

    const data = await response.json();

    if (!data.data || !data.data.images || !data.data.images[0] || !data.data.images[0].url) {
      return Response.json({ error: 'Invalid API response format' }, { status: 500 });
    }

    const hasNsfw = data.data.has_nsfw_concepts && data.data.has_nsfw_concepts[0];

    if (hasNsfw) {
      return Response.json({ 
        error: 'NSFW_CONTENT',
        message: 'Could not generate this concept. Try different wording.',
        nsfw_flag: true
      }, { status: 400 });
    }

    const image = data.data.images[0];

    return Response.json({
      success: true,
      image_url: image.url,
      seed: data.data.seed,
      content_type: image.content_type,
      width: image.width || 1024,
      height: image.height || 1024,
      timings: data.data.timings,
      nsfw_flag: false,
      prompt_used: prompt
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return Response.json({ error: 'Request timeout' }, { status: 408 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});