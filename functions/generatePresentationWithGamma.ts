import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formData } = await req.json();

    // Build prompt for presentation
    const inputText = `Create a professional ${formData.language === 'hebrew' ? 'Hebrew' : 'English'} business presentation for ${formData.businessName}.

Business: ${formData.businessName || ''}
Industry: ${formData.businessField || ''}
Description: ${formData.businessDescription || ''}

Problem: ${formData.painPoint || ''}
Solution: ${formData.solution || ''}

Unique advantages: ${(formData.uniqueAdvantage || []).join(', ')}
Why: ${formData.advantageExplanation || ''}

Value: ${formData.valueProposition || ''}

Call to action: ${formData.ctaText || 'Get Started'}`;

    console.log('🔵 Calling Gamma API...');

    const gammaResponse = await fetch('https://api.gamma.app/v1beta/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GAMMA_API_KEY')}`
      },
      body: JSON.stringify({
        prompt: inputText
      }),
    });

    if (!gammaResponse.ok) {
      const errorText = await gammaResponse.text();
      console.error('❌ Gamma API Error:', gammaResponse.status, errorText);
      throw new Error(`Gamma API failed: ${gammaResponse.status} - ${errorText}`);
    }

    const gammaData = await gammaResponse.json();
    console.log('✅ Gamma response:', JSON.stringify(gammaData));

    // Extract URL from Gamma response
    const presentationUrl = gammaData.url || gammaData.link || `https://gamma.app/docs/${gammaData.generationId}`;

    return Response.json({
      success: true,
      presentationUrl,
      generationId: gammaData.generationId,
      message: 'המצגה שלך נוצרה בהצלחה!'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({
      error: error.message,
      details: 'Failed to generate presentation'
    }, { status: 500 });
  }
});