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
            // ===== AI AGENTS (BOTS) - כל 16 הסוכנים =====
            {
                name: 'idea_formulation',
                category: 'bots',
                short_description: 'בוט לגיבוש רעיונות עסקיים ובדיקת היתכנות',
                full_description: 'סוכן AI שעוזר לייזמים לגבש רעיונות עסקיים, בודק היתכנות, מציע שיפורים, ומזהה הזדמנויות. השיחה מובנית בשלבים: הבנת הרעיון, זיהוי קהל יעד, ניתוח תחרות, והגדרת צעדים ראשונים.',
                is_active: true,
                file_path: 'agents/idea_formulation.json',
                dependencies: ['UserGoal', 'ClientProfile', 'Timeline']
            },
            {
                name: 'marketing_strategy',
                category: 'bots',
                short_description: 'בניית אסטרטגיית שיווק ויצירת קמפיינים',
                full_description: 'בוט שבונה אסטרטגיית שיווק מקיפה: זיהוי קהל יעד, ערוצי שיווק, מסרים, וקמפיינים. יוצר תוכן שיווקי, מציע תקציבים, ועוקב אחרי ביצועים.',
                is_active: true,
                file_path: 'agents/marketing_strategy.json',
                dependencies: ['CRMLead', 'Campaign', 'ContentBank']
            },
            {
                name: 'revenue_growth',
                category: 'bots',
                short_description: 'הגדלת הכנסות חודשיות וזיהוי הזדמנויות',
                full_description: 'מתמקד בהגדלת הכנסות: זיהוי מקורות הכנסה חדשים, אופטימיזציה של מחירים, הגדלת לקוחות, ושיפור שימור. מציע פעולות ספציפיות להגדלת הכנסות.',
                is_active: true,
                file_path: 'agents/revenue_growth.json',
                dependencies: ['UserGoal', 'CRMLead', 'ScheduledEvent']
            },
            {
                name: 'target_audience',
                category: 'bots',
                short_description: 'זיהוי והבנת קהל היעד האידיאלי',
                full_description: 'עוזר לזהות ולהבין את קהל היעד: דמוגרפיה, צרכים, כאבים, התנהגות קנייה. יוצר פרסונות מפורטות ומציע איך להגיע אליהם.',
                is_active: true,
                file_path: 'agents/target_audience.json',
                dependencies: ['ClientProfile', 'UserGoal']
            },
            {
                name: 'customer_acquisition',
                category: 'bots',
                short_description: 'בניית מערכת להשגת לקוחות חדשים',
                full_description: 'מפתח תהליכים להשגת לקוחות: דרכי חשיפה, משפכי מכירה, אופטימיזציה של המרות. בודק מה עובד ומציע שיפורים מבוססי נתונים.',
                is_active: true,
                file_path: 'agents/customer_acquisition.json',
                dependencies: ['Campaign', 'CRMLead']
            },
            {
                name: 'osek_patur_setup',
                category: 'bots',
                short_description: 'סוכן להתאמה אישית של עוסק פטור',
                full_description: 'מייצר תוכנית פעולה מותאמת לפתיחת עוסק פטור. מנחה בשלבים: מילוי פרטים, טפסים, הגשת דוחות. לומד מהמשתמש ומתאים עצמו.',
                is_active: true,
                file_path: 'agents/osek_patur_setup.json',
                dependencies: ['CRMLead', 'Timeline', 'ScheduledEvent']
            },
            {
                name: 'quality_leads',
                category: 'bots',
                short_description: 'זיהוי ושיפור איכות לידים',
                full_description: 'סוכן שמנתח לידים קיימים ומציע דרכים לשפר את איכותם. מזהה דפוסים של לידים איכותיים ומסייע למקד מאמצים.',
                is_active: true,
                file_path: 'agents/quality_leads.json',
                dependencies: ['CRMLead', 'OptimizationSuggestion']
            },
            {
                name: 'recurring_income',
                category: 'bots',
                short_description: 'בניית מודלים להכנסה חוזרת',
                full_description: 'סוכן שמנחה בבניית מוצרים/שירותים עם הכנסה חוזרת. מציע מודלים עסקיים, תמחור, ושיווק למנויים.',
                is_active: true,
                file_path: 'agents/recurring_income.json',
                dependencies: ['UserGoal', 'ScheduledEvent']
            },
            {
                name: 'price_optimization',
                category: 'bots',
                short_description: 'אופטימיזציה של מודל התמחור',
                full_description: 'מנתח מודל תמחור קיים ומציע אופטימיזציה: תמחור מבוסס ערך, תמחור תחרותי, מודלי מנוי. משפר את שולי הרווח.',
                is_active: true,
                file_path: 'agents/price_optimization.json',
                dependencies: ['UserGoal', 'OptimizationSuggestion']
            },
            {
                name: 'conversion_rate',
                category: 'bots',
                short_description: 'שיפור יחס ההמרה',
                full_description: 'סוכן שמנתח את תהליך ההמרה ומציע דרכים לשפרו: דפי נחיתה, מסרים, קריאה לפעולה. משפר את אחוז ההמרה.',
                is_active: true,
                file_path: 'agents/conversion_rate.json',
                dependencies: ['LandingPage', 'OptimizationSuggestion']
            },
            {
                name: 'business_systems',
                category: 'bots',
                short_description: 'בניית מערכות ופרוטוקולים לעסק',
                full_description: 'מנחה בבניית מערכות אוטומטיות ופרוטוקולים לעסק: ניהול לקוחות, שיווק, מכירות, תפעול. משפר יעילות ופיריון.',
                is_active: true,
                file_path: 'agents/business_systems.json',
                dependencies: ['UserGoal', 'ScheduledEvent']
            },
            {
                name: 'time_optimization',
                category: 'bots',
                short_description: 'אופטימיזציה של ניהול זמן',
                full_description: 'סוכן שמסייע למשתמש לייעל את ניהול הזמן: תעדוף משימות, חלוקת זמן, מניעת הסחות דעת. משפר פרודוקטיביות.',
                is_active: true,
                file_path: 'agents/time_optimization.json',
                dependencies: ['DailyFocus', 'ScheduledEvent']
            },
            {
                name: 'marketing_machine',
                category: 'bots',
                short_description: 'הפיכת שיווק למכונה אוטומטית',
                full_description: 'מנחה בהקמת מערך שיווק אוטומטי: משפכים, קמפיינים, אוטומציות. הופך את השיווק לכוח מניע קבוע.',
                is_active: true,
                file_path: 'agents/marketing_machine.json',
                dependencies: ['Campaign', 'ScheduledEvent', 'OptimizationSuggestion']
            },
            {
                name: 'customer_retention',
                category: 'bots',
                short_description: 'שימור לקוחות קיימים',
                full_description: 'סוכן שמציע דרכים לשימור לקוחות: תוכניות נאמנות, תקשורת, שירות לקוחות. מונע נטישה ומגדיל ערך לקוח.',
                is_active: true,
                file_path: 'agents/customer_retention.json',
                dependencies: ['CRMLead', 'Intervention']
            },
            {
                name: 'business_focus',
                category: 'bots',
                short_description: 'מיקוד עסקי וניתוח סטרטגיה',
                full_description: 'סוכן שמסייע למשתמש למקד את העסק: זיהוי נישות, בידול, יתרון תחרותי. מנקה רעשים ומבהיר כיוון.',
                is_active: true,
                file_path: 'agents/business_focus.json',
                dependencies: ['UserGoal', 'Intervention']
            },
            {
                name: 'stress_reduction',
                category: 'bots',
                short_description: 'הפחתת סטרס ושיפור רווחה נפשית',
                full_description: 'סוכן שמציע כלים וטכניקות להפחתת סטרס ושיפור הרווחה הנפשית של המשתמש: תרגילים, מדיטציות, ניהול לחצים.',
                is_active: true,
                file_path: 'agents/stress_reduction.json',
                dependencies: ['UserMemory', 'Intervention']
            },

            // ===== BACKEND FUNCTIONS =====
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
                name: 'qualityLearningBrain',
                category: 'backend_functions',
                short_description: 'מנתח את איכות הלמידה וההתקדמות של המשתמש',
                full_description: 'פונקציה המנתחת את נתוני איכות הלמידה של המשתמש, מזהה דפוסים, נקודות תורפה, ומציעה התאמות למסלול הלמידה. משמש כמנוע אופטימיזציה לשיפור חווית המשתמש והישגיו.',
                is_active: true,
                file_path: 'functions/qualityLearningBrain.js',
                dependencies: ['UserMemory', 'Timeline', 'QualityInsight']
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
            {
                name: 'mentorChat',
                category: 'backend_functions',
                short_description: 'מנטור עסקי AI לפרילנסרים - מייעץ ומוביל',
                full_description: 'פונקציה שמפעילה מנטור AI שמייעץ לפרילנסרים בנושאים עסקיים. שומר היסטוריית שיחות, מעדכן פוקוס יומי, ומנהל את העומס היומי של המשתמש.',
                is_active: true,
                file_path: 'functions/mentorChat.js',
                dependencies: ['DailyFocus', 'CRMLead', 'OpenAI']
            },
            {
                name: 'analyzeBusinessJourney',
                category: 'backend_functions',
                short_description: 'מנתח את המסע העסקי ויוצר המלצות מותאמות',
                full_description: 'מנתח את תשובות המשתמש בשאלון המסע העסקי, מזהה שלב עסקי, יוצר משימות חכמות, וממליץ על מטרה מתאימה. המנוע משתמש ב-AI לניתוח מעמיק.',
                is_active: true,
                file_path: 'functions/analyzeBusinessJourney.js',
                dependencies: ['BusinessJourney', 'UserGoal', 'OpenAI']
            },
            {
                name: 'generateGoalPlan',
                category: 'backend_functions',
                short_description: 'יוצר תוכנית פעולה מפורטת למטרה עסקית',
                full_description: 'מקבל מטרה עסקית ויוצר תוכנית פעולה מפורטת: משימות, לוחות זמנים, משאבים נדרשים, ומדדי הצלחה. משתמש ב-AI ליצירת תוכנית מותאמת אישית.',
                is_active: true,
                file_path: 'functions/generateGoalPlan.js',
                dependencies: ['UserGoal', 'OpenAI']
            },
            {
                name: 'sendLeadToN8N',
                category: 'backend_functions',
                short_description: 'שולח לידים חדשים ל-N8N לאוטומציות שיווק',
                full_description: 'כל ליד חדש שנוצר נשלח אוטומטית ל-N8N שמפעיל אוטומציות: הודעות WhatsApp, מיילים, עדכונים ב-CRM, ועוד. מסנכרן את הנתונים בין המערכות.',
                is_active: true,
                file_path: 'functions/sendLeadToN8N.js',
                dependencies: ['Lead', 'CRMLead']
            },
            {
                name: 'stripeWebhook',
                category: 'backend_functions',
                short_description: 'מטפל בתשלומים דרך Stripe ומעדכן סטטוס משתמשים',
                full_description: 'מקבל עדכונים מ-Stripe על תשלומים, מנויים, וביטולים. מעדכן את סטטוס המשתמש, מפעיל אוטומציות, ושולח אישורים.',
                is_active: true,
                file_path: 'functions/stripeWebhook.js',
                dependencies: ['Payment', 'User', 'Stripe']
            },
            {
                name: 'createCheckoutSession',
                category: 'backend_functions',
                short_description: 'יוצר סשן תשלום ב-Stripe',
                full_description: 'מקבל תוכנית תמחור ויוצר סשן תשלום ב-Stripe. המשתמש מועבר לדף תשלום מאובטח ואחרי תשלום מוחזר למערכת.',
                is_active: true,
                file_path: 'functions/createCheckoutSession.js',
                dependencies: ['Plan', 'Stripe']
            },

            // ===== ENTITIES =====
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
            {
                name: 'UserGoal',
                category: 'entities',
                short_description: 'מטרות עסקיות של המשתמש עם תוכניות ומעקב',
                full_description: 'מאחסן את המטרות העסקיות של המשתמש: כותרת, תיאור, תוכנית פעולה, משימות, התקדמות, וסטטוס. כל מטרה כוללת תובנות AI ותהליך פלואו מובנה.',
                is_active: true,
                file_path: 'entities/UserGoal.json',
                dependencies: []
            },
            {
                name: 'ClientProfile',
                category: 'entities',
                short_description: 'פרופיל הלקוח - דפוסים, חסמים, ועדפות',
                full_description: 'מזהה את דפוסי ההתנהגות של הלקוח: פרפקציוניזם, הימנעות מפעולה, פחד מחשיפה, צורך במבנה. עוזר להתאים את הליווי.',
                is_active: true,
                file_path: 'entities/ClientProfile.json',
                dependencies: []
            },
            {
                name: 'Timeline',
                category: 'entities',
                short_description: 'ציר זמן של שאלות, משימות, והתערבויות למשתמש',
                full_description: 'מאחסן את כל האירועים בציר הזמן של המשתמש: שאלות שנשאלו, משימות שניתנו, תגובות, ניתוחי AI. מאפשר מעקב אחר התקדמות והתאמה דינמית.',
                is_active: true,
                file_path: 'entities/Timeline.json',
                dependencies: []
            },
            {
                name: 'ContentBank',
                category: 'entities',
                short_description: 'בנק תוכן מובנה של שאלות ומשימות',
                full_description: 'מכיל שאלות ומשימות מוכנות מראש לפי שבועות, קטגוריות, תגיות, ורמות קושי. המנטור בוחר מהבנק ומתאים אישית.',
                is_active: true,
                file_path: 'entities/ContentBank.json',
                dependencies: []
            },
            {
                name: 'CRMLead',
                category: 'entities',
                short_description: 'ניהול לידים מתקדם עם מעקב מסע לקוח',
                full_description: 'ישות מתקדמת לניהול לידים: פרטי קשר, סטטוס, שלב במסע, תהליכים פעילים, משימות ללקוח, מדדים עסקיים, והיסטוריית שיחות.',
                is_active: true,
                file_path: 'entities/CRMLead.json',
                dependencies: []
            },
            {
                name: 'DailyFocus',
                category: 'entities',
                short_description: 'פוקוס יומי ועומס של המשתמש',
                full_description: 'מנהל את הפוקוס היומי של המשתמש: מה חשוב היום, מה העומס, מה להימנע ממנו. מתעדכן דינמית לפי אינטראקציות.',
                is_active: true,
                file_path: 'entities/DailyFocus.json',
                dependencies: []
            },
            {
                name: 'BusinessJourney',
                category: 'entities',
                short_description: 'מסע העסק - שלב, משימות, וניתוח AI',
                full_description: 'מתעד את שלב העסק (רעיון, עסק חדש, פעיל, יציב, מתרחב), משימות אסטרטגיות, ומטרה מומלצת. נוצר מניתוח שאלון.',
                is_active: true,
                file_path: 'entities/BusinessJourney.json',
                dependencies: []
            },
            {
                name: 'OptimizationSuggestion',
                category: 'entities',
                short_description: 'הצעות לשיפור ואופטימיזציה',
                full_description: 'מכיל הצעות AI לשיפור המערכת, תהליכים, תוכן, וחוויית משתמש.',
                is_active: true,
                file_path: 'entities/OptimizationSuggestion.json',
                dependencies: []
            },
            {
                name: 'QualityInsight',
                category: 'entities',
                short_description: 'תובנות איכות על הלמידה וההתקדמות',
                full_description: 'מכיל ניתוחי איכות תקופתיים על ההתקדמות, בעיות, והצלחות.',
                is_active: true,
                file_path: 'entities/QualityInsight.json',
                dependencies: []
            },
            {
                name: 'ScheduledEvent',
                category: 'entities',
                short_description: 'אירועים מתוזמנים',
                full_description: 'מנהל אירועים ומשימות מתוזמנים במערכת.',
                is_active: true,
                file_path: 'entities/ScheduledEvent.json',
                dependencies: []
            },
            {
                name: 'Intervention',
                category: 'entities',
                short_description: 'התערבויות והתראות',
                full_description: 'מתעד התערבויות של המערכת כשמזוהה צורך בשינוי או התייחסות מיוחדת.',
                is_active: true,
                file_path: 'entities/Intervention.json',
                dependencies: []
            },
            {
                name: 'Plan',
                category: 'entities',
                short_description: 'תוכניות תמחור ומנויים',
                full_description: 'מגדיר את תוכניות התמחור: שם, מחיר, תכונות, הגבלות, תקופת ניסיון. מנוהל ע"י אדמין.',
                is_active: true,
                file_path: 'entities/Plan.json',
                dependencies: []
            },
            {
                name: 'Payment',
                category: 'entities',
                short_description: 'תשלומים ומנויים של משתמשים',
                full_description: 'מעקב אחר תשלומים: סכום, סטטוס, תוכנית, תאריכים, Stripe IDs. מתעדכן אוטומטית דרך webhook.',
                is_active: true,
                file_path: 'entities/Payment.json',
                dependencies: []
            },
            {
                name: 'Goal',
                category: 'entities',
                short_description: 'קטלוג מטרות עסקיות זמינות',
                full_description: 'רשימת מטרות עסקיות שהמשתמשים יכולים לבחור: שם, תיאור, קטגוריה, הוראות. משמש כתבנית ליצירת UserGoal.',
                is_active: true,
                file_path: 'entities/Goal.json',
                dependencies: []
            },

            // ===== CLIENT FEATURES =====
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
            },
            {
                name: 'MarketingTab',
                category: 'client_features',
                short_description: 'כלי שיווק - לוגו, דפי נחיתה, קמפיינים',
                full_description: 'ממשק מקיף לכלי שיווק: יצירת לוגו, דפי נחיתה, קמפיינים, כרטיסי ביקור, פרופיל Google Business. כולל AI ליצירת תוכן.',
                is_active: true,
                file_path: 'components/client/tabs/MarketingTab.js',
                dependencies: ['LandingPage', 'Campaign']
            },
            {
                name: 'FinancialTab',
                category: 'client_features',
                short_description: 'ניהול פיננסי - חשבוניות, הוצאות, דוחות',
                full_description: 'מערכת פיננסית מלאה: יצירת חשבוניות, סריקת מסמכים, ניהול הוצאות, דוחות, סנכרון בנק (FINBOT), מע"מ.',
                is_active: true,
                file_path: 'components/client/tabs/FinancialTab.js',
                dependencies: ['Payment', 'FINBOT']
            },
            {
                name: 'ProgressTab',
                category: 'client_features',
                short_description: 'מעקב התקדמות והישגים',
                full_description: 'מציג את ההתקדמות של המשתמש: סטטיסטיקות, מטרות שהושגו, ציר זמן, משימות שבוצעו. כולל הישגים והנפשות.',
                is_active: true,
                file_path: 'components/client/tabs/ProgressTab.js',
                dependencies: ['UserGoal', 'Timeline', 'Achievement']
            },
            {
                name: 'BusinessTab',
                category: 'client_features',
                short_description: 'ניהול עסקי - מצב העסק, תובנות, פוקוס',
                full_description: 'דשבורד עסקי: מצב העסק (stage, challenge), תובנות, המלצות, פוקוס אסטרטגי, מדדי ביצועים, תהליכי החלטה.',
                is_active: true,
                file_path: 'components/client/tabs/BusinessTab.js',
                dependencies: ['CRMLead', 'BusinessState']
            },
            {
                name: 'FirstGoalFlow',
                category: 'client_features',
                short_description: 'פלואו להגדרת המטרה הראשונה',
                full_description: 'תהליך מובנה בשלבים להגדרת המטרה הראשונה: בחירת מטרה, שאלות הבהרה, יצירת תוכנית, אישור והפעלה.',
                is_active: true,
                file_path: 'components/client/goals/FirstGoalFlow.js',
                dependencies: ['UserGoal', 'generateGoalPlan']
            },
            {
                name: 'BusinessJourneyQuestionnaire',
                category: 'client_features',
                short_description: 'שאלון מסע העסק - מזהה שלב ויוצר המלצות',
                full_description: 'שאלון אינטראקטיבי שמזהה את שלב העסק, אתגרים, ויוצר המלצות מותאמות אישית. משתמש ב-AI לניתוח.',
                is_active: true,
                file_path: 'components/client/progress/BusinessJourneyQuestionnaire.js',
                dependencies: ['BusinessJourney', 'analyzeBusinessJourney']
            },
            {
                name: 'MentorChat',
                category: 'client_features',
                short_description: 'צ\'אט עם המנטור העסקי',
                full_description: 'ממשק שיחה עם המנטור: שליחת הודעות, קבלת תשובות, היסטוריה, הקשר. תומך בשיחות מתמשכות וזכירת הקשר.',
                is_active: true,
                file_path: 'components/client/mentor/MentorChat.js',
                dependencies: ['mentorChat', 'DailyFocus']
            },
            {
                name: 'LogoCreator',
                category: 'client_features',
                short_description: 'יצירת לוגו בעזרת AI',
                full_description: 'כלי ליצירת לוגו: שאלון על העסק, יצירה בעזרת AI, בחירה מבין אפשרויות, עריכה, ותשלום.',
                is_active: true,
                file_path: 'components/client/marketing/LogoCreator.js',
                dependencies: ['GenerateImage', 'Payment']
            },
            {
                name: 'LandingPageBuilder',
                category: 'client_features',
                short_description: 'בניית דפי נחיתה מותאמים אישית',
                full_description: 'בונה דפי נחיתה: בחירת תבנית, עריכת תוכן, תצוגה מקדימה, פרסום. התוכן נוצר בעזרת AI לפי העסק.',
                is_active: true,
                file_path: 'components/client/marketing/LandingPageBuilder.js',
                dependencies: ['LandingPage', 'InvokeLLM']
            },
            {
                name: 'InvoiceGenerator',
                category: 'client_features',
                short_description: 'יצירת חשבוניות מהירה',
                full_description: 'טופס ליצירת חשבוניות: פרטי לקוח, פריטים, מחירים, מע"מ, הנחות. שמירה, שליחה, וייצוא PDF.',
                is_active: true,
                file_path: 'components/client/financial/InvoiceGenerator.js',
                dependencies: []
            },
            {
                name: 'SmartRecommendations',
                category: 'client_features',
                short_description: 'המלצות חכמות בהתאם למצב המשתמש',
                full_description: 'מציג המלצות דינמיות למשתמש: מטרות מומלצות, משימות, תוכן, פעולות - לפי המצב העסקי והאישי.',
                is_active: true,
                file_path: 'components/client/SmartRecommendations.js',
                dependencies: ['UserMemory', 'UserGoal']
            },
            {
                name: 'AdminDashboard',
                category: 'client_features',
                short_description: 'ממשק ניהול מערכת לאדמין',
                full_description: 'דשבורד אדמין: ניהול משתמשים, מטרות, תוכניות, פעילות, הגדרות מערכת. כולל טאבים ייעודיים לכל נושא.',
                is_active: true,
                file_path: 'pages/AdminDashboard.js',
                dependencies: ['User', 'Plan', 'ActivityLog']
            },
            
            // ===== MARKETING TOOLS - כלים שיווקיים =====
            {
                name: 'PresentationQuestionnaire',
                category: 'client_features',
                short_description: 'שאלון ליצירת מצגת עסקית',
                full_description: 'שאלון מודרך ליצירת מצגת עסקית מותאמת אישית. שואל על העסק, המטרה, קהל היעד ויוצר מצגת מעוצבת באמצעות AI.',
                is_active: true,
                file_path: 'components/client/marketing/PresentationQuestionnaire.js',
                dependencies: ['InvokeLLM', 'SavedWork']
            },
            {
                name: 'StickerQuestionnaire',
                category: 'client_features',
                short_description: 'שאלון ליצירת מדבקות לעסק',
                full_description: 'שאלון ליצירת מדבקות ממותגות לעסק. כולל בחירת סגנון, גדלים, ותוכן. יוצר עיצובים מותאמים אישית.',
                is_active: true,
                file_path: 'components/client/marketing/StickerQuestionnaire.js',
                dependencies: ['InvokeLLM', 'SavedWork']
            },
            {
                name: 'SocialMediaQuestionnaire',
                category: 'client_features',
                short_description: 'שאלון ליצירת תוכן לרשתות חברתיות',
                full_description: 'שאלון ליצירת פוסטים ותוכן מעוצב לרשתות חברתיות. כולל בחירת פלטפורמה, סגנון, ונושא.',
                is_active: true,
                file_path: 'components/client/marketing/SocialMediaQuestionnaire.js',
                dependencies: ['InvokeLLM', 'SavedWork']
            },
            {
                name: 'BusinessCardQuestionnaire',
                category: 'client_features',
                short_description: 'שאלון ליצירת כרטיס ביקור דיגיטלי',
                full_description: 'שאלון ליצירת כרטיס ביקור דיגיטלי מעוצב. כולל פרטי קשר, עיצוב, והפצה דיגיטלית.',
                is_active: true,
                file_path: 'components/client/marketing/BusinessCardQuestionnaire.js',
                dependencies: ['InvokeLLM', 'SavedWork']
            },
            {
                name: 'EmailSignatureQuestionnaire',
                category: 'client_features',
                short_description: 'שאלון ליצירת חתימת מייל מקצועית',
                full_description: 'שאלון ליצירת חתימת מייל מקצועית ומעוצבת. כולל פרטי קשר, לוגו, ולינקים לרשתות חברתיות.',
                is_active: true,
                file_path: 'components/client/marketing/EmailSignatureQuestionnaire.js',
                dependencies: ['SavedWork']
            },
            {
                name: 'ProposalQuestionnaire',
                category: 'client_features',
                short_description: 'שאלון ליצירת הצעת מחיר מותאמת',
                full_description: 'שאלון ליצירת הצעת מחיר מקצועית ומותאמת אישית. כולל פירוט שירותים, מחירים, ותנאים.',
                is_active: true,
                file_path: 'components/client/marketing/ProposalQuestionnaire.js',
                dependencies: ['InvokeLLM', 'SavedWork']
            },
            
            // ===== CAMPAIGN TEMPLATES - תבניות קמפיינים =====
            {
                name: 'SocialCampaign',
                category: 'client_features',
                short_description: 'קמפיין ברשתות חברתיות',
                full_description: 'כלי ליצירת קמפיין שיווקי ברשתות חברתיות: Facebook, Instagram. כולל תכנון תוכן, לוח זמנים, ותקציב.',
                is_active: true,
                file_path: 'components/client/marketing/campaigns/SocialCampaign.js',
                dependencies: ['Campaign', 'InvokeLLM']
            },
            {
                name: 'GoogleCampaign',
                category: 'client_features',
                short_description: 'פרסום ב-Google',
                full_description: 'כלי ליצירת קמפיין פרסום ב-Google Ads: מילות מפתח, מודעות, תקציב, והגדרות טרגוט.',
                is_active: true,
                file_path: 'components/client/marketing/campaigns/GoogleCampaign.js',
                dependencies: ['Campaign', 'InvokeLLM']
            },
            {
                name: 'EmailCampaign',
                category: 'client_features',
                short_description: 'שיווק במייל',
                full_description: 'כלי ליצירת קמפיין שיווק במייל: עיצוב ניוזלטר, רשימת תפוצה, אוטומציות, ומעקב תוצאות.',
                is_active: true,
                file_path: 'components/client/marketing/campaigns/EmailCampaign.js',
                dependencies: ['Campaign', 'SendEmail']
            },
            {
                name: 'UsersTable',
                category: 'client_features',
                short_description: 'טבלת ניהול משתמשים לאדמין',
                full_description: 'טבלה מתקדמת לניהול משתמשים: חיפוש, מיון, פעולות מרובות, עריכה, מחיקה, שינוי תוכנית.',
                is_active: true,
                file_path: 'components/admin/UsersTable.js',
                dependencies: ['User', 'adminListUsers']
            },
            {
                name: 'SystemConfigManager',
                category: 'client_features',
                short_description: 'ניהול רכיבי המערכת - הדף שאתה רואה עכשיו',
                full_description: 'ממשק ניהול לכל רכיבי המערכת: בוטים, פונקציות, ישויות, תכונות. מאפשר צפייה, עריכה, סינון, וקיבוץ לפי קטגוריה.',
                is_active: true,
                file_path: 'components/admin/SystemConfigManager.js',
                dependencies: ['SystemComponent']
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