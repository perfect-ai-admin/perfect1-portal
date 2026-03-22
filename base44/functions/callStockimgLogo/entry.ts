import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const STOCKIMG_LOGO_URL = 'https://api.stockimg.ai/v1/text-to-image/logo';
const REQUEST_TIMEOUT_MS = 30000;

Deno.serve(async (req) => {
    try {
        const { prompt, colors, width, height } = await req.json();

        if (!prompt) {
            return Response.json({ error: 'Prompt required' }, { status: 400 });
        }

        const apiKey = Deno.env.get('STOCKIMG_API_KEY');
        if (!apiKey) {
            console.error('STOCKIMG_API_KEY not set');
            return Response.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const bodyData = {
            prompt: prompt,
            image_size: {
                width: width || 1024,
                height: height || 1024
            },
            safety_checker: true
        };

        if (colors && Array.isArray(colors) && colors.length > 0) {
            bodyData.colors = colors;
        }

        // Call Stockimg API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const response = await fetch(STOCKIMG_LOGO_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(bodyData),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Stockimg API error (${response.status}):`, errorBody);
            return Response.json({ 
                error: 'API_HTTP_ERROR',
                status: response.status,
                message: errorBody
            }, { status: 400 });
        }

        const data = await response.json();

        // Validate response structure
        if (!data.data || !data.data.images || !Array.isArray(data.data.images) || data.data.images.length === 0) {
            console.error('Stockimg response missing images array:', data);
            return Response.json({ error: 'MISSING_URL' }, { status: 400 });
        }

        const imageData = data.data.images[0];
        if (!imageData.url) {
            console.error('Stockimg response missing image URL:', imageData);
            return Response.json({ error: 'MISSING_URL' }, { status: 400 });
        }

        // Check NSFW flag
        if (data.data.has_nsfw_concepts && data.data.has_nsfw_concepts[0] === true) {
            return Response.json({ 
                error: 'NSFW',
                nsfw_flag: true
            }, { status: 400 });
        }

        return Response.json({
            ok: true,
            image_url: imageData.url,
            seed: data.data.seed || null,
            prompt_used: prompt,
            timings: data.data.timings || null,
            nsfw_flag: false,
            content_type: imageData.content_type || 'image/png',
            width: imageData.width || (width || 1024),
            height: imageData.height || (height || 1024)
        });
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Stockimg API request timeout');
            return Response.json({ error: 'TIMEOUT' }, { status: 408 });
        }
        console.error('callStockimgLogo error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});