import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formData } = await req.json();

    // Build inputText from form data for Gamma API v1.0
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

    // Prepare Gamma API v1.0 payload
    const payload = {
      inputText: inputText,
      textMode: 'generate',
      format: 'presentation',
      numCards: numCardsMap[formData.length] || 10,
      cardSplit: 'auto',
      additionalInstructions: `Create a professional business presentation. Style: ${formData.style}. Colors: ${formData.colors}. Make it persuasive and clear.`,
      textOptions: {
        language: formData.language === 'hebrew' ? 'he' : 'en'
      },
      imageOptions: {
        model: 'dall-e-3',
        generateImage: true
      }
    };

    // Add themeId if selected from Gamma themes
    if (formData.gammaTheme) {
      payload.themeId = formData.gammaTheme;
    }

    // Add folderIds if selected from Gamma folders
    if (formData.gammaFolder) {
      payload.folderIds = [formData.gammaFolder];
    }

    console.log('🔵 Sending to Gamma API v1.0...');
    console.log('Token available:', !!Deno.env.get('GAMMA_API_KEY'));

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
    console.log('✅ Gamma response:', gammaData);

    // Extract presentation URL using generationId
    const presentationUrl = `https://gamma.app/generations/${gammaData.generationId}`;

    return Response.json({
      success: true,
      presentationUrl,
      generationId: gammaData.generationId,
      message: 'המצגה שלך נוצרה בהצלחה!'
    });

  } catch (error) {
    console.error('❌ Error generating presentation:', error);
    return Response.json({
      error: error.message,
      details: 'Failed to generate presentation with Gamma'
    }, { status: 500 });
  }
});