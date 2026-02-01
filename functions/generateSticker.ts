import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
        prompt: `You are an expert Product Manager and AI Art Director specialized in sticker design.
        
        Analyze the following user requirements from a sticker questionnaire:
        ${JSON.stringify(formData, null, 2)}
        
        Your tasks:
        1. "product_brief_hebrew": Write a professional product characterization (אפיון) in Hebrew. 
           - Summarize the business essence, the target audience, the desired vibe, and specific elements.
           - Ensure NO detail from the input is missed.
           - Format it as a structured paragraph.
        
        2. "image_prompt_english": Write a highly optimized prompt for an AI Image Generator (specifically for stickers).
           - Start with: "A high quality die-cut sticker design of..."
           - Incorporate the business type, style, and vibe visuals.
           - If 'hasText' is yes/combined and 'exampleSentence' or 'businessName' exists, include: text "${formData.exampleSentence || formData.businessName}".
           - Include technical keywords: "white border, vector art, flat design, isolated on white background, high resolution, professional vector illustration".
           - Exclude anything mentioned in 'excludeText'.
           
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