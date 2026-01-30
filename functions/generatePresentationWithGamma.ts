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
    
    const aiPromptRequest = `אתה מנהל מוצר מומחה שבונה מצגות עסקיות מקצועיות.
קיבלת את התשובות הבאות משאלון לקוח:

**פרטי העסק:**
- שם העסק: ${formData.businessName}
- תחום פעילות: ${formData.businessField}
- תיאור: ${formData.businessDescription}
- סוג המצגת: ${formData.presentationType.join(', ')}
- קהל יעד: ${formData.targetAudience.join(', ')}

**הבעיה:**
- הכאב של הקהל: ${formData.painPoint}
- למה זה קריטי: ${formData.whyPainful.join(', ')}
- פתרונות קיימים: ${formData.currentSolutions || 'לא צוין'}

**הפתרון:**
- הפתרון המוצע: ${formData.solution}
- איך זה עובד:
  1. ${formData.solutionSteps.step1}
  2. ${formData.solutionSteps.step2}
  3. ${formData.solutionSteps.step3}

**יתרונות:**
- במה שונים: ${formData.uniqueAdvantage.join(', ')}
- למה עדיף: ${formData.advantageExplanation}

**הוכחות:**
- מה יש להציג: ${formData.proofs.join(', ')}
- נתון מרכזי: ${formData.strongMetric || 'לא צוין'}

**הצעת ערך:**
- מה מקבלים: ${formData.valueProposition}
- תמונת "אחרי": ${formData.afterPicture}

**קריאה לפעולה:**
- מה רוצים שיקרה: ${formData.cta.join(', ')}
- טקסט כפתור: ${formData.ctaText || 'לא צוין'}

**עיצוב:**
- סגנון: ${formData.style || 'מקצועי'}
- צבעים: ${formData.colors || 'צבעי המותג'}
- שפה: ${formData.language === 'hebrew' ? 'עברית' : 'אנגלית'}
- אורך: ${formData.length === 'short' ? 'קצר (6-8 שקפים)' : formData.length === 'medium' ? 'סטנדרטי (10-12 שקפים)' : 'מקיף (15-20 שקפים)'}

---

**המשימה שלך:**
כתוב פרומפט מקצועי ומדויק ל-Gamma AI שייצור מצגת עסקית מושלמת.
הפרומפט חייב להיות:
1. ברור ומפורט - כולל את כל המידע החשוב
2. מובנה היטב - עם סדר לוגי של מידע
3. בשפה ${formData.language === 'hebrew' ? 'עברית' : 'אנגלית'} - כל התוכן במצגת יהיה בשפה זו
4. מכוון תוצאות - ממוקד ביצירת מצגת משכנעת ומקצועית

כתוב **רק** את הפרומפט הסופי, ללא הסברים נוספים.`;

    let inputText;
    try {
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: aiPromptRequest
      });
      
      // InvokeLLM returns the text directly as a string
      inputText = typeof aiResponse === 'string' ? aiResponse : aiResponse.output || aiResponse.text || JSON.stringify(aiResponse);
      console.log('✅ AI-generated prompt ready:', inputText.substring(0, 200) + '...');
    } catch (aiError) {
      console.error('⚠️ AI prompt generation failed, using fallback:', aiError);
      // Fallback to basic prompt if AI fails
      inputText = `Create a professional business presentation for ${formData.businessName} in ${formData.language === 'hebrew' ? 'Hebrew' : 'English'}.
      
Business: ${formData.businessName}
Industry: ${formData.businessField}
Description: ${formData.businessDescription}

Problem: ${formData.painPoint}
Solution: ${formData.solution}
Value: ${formData.valueProposition}
CTA: ${formData.ctaText || 'Get Started'}`;
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