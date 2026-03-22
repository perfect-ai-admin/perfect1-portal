import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // This is a system function, usually triggered by cron
        const user = await base44.auth.me();
        
        // Admin check (or system role if triggered by cron, but here we assume admin/system)
        if (user && user.role !== 'admin') {
           // return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const scope = body.scope || 'daily'; // daily, weekly

        // 1. Gather Data (Logs)
        // Fetch recent CRM leads to analyze chat history
        // In a real scenario, we might need a more efficient way to query logs if they are huge
        // Here we take the last 50 active leads for analysis
        const recentLeads = await base44.entities.CRMLead.filter({ 
            // status: 'in_progress' // Filter if possible
        }, '-created_date', 50);

        // Fetch recent timeline entries (interactions)
        const recentTimeline = await base44.entities.Timeline.list('-created_date', 100);

        // 2. Prepare Data for Analysis
        const conversations = recentLeads.data.map(lead => ({
            id: lead.id,
            status: lead.status,
            history: lead.chat_history || [],
            last_contact: lead.last_contact_date
        })).filter(c => c.history.length > 0);

        const interactions = recentTimeline.data.map(t => ({
            type: t.type,
            content: t.content,
            response: t.client_response,
            analysis: t.ai_analysis,
            status: t.status
        }));

        // 3. AI Analysis (QualityLearning_Brain)
        const prompt = `
        ROLE: QualityLearning_Brain
        TASK: Analyze the recent conversation logs and identify friction points, quality issues, and opportunities for improvement.

        DATA:
        Conversations: ${JSON.stringify(conversations.slice(0, 10))} 
        Interactions: ${JSON.stringify(interactions.slice(0, 20))}

        OBJECTIVES:
        1. Identify "Drop-off points" (where users stop responding).
        2. Identify "Confusion" (repeated questions, "I don't understand").
        3. Identify "Quality Issues" (long answers, robotic tone).
        4. Suggest "Copy Improvements" (better phrasing).
        5. Suggest "New Rules" (e.g., "If user asks X, move to human").

        OUTPUT JSON format:
        {
            "metrics": {
                "drop_off_rate": number (0-1),
                "confusion_rate": number (0-1),
                "sentiment_score": number (0-10)
            },
            "issues": [
                { "type": "drop_off" | "confusion" | "quality", "description": "...", "severity": "high" | "medium" | "low", "affected_area": "..." }
            ],
            "suggestions": [
                {
                    "type": "copy" | "rule",
                    "target_area": "...",
                    "current_state": "...",
                    "suggestion": "...",
                    "reasoning": "..."
                }
            ],
            "summary": "Short narrative summary of the analysis"
        }
        `;

        const analysisRes = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    metrics: { 
                        type: "object", 
                        properties: {
                            drop_off_rate: { type: "number" },
                            confusion_rate: { type: "number" },
                            sentiment_score: { type: "number" }
                        }
                    },
                    issues: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                type: { type: "string" },
                                description: { type: "string" },
                                severity: { type: "string" },
                                affected_area: { type: "string" }
                            }
                        }
                    },
                    suggestions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                type: { type: "string" },
                                target_area: { type: "string" },
                                current_state: { type: "string" },
                                suggestion: { type: "string" },
                                reasoning: { type: "string" }
                            }
                        }
                    },
                    summary: { type: "string" }
                },
                required: ["metrics", "issues", "suggestions", "summary"]
            }
        });

        // 4. Store Results
        
        // Save Insight
        await base44.entities.QualityInsight.create({
            date: new Date().toISOString().split('T')[0],
            scope: scope,
            metrics: analysisRes.metrics,
            issues_detected: analysisRes.issues,
            narrative_summary: analysisRes.summary
        });

        // Save Suggestions
        for (const sugg of analysisRes.suggestions) {
            await base44.entities.OptimizationSuggestion.create({
                type: sugg.type,
                target_bot_id: sugg.target_area, // Approximate mapping
                target_state: "unknown",
                current_content: sugg.current_state,
                suggested_content: sugg.suggestion,
                reasoning: sugg.reasoning,
                status: "pending",
                created_at: new Date().toISOString()
            });
        }

        return Response.json({ success: true, analysis: analysisRes });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});