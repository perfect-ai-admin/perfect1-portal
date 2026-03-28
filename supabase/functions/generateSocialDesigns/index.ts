import { getCustomer, supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const { formData } = await req.json();
    const { businessName, networks, targetAudience, goals, vibe, designTypes, writingStyle, language, hasBranding, preferredColors, futureUse, editPlatform, inspirationLinks, excludeElements } = formData || {};

    const prompt = `אתה מעצב גרפי ומומחה שיווק דיגיטלי. צור חבילת עיצובים לרשתות חברתיות עבור העסק "${businessName || 'העסק'}".

פרטי העסק:
- רשתות: ${(networks || []).join(', ') || 'לא צוין'}
- קהל יעד: ${targetAudience || 'כללי'}
- מטרות: ${(goals || []).join(', ') || 'לא צוין'}
- אווירה: ${vibe || 'מקצועי'}
- סגנון כתיבה: ${writingStyle || 'לא צוין'}
- שפה: ${language || 'עברית'}
- צבעים מועדפים: ${preferredColors || 'לא צוין'}
- סוגי עיצובים: ${(designTypes || []).join(', ') || 'פוסטים'}
- אלמנטים להימנע מהם: ${excludeElements || 'אין'}

צור בדיוק 5 עיצובים (כל אחד כאובייקט JSON):
- title: כותרת העיצוב
- type: סוג (post/story/cover/highlight/reel)
- network: הרשת המתאימה
- headline: כותרת שתופיע על העיצוב
- body_text: טקסט גוף קצר
- cta: קריאה לפעולה
- visual_description: תיאור ויזואלי מפורט לעיצוב (צבעים, פריסה, אלמנטים)
- hashtags: 5 האשטגים רלוונטיים
- posting_tip: טיפ לפרסום

החזר JSON בפורמט: { "designs": [...], "brand_guidelines": { "colors": [...], "fonts": [...], "tone": "..." } }`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'אתה מעצב גרפי ומומחה שיווק. תמיד תחזיר JSON תקין בלבד.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI error:', errText);
      return errorResponse('AI generation failed', 500);
    }

    const aiData = await openaiRes.json();
    const content = JSON.parse(aiData.choices[0].message.content);

    // Save to DB
    const { data: saved, error: saveErr } = await supabaseAdmin
      .from('social_designs')
      .insert({
        customer_id: customer.id,
        business_name: businessName,
        form_data: formData,
        designs: content.designs || [],
        brand_guidelines: content.brand_guidelines || {},
        status: 'completed'
      })
      .select()
      .single();

    if (saveErr) {
      console.error('Save error:', saveErr);
      // Still return the designs even if save fails
    }

    return jsonResponse({
      success: true,
      designs: content.designs || [],
      brand_guidelines: content.brand_guidelines || {},
      id: saved?.id || null
    });

  } catch (err) {
    console.error('generateSocialDesigns error:', err);
    return errorResponse(err.message || 'Internal error', 500);
  }
});
