import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Force update
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 1. Parse Payload - Expecting formData now instead of direct prompt
    const { formData, width, height } = await req.json();

    if (!formData) {
      return Response.json({ error: 'Form data required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('STOCKIMG_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    // 2. AI Product Manager & Prompt Engineer Step
    // We send all form data to the LLM to process it intelligently
    console.log('[GenerateSticker] Processing form data with LLM...');
    
    const analysisResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert Product Manager and AI Art Director specialized in sticker design for messaging apps (WhatsApp/Telegram).
        
        Analyze the following user requirements from a sticker questionnaire deeply:
        ${JSON.stringify(formData, null, 2)}
        
        Your Goal: Create a perfect specification (Product Brief) and a precise Image Generation Prompt.
        
        STRICTLY FOLLOW THESE 10 POINTS in your analysis:
        1. **Business Name**: Verify the name provided.
        2. **Field/Industry**: Translate the field ("${formData.field === 'other' ? formData.customField : formData.field}") into specific visual imagery.
        3. **Main Subject (CRITICAL)**: User explicitly requested: "${formData.mainSubject || 'Not specified'}". 
           - IF SPECIFIED: This MUST be the central character/object of the sticker.
           - IF NOT SPECIFIED: You MUST invent a clear, iconic subject based on the Field (e.g. A cute 3D Plumber character for plumbing, A sleek laptop for digital).

        4. **PURPOSE (ACTION & CONTEXT)**: 
           The purpose "${formData.purpose}" defines what the MAIN SUBJECT is DOING or FEELING:
           - "closing": The Subject is shaking hands, holding a 'Done' sign, or giving a thumbs up.
           - "service": The Subject is wearing a headset, offering help, or smiling warmly.
           - "branding": The Subject is presenting the Business Logo/Name proudly.
           - "quick": The Subject is rushing, flashing, or gesturing speed.
           - "fun": The Subject is dancing, winking, or laughing.

        5. **Platform**: WhatsApp stickers need clear silhouettes and thick white borders. Die-cut style.
        6. **Style**: Strictly adhere to "${formData.style}":
           - "3d_cute": Pixar-style, glossy, soft lighting, 3D render.
           - "flat_vector": Adobe Illustrator style, clean lines, no gradients, flat colors.
           - "elegant": Gold/Black/White, serif fonts, minimalist lines.
           - "pop_art": Comic book style, halftones, bold black outlines, vibrant.
           - "realistic": Photorealistic, detailed textures, cinematic lighting.
        7. **Text Content & Language**: 
           - **CRITICAL RULE FOR HEBREW**: Image generators CANNOT render Hebrew text. It comes out as gibberish. 
           - **IF LANGUAGE IS HEBREW**: 
             - **DO NOT** ask for the specific Hebrew words in the "image_prompt_english".
             - **INSTEAD**: Ask for a "blank white speech bubble", "empty board", or "clean space for text" in the center of the composition.
             - **COMPOSITION**: Make sure there is a clear, white, empty area where text can be overlaid later.
             - In the "product_brief_hebrew", clearly state: "הטקסט יוסף ידנית על גבי הבועה/השלט הריק (בינה מלאכותית עדיין לא תומכת בטקסט עברי תקין)."
           - **IF LANGUAGE IS ENGLISH**: 
           - **BRANDING CRITICAL**: The design MUST act as the business branding/logo sticker.
           - **MANDATORY TEXT**: The text "${formData.exampleSentence || ''}" AND "${formData.businessName || ''}" MUST be visible.
           - **CONTENT**: Use the exact text: "${formData.exampleSentence || ''}" (Primary) and "${formData.businessName || ''}" (Secondary/Branding).
           - **FORMAT**: "A high-quality die-cut sticker logo design, featuring the text '${formData.exampleSentence || formData.businessName}' as the central logotype, bold and legible typography, integrated with [VISUAL_ELEMENTS]".
           - **PRIORITY**: If 'exampleSentence' exists, it is the MAIN text. 'businessName' should be smaller or secondary.
           - **NOTE**: If only business name exists, make it the main text.
           - **FIELD**: If the field is 'other', use the custom description: "${formData.field === 'other' ? formData.customField : formData.field}".
           - **STYLE**: Strictly adhere to the selected style: "${formData.style}".
           8. **Vibe/Feeling**: Translate abstract feelings (Confidence, Comfort) into color palettes and shapes.
           9. **Vibe/Feeling**: Translate abstract feelings (Confidence, Comfort) into color palettes and shapes (e.g., Confidence = Blue/Gold, Strong lines; Comfort = Pastels, Round shapes).
           10. **Logo/Colors**: If specific colors are mentioned, use them as the primary palette.

           TASKS:

           1. **"product_brief_hebrew"**: Write a detailed, structured product specification in Hebrew for the user (The Product Manager).
           - Structure it with bullet points corresponding to the analysis (Business, Visual Concept, Vibe, Colors, Text Strategy).
           - Explain *why* certain visual choices were made based on their answers.
           - If Hebrew text was requested, add a small note that AI might struggle with Hebrew letters perfectly.

           2. **"image_prompt_english"**: Write the FINAL optimized prompt for StockImg/Stable Diffusion.
           - Format: "Die-cut sticker design of [MAIN SUBJECT], [ACTION/POSE], [STYLE DESCRIPTORS], [VIBE VISUALS], [COLORS], white border, vector art, isolated on white background, high quality, 4k, text '${formData.exampleSentence ? formData.exampleSentence : (formData.businessName || 'Sticker')}' clearly visible".
           - **TEXT HANDLING**: If text is required, add: "holding a sign saying '[TEXT]'" or "with text '[TEXT]' in bold typography". *Note*: If Hebrew, write the Hebrew text in the prompt but expect mixed results.
           - **EXCLUSIONS**: If 'excludeText' exists, add "no [excludeText]" to negative prompt logic implies avoiding it in description.
           
        Return ONLY the JSON object.`,
        response_json_schema: {
            type: "object",
            properties: {
                product_brief_hebrew: { type: "string" },
                image_prompt_english: { type: "string" }
            },
            required: ["product_brief_hebrew", "image_prompt_english"]
        }
    });

    const aiOutput = typeof analysisResponse === 'string' ? JSON.parse(analysisResponse) : analysisResponse;
    const finalPrompt = aiOutput.image_prompt_english;
    const productBrief = aiOutput.product_brief_hebrew;

    console.log('[GenerateSticker] AI Brief:', productBrief);
    console.log('[GenerateSticker] Generated Prompt:', finalPrompt);

    // 3. Construct Payload for StockImg
    const stockImgPayload = {
      prompt: finalPrompt,
      image_size: {
        width: parseInt(width) || 1024,
        height: parseInt(height) || 1024
      },
      safety_checker: true,
      image_format: "png"
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    // 4. Call StockImg API
    const response = await fetch('https://api.stockimg.ai/v1/text-to-image/sticker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(stockImgPayload),
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

    // 5. Validate Response
    if (!data || !data.data || !data.data.images || !Array.isArray(data.data.images) || data.data.images.length === 0) {
      return Response.json({ 
        ok: false, 
        error_code: 'STOCKIMG_INVALID_RESPONSE', 
        message: 'Image service returned invalid response' 
      });
    }

    const image = data.data.images[0];

    // 6. Return Result including the AI analysis
    return Response.json({
      ok: true,
      image_url: image.url,
      seed: data.data.seed,
      ai_brief: productBrief,
      used_prompt: finalPrompt
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