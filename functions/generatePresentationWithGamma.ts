import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formData } = await req.json();

    // Build comprehensive prompt for Gamma API
    const prompt = `
    בואו נבנה מצגת עסקית מקצועית בעברית.

    פרטי העסק:
    - שם: ${formData.businessName}
    - תחום: ${formData.businessField}
    - תיאור: ${formData.businessDescription}

    הבעיה:
    - הבעיה הכואבת: ${formData.painPoint}
    - גורם המשקל: ${formData.whyPainful.join(', ')}

    הפתרון:
    - הפתרון: ${formData.solution}
    - שלבי העבודה: ${formData.solutionSteps.step1} → ${formData.solutionSteps.step2} → ${formData.solutionSteps.step3}

    היתרון תחרותי:
    - היתרונות: ${formData.uniqueAdvantage.join(', ')}
    - הסבר: ${formData.advantageExplanation}

    הוכחות:
    - סוגי הוכחות: ${formData.proofs.join(', ')}
    - מטריקה חזקה: ${formData.strongMetric || 'ללא'}

    הצעת ערך:
    - מה מקבל הלקוח: ${formData.valueProposition}
    - איך החיים יראו: ${formData.afterPicture}

    קריאה לפעולה:
    - סוג ה-CTA: ${formData.cta.join(', ')}
    - טקסט כפתור: ${formData.ctaText || 'בואו נתחיל'}

    עיצוב:
    - סגנון: ${formData.style}
    - צבעים: ${formData.colors}

    טכני:
    - שפה: ${formData.language === 'hebrew' ? 'עברית' : 'אנגלית'}
    - אורך: ${
      formData.length === 'short' ? '6-8 שקפים קצרים ולעניין' : 
      formData.length === 'medium' ? '10-12 שקפים סטנדרטיים' : 
      '15-20 שקפים מקיפים ומלאים'
    }

    יצור מצגת עסקית מקצועית שממכרת את הרעיון בצורה חזקה וברורה. 
    כל שקף צריך להיות ברור, קוהרנטי ומוקד על הקהל שלנו.
    `;

    console.log('🔵 Sending to Gamma API...');
    console.log('Token available:', !!Deno.env.get('GAMMA_API_KEY'));

    const gammaResponse = await fetch('https://api.gamma.app/presentations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GAMMA_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        title: formData.businessName + ' - Business Presentation',
        language: formData.language === 'hebrew' ? 'he' : 'en',
      }),
    });

    if (!gammaResponse.ok) {
      const errorText = await gammaResponse.text();
      console.error('❌ Gamma API Error:', gammaResponse.status, errorText);
      throw new Error(`Gamma API failed: ${gammaResponse.status} - ${errorText}`);
    }

    const gammaData = await gammaResponse.json();
    console.log('✅ Gamma response:', gammaData);

    // Extract the presentation URL
    const presentationUrl = gammaData.id || gammaData.url || `https://gamma.app/presentations/${gammaData.id}`;

    return Response.json({
      success: true,
      presentationUrl,
      presentationId: gammaData.id,
      message: 'מצגתך נוצרה בהצלחה!'
    });

  } catch (error) {
    console.error('❌ Error generating presentation:', error);
    return Response.json({
      error: error.message,
      details: 'Failed to generate presentation with Gamma'
    }, { status: 500 });
  }
});