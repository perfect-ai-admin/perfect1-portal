import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { brand_name, business_type, style, slogan, icon_hint, vibe, colors = [] } = await req.json();

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

    // Extract patterns from approved logos for context
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

    let learningContext = '';
    if (learningHistory.length > 0) {
      if (successfulStyles[style]) {
        learningContext += `(User previously liked style "${style}"). `;
      }
      if (Object.keys(successfulColors).length > 0) {
        const topColors = Object.entries(successfulColors)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(e => e[0])
          .join(', ');
        learningContext += `(User previously liked these colors: ${topColors}). `;
      }
    }

    // Use LLM to generate the perfect prompt
    console.log('[BUILD_PROMPT] Generating prompt via LLM...');
    
    const llmRes = await base44.integrations.Core.InvokeLLM({
      prompt: `
      You are an expert prompt engineer for AI image generators (like Stable Diffusion / StockImg).
      Your task is to create a SINGLE, highly optimized English prompt to generate a professional logo.
      
      INPUTS (may be in Hebrew or English):
      - Brand Name: "${brand_name}"
      - Business Type: "${business_type}"
      - Design Style (Step 3 choice): "${style}"
      - Desired Atmosphere/Vibe: "${vibe || 'Professional'}"
      - Slogan: "${slogan || ''}"
      - Icon/Symbol Preference: "${icon_hint || ''}"
      - Learning Context: ${learningContext}
      
      INSTRUCTIONS:
      1. Analyze the "Business Type" and "Atmosphere/Vibe" to determine the best visual subject for the logo.
      2. Analyze the "Design Style" to determine the artistic technique (e.g., minimalist, abstract, playful).
      3. Construct a prompt that describes the VISUAL SYMBOL only.
      
      CRITICAL CONSTRAINTS:
      - The logo must be an ICON / SYMBOL ONLY. 
      - NO TEXT, NO LETTERS, NO WORDS in the image. (Text is added later by code).
      - Style must be: Vector, Flat, Minimalist, Clean lines.
      - Background: Pure White (#FFFFFF).
      - High quality: 4k, trending on dribbble, vector graphics.
      - Do NOT include the brand name in the visual description, only the symbol representing it.
      
      OUTPUT FORMAT:
      Return ONLY a JSON object with a single key "prompt".
      Example: {"prompt": "minimalist vector logo of a coffee bean, flat design, orange and brown colors, professional, clean white background, 4k vector graphics"}
      `,
      response_json_schema: {
        type: "object",
        properties: {
          prompt: { type: "string" }
        }
      }
    });

    let finalPrompt = '';
    if (llmRes && typeof llmRes === 'object' && llmRes.prompt) {
      finalPrompt = llmRes.prompt;
    } else {
      // Fallback if LLM fails
      console.error('[BUILD_PROMPT] LLM failed to return prompt, using fallback');
      finalPrompt = `vector logo symbol for ${business_type}, ${style} style, ${vibe || ''}, minimalist, flat design, white background, no text`;
    }

    // Enforce critical keywords at the end just in case
    if (!finalPrompt.toLowerCase().includes('white background')) finalPrompt += ', white background';
    if (!finalPrompt.toLowerCase().includes('no text')) finalPrompt += ', no text';
    if (!finalPrompt.toLowerCase().includes('vector')) finalPrompt += ', vector style';

    console.log('[BUILD_PROMPT] Final Prompt:', finalPrompt);

    return Response.json({ 
      ok: true,
      prompt: finalPrompt,
      language: 'en', // Prompt is always English
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