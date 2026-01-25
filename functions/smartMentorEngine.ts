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
            6. האם התוכן (השאלה/משימה) היה אפקטיבי?

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
            },
            "effectiveness_score": number (1-5, based on depth and honesty of answer),
            "strategy_update_for_mentor": "הערה קצרה לעצמך לעתיד: איך לגשת ללקוח הזה טוב יותר? (למשל: 'להיות ישיר יותר', 'לתת יותר חיזוקים', 'לאתגר אותו')"
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
                              profile_updates: { type: "object", additionalProperties: true },
                              effectiveness_score: { type: "number" },
                              strategy_update_for_mentor: { type: "string" }
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

            // 1.1 Learn & Feedback Loop: Update ContentBank and Strategy
            const timelineEntry = await base44.entities.Timeline.get(timeline_entry_id);
            if (timelineEntry && timelineEntry.content_id) {
                // Update content effectiveness (simple weighted average or increment)
                const contentItem = await base44.entities.ContentBank.get(timelineEntry.content_id);
                if (contentItem) {
                    const score = analysis.effectiveness_score || 3; // Default to neutral if not provided
                    const currentRating = contentItem.effectiveness_rating || 0;
                    const usage = contentItem.usage_count || 1;

                    // Weighted update: 90% history, 10% new score
                    const newRating = currentRating === 0 ? score : (currentRating * 0.9 + score * 0.1);

                    await base44.entities.ContentBank.update(timelineEntry.content_id, {
                        effectiveness_rating: parseFloat(newRating.toFixed(2))
                    });
                }
            }

            // 2. Update Profile & Strategy
            let profileUpdates = analysis.profile_updates || {};

            // Append strategy notes if provided
            if (analysis.strategy_update_for_mentor) {
                const currentNotes = profile.mentor_strategy_notes || "";
                const timestamp = new Date().toISOString().split('T')[0];
                profileUpdates.mentor_strategy_notes = currentNotes + `\n[${timestamp}] ${analysis.strategy_update_for_mentor}`;
            }

            if (Object.keys(profileUpdates).length > 0) {
                await base44.entities.ClientProfile.update(profile.id, profileUpdates);
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
        // ACTION: ORCHESTRATE JOURNEY (NEW)
        // ==========================================
        if (action === 'orchestrate_journey') {
            const { lead_id, trigger_event, context } = body;

            if (!lead_id) {
                return Response.json({ error: 'lead_id is required' }, { status: 400 });
            }

            // 1. Fetch Lead State
            const lead = await base44.entities.CRMLead.get(lead_id);
            if (!lead) return Response.json({ error: 'Lead not found' }, { status: 404 });

            let updates = {};
            let decision = {
                handler: lead.active_handler || 'LeadRouter_Entry',
                action: 'continue',
                reason: 'default flow'
            };

            const currentState = {
                stage: lead.journey_stage || 'lead_new',
                process: lead.active_process || 'none',
                handler: lead.active_handler,
                risk: (lead.risk_flags || []).includes('high') ? 'high' : 'low',
                human_req: lead.journey_stage === 'human_required'
            };

            // --- RULE 3: Escalation / Human Handoff ---
            if (currentState.human_req || currentState.risk === 'high') {
                // Stop everything, assign to human
                return Response.json({
                    success: true,
                    decision: {
                        handler: 'Human_Agent',
                        action: 'stop_automation',
                        reason: 'Escalation required (Risk or Manual Flag)'
                    },
                    updates: {
                        journey_stage: 'human_required',
                        active_process: 'none',
                        active_handler: 'Human_Agent'
                    }
                });
            }

            // --- RULE 1: Regulatory Wins ---
            // If in critical process, block marketing/nurture
            const criticalProcesses = ['filing', 'onboarding', 'signing_opening'];
            if (criticalProcesses.includes(currentState.process)) {
                 // Force handler to be the process owner
                 let requiredHandler = 'TaxFiling_Manager'; // default for filing
                 if (currentState.process === 'onboarding') requiredHandler = 'OpeningBot';
                 if (currentState.process === 'signing_opening') requiredHandler = 'OpeningBot';

                 // If trigger is "sales_pitch" or "marketing", block it
                 if (trigger_event === 'marketing_blast' || trigger_event === 'warmup') {
                     return Response.json({
                         success: true,
                         decision: {
                             handler: 'none',
                             action: 'block',
                             reason: 'Critical process active'
                         }
                     });
                 }

                 // Allow only process-related queries or urgent support
                 updates.active_handler = requiredHandler;
            }

            // --- SCENARIO LOGIC (State Machine) ---

            // Scenario 1: New Lead
            if (currentState.stage === 'lead_new') {
                updates.active_handler = 'LeadRouter_Entry';
                updates.next_best_action = 'qualify_needs';
                decision.reason = 'New lead entry';
            }

            // Scenario 2: Post Call Pending
            else if (currentState.stage === 'post_call_pending') {
                updates.active_handler = 'SmartSalesAgent';
                // Scheduler should pick this up for followup
            }

            // Scenario 3: Nurture (No answer for X days)
            // This logic is usually triggered by scheduler, here we just validate state
            else if (currentState.stage === 'nurture') {
                 updates.active_handler = 'NurtureBot_Reengage';
            }

            // Scenario 4: Closed / Onboarding
            else if (currentState.stage === 'deal_closed') {
                updates.journey_stage = 'onboarding_docs';
                updates.active_process = 'onboarding';
                updates.active_handler = 'OpeningBot';
            }

            // Scenario 5: Filing Period (Regulatory)
            // Triggered externally by "filing_period_open" event usually
            if (trigger_event === 'filing_period_open') {
                updates.active_process = 'filing';
                updates.journey_stage = 'filing_period_active';
                updates.active_handler = 'TaxFiling_Manager';
            }

            // --- RULE 2: Single Handler ---
            if (updates.active_handler && updates.active_handler !== lead.active_handler) {
                decision.handler = updates.active_handler;
                decision.action = 'switch_handler';
            }

            // Apply Updates
            if (Object.keys(updates).length > 0) {
                await base44.entities.CRMLead.update(lead_id, updates);
            }

            // Return final decision for the caller (Router)
            return Response.json({
                success: true,
                decision,
                current_state: { ...currentState, ...updates }
            });
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
            - Mentor Strategy Notes (LEARNINGS): ${profile.mentor_strategy_notes || "None yet"}
            - Strategic Context (Business Type, Vision): ${JSON.stringify(goal.strategic_context || {})}
            - Candidates: ${JSON.stringify(contentCandidates.data.map(c => ({ id: c.id, content: c.content, tags: c.tags, difficulty: c.difficulty, rating: c.effectiveness_rating })))}

            TASK:
            בחר את השאלה/משימה הבאה הכי מתאימה מהרשימה.
            קריטריונים:
            1. התאמה לפרופיל ולמדדים שנלמדו עליו (ראה Strategy Notes)
            2. רמת קושי מתאימה
            3. העדף תוכן עם rating גבוה אם מתאים לקונטקסט

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

            // Update usage count
            await base44.entities.ContentBank.update(selected.id, {
                usage_count: (selected.usage_count || 0) + 1
            });

            // Create Timeline Entry
            const newTimelineEntry = await base44.entities.Timeline.create({
                user_id: user.id,
                goal_id: goal_id,
                content_id: selected.id, // Link to content for feedback loop
                week: currentWeek,
                day: goal.current_day || 1, 
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

        // ==========================================
        // ACTION: SEND WHATSAPP
        // ==========================================
        if (action === 'send_whatsapp') {
            const { content } = body;

            if (!content) {
                return Response.json({ error: 'content is required' }, { status: 400 });
            }

            try {
                const user = await base44.auth.me();
                if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

                // Get user's lead to find phone number
                const leads = await base44.asServiceRole.entities.CRMLead.filter({ 
                    $or: [{ created_by: user.email }, { id: user.id }]
                }, 1);

                if (!leads.data || leads.data.length === 0) {
                    return Response.json({ success: false, message: 'No lead found for user' });
                }

                const phone = leads.data[0].phone;
                const cleanPhone = phone.replace('+', '').replace(/\D/g, '');

                // Send via greenApiWebhook's sendWhatsAppMessage logic
                const instanceId = Deno.env.get('GREENAPI_INSTANCE_ID');
                const apiToken = Deno.env.get('GREENAPI_API_TOKEN');

                if (!instanceId || !apiToken) {
                    return Response.json({ error: 'Green-API credentials not configured' }, { status: 500 });
                }

                const url = `https://api.greenapi.com/waInstance${instanceId}/sendMessage/${apiToken}`;
                const payload = {
                    chatId: `${cleanPhone}@c.us`,
                    message: content
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.text();

                if (!response.ok) {
                    console.error('Green-API error:', result);
                    return Response.json({ success: false, error: result }, { status: 500 });
                }

                return Response.json({ success: true, message_sent: true });
            } catch (err) {
                return Response.json({ error: err.message }, { status: 500 });
            }
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});