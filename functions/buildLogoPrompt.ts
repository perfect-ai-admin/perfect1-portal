Deno.serve(async (req) => {
  try {

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brand_name, business_type, style, slogan, icon_hint } = await req.json();

    if (!brand_name || !business_type || !style) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let prompt = `Create a professional vector-style logo for ${brand_name}. `;
    prompt += `Business type: ${business_type}. `;
    prompt += `Design style: ${style}. `;
    prompt += `Modern, minimalist, flat design, icon + wordmark layout. `;
    prompt += `Clean lines, professional, scalable. `;
    prompt += `No background, no mockups, no 3D effects. `;

    if (slogan) {
      prompt += `Include text: "${slogan}". `;
    }

    if (icon_hint) {
      prompt += `Icon concept: ${icon_hint}. `;
    }

    prompt += `High quality, ready for production.`;

    console.log('[BUILD_PROMPT] Generated:', prompt);

    return Response.json({ prompt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});