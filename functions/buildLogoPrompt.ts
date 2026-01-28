Deno.serve(async (req) => {
  try {
    const { brand_name, business_type, style, slogan, icon_hint } = await req.json();

    if (!brand_name || !business_type || !style) {
      return Response.json({ 
        ok: false,
        error_code: 'MISSING_FIELDS',
        message: 'Missing required fields: brand_name, business_type, style'
      });
    }

    // זהיית שפה - בדיקה אם יש תווי עברית
    const hasHebrew = /[\u0590-\u05FF]/.test(brand_name + business_type + style + (slogan || '') + (icon_hint || ''));
    
    let prompt;

    if (hasHebrew) {
      // פרומפט בעברית
      prompt = `צור לוגו וקטורי מקצועי לחברה בשם "${brand_name}". `;
      prompt += `תחום עיסוק: ${business_type}. `;
      prompt += `סגנון עיצובי: ${style}. `;
      prompt += `עיצוב מינימליסטי שטוח, צבעים אחידים, דיוק גיאומטרי. `;
      prompt += `פריסה של אייקון + כיתוב, קווים חדים, חד-צבעי או צבעים מעטים. `;
      prompt += `רקע לבן נקי בלבד, אין גרדיאנטים, אין אפקטים תלת-מימדיים. `;
      prompt += `איכות גבוהה, במצב מוגן וסקיצה בסגנון Adobe Illustrator. `;
      
      if (icon_hint && typeof icon_hint === 'string') {
        prompt += `קונספט האייקון: ${icon_hint}. `;
      }

      if (slogan && typeof slogan === 'string') {
        prompt += `כלול טקסט: "${slogan}". `;
      }

      prompt += `מרכוז בתמונה, חד וברור, מוכן לייצור.`;
    } else {
      // פרומפט באנגלית
      prompt = `Create a premium professional vector logo for "${brand_name}". `;
      prompt += `Business type: ${business_type}. `;
      prompt += `Design style: ${style}. `;
      prompt += `Minimalist flat design, solid colors, geometric precision. `;
      prompt += `Icon + wordmark layout, sharp edges, limited color palette. `;
      prompt += `Pure white background only, no gradients, no 3D effects. `;
      prompt += `4k quality, Adobe Illustrator style, scalable and production-ready. `;
      
      if (icon_hint && typeof icon_hint === 'string') {
        prompt += `Icon concept: ${icon_hint}. `;
      }

      if (slogan && typeof slogan === 'string') {
        prompt += `Include text: "${slogan}". `;
      }

      prompt += `Centered composition, clean and sharp, award-winning design quality.`;
    }

    console.log('[BUILD_PROMPT] Generated prompt successfully, language:', hasHebrew ? 'Hebrew' : 'English');

    return Response.json({ 
      ok: true,
      prompt,
      language: hasHebrew ? 'he' : 'en'
    });
  } catch (error) {
    console.error('[BUILD_PROMPT] Error:', error.message);
    return Response.json({ 
      ok: false,
      error_code: 'PROMPT_BUILD_FAILED',
      message: 'Failed to build logo prompt'
    });
  }
});