import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * מבטיח קישורים עקביים בין User ↔ CRMLead ↔ UserGoal
 * מופעל אוטומטית בכל נקודת כניסה
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { phone_normalized, email, create_if_missing } = await req.json();

        if (!phone_normalized && !email) {
            return Response.json({ error: 'phone_normalized or email required' }, { status: 400 });
        }

        let user = null;
        let lead = null;

        // 1. חפש User קיים
        if (email) {
            const users = await base44.asServiceRole.entities.User.filter({ email }, '-created_date', 1);
            if (users.length > 0) {
                user = users[0];
            }
        }

        if (!user && phone_normalized) {
            const allUsers = await base44.asServiceRole.entities.User.list();
            user = allUsers.find(u => {
                if (!u.phone) return false;
                const normalized = normalizePhone(u.phone);
                return normalized === phone_normalized;
            });
        }

        // 2. חפש CRMLead
        if (phone_normalized) {
            const leads = await base44.asServiceRole.entities.CRMLead.filter({ 
                phone_normalized 
            }, '-created_date', 1);
            
            if (leads.length > 0) {
                lead = leads[0];
            }
        }

        // 3. צור חסרים אם נדרש
        if (create_if_missing) {
            if (!user && email) {
                // צור User system (בסופו המשתמש יזמן רגיל)
                console.log('📝 Creating system user for:', email);
                // לא יכולים ליצור User ישירות - רק invite
                // נשאיר lead orphan עד שיצור חשבון
            }

            if (!lead && phone_normalized) {
                lead = await base44.asServiceRole.entities.CRMLead.create({
                    full_name: 'WhatsApp User',
                    phone: phone_normalized,
                    phone_normalized: phone_normalized,
                    email: email,
                    user_id: user?.id,
                    source: 'WhatsApp',
                    status: 'new',
                    journey_stage: 'lead_new',
                    active_handler: 'LeadRouter'
                });
            }
        }

        // 4. סנכרן קישורים
        if (user && lead && !lead.user_id) {
            await base44.asServiceRole.entities.CRMLead.update(lead.id, {
                user_id: user.id,
                email: user.email
            });
        }

        // 5. סנכרן UserGoals
        if (user && lead) {
            const goals = await base44.asServiceRole.entities.UserGoal.filter({ 
                user_id: user.id 
            });
            
            for (const goal of goals) {
                if (!goal.lead_id) {
                    await base44.asServiceRole.entities.UserGoal.update(goal.id, {
                        lead_id: lead.id
                    });
                }
            }
        }

        return Response.json({
            success: true,
            user: user ? { id: user.id, email: user.email } : null,
            lead: lead ? { id: lead.id, phone: lead.phone_normalized } : null,
            links_synced: true
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function normalizePhone(phone) {
    if (!phone) return null;
    let cleaned = phone.toString().replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.startsWith('0')) cleaned = '972' + cleaned.substring(1);
    if (!cleaned.startsWith('972')) cleaned = '972' + cleaned;
    return cleaned;
}