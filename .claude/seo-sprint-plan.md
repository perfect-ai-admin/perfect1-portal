# SEO Sprint Plan — 3 שבועות (אפריל 2026)

## יעד: 80% דפים מאונדקסים + 200+ ביטויים

---

## שבוע 1 (5-11 אפריל): תיקון טכני קריטי

### ✅ סיימנו
- [x] תיקון robots.txt (הסרת `/open-osek-patur` Disallow)
- [x] תיקון BreadcrumbList schema (undefined items)
- [x] תיקון FAQ schema (empty Q&A filtering)
- [x] Build production

### 📋 שנותר השבוע

**יום ראשון (5 אפריל):**
1. **בדוק HTML rendering ל-Googlebot**
   ```bash
   curl -A "Googlebot" https://www.perfect1.co.il/osek-patur/how-to-open | head -100
   ```
   - וודא ש-meta tags visible
   - וודא ש-schema scripts visible

2. **בדוק Sitemap בGSC**
   - Remove `/sitemap` (pending status)
   - Keep only `/sitemap.xml`

3. **Request Indexing ידני**
   - בGSC: Tools → Request Indexing
   - 10 URLs per day:
     - `/osek-patur/how-to-open`
     - `/osek-murshe/how-to-open`
     - `/hevra-bam/how-to-open`
     - `/sgirat-tikim/close-osek-patur`
     - `/guides/opening-business`
     - `/compare/osek-patur-vs-murshe`
     - `/osek-patur` (hub)
     - `/osek-murshe` (hub)
     - `/hevra-bam` (hub)
     - `/guides` (hub)

**ימים 2-3 (6-7 אפריל):**
- Request 10 more URLs daily (rotate through all 47 content pages)

**ימים 4-5 (8-9 אפריל):**
- בדוק GSC Coverage report
- וודא: "Discovered — not indexed" count יורד
- אם עדיין stuck: סקור עבור:
  - duplicate content
  - noindex tags
  - low page quality (< 500 words)

---

## שבוע 2 (12-18 אפריל): הרחבת תוכן חוסר

### תכנית יצירה
**יום אחד = 2-3 מאמרים חדשים**

#### קטגוריה: osek-patur (השלמה 5 מאמרים חסרים)
| slug | ביטוי ראשי | עדיפות |
|------|-----------|--------|
| bituach-leumi | ביטוח לאומי עוסק פטור | 🔴 גבוה |
| receipt-guide | קבלה עוסק פטור | 🔴 גבוה |
| bank-account | חשבון בנק עוסק פטור | 🟠 בינוני |
| side-income | עבודה נוספת עוסק פטור | 🟠 בינוני |
| etsy-ebay | עוסק פטור למכירות אונליין | 🟠 בינוני |

#### קטגוריה: osek-murshe (השלמה 2 מאמרים חסרים)
| slug | ביטוי ראשי | עדיפות |
|------|-----------|--------|
| bookkeeping | הנהלת חשבונות עוסק מורשה | 🔴 גבוה |
| income-tax | מס הכנסה עוסק מורשה | 🔴 גבוה |

#### קטגוריה: guides (בנייה של 5 מאמרים חדשים)
| slug | ביטוי ראשי | עדיפות |
|------|-----------|--------|
| first-business | פתיחת עסק ראשון | 🔴 גבוה |
| business-plan | תוכנית עסקית | 🔴 גבוה |
| freelancer-guide | מדריך לפרילנסרים | 🔴 גבוה |
| home-business | עסק מהבית | 🟠 בינוני |
| pricing | תמחור שירותים | 🟠 בינוני |

### דפי השוואה (לפחות 5)
| slug | ביטוי ראשי |
|------|-----------|
| osek-vs-hevra | עוסק מורשה או חברה בעמ |
| patur-vs-hevra | עוסק פטור או חברה |
| freelancer-vs-employee | פרילנס או שכיר |
| sole-vs-partnership | עוסק עצמאי או שותפות |
| invoice-software-compare | השוואת תוכנות חשבוניות |

---

## שבוע 3 (19-25 אפריל): ניטור + הכנה לשלב 2

### ניטור GSC
- דוח coverage: כמה דפים נוספים אונדקסו?
- דוח queries: איזה ביטויים חדשים מופיעים?
- דוח position: האם ממוצע מיקום עולה או יורד?

### בנייה של אסטרטגיית שלב 2
- זיהוי 15 long-tail queries מ-GSC עם potential
- בנייה של 30 מאמרי long-tail (אפריל-מאי)

### ניהול סטטוס
| סוג | כמות | מצב |
|-----|------|------|
| דפים מאונדקסים | 40+ | 🎯 יעד שבוע 1 |
| Keywords מדורגים | 150+ | 🎯 יעד שבוע 2 |
| מאמרים חדשים | 20+ | 🎯 יעד שבוע 2-3 |
| Rich Results pass | 15+ | 🎯 יעד שבוע 1 |

---

## מדדי הצלחה

| מדד | עכשיו | שבוע 1 | שבוע 3 |
|-----|--------|--------|--------|
| דפים מאונדקסים | 4 | 40 | 65 |
| Keywords | 77 | 150 | 250 |
| CTR ממוצע | 0% | 1.5% | 3% |
| מיקום ממוצע | 72 | 55 | 40 |
| Clicks/חודש | 0 | 20 | 100 |

---

## שנותר להפעיל

**Agent seo-content-generator:**
- ייצור כל 20 המאמרים החדשים
- Prompt template: "יצירת מאמר SEO ל-{keyword} בקטגוריה {category}"

**Agent seo-internal-linking:**
- בנייה של מפת linking אופטימלית
- וודא 3+ קישורים ממאמר

**Agent seo-monitoring:**
- ניטור יומי GSC
- דיווח progress שבועי