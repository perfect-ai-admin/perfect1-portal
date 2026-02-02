import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { brand_name, business_type, style, slogan, icon_hint, colors = [] } = await req.json();

    if (!brand_name || !business_type || !style) {
      return Response.json({ 
        ok: false,
        error_code: 'MISSING_FIELDS',
        message: 'Missing required fields: brand_name, business_type, style'
      });
    }

    // Get user learning history
    let learningHistory = [];
    try {
      const user = await base44.auth.me();
      if (user) {
        learningHistory = await base44.entities.LogoLearning.filter({
          user_id: user.email,
          user_approved: true
        }, '-created_at', 5);
      }
    } catch (e) {
      console.log('[BUILD_PROMPT] Could not fetch learning history');
    }

    // Extract patterns from approved logos
    let successfulStyles = {};
    let successfulColors = {};
    
    learningHistory.forEach(entry => {
      if (entry.style) {
        successfulStyles[entry.style] = (successfulStyles[entry.style] || 0) + 1;
      }
      if (entry.colors_used && Array.isArray(entry.colors_used)) {
        entry.colors_used.forEach(color => {
          successfulColors[color] = (successfulColors[color] || 0) + 1;
        });
      }
    });

    // זהיית שפה
    const hasHebrew = /[\u0590-\u05FF]/.test(brand_name + business_type + style + (slogan || '') + (icon_hint || ''));
    
    let prompt;
    let styleEnhancement = '';
    let colorEnhancement = '';

    // Add enhancements from learned patterns
    if (learningHistory.length > 0) {
      if (successfulStyles[style]) {
        styleEnhancement = `(Style "${style}" has been successful before in your designs). `;
      }
      if (Object.keys(successfulColors).length > 0) {
        const topColors = Object.entries(successfulColors)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(e => e[0])
          .join(', ');
        colorEnhancement = `(Inspired by your previous successful color palettes: ${topColors}). `;
      }
    }

    let translatedInputs = {
      brand_name: brand_name,
      business_type: business_type,
      style: style,
      slogan: slogan || '',
      icon_hint: icon_hint || ''
    };

    if (hasHebrew) {
      try {
        console.log('[BUILD_PROMPT] Translating Hebrew inputs...');
        const translationRes = await base44.integrations.Core.InvokeLLM({
          prompt: `Translate the following logo design inputs from Hebrew to English. Return ONLY a JSON object with keys: brand_name, business_type, style, slogan, icon_hint.
          Inputs:
          brand_name: "${brand_name}"
          business_type: "${business_type}"
          style: "${style}"
          slogan: "${slogan || ''}"
          icon_hint: "${icon_hint || ''}"
          
          Note: Translate the meaning effectively for a logo designer. For brand_name, if it's a name, keep phonetic or translate if meaningful.
          `,
          response_json_schema: {
            type: "object",
            properties: {
              brand_name: { type: "string" },
              business_type: { type: "string" },
              style: { type: "string" },
              slogan: { type: "string" },
              icon_hint: { type: "string" }
            }
          }
        });
        
        if (translationRes && typeof translationRes === 'object') {
             translatedInputs = { ...translatedInputs, ...translationRes };
             console.log('[BUILD_PROMPT] Translation success:', translatedInputs);
        }
      } catch (err) {
        console.error('[BUILD_PROMPT] Translation failed:', err);
        // Fallback to original inputs if translation fails
      }
    }

    // Always construct prompt in English
    prompt = `Create a premium professional vector logo symbol for "${translatedInputs.brand_name}". `;
    prompt += `The logo must clearly represent the business profession: ${translatedInputs.business_type}. `;
    prompt += `Design style: ${translatedInputs.style}. ${styleEnhancement}`;
    prompt += `Minimalist flat design, solid colors, geometric precision. `;
    prompt += `Icon only, NO TEXT, NO LETTERS. Visual symbol representing a ${translatedInputs.business_type}. ${colorEnhancement}`;
    prompt += `Pure white background only, no gradients, no 3D effects. `;
    prompt += `4k quality, Adobe Illustrator style, scalable and production-ready. `;
    
    if (translatedInputs.icon_hint) {
      prompt += `Icon concept: ${translatedInputs.icon_hint}. `;
    }

    prompt += `Centered composition, clean and sharp, award-winning design quality.`;

    console.log('[BUILD_PROMPT] Generated prompt with learning enhancement from', learningHistory.length, 'approved logos');

    return Response.json({ 
      ok: true,
      prompt,
      language: hasHebrew ? 'he' : 'en',
      learning_applied: learningHistory.length > 0
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