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

    // Use gammaDirectCall instead since it works
    const directResponse = await base44.asServiceRole.functions.invoke('gammaDirectCall', {
      formData
    });

    if (!directResponse.success) {
      throw new Error(directResponse.error || 'Failed to generate presentation');
    }

    // Send event to n8n
    await n8nWebhookClient.presentationCompleted(user.email, {
      businessName: formData.businessName,
      presentationUrl: directResponse.presentationUrl,
      generationId: directResponse.generationId,
      userId: user.id,
      businessField: formData.businessField
    });

    return Response.json({
      success: true,
      presentationUrl: directResponse.presentationUrl,
      generationId: directResponse.generationId,
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

async function oldApproach(req) {
  // OLD CODE - Keeping for reference
  const payload = {
    inputText: '',
    textMode: 'generate',
    numCards: 10
  };

  const gammaResponse = await fetch('https://public-api.gamma.app/v1.0/generations', {
    method: 'POST',
    headers: {
      'X-API-KEY': Deno.env.get('GAMMA_API_KEY'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });