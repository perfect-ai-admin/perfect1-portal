---
name: content-audit
description: "ביקורת תוכן SEO — בדיקת כל המאמרים, meta tags, keywords, internal linking, gaps. שימוש: /content-audit. מופעל כש: ביקורת תוכן, בדיקת מאמרים, מצב SEO, content gaps. קשור ל: article, seo-technical, seo-qa."
user_invocable: true
---

# Skill: ביקורת תוכן SEO

## תהליך

### 1. סרוק כל המאמרים
```
src/content/*/*.json
```

### 2. בדוק כל מאמר

| בדיקה | תקין | בעיה |
|--------|------|-------|
| metaTitle | ≤60 תווים + ביטוי ראשי | חסר/ארוך מדי |
| metaDescription | ≤155 תווים + CTA | חסר/ארוך |
| keywords | 4-8 ביטויים | חסר/מעט מדי |
| sections | ≥5 sections | מעט מדי |
| faq | ≥3 שאלות | חסר |
| relatedArticles | ≥3 מאמרים קיימים | חסר/שבורים |
| toc | תואם sections | לא מסונכרן |
| publishDate | קיים | חסר |

### 3. בדוק internal linking
- כל מאמר מקשר ל-3+ מאמרים?
- יש orphan articles (אף אחד לא מקשר אליהם)?
- relatedArticles מצביעים על slugs קיימים?

### 4. בדוק content gaps
השווה מול CLAUDE.md — איזה מאמרים מתוכננים אבל עדיין לא נכתבו?

### 5. דוח

```
📊 ביקורת תוכן — {תאריך}

מאמרים: {total} | תקינים: {ok} | בעיות: {issues}

❌ בעיות:
- {category}/{slug}: metaTitle ארוך (72 תווים)
- {category}/{slug}: חסר FAQ
- {category}/{slug}: relatedArticles מצביע על slug שלא קיים

📝 Content Gaps (מתוכננים אבל חסרים):
- osek-murshe/how-to-open
- osek-murshe/cost
- ...

🔗 Orphan Articles (אף אחד לא מקשר אליהם):
- {category}/{slug}
```
