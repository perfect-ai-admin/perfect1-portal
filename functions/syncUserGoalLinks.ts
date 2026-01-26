import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * מסנכרן קישורים בין User, CRMLead, UserGoal
 * מבטיח שכולם מקושרים נכון דרך user_id
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Admin only' }, { status: 403 });
        }

        const { auto_fix } = await req.json();

        console.log('🔍 Scanning for broken links between User, CRMLead, UserGoal...');

        // 1. שלוף את כל ה-CRMLeads
        const allLeads = await base44.asServiceRole.entities.CRMLead.list();
        
        const report = {
            total_leads: allLeads.length,
            fixed: 0,
            errors: []
        };

        for (const lead of allLeads) {
            try {
                // אם יש user_id - בדוק שהוא קיים
                if (lead.user_id) {
                    const goals = await base44.asServiceRole.entities.UserGoal.filter({ 
                        created_by: lead.email 
                    });
                    
                    // עדכן goals שחסר להם user_id
                    for (const goal of goals) {
                        if (!goal.user_id || goal.user_id !== lead.user_id) {
                            if (auto_fix) {
                                await base44.asServiceRole.entities.UserGoal.update(goal.id, {
                                    user_id: lead.user_id
                                });
                                report.fixed++;
                                console.log('✅ Fixed goal:', goal.id, '-> user_id:', lead.user_id);
                            } else {
                                report.errors.push({
                                    type: 'missing_user_id_in_goal',
                                    goal_id: goal.id,
                                    lead_id: lead.id
                                });
                            }
                        }
                    }
                }
                
                // אם אין user_id ב-Lead אבל יש email - חפש User מתאים
                if (!lead.user_id && lead.email) {
                    const users = await base44.asServiceRole.entities.User.list();
                    const matchingUser = users.find(u => u.email === lead.email);
                    
                    if (matchingUser) {
                        if (auto_fix) {
                            await base44.asServiceRole.entities.CRMLead.update(lead.id, {
                                user_id: matchingUser.id
                            });
                            report.fixed++;
                            console.log('✅ Linked lead:', lead.id, '-> user:', matchingUser.id);
                        } else {
                            report.errors.push({
                                type: 'unlinked_lead',
                                lead_id: lead.id,
                                email: lead.email
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('❌ Error processing lead:', lead.id, err.message);
            }
        }

        return Response.json({
            success: true,
            report,
            message: auto_fix ? `Fixed ${report.fixed} links` : `Found ${report.errors.length} issues`
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});