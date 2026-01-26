import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Backfill Script - הכנת המערכת ל-DLQ + AgentRun
 * מנרמל טלפונים, מקשר entities, מנקה נתונים
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // אימות admin
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
        }
        
        const body = await req.json().catch(() => ({}));
        const { action = 'full_backfill', dryRun = false } = body;
        
        const results = {
            phones_normalized: 0,
            users_linked: 0,
            goals_linked: 0,
            chat_trimmed: 0,
            errors: []
        };
        
        console.log(`🚀 Starting backfill (dryRun: ${dryRun})`);
        
        // 1) נרמול טלפונים ב-CRMLead
        const leads = await base44.asServiceRole.entities.CRMLead.list();
        
        for (const lead of leads) {
            try {
                if (!lead.phone_normalized && lead.phone) {
                    const normalized = normalizePhone(lead.phone);
                    
                    if (!dryRun) {
                        await base44.asServiceRole.entities.CRMLead.update(lead.id, {
                            phone_normalized: normalized
                        });
                    }
                    
                    results.phones_normalized++;
                    console.log(`📱 Normalized: ${lead.phone} → ${normalized}`);
                }
            } catch (err) {
                results.errors.push({ lead_id: lead.id, error: err.message });
            }
        }
        
        // 2) קישור CRMLead ↔ User
        for (const lead of leads) {
            try {
                if (!lead.user_id && (lead.email || lead.phone_normalized)) {
                    const allUsers = await base44.asServiceRole.entities.User.list();
                    
                    const matchingUser = allUsers.find(u => 
                        (lead.email && u.email === lead.email) ||
                        (lead.phone_normalized && normalizePhone(u.phone) === lead.phone_normalized)
                    );
                    
                    if (matchingUser && !dryRun) {
                        await base44.asServiceRole.entities.CRMLead.update(lead.id, {
                            user_id: matchingUser.id
                        });
                        results.users_linked++;
                        console.log(`🔗 Linked lead ${lead.id} → user ${matchingUser.id}`);
                    }
                }
            } catch (err) {
                results.errors.push({ lead_id: lead.id, error: err.message });
            }
        }
        
        // 3) קישור UserGoal → CRMLead
        const goals = await base44.asServiceRole.entities.UserGoal.list();
        
        for (const goal of goals) {
            try {
                if (!goal.lead_id && goal.user_id) {
                    const userLeads = leads.filter(l => l.user_id === goal.user_id);
                    
                    if (userLeads.length > 0 && !dryRun) {
                        await base44.asServiceRole.entities.UserGoal.update(goal.id, {
                            lead_id: userLeads[0].id
                        });
                        results.goals_linked++;
                        console.log(`🔗 Linked goal ${goal.id} → lead ${userLeads[0].id}`);
                    }
                }
            } catch (err) {
                results.errors.push({ goal_id: goal.id, error: err.message });
            }
        }
        
        // 4) גיזום chat_history ארוך
        for (const lead of leads) {
            try {
                if (lead.chat_history && lead.chat_history.length > 100) {
                    const trimmed = lead.chat_history.slice(-100);
                    
                    if (!dryRun) {
                        await base44.asServiceRole.entities.CRMLead.update(lead.id, {
                            chat_history: trimmed
                        });
                    }
                    
                    results.chat_trimmed++;
                    console.log(`✂️ Trimmed chat history for lead ${lead.id}: ${lead.chat_history.length} → 100`);
                }
            } catch (err) {
                results.errors.push({ lead_id: lead.id, error: err.message });
            }
        }
        
        console.log('✅ Backfill completed');
        
        return Response.json({
            success: true,
            dryRun,
            results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Backfill error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function normalizePhone(phone) {
    if (!phone) return null;
    let cleaned = phone.toString().replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '972' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('972')) {
        cleaned = '972' + cleaned;
    }
    return cleaned;
}