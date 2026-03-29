-- CRM Seed Data: Service Catalog + Lost Reasons

-- ============================================
-- Service Catalog (6 services)
-- ============================================
INSERT INTO service_catalog (name, slug, category, description, base_price, estimated_duration_days, required_documents, onboarding_steps, sort_order, source)
VALUES
  ('פתיחת עוסק פטור', 'open-osek-patur', 'opening', 'פתיחת תיק עוסק פטור ברשויות', 350, 14,
   '["תעודת זהות","צילום צ׳ק/אישור ניהול חשבון"]'::jsonb,
   '["איסוף מסמכים","פתיחת תיק ברשות המסים","רישום בביטוח לאומי","מכתב לבנק","הגדרת מערכת חשבוניות","הושלם"]'::jsonb,
   1, 'sales_portal'),

  ('פתיחת עוסק מורשה', 'open-osek-murshe', 'opening', 'פתיחת תיק עוסק מורשה כולל מע"מ', 500, 21,
   '["תעודת זהות","צילום צ׳ק/אישור ניהול חשבון","חוזה שכירות/בעלות"]'::jsonb,
   '["איסוף מסמכים","פתיחת תיק ברשות המסים","רישום במע\"מ","רישום בביטוח לאומי","הגדרת חשבוניות מס","הגדרת הנהלת חשבונות","הושלם"]'::jsonb,
   2, 'sales_portal'),

  ('פתיחת חברה בע"מ', 'open-hevra-bam', 'opening', 'הקמת חברה בע"מ כולל רישום ברשם החברות', 2500, 45,
   '["תעודת זהות דירקטורים","תקנון חברה","הצהרת דירקטור ראשון","טופס הגשה לרשם"]'::jsonb,
   '["איסוף מסמכים","רישום ברשם החברות","הכנת מסמכי יסוד","פתיחת תיק ברשות המסים","רישום במע\"מ","ביטוח לאומי","פתיחת חשבון בנק","הנהלת חשבונות כפולה","הושלם"]'::jsonb,
   3, 'sales_portal'),

  ('סגירת תיקים', 'close-business', 'closing', 'סגירת תיקים ברשויות המס וביטוח לאומי', 400, 30,
   '["תעודת זהות","אישור סגירת חשבון בנק עסקי"]'::jsonb,
   '["איסוף מסמכים","סגירה ברשות המסים","סגירת תיק מע\"מ","סגירת ביטוח לאומי","דוח שנתי אחרון","הושלם"]'::jsonb,
   4, 'sales_portal'),

  ('הנהלת חשבונות שוטפת', 'ongoing-bookkeeping', 'ongoing', 'ניהול חשבונות חודשי שוטף', 300, 7,
   '["גישה למערכת החשבוניות","פרטי חשבון בנק"]'::jsonb,
   '["הגדרת גישות למערכות","סנכרון נתונים קיימים","הגדרת לוח דיווחים","הושלם"]'::jsonb,
   5, 'sales_portal'),

  ('ייעוץ כללי', 'general-consulting', 'consulting', 'פגישת ייעוץ עסקי ומיסויי', 200, 1,
   '[]'::jsonb,
   '["תיאום פגישה","ביצוע פגישה","שליחת סיכום","הושלם"]'::jsonb,
   6, 'sales_portal')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Lost Reasons (16 reasons in 7 categories)
-- ============================================
INSERT INTO lost_reasons (category, reason_text, is_recoverable, recovery_action, follow_up_days, sort_order, source)
VALUES
  -- מחיר
  ('price', 'המחיר גבוה מדי', true, 'הצעת הנחה או חבילה מצומצמת', 14, 1, 'sales_portal'),
  ('price', 'מצא מחיר זול יותר', true, 'בירור מה ההצעה המתחרה והתאמת מחיר', 30, 2, 'sales_portal'),
  ('price', 'אין תקציב כרגע', true, 'חזרה בתחילת רבעון הבא', 30, 3, 'sales_portal'),

  -- תזמון
  ('timing', 'לא בזמן הנכון', true, 'חזרה בעוד חודשיים', 60, 4, 'sales_portal'),
  ('timing', 'מתכנן לשנה הבאה', true, 'חזרה ברבעון הרלוונטי', 180, 5, 'sales_portal'),
  ('timing', 'העסק עוד לא מוכן', true, 'חזרה בעוד 3 חודשים', 90, 6, 'sales_portal'),

  -- מתחרה
  ('competitor', 'בחר במשרד אחר', true, 'חזרה אחרי 3 חודשים לבדוק שביעות רצון', 90, 7, 'sales_portal'),
  ('competitor', 'כבר יש לו רו"ח', false, NULL, NULL, 8, 'sales_portal'),

  -- צורך
  ('need', 'שינה דעה / לא צריך', true, 'חזרה בעוד 4 חודשים', 120, 9, 'sales_portal'),
  ('need', 'סגר את העסק', false, NULL, NULL, 10, 'sales_portal'),
  ('need', 'שכיר, לא עצמאי', false, NULL, NULL, 11, 'sales_portal'),

  -- אמון
  ('trust', 'לא השתכנע מהשירות', true, 'שליחת case studies או המלצות', 30, 12, 'sales_portal'),

  -- תקשורת
  ('communication', 'לא ניתן ליצור קשר (3+)', true, 'ניסיון אחרון בעוד שבועיים', 14, 13, 'sales_portal'),
  ('communication', 'מספר שגוי', false, NULL, NULL, 14, 'sales_portal'),
  ('communication', 'ספאם / לא אמיתי', false, NULL, NULL, 15, 'sales_portal'),

  -- אחר
  ('other', 'סיבה אחרת', true, NULL, NULL, 16, 'sales_portal')
ON CONFLICT DO NOTHING;
