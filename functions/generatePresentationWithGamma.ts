import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { n8nWebhookClient } from './n8nWebhookClient.js';

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
Presentation Type: ${formData.presentationType.join(', ')}
Target Audience: ${formData.targetAudience.join(', ')}

Problem: ${formData.painPoint}
Why it matters: ${formData.whyPainful.join(', ')}
Current Solutions: ${formData.currentSolutions || 'N/A'}

Solution: ${formData.solution}
How it works: ${formData.solutionSteps.step1} → ${formData.solutionSteps.step2} → ${formData.solutionSteps.step3}

Unique Advantages: ${formData.uniqueAdvantage.join(', ')}
Why we're different: ${formData.advantageExplanation}

Proofs: ${formData.proofs.join(', ')}
Key metric: ${formData.strongMetric || 'Strong results'}

Value Proposition: ${formData.valueProposition}
After picture: ${formData.afterPicture}

Call to action: ${formData.cta.join(', ')}
CTA button text: ${formData.ctaText || 'Get Started'}

Design Preferences:
Style: ${formData.style || 'professional'}
Colors: ${formData.colors || 'brand colors'}
Language: ${formData.language === 'hebrew' ? 'Hebrew - write all content in Hebrew' : 'English'}`;

    // Map length to numCards
    const numCardsMap = {
      'short': 8,
      'medium': 12,
      'full': 18
    };

    // Direct Gamma API call - simple and works
    const payload = {
      inputText: inputText,
      textMode: 'generate',
      numCards: numCardsMap[formData.length] || 10
    };

    if (formData.gammaTheme) {
      payload.themeId = formData.gammaTheme;
    }

    console.log('🔵 Calling Gamma API v1.0...');

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
    console.log('✅ Gamma response:', JSON.stringify(gammaData));

    // Gamma returns the URL directly in the response
    const presentationUrl = gammaData.url || `https://gamma.app/docs/${gammaData.generationId}`;

    // Send event to n8n
    await n8nWebhookClient.presentationCompleted(user.email, {
      businessName: formData.businessName,
      presentationUrl,
      generationId: gammaData.generationId,
      userId: user.id,
      businessField: formData.businessField
    });

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