import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * מאכלס את הרכיבים הקיימים במערכת לטבלת SystemComponent
 * מריץ פעם אחת כדי לאתחל את הנתונים
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const components = [
            // Bots & Agents
            {
                name: 'getPersonalizedContext',
                category: 'backend_functions',
                short_description: 'מחזיר הקשר מותאם אישית למשתמש לפני כל אינטראקציה',
                full_description: 'פונקציה זו שולפת את זיכרון המשתמש, מטרותיו, שיחותיו האחרונות ובונה הקשר מלא שמאפשר לסוכנים והמנטורים להתאים את עצמם באופן אישי לכל משתמש. היא מספקת המלצות על סגנון תקשורת, פורמט תוכן, ופעולות הבאות מומלצות.',
                is_active: true,
                file_path: 'functions/getPersonalizedContext.js',
                dependencies: ['UserMemory', 'ConversationLog', 'UserGoal']
            },
            {
                name: 'updateUserMemory',
                category: 'backend_functions',
                short_description: 'מעדכן את זיכרון המשתמש אחרי כל שיחה ולומד ממנה',
                full_description: 'פונקציה זו מנתחת כל שיחה עם המשתמש באמצעות AI, מחלצת תובנות, מזהה דפוסים, ומעדכנת את זיכרון המשתמש. היא לומדת את תכונות האישיות, העדפות, אתגרים, והתקדמות - ומשפרת כל הזמן את ההתאמה האישית.',
                is_active: true,
                file_path: 'functions/updateUserMemory.js',
                dependencies: ['UserMemory', 'ConversationLog', 'OpenAI']
            },
            {
                name: 'smartMentorEngine',
                category: 'backend_functions',
                short_description: 'המנוע המרכזי של המנטור החכם שמנהל את כל תהליך הליווי',
                full_description: 'זהו המנוע המרכזי שמנהל את תהליך הליווי העסקי. הוא קורא את זיכרון המשתמש, מבין את ההקשר, שואל שאלות מותאמות אישית, מציע משימות, ולומד מכל אינטראקציה. המנוע משלב AI מתקדם עם בנק תוכן קיים ויוצר חוויה אישית לחלוטין.',
                is_active: true,
                file_path: 'functions/smartMentorEngine.js',
                dependencies: ['UserMemory', 'ContentBank', 'Timeline', 'UserGoal']
            },
            {
                name: 'whatsappMiddleware',
                category: 'backend_functions',
                short_description: 'בודק סטטוס משתמש לפני שליחת הודעות WhatsApp',
                full_description: 'פונקציית ביניים שבודקת את סטטוס המשתמש (פעיל/מושהה/חסום) לפני שליחת כל הודעת WhatsApp. משתמשים מושהים לא יקבלו הודעות WhatsApp אך עדיין יכולים לגשת למערכת. משתמשים חסומים לא יקבלו שום תקשורת.',
                is_active: true,
                file_path: 'functions/whatsappMiddleware.js',
                dependencies: ['User']
            },
            
            // Entities
            {
                name: 'UserMemory',
                category: 'entities',
                short_description: 'זיכרון מצטבר על המשתמש - מה למדנו עליו ואיך להתאים לו את המערכת',
                full_description: 'ישות זו מאחסנת את כל מה שהמערכת למדה על המשתמש: תכונות אישיות, סגנון תקשורת, העדפות תוכן, הקשר עסקי, דפוסי אינטראקציה, התקדמות, ואסטרטגיית ההתאמה האישית. היא מתעדכנת כל הזמן ומשפרת את היכולת של המערכת להתאים עצמה.',
                is_active: true,
                file_path: 'entities/UserMemory.json',
                dependencies: []
            },
            {
                name: 'ConversationLog',
                category: 'entities',
                short_description: 'לוג של כל השיחות עם המשתמש כולל תובנות וסנטימנט',
                full_description: 'שומר את כל השיחות של המשתמש עם הסוכנים והמנטורים. כל שיחה מתועדת עם ההקשר, התובנות שחולצו, סנטימנט, משימות שנוצרו, ותוצאה. מאפשר למידה מתמשכת ומעקב אחר התפתחות המשתמש.',
                is_active: true,
                file_path: 'entities/ConversationLog.json',
                dependencies: []
            },
            {
                name: 'SystemComponent',
                category: 'entities',
                short_description: 'מחזיק את כל רכיבי המערכת והגדרותיהם לניהול מרכזי',
                full_description: 'ישות זו מאפשרת ניהול מרכזי של כל הרכיבים במערכת - בוטים, פונקציות, ישויות, ותכונות. לכל רכיב יש תיאור, הגדרות, תלויות, וסטטוס. מאפשרת לעדכן התנהגות המערכת דרך ממשק ניהול.',
                is_active: true,
                file_path: 'entities/SystemComponent.json',
                dependencies: []
            },

            // Client Features
            {
                name: 'ClientDashboard',
                category: 'client_features',
                short_description: 'הדשבורד הראשי של הלקוח - נקודת הכניסה לכל השירותים',
                full_description: 'הדף המרכזי שבו הלקוח מתחבר למערכת. כולל טאבים למנטור, מטרות, שיווק, פיננסים, התקדמות. משתמש בזיכרון המשתמש כדי להציג תוכן מותאם אישית ולהמליץ על הצעד הבא.',
                is_active: true,
                file_path: 'pages/ClientDashboard.js',
                dependencies: ['UserMemory', 'UserGoal', 'MentorTab']
            },
            {
                name: 'MentorTab',
                category: 'client_features',
                short_description: 'טאב המנטור - שיחות חכמות עם המנטור האישי',
                full_description: 'ממשק השיחה עם המנטור החכם. מציג היסטוריה, מאפשר שיחה בזמן אמת, ומתאים את עצמו לפי זיכרון המשתמש. המנטור זוכר הכל, לומד מכל שיחה, ומתאים את השאלות והמשימות.',
                is_active: true,
                file_path: 'components/client/tabs/MentorTab.js',
                dependencies: ['smartMentorEngine', 'UserMemory']
            },
            {
                name: 'GoalsTab',
                category: 'client_features',
                short_description: 'ניהול מטרות עסקיות ומעקב התקדמות',
                full_description: 'מאפשר למשתמש להגדיר מטרות עסקיות, לעקוב אחרי התקדמות, ולקבל משימות מותאמות. המערכת לומדת מה מתאים לכל משתמש ומציעה מטרות ומשימות בהתאם.',
                is_active: true,
                file_path: 'components/client/tabs/GoalsTab.js',
                dependencies: ['UserGoal', 'UserMemory']
            }
        ];

        const created = [];
        for (const comp of components) {
            const existing = await base44.asServiceRole.entities.SystemComponent.filter({
                name: comp.name
            });
            
            if (existing.length === 0) {
                const result = await base44.asServiceRole.entities.SystemComponent.create(comp);
                created.push(result);
            }
        }

        return Response.json({
            success: true,
            message: `נוצרו ${created.length} רכיבים חדשים`,
            created: created.length,
            total: components.length
        });

    } catch (error) {
        console.error('Error seeding components:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});