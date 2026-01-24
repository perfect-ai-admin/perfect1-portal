import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { action, goal_id, content, client_response, timeline_entry_id } = body;

        if (!goal_id) {
            return Response.json({ error: 'goal_id is required' }, { status: 400 });
        }

        // --- Helper: Get Profile ---
        const getProfile = async () => {
            const profiles = await base44.entities.ClientProfile.filter({ goal_id }, 1);
            if (profiles.data.length > 0) return profiles.data[0];
            
            // Create default profile if not exists
            return await base44.entities.ClientProfile.create({
                user_id: user.id,
                goal_id: goal_id,
                response_rate_week1: 0,
                task_completion_rate: 0,
                days_skipped: 0
            });
        };

        // --- Helper: Get Timeline ---
        const getTimeline = async (limit = 20) => {
            return await base44.entities.Timeline.filter({ goal_id }, '-created_date', limit);
        };

        // ==========================================
        // ACTION: ANALYZE RESPONSE
        // ==========================================
        if (action === 'analyze_response') {
            if (!client_response || !timeline_entry_id) {
                return Response.json({ error: 'client_response and timeline_entry_id required' }, { status: 400 });
            }

            const profile = await getProfile();
            const timelineHistory = await getTimeline();
            const goal = await base44.entities.UserGoal.get(goal_id);

            // Construct context for AI
            const context = {
                current_answer: client_response,
                question_asked: content || "Unknown question",
                profile: profile,
                strategic_context: goal?.strategic_context || {},
                history: timelineHistory.data.map(t => ({
                    q: t.content,
                    a: t.client_response,
                    analysis: t.ai_analysis
                })).reverse()
            };

            const prompt = `
        ROLE: אתה פסיכולוג עסקי + מנטור ותיק.
        INPUT:
        - תשובת הלקוח: "${client_response}"
        - הקשר מלא: ${JSON.stringify(context.history)}
        - פרופיל נוכחי: ${JSON.stringify(profile)}
        - הקשר אסטרטגי (סוג עסק, חזון, ציפיות): ${JSON.stringify(context.strategic_context)}

        ANALYZE:
1. מה הלקוח באמת אומר? (קרא בין השורות)
2. איזו תבנית התנהגותית זה חושף?
3. מה החסם האמיתי שמתגלה?
4. האם זה תואם לתשובות קודמות או סותר?
5. מה הלקוח מנסה להסתיר מעצמו?

OUTPUT (JSON):
{
  "surface_meaning": "מה הוא אמר במילים",
  "deep_meaning": "מה הוא באמת מתכוון",
  "pattern_detected": ["perfectionist", "fear_of_exposure", "action_avoider", "needs_structure", "inconsistent"], 
  "confidence_level": "high/medium/low",
  "recommended_adjustment": "האם לשנות את השאלה/משימה הבאה?",
  "intervention_needed": boolean,
  "intervention_reason": "סיבה להתערבות אם נדרש",
  "profile_updates": {
      "perfectionist": boolean (optional),
      "fear_of_exposure": boolean (optional),
      "needs_structure": boolean (optional),
      "action_avoider": boolean (optional)
  }
}
`;

            const aiRes = await base44.integrations.Core.InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        surface_meaning: { type: "string" },
                        deep_meaning: { type: "string" },
                        pattern_detected: { type: "array", items: { type: "string" } },
                        confidence_level: { type: "string" },
                        recommended_adjustment: { type: "string" },
                        intervention_needed: { type: "boolean" },
                        intervention_reason: { type: "string" },
                        profile_updates: { type: "object", additionalProperties: true }
                    },
                    required: ["deep_meaning", "intervention_needed"]
                }
            });

            const analysis = aiRes; // InvokeLLM returns the object directly when schema is provided

            // 1. Update Timeline Entry
            await base44.entities.Timeline.update(timeline_entry_id, {
                client_response: client_response,
                ai_analysis: JSON.stringify(analysis),
                tags: analysis.pattern_detected || [],
                status: "completed"
            });

            // 2. Update Profile
            if (analysis.profile_updates) {
                await base44.entities.ClientProfile.update(profile.id, analysis.profile_updates);
            }

            // 3. Handle Intervention
            if (analysis.intervention_needed) {
                await base44.entities.Intervention.create({
                    user_id: user.id,
                    goal_id: goal_id,
                    trigger_type: "AI Analysis",
                    intervention_text: analysis.intervention_reason || "AI detected an issue",
                    resolved: false
                });
            }

            // 4. Trigger Next Content Selection (Optional - could be separate call)
            // For now, return analysis
            return Response.json({ success: true, analysis });
        }

        // ==========================================
        // ACTION: GET NEXT CONTENT
        // ==========================================
        if (action === 'get_next_content') {
            const profile = await getProfile();
            const goal = await base44.entities.UserGoal.get(goal_id);
            
            if (!goal) return Response.json({ error: 'Goal not found' }, { status: 404 });

            const currentWeek = goal.current_week || 1;
            
            // Simple logic: Fetch content for this week
            // Filter by tags in profile if any
            let contentQuery = { week: currentWeek };
            
            // Advanced: use 'pattern_detected' from profile to filter content tags
            // For now, get all content for the week and pick one
            const contentCandidates = await base44.entities.ContentBank.filter(contentQuery, 50);
            
            if (contentCandidates.data.length === 0) {
                return Response.json({ message: "No content available for this week" });
            }

            // AI Selection Logic (Adaptive Engine)
            const selectionPrompt = `
            ROLE: אתה אוצר תוכן מותאם אישית.
            INPUT:
            - Current: Week ${currentWeek}
            - Client Profile: ${JSON.stringify(profile)}
            - Strategic Context (Business Type, Vision): ${JSON.stringify(goal.strategic_context || {})}
            - Candidates: ${JSON.stringify(contentCandidates.data.map(c => ({ id: c.id, content: c.content, tags: c.tags, difficulty: c.difficulty })))}

            TASK:
בחר את השאלה/משימה הבאה הכי מתאימה מהרשימה.
קריטריונים:
1. התאמה לפרופיל (פחד, פרפקציוניזם וכו')
2. רמת קושי מתאימה

OUTPUT (JSON):
{
    "selected_content_id": "id_from_candidates",
    "personalized_content": "התוכן מותאם אישית ללקוח (שנה ניסוח אם צריך)",
    "reasoning": "למה בחרת בזה"
}
`;

            const selectionRes = await base44.integrations.Core.InvokeLLM({
                prompt: selectionPrompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        selected_content_id: { type: "string" },
                        personalized_content: { type: "string" },
                        reasoning: { type: "string" }
                    },
                    required: ["selected_content_id"]
                }
            });

            const selected = contentCandidates.data.find(c => c.id === selectionRes.selected_content_id) || contentCandidates.data[0];
            const personalizedContent = selectionRes.personalized_content || selected.content;

            // Create Timeline Entry
            const newTimelineEntry = await base44.entities.Timeline.create({
                user_id: user.id,
                goal_id: goal_id,
                week: currentWeek,
                day: goal.current_day || 1, // Need to handle day increment logic elsewhere
                type: selected.type,
                content: personalizedContent,
                status: "pending"
            });

            return Response.json({ 
                success: true, 
                timeline_entry: newTimelineEntry,
                selection_reason: selectionRes.reasoning 
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});