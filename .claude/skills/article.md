---
name: article
description: "יצירת מאמר SEO חדש בעברית לפי תבנית הפרויקט. שימוש: /article {category}/{slug}. מופעל כש: צריך מאמר חדש, תוכן SEO, כתיבת מדריך, הוספת מאמר לפורטל. קשור ל: seo-content-generator, seo-content-keyword."
user_invocable: true
---

# Skill: יצירת מאמר SEO

**קלט:** `$ARGUMENTS` בפורמט `{category}/{slug}` (למשל `osek-murshe/how-to-open`)

## שלב 1: גילוי

1. פרק `$ARGUMENTS` ל-category ו-slug
2. חפש ב-CLAUDE.md את השורה המתאימה — שלוף ביטוי ראשי + משניים
3. אם לא נמצא — שאל את המשתמש מה הביטוי הראשי
4. קרא `src/content/{category}/` לראות מה כבר קיים (למניעת כפילות)
5. קרא מאמר קיים כדוגמה: `src/content/osek-patur/how-to-open.json`

## שלב 2: מחקר מילות מפתח

- **ביטוי ראשי**: מופיע ב-H1, meta title, פסקה ראשונה
- **ביטויים משניים (3-5)**: מופיעים ב-H2, תוך הטקסט
- **Long-tail (2-3)**: שאלות שמטרגטות "אנשים גם שואלים"
- **כל הביטויים בעברית** — מונחים ישראליים מקומיים

## שלב 3: כתיבת התוכן

צור JSON ב-`src/content/{category}/{slug}.json`:

```json
{
  "slug": "",
  "category": "",
  "metaTitle": "ביטוי ראשי — הקשר | פרפקט וואן (עד 60 תווים)",
  "metaDescription": "משפט עם ביטוי ראשי + CTA (עד 155 תווים)",
  "keywords": ["ראשי", "משני1", "משני2", "long-tail1"],
  "heroTitle": "H1 כולל ביטוי ראשי",
  "heroSubtitle": "משפט תומך אחד",
  "publishDate": "YYYY-MM-DD",
  "updatedDate": "YYYY-MM-DD",
  "author": { "name": "צוות פרפקט וואן", "role": "מומחי עסקים" },
  "readTime": 10,
  "toc": [],
  "sections": [],
  "relatedArticles": [],
  "faq": []
}
```

### עקרונות כתיבה

**מבנה:**
- לפחות 8 sections, 1500+ מילים
- סוגי sections מגוונים: `text`, `list`, `steps`, `callout`, `faq`, `comparison`, `cta-inline`
- פסקאות קצרות (2-3 משפטים), H1 יחיד = heroTitle

**סגנון:**
- עברית טבעית — "איך פותחים" ולא "מדריך מקיף לפתיחת"
- מספרים ספציפיים: "תוך 3 ימי עסקים" ולא "במהירות"
- מונחים ישראליים: מס הכנסה, מע״מ, ביטוח לאומי
- אל תמציא — מידע מדויק ורלוונטי לישראל 2026

**SEO:**
- ביטוי ראשי בפסקה ראשונה + H1 + meta
- ביטויים משניים ב-H2 של sections
- FAQ: 3-5 שאלות (מה, איך, כמה, מתי)
- relatedArticles: 3-4 מאמרים **קיימים** (בדוק!)

## שלב 4: עדכונים

1. הוסף URL ל-`public/sitemap.xml`
2. בדוק אם צריך עדכון ב-`src/portal/config/navigation.js`
3. דווח: "מאמר {slug} נוצר — {X} sections, {Y} מילים"
