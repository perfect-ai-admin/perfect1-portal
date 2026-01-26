import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * מעקב ביצועי סוכנים
 * מתעד איזה agent עבד עם המשתמש, כמה זמן, ומה התוצאה
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, agent_name, user_id, goal_id, duration_seconds, outcome, metadata } = await req.json();

        if (action === 'log_interaction') {
            if (!agent_name || !user_id) {
                return Response.json({ error: 'agent_name and user_id required' }, { status: 400 });
            }

            // יצירת לוג אינטראקציה
            await base44.asServiceRole.entities.ConversationLog.create({
                user_id: user_id,
                goal_id: goal_id,
                agent_name: agent_name,
                channel: 'whatsapp',
                messages: metadata?.messages || [],
                duration_minutes: duration_seconds ? Math.round(duration_seconds / 60) : null,
                outcome: outcome,
                sentiment_analysis: metadata?.sentiment,
                extracted_insights: metadata?.insights || []
            });

            return Response.json({ success: true, logged: true });
        }

        if (action === 'get_agent_stats') {
            // סטטיסטיקות לפי agent
            const logs = await base44.asServiceRole.entities.ConversationLog.filter(
                agent_name ? { agent_name } : {},
                '-created_date',
                100
            );

            const stats = {
                total_conversations: logs.length,
                by_agent: {},
                avg_duration: 0,
                outcomes: {}
            };

            logs.forEach(log => {
                if (log.agent_name) {
                    stats.by_agent[log.agent_name] = (stats.by_agent[log.agent_name] || 0) + 1;
                }
                if (log.outcome) {
                    stats.outcomes[log.outcome] = (stats.outcomes[log.outcome] || 0) + 1;
                }
                if (log.duration_minutes) {
                    stats.avg_duration += log.duration_minutes;
                }
            });

            if (logs.length > 0) {
                stats.avg_duration = Math.round(stats.avg_duration / logs.length);
            }

            return Response.json({ success: true, stats });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error in agent performance tracker:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});