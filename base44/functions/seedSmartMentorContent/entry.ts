import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CONTENT_DATA = [
    // --- שאלות לשבוע 1 - Client Acquisition ---
    {
        external_id: "Q001",
        type: "Question",
        week: 1,
        goal_category: ["Client Acquisition"],
        tags: ["opening", "broad", "safe"],
        difficulty: "Easy",
        content: "כמה לקוחות/פרויקטים סגרת ב-6 החודשים האחרונים?",
        when_to_use: "שאלת פתיחה סטנדרטית - תמיד ביום 1",
        expected_outcome: "מספר קונקרטי + הקשר (מאיפה הגיעו)"
    },
    {
        external_id: "Q002",
        type: "Question",
        week: 1,
        goal_category: ["Client Acquisition"],
        tags: ["opening", "emotional", "safe"],
        difficulty: "Easy",
        content: "אם היית צריך לדרג את הביטחון שלך בלהביא לקוחות חדשים מ-1-10, איפה אתה?",
        when_to_use: "ליום 1 אחרי השאלה הפתיחה",
        expected_outcome: "מספר + הסבר למה"
    },
    {
        external_id: "Q003",
        type: "Question",
        week: 1,
        goal_category: ["Client Acquisition"],
        tags: ["perfectionist", "confrontational"],
        difficulty: "Medium",
        content: "מה צריך להיות 'מוכן' לפני שאתה מתחיל לחפש לקוחות אקטיבית?",
        when_to_use: "אם זוהה perfectionist pattern או avoidance",
        expected_outcome: "רשימת תירוצים שחושפת פרפקציוניזם"
    },
    {
        external_id: "Q004",
        type: "Question",
        week: 1,
        goal_category: ["Client Acquisition"],
        tags: ["fear_of_exposure", "safe", "imaginative"],
        difficulty: "Medium",
        content: "אם היית יכול לקבל לקוחות בלי לדבר עם אף אחד, איך זה היה נראה?",
        when_to_use: "אם יש סימני פחד מחשיפה",
        expected_outcome: "גילוי הפחד מאחורי ההימנעות"
    },
    {
        external_id: "Q005",
        type: "Question",
        week: 1,
        goal_category: ["Client Acquisition"],
        tags: ["needs_structure", "clarity"],
        difficulty: "Medium",
        content: "אם היית צריך להסביר למישהו בדיוק מה עושה הלקוח האידיאלי שלך, מה היית אומר?",
        when_to_use: "אם יש בלבול לגבי קהל יעד",
        expected_outcome: "בהירות (או חוסר בהירות) על הלקוח"
    },
    {
        external_id: "Q006",
        type: "Question",
        week: 1,
        goal_category: ["Client Acquisition"],
        tags: ["avoidance", "confrontational"],
        difficulty: "Hard",
        content: "מה אתה נמנע מלעשות כשזה מגיע לחיפוש לקוחות? היה כנה.",
        when_to_use: "אחרי שכבר יש אמון",
        expected_outcome: "חשיפת ההימנעות האמיתית"
    },
    {
        external_id: "Q007",
        type: "Question",
        week: 1,
        goal_category: ["Client Acquisition"],
        tags: ["perfectionist", "confrontational", "deep"],
        difficulty: "Hard",
        content: "מה המחיר שאתה משלם על כך שהמוצר/השירות 'עדיין לא מוכן'?",
        when_to_use: "רק אם זוהה perfectionist ויש resistance",
        expected_outcome: "מודעות למחיר ההמתנה"
    },
    {
        external_id: "Q008",
        type: "Question",
        week: 1,
        goal_category: ["Client Acquisition"],
        tags: ["resources", "practical"],
        difficulty: "Medium",
        content: "מה יש לך עכשיו (כישורים, קשרים, תוכן, כלים) שאתה לא משתמש בו?",
        when_to_use: "כשרוצים לזהות משאבים לא מנוצלים",
        expected_outcome: "רשימת נכסים קיימים"
    },
    {
        external_id: "Q009",
        type: "Question",
        week: 1,
        goal_category: ["Client Acquisition"],
        tags: ["expectations", "deep"],
        difficulty: "Medium",
        content: "מה אתה רוצה שיקרה עם הלקוחות שלך, אבל לא ממש מאמין שיקרה?",
        when_to_use: "סוף שבוע 1, לזהות פער תקווה-אמונה",
        expected_outcome: "חשיפת ספקות פנימיים"
    },
    {
        external_id: "Q010",
        type: "Question",
        week: 1,
        goal_category: ["Client Acquisition"],
        tags: ["past_attempts", "learning"],
        difficulty: "Easy",
        content: "מה כבר ניסית בעבר להביא לקוחות? מה עבד ומה לא?",
        when_to_use: "יום 2-3, לבנות על ניסיון",
        expected_outcome: "היסטוריה + תובנות"
    },

    // --- משימות לשבוע 2 - Client Acquisition ---
    {
        external_id: "T001",
        type: "Task",
        week: 2,
        goal_category: ["Client Acquisition"],
        tags: ["safe", "writing", "no_exposure"],
        difficulty: "Very Easy",
        time_required: 10,
        content: "כתוב 3 משפטים על מה אתה עושה - כאילו אתה מסביר לחבר",
        when_to_use: "יום 1, לכולם, warm-up",
        expected_outcome: "טיוטה ראשונית של value prop"
    },
    {
        external_id: "T002",
        type: "Task",
        week: 2,
        goal_category: ["Client Acquisition"],
        tags: ["safe", "organization", "no_exposure"],
        difficulty: "Very Easy",
        time_required: 15,
        content: "רשום 5 פרויקטים/עבודות שהכי נהנית לעשות - רק רשימה, בלי הסברים",
        when_to_use: "fear_of_exposure או יום 1-2",
        expected_outcome: "זיהוי התמחות טבעית"
    },
    {
        external_id: "T003",
        type: "Task",
        week: 2,
        goal_category: ["Client Acquisition"],
        tags: ["safe", "choice", "clarity"],
        difficulty: "Very Easy",
        time_required: 10,
        content: "בחר תעשייה/תחום אחד להתמקד בו החודש הזה (לא לנצח, רק החודש)",
        when_to_use: "needs_structure או חוסר בהירות",
        expected_outcome: "מיקוד ראשוני"
    },
    {
        external_id: "T004",
        type: "Task",
        week: 2,
        goal_category: ["Client Acquisition"],
        tags: ["safe", "research", "no_exposure"],
        difficulty: "Very Easy",
        time_required: 20,
        content: "רשום 5 מקומות (אונליין או אופליין) שבהם קהל היעד שלך מבלה",
        when_to_use: "לאחר זיהוי קהל יעד",
        expected_outcome: "רשימת ערוצים פוטנציאליים"
    },
    {
        external_id: "T005",
        type: "Task",
        week: 2,
        goal_category: ["Client Acquisition"],
        tags: ["safe", "structure", "planning"],
        difficulty: "Very Easy",
        time_required: 15,
        content: "צור תזכורת יומית בשם 'שעת לקוחות' - רק להוסיף ליומן, לא לבצע עכשיו",
        when_to_use: "inconsistent או needs_structure",
        expected_outcome: "תחילת בניית שגרה"
    },
    {
        external_id: "T006",
        type: "Task",
        week: 2,
        goal_category: ["Client Acquisition"],
        tags: ["networking", "low_risk"],
        difficulty: "Easy",
        time_required: 20,
        content: "צור רשימה של 10 אנשים שאתה כבר מכיר שיכולים להפוך ללקוחות או להפנות אותך",
        when_to_use: "high_engagement בשבוע 1",
        expected_outcome: "רשימת warm leads"
    },
    {
        external_id: "T007",
        type: "Task",
        week: 2,
        goal_category: ["Client Acquisition"],
        tags: ["practice", "safe", "no_exposure"],
        difficulty: "Easy",
        time_required: 30,
        content: "כתוב מייל קצר (5 שורות) להצעת שירות - לא לשלוח, רק לתרגל",
        when_to_use: "fear_of_exposure אבל מוכן לכתוב",
        expected_outcome: "טמפלייט ראשוני"
    },
    {
        external_id: "T008",
        type: "Task",
        week: 2,
        goal_category: ["Client Acquisition"],
        tags: ["organization", "clarity"],
        difficulty: "Easy",
        time_required: 25,
        content: "ארגן את רשימת אנשי הקשר שלך לפי: לקוחות פוטנציאליים / שותפים / אחר",
        when_to_use: "needs_structure",
        expected_outcome: "CRM פשוט"
    },
    {
        external_id: "T009",
        type: "Task",
        week: 2,
        goal_category: ["Client Acquisition"],
        tags: ["value_prop", "thinking"],
        difficulty: "Medium",
        time_required: 30,
        content: "לכל אחד מ-5 הפרויקטים שבחרת, כתוב: למי זה הכי מתאים?",
        when_to_use: "אחרי T002",
        expected_outcome: "זיהוי קהל יעד לכל סוג עבודה"
    },
    {
        external_id: "T010",
        type: "Task",
        week: 2,
        goal_category: ["Client Acquisition"],
        tags: ["feedback", "minimal_exposure"],
        difficulty: "Medium",
        time_required: 20,
        content: "שתף את 3 המשפטים (מT001) עם חבר אחד ושאל: 'מה הכי ברור לך?'",
        when_to_use: "אחרי T001 ורק אם completion_rate > 70%",
        expected_outcome: "feedback ראשוני"
    },

    // --- משימות לשבוע 3 - Client Acquisition ---
    {
        external_id: "T011",
        type: "Task",
        week: 3,
        goal_category: ["Client Acquisition"],
        tags: ["value_prop", "decision", "heavy"],
        difficulty: "Hard",
        time_required: 180, // 3 hours avg
        content: "כתוב הצעת ערך של 50-100 מילים שמתחילה עם הבעיה שהלקוח שלך מתמודד איתה, לא עם מה אתה עושה",
        when_to_use: "אחרי שבוע 2 מוצלח, לכולם",
        expected_outcome: "value proposition מלא",
        personalization_template: "כתוב הצעת ערך של 50-100 מילים ל{קהל_היעד_שזוהה}"
    },
    {
        external_id: "T012",
        type: "Task",
        week: 3,
        goal_category: ["Client Acquisition"],
        tags: ["pricing", "decision", "heavy"],
        difficulty: "Hard",
        time_required: 120, // 2 hours avg
        content: "צור מחירון עם 3 רמות מחיר - לא משנה אם זה 'נכון', רק תתחיל",
        when_to_use: "perfectionist - כדי לשבור את המחסום",
        expected_outcome: "מבנה תמחור ראשוני"
    },
    {
        external_id: "T013",
        type: "Task",
        week: 3,
        goal_category: ["Client Acquisition"],
        tags: ["outreach", "decision", "exposure"],
        difficulty: "Hard",
        time_required: 90, // 1.5 hours avg
        content: "בחר 3 לקוחות פוטנציאליים ספציפיים ליצור איתם קשר השבוע",
        when_to_use: "רק אם שבוע 2 > 80% completion",
        expected_outcome: "רשימה + commitment"
    },
    {
        external_id: "T014",
        type: "Task",
        week: 3,
        goal_category: ["Client Acquisition"],
        tags: ["process", "structure", "heavy"],
        difficulty: "Medium", // Adjusted from Medium-Hard
        time_required: 150, // 2.5 hours avg
        content: "צור טמפלייט להצעת מחיר שכולל: תיאור הפרויקט, מחיר, לוח זמנים, תנאים",
        when_to_use: "needs_structure או יש לקוחות קיימים",
        expected_outcome: "תהליך חוזר"
    },
    {
        external_id: "T015",
        type: "Task",
        week: 3,
        goal_category: ["Client Acquisition"],
        tags: ["routine", "structure"],
        difficulty: "Medium",
        time_required: 60,
        content: "קבע שעה קבועה ביום (או 3 ימים בשבוע) ל'שעת לקוחות' - בלוק קבוע ביומן",
        when_to_use: "inconsistent או needs_routine",
        expected_outcome: "שגרה מובנית"
    },
    {
        external_id: "T016",
        type: "Task",
        week: 3,
        goal_category: ["Client Acquisition"],
        tags: ["recovery", "easy", "safe"],
        difficulty: "Easy",
        time_required: 30,
        content: "שפר את אחת המשימות משבוע 2 שלא הושלמה - בחר את הכי קלה",
        when_to_use: "אם completion_week2 < 50%",
        expected_outcome: "quick win לבנות ביטחון"
    },
    {
        external_id: "T017",
        type: "Task",
        week: 3,
        goal_category: ["Client Acquisition"],
        tags: ["recovery", "reflection"],
        difficulty: "Easy",
        time_required: 20,
        content: "כתוב: מה מנע ממני להשלים את שבוע 2?",
        when_to_use: "אם יש resistance או dropout",
        expected_outcome: "הבנת החסם"
    },

    // --- שאלות נוספות - Financial Order ---
    {
        external_id: "Q101",
        type: "Question",
        week: 1,
        goal_category: ["Financial Order"],
        tags: ["opening", "practical"],
        difficulty: "Easy",
        content: "מתי בפעם האחרונה הסתכלת על המספרים בעסק? (הכנסות, הוצאות, רווח)",
    },
    {
        external_id: "Q102",
        type: "Question",
        week: 1,
        goal_category: ["Financial Order"],
        tags: ["avoidance", "confrontational"],
        difficulty: "Hard",
        content: "מה אתה הכי מפחד למצוא אם תבדוק את המצב הפיננסי באמת?",
    },
    {
        external_id: "Q103",
        type: "Question",
        week: 1,
        goal_category: ["Financial Order"],
        tags: ["perfectionist", "practical"],
        difficulty: "Medium",
        content: "מה צריך להיות 'מסודר' לפני שתתחיל לעקוב אחרי הכסף?",
    },
    {
        external_id: "Q104",
        type: "Question",
        week: 1,
        goal_category: ["Financial Order"],
        tags: ["needs_structure"],
        difficulty: "Medium",
        content: "אם היה לך מערכת פשוטה לעקוב אחרי הכסף, מה היא הייתה צריכה לכלול?",
    },

    // --- שאלות נוספות - Business Focus ---
    {
        external_id: "Q201",
        type: "Question",
        week: 1,
        goal_category: ["Business Focus"],
        tags: ["opening", "broad"],
        difficulty: "Easy",
        content: "כמה דברים שונים אתה עושה בעסק עכשיו?",
    },
    {
        external_id: "Q202",
        type: "Question",
        week: 1,
        goal_category: ["Business Focus"],
        tags: ["confrontational", "deep"],
        difficulty: "Hard",
        content: "מה אתה עושה שאתה יודע שלא צריך, אבל ממשיך בגלל...?",
    },
    {
        external_id: "Q203",
        type: "Question",
        week: 1,
        goal_category: ["Business Focus"],
        tags: ["clarity", "decision"],
        difficulty: "Medium",
        content: "אם היית צריך לבחור רק דבר אחד להתמקד בו ל-3 החודשים הקרובים, מה זה היה?",
    },
    {
        external_id: "Q204",
        type: "Question",
        week: 1,
        goal_category: ["Business Focus"],
        tags: ["fear", "avoidance"],
        difficulty: "Hard",
        content: "מה אתה מפחד שיקרה אם תוותר על כל השאר?",
    }
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // This function is administrative, so ideally check for admin role
        // For now allowing authenticated users for initial setup
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let createdCount = 0;
        let skippedCount = 0;

        for (const item of CONTENT_DATA) {
            // Check if item already exists by external_id (or content hash)
            // Using list and manual check since we don't have a unique constraint on external_id yet
            const existing = await base44.entities.ContentBank.list(); 
            // In a real scenario with many items, use a better filter query. 
            // Currently filter by content might be risky with special chars, 
            // so looping through small list is okay for seeding.
            
            const exists = existing.data.some(e => e.content === item.content || (item.external_id && e.external_id === item.external_id));

            if (!exists) {
                await base44.entities.ContentBank.create(item);
                createdCount++;
            } else {
                skippedCount++;
            }
        }

        return Response.json({ 
            success: true, 
            message: `Content seeding completed. Created: ${createdCount}, Skipped: ${skippedCount}` 
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});