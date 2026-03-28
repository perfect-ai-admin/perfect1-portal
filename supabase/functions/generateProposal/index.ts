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
    const { businessName, field, targetAudience, sendMethod, salesStyle, keyMessage, serviceStructure, hasCTA, colorPreference, reusability, format } = formData || {};

    const prompt = `אתה מומחה כתיבת הצעות מחיר שמוכרות. צור הצעת מחיר מקצועית עבור "${businessName || 'העסק'}" בתחום ${field || 'כללי'}.

פרטים:
- קהל יעד: ${targetAudience || 'עסקים'}
- שיטת שליחה: ${(sendMethod || []).join(', ') || 'מייל'}
- סגנון מכירה: ${salesStyle || 'מקצועי'}
- מסר מפתח: ${keyMessage || ''}
- מבנה שירותים: ${serviceStructure || 'חבילות'}
- CTA: ${hasCTA || 'כן'}
- צבעים: ${colorPreference || 'כחול מקצועי'}

צור הצעת מחיר מלאה בפורמט JSON:
{
  "proposal": {
    "header": { "title": "...", "subtitle": "...", "date": "..." },
    "intro": { "greeting": "...", "pain_point": "...", "solution_promise": "..." },
    "about": { "title": "...", "description": "...", "usp_points": ["..."] },
    "services": [
      { "name": "...", "description": "...", "price": "...", "features": ["..."] }
    ],
    "why_us": ["..."],
    "testimonial": { "quote": "...", "author": "..." },
    "cta": { "text": "...", "urgency": "..." },
    "terms": ["..."],
    "contact": { "note": "..." }
  },
  "design": {
    "primary_color": "...",
    "secondary_color": "...",
    "font_style": "...",
    "layout": "..."
  }
}

הצעת המחיר צריכה להיות משכנעת, מקצועית, ובנויה כך שקל ללקוח להגיד כן.`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'אתה מומחה יצירת הצעות מחיר. תמיד תחזיר JSON תקין בלבד.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
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
      .from('proposals')
      .insert({
        customer_id: customer.id,
        business_name: businessName,
        form_data: formData,
        proposal_data: content.proposal || content,
        design_config: content.design || {},
        status: 'completed'
      })
      .select()
      .single();

    if (saveErr) {
      console.error('Save error:', saveErr);
    }

    return jsonResponse({
      success: true,
      proposal: content.proposal || content,
      design: content.design || {},
      id: saved?.id || null
    });

  } catch (err) {
    console.error('generateProposal error:', err);
    return errorResponse(err.message || 'Internal error', 500);
  }
});
