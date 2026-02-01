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
        1. **Business Name**: Verify the name provided. If language is Hebrew, note that image generators struggle with Hebrew text. 
        2. **Field/Industry**: Translate the field into specific visual imagery (e.g., "Digital" -> pixels, screens, abstract nodes; "Therapy" -> soft shapes, plants, hands).
        3. **Target Audience**: Adjust the complexity. Kids/Teens -> Colorful, Bold. Business -> Clean, Minimal, Sophisticated.
        4. **Purpose**: 
           - "Closing deal" -> Handshake, Checkmark, Thumbs up.
           - "Service" -> Headset, Smile, Heart.
           - "Funny" -> Exaggerated expressions, caricatures.
        5. **Platform**: WhatsApp stickers need clear silhouettes and thick white borders.
        6. **Style**: Define the artistic style clearly (e.g., "Professional" -> Flat Vector, Geometric; "Warm" -> Watercolor, Soft edges; "Funny" -> Cartoon, Pop Art).
        7. **Text Content & Language**: 
           - **CRITICAL RULE FOR HEBREW**: Image generators CANNOT render Hebrew text. It comes out as gibberish. 
           - **IF LANGUAGE IS HEBREW**: 
             - **DO NOT** ask for the specific Hebrew words in the "image_prompt_english".
             - **INSTEAD**: Ask for a "blank white speech bubble", "empty sign", or "space for text" in the composition.
             - In the "product_brief_hebrew", clearly state: "הטקסט יוסף ידנית על גבי הבועה/השלט הריק (בינה מלאכותית עדיין לא תומכת בטקסט עברי תקין)."
           - **IF LANGUAGE IS ENGLISH**: You can include the specific text in the prompt (e.g., "with text 'Sale'").
        8. **Vibe/Feeling**: Translate abstract feelings (Confidence, Comfort) into color palettes and shapes.
        9. **Vibe/Feeling**: Translate abstract feelings (Confidence, Comfort) into color palettes and shapes (e.g., Confidence = Blue/Gold, Strong lines; Comfort = Pastels, Round shapes).
        10. **Logo/Colors**: If specific colors are mentioned, use them as the primary palette.
        
        TASKS:
        
        1. **"product_brief_hebrew"**: Write a detailed, structured product specification in Hebrew for the user (The Product Manager).
           - Structure it with bullet points corresponding to the analysis (Business, Visual Concept, Vibe, Colors, Text Strategy).
           - Explain *why* certain visual choices were made based on their answers.
           - If Hebrew text was requested, add a small note that AI might struggle with Hebrew letters perfectly.
        
        2. **"image_prompt_english"**: Write the FINAL optimized prompt for StockImg/Stable Diffusion.
           - Format: "Die-cut sticker design of [MAIN SUBJECT], [ACTION/POSE], [STYLE DESCRIPTORS], [VIBE VISUALS], [COLORS], white border, vector art, isolated on white background, high quality, 4k".
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