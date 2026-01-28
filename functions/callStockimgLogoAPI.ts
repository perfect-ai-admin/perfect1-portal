import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, colors, width, height } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('STOCKIMG_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const payload = {
      prompt,
      colors: colors || [],
      image_size: {
        width: width || 1024,
        height: height || 1024
      },
      safety_checker: true
    };

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
      return Response.json({ error: `API error: ${errorText}` }, { status: response.status });
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