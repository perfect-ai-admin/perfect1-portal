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

עסק: ${formData.businessName || ''}
תחום: ${formData.businessField || ''}
תיאור: ${formData.businessDescription || ''}

הבעיה שהעסק פותר: ${formData.painPoint || ''}
הפתרון: ${formData.solution || ''}
יתרונות: ${(formData.uniqueAdvantage || []).join(', ')} - ${formData.advantageExplanation || ''}
הוכחות: ${(formData.proofs || []).join(', ')}${formData.strongMetric ? `, ${formData.strongMetric}` : ''}
הצעת ערך: ${formData.valueProposition || ''}
תוצאה: ${formData.afterPicture || ''}
קריאה לפעולה: ${(formData.cta || []).join(', ')}

כתוב תוכן למצגת עסקית ${formData.language === 'hebrew' ? 'בעברית' : 'באנגלית'}.
הפלט שלך צריך להיות **טקסט חופשי בלבד** - לא JSON, לא קוד, רק תוכן טקסטואלי.
התוכן צריך להיות מובנה, משכנע ומקצועי, מתאים למצגת ${formData.length === 'short' ? 'קצרה' : formData.length === 'medium' ? 'בינונית' : 'מקיפה'}.

כתוב רק את התוכן, ללא הסברים נוספים.`;

    // Skip AI - use simple direct prompt
    const inputText = `Create a professional ${formData.language === 'hebrew' ? 'Hebrew' : 'English'} business presentation for ${formData.businessName}.

Business: ${formData.businessName}
Industry: ${formData.businessField}
Description: ${formData.businessDescription}

Problem: ${formData.painPoint}
Solution: ${formData.solution}

Unique advantages: ${formData.uniqueAdvantage.join(', ')}
Why: ${formData.advantageExplanation}

Value: ${formData.valueProposition}

Call to action: ${formData.ctaText || 'Get Started'}`;

    // Map length to numCards
    const numCardsMap = {
      'short': 8,
      'medium': 12,
      'full': 18
    };

    // Build payload for Gamma API - minimal payload only
    const payload = {
      text: inputText
    };

    console.log('🔵 Calling Gamma API...');

    const gammaResponse = await fetch('https://api.gamma.app/api/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GAMMA_API_KEY')}`
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