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

    // Step 1: Generate professional prompt using AI
    console.log('🤖 Generating professional prompt using AI...');
    
    const aiPromptRequest = `אתה כותב תוכן מקצועי למצגות עסקיות.
קיבלת את הנתונים הבאות על עסק:

עסק: ${formData.businessName}
תחום: ${formData.businessField}
תיאור: ${formData.businessDescription}

הבעיה שהעסק פותר: ${formData.painPoint}
הפתרון: ${formData.solution}
יתרונות: ${formData.uniqueAdvantage.join(', ')} - ${formData.advantageExplanation}
הוכחות: ${formData.proofs.join(', ')}${formData.strongMetric ? `, ${formData.strongMetric}` : ''}
הצעת ערך: ${formData.valueProposition}
תוצאה: ${formData.afterPicture}
קריאה לפעולה: ${formData.cta.join(', ')}

כתוב תוכן למצגת עסקית ${formData.language === 'hebrew' ? 'בעברית' : 'באנגלית'}.
הפלט שלך צריך להיות **טקסט חופשי בלבד** - לא JSON, לא קוד, רק תוכן טקסטואלי.
התוכן צריך להיות מובנה, משכנע ומקצועי, מתאים למצגת ${formData.length === 'short' ? 'קצרה' : formData.length === 'medium' ? 'בינונית' : 'מקיפה'}.

כתוב רק את התוכן, ללא הסברים נוספים.`;

    let inputText;
    try {
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: aiPromptRequest
      });
      
      inputText = typeof aiResponse === 'string' ? aiResponse : (aiResponse.output || aiResponse.text || String(aiResponse));
      console.log('✅ AI-generated prompt ready');
    } catch (aiError) {
      console.error('⚠️ AI prompt generation failed, using fallback:', aiError);
      inputText = `Create a professional ${formData.language === 'hebrew' ? 'Hebrew' : 'English'} business presentation for ${formData.businessName}.

Business: ${formData.businessName}
Industry: ${formData.businessField}
Description: ${formData.businessDescription}

Problem: ${formData.painPoint}
Solution: ${formData.solution}
How it works: ${formData.solutionSteps.step1}, ${formData.solutionSteps.step2}, ${formData.solutionSteps.step3}

Unique advantages: ${formData.uniqueAdvantage.join(', ')}
Why different: ${formData.advantageExplanation}

Proofs: ${formData.proofs.join(', ')}
${formData.strongMetric ? `Key metric: ${formData.strongMetric}` : ''}

Value: ${formData.valueProposition}
After picture: ${formData.afterPicture}

Call to action: ${formData.cta.join(', ')}
${formData.ctaText ? `CTA text: ${formData.ctaText}` : ''}`;
    }

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
    console.log('Payload:', JSON.stringify(payload, null, 2));

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