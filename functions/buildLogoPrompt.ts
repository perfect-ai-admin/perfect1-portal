Deno.serve(async (req) => {
  try {
    const { brand_name, business_type, style, slogan, icon_hint } = await req.json();

    if (!brand_name || !business_type || !style) {
      return Response.json({ 
        ok: false,
        error_code: 'MISSING_FIELDS',
        message: 'Missing required fields: brand_name, business_type, style'
      });
    }

    let prompt = `Create a professional vector-style logo for ${brand_name}. `;
    prompt += `Business type: ${business_type}. `;
    prompt += `Design style: ${style}. `;
    prompt += `Modern, minimalist, flat design, icon + wordmark layout. `;
    prompt += `Clean lines, professional, scalable. `;
    prompt += `No background, no mockups, no 3D effects. `;

    if (slogan && typeof slogan === 'string') {
      prompt += `Include text: "${slogan}". `;
    }

    if (icon_hint && typeof icon_hint === 'string') {
      prompt += `Icon concept: ${icon_hint}. `;
    }

    prompt += `High quality, ready for production.`;

    console.log('[BUILD_PROMPT] Generated prompt successfully');

    return Response.json({ 
      ok: true,
      prompt 
    });
  } catch (error) {
    console.error('[BUILD_PROMPT] Error:', error.message);
    return Response.json({ 
      ok: false,
      error_code: 'PROMPT_BUILD_FAILED',
      message: 'Failed to build logo prompt'
    });
  }
});