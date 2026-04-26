---
name: landing-optimizer
description: "אופטימיזציית landing pages — CRO, A/B testing, שיפור המרות, ניתוח דפי נחיתה. מופעל כש: שיפור landing page, העלאת המרות, A/B test, ניתוח דף נחיתה, CRO. קשור ל: copywriting, seo-technical."
user_invocable: true
---

# Skill: אופטימיזציית Landing Pages

## שלב 1: ביקורת הדף הקיים

קרא את קובץ הדף ובדוק:

| אלמנט | בדיקה |
|--------|--------|
| H1 | ברור? כולל value proposition? |
| Hero | CTA נראה above the fold? |
| Social proof | מספרים? עדויות? לוגואים? |
| טופס | כמה שדות? מינימלי? |
| CTA | ספציפי? תועלת? |
| מהירות | תמונות ממוטבות? lazy loading? |
| Mobile | responsive? touch targets 44px+? |

## שלב 2: זהה בעיות

**סימנים לבעיית המרה:**
- H1 עמום ("פתרונות לעסקים" במקום "פתח עוסק פטור ב-10 דקות")
- CTA גנרי ("שלח" במקום "קבל הצעת מחיר")
- טופס ארוך (5+ שדות בשלב ראשון)
- אין social proof above the fold
- אין טיפול בהתנגדויות

## שלב 3: הצע שיפורים

**תעדוף לפי impact:**
1. **גבוה**: H1, CTA, טופס (פחות שדות)
2. **בינוני**: Social proof, התנגדויות, mobile
3. **נמוך**: מיקרו-קופי, צבעים, animations

**A/B testing — היפותזות מומלצות:**
- כותרת ספציפית vs. כללית
- CTA עם תועלת vs. גנרי
- טופס 2 שדות vs. 4 שדות
- עם/בלי social proof above the fold

## דפי נחיתה קיימים בפרויקט

| דף | קובץ |
|----|-------|
| עוסק פטור A | `src/pages/OsekPaturSteps.jsx` |
| עוסק פטור B | `src/pages/OsekPaturStepsB.jsx` |
| עוסק זעיר | `src/pages/OsekZeirLanding.jsx` |
| פטור vs מורשה | `src/pages/PaturVsMursheLanding.jsx` |
| Pricing | `src/pages/Pricing.jsx` |
| Home | `src/pages/Home.jsx` |
