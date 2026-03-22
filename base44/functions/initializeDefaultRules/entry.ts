import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const defaultRules = [
            {
                name: 'חוסר פעילות - 7 ימים',
                trigger_type: 'inactivity',
                conditions: { days_inactive: 7 },
                actions: [
                    {
                        type: 'send_email',
                        data: {
                            subject: 'חזקת להתחיל עם BizPilot 💪',
                            body: 'לא ראינו אותך הרבה זמן. בואו נתחיל לגדול ביחד!'
                        }
                    },
                    {
                        type: 'log_activity',
                        data: { message: 'תזכורת חוסר פעילות נשלחה' }
                    }
                ],
                is_active: true,
                priority: 5
            },
            {
                name: 'תזכורת תום מסלול',
                trigger_type: 'plan_expiring',
                conditions: { days_until_due: 7 },
                actions: [
                    {
                        type: 'send_email',
                        data: {
                            subject: 'המסלול שלך חדל בעוד שבוע',
                            body: 'המסלול שלך פקיעות בעוד 7 ימים. בואו נחדש!'
                        }
                    }
                ],
                is_active: true,
                priority: 8
            },
            {
                name: 'תזכורת מטרה קרובה',
                trigger_type: 'goal_due',
                conditions: { days_until_due: 7 },
                actions: [
                    {
                        type: 'send_notification',
                        data: { message: 'המטרה שלך אמורה להסתיים בעוד שבוע! תן בראש! 💪' }
                    }
                ],
                is_active: true,
                priority: 6
            },
            {
                name: 'ברכה על התחברות ראשונה',
                trigger_type: 'first_login',
                conditions: {},
                actions: [
                    {
                        type: 'send_notification',
                        data: { message: 'ברוכים הבאים ל-BizPilot! 🚀 בואו נתחיל' }
                    },
                    {
                        type: 'log_activity',
                        data: { message: 'משתמש חדש נכנס לראשונה' }
                    }
                ],
                is_active: true,
                priority: 10
            }
        ];

        const created = [];
        for (const rule of defaultRules) {
            try {
                const existing = await base44.asServiceRole.entities.RulesEngine.filter({
                    name: rule.name
                });

                if (existing.length === 0) {
                    const result = await base44.asServiceRole.entities.RulesEngine.create(rule);
                    created.push(result.name);
                }
            } catch (error) {
                console.error(`Error creating rule ${rule.name}:`, error);
            }
        }

        return Response.json({
            success: true,
            created,
            message: `${created.length} default rules initialized`
        });

    } catch (error) {
        console.error('Error initializing rules:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});