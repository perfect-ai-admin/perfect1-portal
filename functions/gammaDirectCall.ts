import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formData } = await req.json();

    // Build inputText from form data
    const inputText = `Business: ${formData.businessName}
Industry: ${formData.businessField}
Description: ${formData.businessDescription}

Problem: ${formData.painPoint}
Why it matters: ${formData.whyPainful.join(', ')}

Solution: ${formData.solution}
How it works: ${formData.solutionSteps.step1} → ${formData.solutionSteps.step2} → ${formData.solutionSteps.step3}

Unique Advantages: ${formData.uniqueAdvantage.join(', ')}
Why we're different: ${formData.advantageExplanation}

Proofs: ${formData.proofs.join(', ')}
Key metric: ${formData.strongMetric || 'Strong results'}

Value Proposition: ${formData.valueProposition}
After picture: ${formData.afterPicture}

Call to action: ${formData.cta.join(', ')}
CTA button text: ${formData.ctaText || 'Get Started'}`;

    // Map length to numCards
    const numCardsMap = {
      'short': 8,
      'medium': 12,
      'full': 18
    };

    // Send with required fields
    const payload = {
      inputText: inputText,
      numCards: numCardsMap[formData.length] || 10,
      textMode: 'generate'
    };

    console.log('📤 Direct API Call - Minimal Payload');
    console.log('Sending:', JSON.stringify(payload));

    const gammaResponse = await fetch('https://public-api.gamma.app/v1.0/generations', {
      method: 'POST',
      headers: {
        'X-API-KEY': Deno.env.get('GAMMA_API_KEY'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!gammaResponse.ok) {
      const errorText = await gammaResponse.text();
      console.error('❌ Gamma API Error:', gammaResponse.status, errorText);
      throw new Error(`Gamma API failed: ${gammaResponse.status} - ${errorText}`);
    }

    const gammaData = await gammaResponse.json();
    console.log('✅ Success:', gammaData);

    // Extract presentation URL
    const presentationUrl = `https://gamma.app/generations/${gammaData.generationId}`;

    return Response.json({
      success: true,
      presentationUrl,
      generationId: gammaData.generationId,
      message: 'המצגה שלך נוצרה!'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({
      error: error.message,
      details: 'Failed to generate presentation'
    }, { status: 500 });
  }
});