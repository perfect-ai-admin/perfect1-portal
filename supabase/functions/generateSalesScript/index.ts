// Edge Function: generateSalesScript
// Generates a personalised sales script using AI.
// The client (CreateScriptDialog) is responsible for persisting the result via entities.SalesScript.create().
// Expected request body: { type?, scenario, audience?, goal, keyPoints? }
// Response shape: { title, script, tips, ... }  (full generated object)

import { getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const { type, scenario, audience, goal, keyPoints } = await req.json();

    if (!scenario) return errorResponse('scenario is required', 400);
    if (!goal) return errorResponse('goal is required', 400);

    const typeLabel: Record<string, string> = {
      opening: 'פתיחה וסינון',
      discovery: 'בירור צרכים',
      pitch: 'הצגת פתרון',
      objection: 'טיפול בהתנגדות',
      closing: 'סגירה',
      followup: 'פולואו-אפ',
    };

    const scriptType = typeLabel[type] || type || 'כללי';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `אתה מומחה מכירות ישראלי. צור סקריפט מכירה מקצועי בעברית עבור סוג שיחה: ${scriptType}.
החזר JSON עם השדות הבאים:
- title (string): כותרת קצרה לסקריפט
- script (string): טקסט הסקריפט המלא — ניתן לכלול הנחיות בסוגריים מרובעים
- opening (string): משפט הפתיחה המומלץ
- discovery_questions (array of strings): שאלות גילוי
- pitch (string): הצגת הפתרון
- objection_handling (array of {objection: string, response: string}): טיפול בהתנגדויות
- closing (string): משפט הסגירה המומלץ
- tips (array of strings): טיפים נוספים למוכר`,
        },
        {
          role: 'user',
          content: `סיטואציה: ${scenario}\nקהל יעד: ${audience || 'כללי'}\nמטרת השיחה: ${goal}\nנקודות מפתח: ${keyPoints || ''}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const generated = JSON.parse(completion.choices[0].message.content || '{}');

    // Ensure required fields have fallbacks
    const response = {
      title: generated.title || `סקריפט ${scriptType} - ${scenario.slice(0, 30)}`,
      script: generated.script || '',
      opening: generated.opening || '',
      discovery_questions: generated.discovery_questions || [],
      pitch: generated.pitch || '',
      objection_handling: generated.objection_handling || [],
      closing: generated.closing || '',
      tips: generated.tips || [],
    };

    return jsonResponse(response);
  } catch (error) {
    return errorResponse((error as Error).message);
  }
});
