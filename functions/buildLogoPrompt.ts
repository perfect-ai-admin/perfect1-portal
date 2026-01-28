import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brand_name, business_type, style, slogan, icon_hint } = await req.json();

    if (!brand_name || !business_type || !style) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let prompt = `Create a clean professional vector-style logo for ${brand_name}, a ${business_type}. `;
    prompt += `Style: ${style}. `;
    prompt += `Minimal, modern, flat design, centered composition. `;
    prompt += `No mockups, no background texture, no 3D. `;
    prompt += `Include a simple icon + wordmark. Use brand colors. `;

    if (slogan) {
      prompt += `Include slogan '${slogan}' small and readable. `;
    }

    if (icon_hint) {
      prompt += `Icon should reflect: ${icon_hint}. `;
    }

    prompt += `Professional corporate quality.`;

    return Response.json({ prompt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});