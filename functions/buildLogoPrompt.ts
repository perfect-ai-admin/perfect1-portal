import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { brand_name, business_type, style, slogan, icon_hint, colors = [] } = await req.json();

    if (!brand_name || !business_type || !style) {
      return Response.json({ 
        ok: false,
        error_code: 'MISSING_FIELDS',
        message: 'Missing required fields: brand_name, business_type, style'
      });
    }

    // Get user learning history
    let learningHistory = [];
    try {
      const user = await base44.auth.me();
      if (user) {
        learningHistory = await base44.entities.LogoLearning.filter({
          user_id: user.email,
          user_approved: true
        }, '-created_at', 5);
      }
    } catch (e) {
      console.log('[BUILD_PROMPT] Could not fetch learning history');
    }

    // Extract patterns from approved logos
    let successfulStyles = {};
    let successfulColors = {};
    
    learningHistory.forEach(entry => {
      if (entry.style) {
        successfulStyles[entry.style] = (successfulStyles[entry.style] || 0) + 1;
      }
      if (entry.colors_used && Array.isArray(entry.colors_used)) {
        entry.colors_used.forEach(color => {
          successfulColors[color] = (successfulColors[color] || 0) + 1;
        });
      }
    });

    // זהיית שפה
    const hasHebrew = /[\u0590-\u05FF]/.test(brand_name + business_type + style + (slogan || '') + (icon_hint || ''));
    
    let prompt;
    let styleEnhancement = '';
    let colorEnhancement = '';

    // Add enhancements from learned patterns
    if (learningHistory.length > 0) {
      if (successfulStyles[style]) {
        styleEnhancement = `(Style "${style}" has been successful before in your designs). `;
      }
      if (Object.keys(successfulColors).length > 0) {
        const topColors = Object.entries(successfulColors)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(e => e[0])
          .join(', ');
        colorEnhancement = `(Inspired by your previous successful color palettes: ${topColors}). `;
      }
    }

    if (hasHebrew) {
      prompt = `צור לוגו וקטורי מקצועי לחברה בשם "${brand_name}". `;
      prompt += `תחום עיסוק: ${business_type}. `;
      prompt += `סגנון עיצובי: ${style}. ${styleEnhancement}`;
      prompt += `עיצוב מינימליסטי שטוח, צבעים אחידים, דיוק גיאומטרי. `;
      prompt += `פריסה של אייקון + כיתוב, קווים חדים, חד-צבעי או צבעים מעטים. ${colorEnhancement}`;
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
      prompt = `Create a premium professional vector logo for "${brand_name}". `;
      prompt += `Business type: ${business_type}. `;
      prompt += `Design style: ${style}. ${styleEnhancement}`;
      prompt += `Minimalist flat design, solid colors, geometric precision. `;
      prompt += `Icon + wordmark layout, sharp edges, limited color palette. ${colorEnhancement}`;
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

    console.log('[BUILD_PROMPT] Generated prompt with learning enhancement from', learningHistory.length, 'approved logos');

    return Response.json({ 
      ok: true,
      prompt,
      language: hasHebrew ? 'he' : 'en',
      learning_applied: learningHistory.length > 0
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