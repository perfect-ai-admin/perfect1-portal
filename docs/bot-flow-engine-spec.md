# Bot Flow Engine — אפיון מלא

## מסמך אפיון: מערכת בוט כניסה דינמית לפי דף מקור
**גרסה:** 1.0
**תאריך:** 2026-03-31
**מטרה:** להגדיל יחס המרה של לידים מהאתר דרך שיחת בוט מותאמת לכוונת המשתמש

---

## 1. Product Vision

**בעיה:** כל הלידים מקבלים אותו מענה — בלי קשר לדף שממנו הגיעו, לכוונה שלהם, או לשלב שהם נמצאים בו.

**פתרון:** בוט אחד חכם שמקבל context מלא על הליד (דף מקור, intent, UTM) ומתאים אוטומטית את:
- הודעת הפתיחה
- השאלות
- הטון
- ה-CTA
- יעד הסיום

**תוצאה עסקית:**
- עלייה ב-first response rate
- עלייה ב-CTA click rate
- קיצור זמן מליד לפעולה
- שדות CRM עשירים יותר לכל ליד

---

## 2. Bot Architecture

```
┌─────────────────────────────────────────────────────┐
│                    WEBSITE                           │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Landing  │ │ Article  │ │ Compare  │  ...        │
│  │ Pages    │ │ Pages    │ │ Pages    │            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘            │
│       │             │            │                   │
│       └─────────────┴────────────┘                   │
│                     │                                │
│              Lead Form Submit                        │
│              + page_context                          │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              BOT FLOW ENGINE                         │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐                  │
│  │ Intent      │  │ Flow         │                  │
│  │ Classifier  │──│ Selector     │                  │
│  └─────────────┘  └──────┬───────┘                  │
│                          │                           │
│  ┌───────────────────────┼──────────────────────┐   │
│  │        FLOW TYPES     │                      │   │
│  │  ┌─────────┐ ┌───────┴──┐ ┌──────────┐     │   │
│  │  │service  │ │comparison│ │ guide    │     │   │
│  │  │_flow    │ │_flow     │ │ _flow    │     │   │
│  │  └─────────┘ └──────────┘ └──────────┘     │   │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐     │   │
│  │  │pricing  │ │accounting│ │ generic  │     │   │
│  │  │_flow    │ │_svc_flow │ │ _flow    │     │   │
│  │  └─────────┘ └──────────┘ └──────────┘     │   │
│  └──────────────────────────────────────────────┘   │
│                          │                           │
│                    ┌─────┴─────┐                     │
│                    │ Message   │                     │
│                    │ Templates │                     │
│                    └─────┬─────┘                     │
│                          │                           │
└──────────────────────────┼──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│              CHANNELS                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ WhatsApp │ │ SMS      │ │ Web Chat │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              CRM (Supabase leads table)              │
│  + bot_fields: flow_type, intent, temperature,      │
│    outcome_state, current_step, answers...           │
└─────────────────────────────────────────────────────┘
```

---

## 3. Input Schema

כל ליד שנכנס למערכת הבוט מגיע עם:

```typescript
interface BotLeadInput {
  // פרטי ליד
  lead_name: string;
  phone: string;
  email?: string;

  // context מהדף
  page_url: string;          // URL מלא
  page_slug: string;         // e.g. "open-osek-patur"
  page_title: string;        // e.g. "פתיחת עוסק פטור"
  page_category: string;     // e.g. "osek-patur"
  page_type: PageType;       // landing | article | hub | compare | pricing_app

  // intent (מחושב — ראה סעיף 4)
  page_intent: PageIntent;
  service_type?: string;     // e.g. "open_osek_patur"

  // UTM
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;

  // מטא
  referrer?: string;
  lead_created_at: string;   // ISO timestamp
}
```

---

## 4. Page Intent Model — מודל סיווג כוונה

### 4.1 טבלת Intent לפי URL

#### A. דפי נחיתה (Landing Pages)

| URL | page_slug | page_intent | service_type | flow_type |
|-----|-----------|-------------|--------------|-----------|
| `/open-osek-patur` | `open-osek-patur` | `service` | `open_osek_patur` | `service_flow` |
| `/OsekPaturLanding` | `osek-patur-landing` | `service` | `open_osek_patur` | `service_flow` |
| `/OsekPaturSteps` | `osek-patur-steps` | `service` | `open_osek_patur` | `service_flow` |
| `/accountant-osek-patur` | `accountant-osek-patur` | `accounting_service` | `accountant_osek_patur` | `accounting_svc_flow` |
| `/patur-vs-murshe` | `patur-vs-murshe` | `comparison` | `patur_vs_murshe` | `comparison_flow` |
| `/patur-vs-murshe-quiz` | `patur-vs-murshe-quiz` | `comparison` | `patur_vs_murshe` | `comparison_flow` |

#### B. דפי מאמרים — עוסק פטור

| URL | page_intent | service_type | flow_type |
|-----|-------------|--------------|-----------|
| `/osek-patur/how-to-open` | `guide` | `open_osek_patur` | `guide_flow` |
| `/osek-patur/management` | `guide` | `manage_osek_patur` | `accounting_svc_flow` |
| `/osek-patur/taxes` | `guide` | `taxes_osek_patur` | `guide_flow` |
| `/osek-patur/tax-reporting` | `guide` | `reporting_osek_patur` | `guide_flow` |
| `/osek-patur/income-ceiling` | `guide` | `ceiling_osek_patur` | `guide_flow` |
| `/osek-patur/rights` | `guide` | `rights_osek_patur` | `guide_flow` |
| `/osek-patur/status-change` | `service` | `status_change` | `service_flow` |
| `/osek-patur/cost` | `pricing` | `cost_osek_patur` | `pricing_flow` |
| `/osek-patur/accountant` | `accounting_service` | `accountant_osek_patur` | `accounting_svc_flow` |
| `/osek-patur/faq` | `guide` | `faq_osek_patur` | `guide_flow` |

#### C. דפי מאמרים — עוסק מורשה

| URL | page_intent | service_type | flow_type |
|-----|-------------|--------------|-----------|
| `/osek-murshe/how-to-open` | `guide` | `open_osek_murshe` | `guide_flow` |
| `/osek-murshe/management` | `guide` | `manage_osek_murshe` | `accounting_svc_flow` |
| `/osek-murshe/taxes` | `guide` | `taxes_osek_murshe` | `guide_flow` |
| `/osek-murshe/vat-guide` | `guide` | `vat_osek_murshe` | `guide_flow` |
| `/osek-murshe/reports` | `guide` | `reports_osek_murshe` | `guide_flow` |
| `/osek-murshe/cost` | `pricing` | `cost_osek_murshe` | `pricing_flow` |
| `/osek-murshe/status-change` | `service` | `status_change` | `service_flow` |
| `/osek-murshe/faq` | `guide` | `faq_osek_murshe` | `guide_flow` |

#### D. דפי מאמרים — חברה בע"מ

| URL | page_intent | service_type | flow_type |
|-----|-------------|--------------|-----------|
| `/hevra-bam/how-to-open` | `guide` | `open_hevra` | `guide_flow` |
| `/hevra-bam/management` | `guide` | `manage_hevra` | `guide_flow` |
| `/hevra-bam/reports` | `guide` | `reports_hevra` | `guide_flow` |
| `/hevra-bam/shareholders` | `guide` | `shareholders_hevra` | `guide_flow` |
| `/hevra-bam/transition` | `service` | `transition_hevra` | `service_flow` |
| `/hevra-bam/cost` | `pricing` | `cost_hevra` | `pricing_flow` |
| `/hevra-bam/faq` | `guide` | `faq_hevra` | `guide_flow` |

#### E. דפי מאמרים — סגירת תיקים

| URL | page_intent | service_type | flow_type |
|-----|-------------|--------------|-----------|
| `/sgirat-tikim/close-osek-patur` | `service` | `close_osek_patur` | `service_flow` |
| `/sgirat-tikim/close-osek-murshe` | `service` | `close_osek_murshe` | `service_flow` |
| `/sgirat-tikim/close-company` | `service` | `close_company` | `service_flow` |
| `/sgirat-tikim/authorities` | `guide` | `close_authorities` | `guide_flow` |
| `/sgirat-tikim/consequences` | `guide` | `close_consequences` | `guide_flow` |
| `/sgirat-tikim/faq` | `guide` | `faq_sgirat_tikim` | `guide_flow` |

#### F. דפי מדריכים כלליים

| URL | page_intent | service_type | flow_type |
|-----|-------------|--------------|-----------|
| `/guides/opening-business` | `guide` | `opening_business` | `guide_flow` |
| `/guides/which-business-type` | `comparison` | `business_type_selection` | `comparison_flow` |
| `/guides/comparisons` | `comparison` | `comparisons` | `comparison_flow` |
| `/guides/taxation` | `guide` | `taxation` | `guide_flow` |
| `/guides/freelancers` | `guide` | `freelancers` | `guide_flow` |
| `/guides/tools` | `guide` | `tools` | `guide_flow` |
| `/guides/faq` | `guide` | `faq_general` | `guide_flow` |

#### G. דפי השוואה

| URL | page_intent | service_type | flow_type |
|-----|-------------|--------------|-----------|
| `/compare/osek-patur-vs-murshe` | `comparison` | `patur_vs_murshe` | `comparison_flow` |

#### H. דפי רכזת קטגוריה (Hub)

| URL | page_intent | service_type | flow_type |
|-----|-------------|--------------|-----------|
| `/` (portal home) | `guide` | `general` | `generic_flow` |
| `/osek-patur` | `guide` | `osek_patur_general` | `guide_flow` |
| `/osek-murshe` | `guide` | `osek_murshe_general` | `guide_flow` |
| `/hevra-bam` | `guide` | `hevra_general` | `guide_flow` |
| `/sgirat-tikim` | `service` | `sgirat_tikim_general` | `service_flow` |
| `/guides` | `guide` | `guides_general` | `guide_flow` |

#### I. דפי אפליקציה (perfect-dashboard.com)

| URL | page_intent | service_type | flow_type |
|-----|-------------|--------------|-----------|
| `/Pricing` | `pricing` | `app_pricing` | `pricing_flow` |
| `/Features` | `guide` | `app_features` | `generic_flow` |
| `/FAQ` | `guide` | `app_faq` | `generic_flow` |
| `/SmartLogo` | `service` | `smart_logo` | `service_flow` |
| `/Branding` | `service` | `branding` | `service_flow` |
| `/blog/logo-leasek` | `guide` | `logo_article` | `guide_flow` |
| `/blog/kartis-bikur-digitali` | `guide` | `digital_card_article` | `guide_flow` |
| `/blog/daf-nchita` | `guide` | `landing_page_article` | `guide_flow` |
| `/blog/matzget-iskit` | `guide` | `presentation_article` | `guide_flow` |
| `/blog/matzget-mashkiim` | `guide` | `investor_deck_article` | `guide_flow` |
| `/blog/sticker-leasek` | `guide` | `sticker_article` | `guide_flow` |
| `/PricingPerfectBizAI` | `pricing` | `app_ai_pricing` | `pricing_flow` |

### 4.2 Intent Classifier Logic

```
function classifyIntent(page_slug, page_url, page_title):

  // Rule 1: URL-based exact match (מטבלה 4.1)
  if PAGE_INTENT_MAP[page_slug] exists:
    return PAGE_INTENT_MAP[page_slug]

  // Rule 2: URL pattern matching
  if page_url contains "/compare/":
    return { intent: "comparison", flow: "comparison_flow" }

  if page_url contains "/cost" or page_title contains "כמה עולה" or "מחיר" or "עלות":
    return { intent: "pricing", flow: "pricing_flow" }

  if page_url contains "/accountant" or page_title contains "רואה חשבון":
    return { intent: "accounting_service", flow: "accounting_svc_flow" }

  if page_slug startsWith "open-" or page_slug startsWith "close-"
     or page_title contains "פתיחת" or "סגירת":
    return { intent: "service", flow: "service_flow" }

  if page_url contains "vs" or page_title contains "או" or "הבדל" or "השוואה":
    return { intent: "comparison", flow: "comparison_flow" }

  if page_title contains "איך" or "מדריך" or "שלבים":
    return { intent: "guide", flow: "guide_flow" }

  // Rule 3: Fallback
  return { intent: "guide", flow: "generic_flow" }
```

---

## 5. Flow Engine — מנוע מסלולים

### 5.1 מבנה Flow

```typescript
interface BotFlow {
  flow_type: string;
  goal: string;
  tone: string;
  max_steps: number;
  opening_message: string;        // template עם {{variables}}
  steps: BotStep[];
  global_buttons: GlobalButton[];
  exit_conditions: ExitCondition[];
}

interface BotStep {
  step_id: string;
  question: string;
  buttons: Button[];
  free_text_allowed: boolean;
  next_step_logic: Record<string, string>;  // button_id → next step/action
  crm_field: string;            // איזה שדה ב-CRM לעדכן
}

interface Button {
  id: string;
  label: string;
  emoji?: string;
  action?: string;              // "next_step" | "cta" | "handoff" | "pricing"
  temperature_signal?: string;  // "hot" | "warm" | "cold"
}
```

### 5.2 כפתורים גלובליים (בכל Flow, בכל שלב)

```
┌────────────────────────────────┐
│ 💬 לדבר עם נציג               │
│ ❓ לשאול שאלה                  │
│ 💰 כמה זה עולה                │
│ 🚀 להתחיל עכשיו               │
└────────────────────────────────┘
```

- **לדבר עם נציג** → `outcome: handoff_to_agent`, `temperature: hot`
- **לשאול שאלה** → מעבר למסלול פתוח / נציג
- **כמה זה עולה** → הצגת מחיר חלקי + CTA
- **להתחיל עכשיו** → מעבר ישיר ל-CTA (שליחת ת"ז / תשלום / שיחה)

---

## 6. Flows מפורטים לפי סוג דף

---

### FLOW A: service_flow — דפי שירות ישיר

**דפים שמפעילים:**
- `/open-osek-patur` — פתיחת עוסק פטור
- `/OsekPaturLanding` — דף נחיתה עוסק פטור
- `/OsekPaturSteps` — דף נחיתה עוסק פטור (steps)
- `/osek-patur/status-change` — שינוי סטטוס
- `/osek-murshe/status-change` — שינוי סטטוס
- `/hevra-bam/transition` — מעבר לחברה
- `/sgirat-tikim/close-osek-patur` — סגירת עוסק פטור
- `/sgirat-tikim/close-osek-murshe` — סגירת עוסק מורשה
- `/sgirat-tikim/close-company` — סגירת חברה
- `/sgirat-tikim` (hub) — סגירת תיקים
- `/SmartLogo` — לוגו AI
- `/Branding` — מיתוג

**מטרה:** להוביל מהר לפעולה — שליחת ת"ז, שיחה, או התחלת תהליך.

**טון:** שירותי, ישיר, מקצועי. בלי להעמיס מידע.

**מספר שלבים:** 2 + CTA

---

#### Flow A1: פתיחת עוסק פטור

**הודעת פתיחה:**
```
שלום {{lead_name}} 👋
ראיתי שהשארת פרטים לגבי פתיחת עוסק פטור.
אני כאן כדי לעזור לך להתחיל בצורה מסודרת מול מע״מ, מס הכנסה וביטוח לאומי.
נשאל 2 שאלות קצרות ונתקדם.
```

**שלב 1 — מיקום בתהליך:**
```
איפה אתה נמצא בתהליך?
```
| כפתור | temperature | next |
|--------|-------------|------|
| 🚀 רוצה להתחיל עכשיו | hot | step_2 |
| 📅 מתחיל בקרוב | warm | step_2 |
| 🔍 רק בודק מידע | cold | step_2 |

→ שמור ב-CRM: `first_answer`, `temperature`

**שלב 2 — תחום פעילות:**
```
מה תחום הפעילות שלך?
```
| כפתור | next |
|--------|------|
| 💼 שירותים / פרילנס | cta |
| 📦 מכירת מוצרים | cta |
| 🎓 מקצוע חופשי | cta |
| ✏️ אחר | cta |

→ שמור ב-CRM: `second_answer`, `profession`

**הודעת מעבר + CTA:**
```
מעולה 👍
אפשר להתקדם עכשיו באחת מהדרכים הבאות:
```
| כפתור | action | outcome |
|--------|--------|---------|
| 📄 לשלוח ת"ז ולהתחיל | collect_documents | `sent_documents` |
| 📞 לקבוע שיחה קצרה | book_call | `booked_call` |
| ❓ לשאול שאלה | open_question | `asked_question` |
| 💰 כמה זה עולה | show_pricing | → pricing message |

**אם לחץ "כמה זה עולה":**
```
פתיחת תיק: 250 ₪ + מע״מ (חד פעמי)
ליווי חודשי: 200 ₪ + מע״מ

כולל: דוח שנתי, ליווי שוטף, אפליקציה להוצאת קבלות, ומנהלת תיק זמינה.

מה תרצה לעשות?
```
| כפתור | outcome |
|--------|---------|
| 📄 לשלוח ת"ז ולהתחיל | `sent_documents` |
| 📞 לדבר עם רואה חשבון | `booked_call` |
| 🚀 להתחיל עכשיו | `started_checkout` |

**כללי מעבר:**
- אם `temperature = hot` → push ישיר ל-CTA אחרי שלב 2
- אם `temperature = cold` → לא לבקש ת"ז, להציע שיחה/שאלה
- אם בחר "רוצה להתחיל עכשיו" בשלב 1 → אפשר לדלג לשלב CTA

**מתי מעבירים לנציג:** אם בחר "לשאול שאלה" או לחץ "לדבר עם נציג"
**מתי מבקשים מסמכים:** אם `temperature = hot` ובחר "לשלוח ת"ז"
**מתי מציעים מחיר:** אם לחץ "כמה זה עולה" או `temperature = warm`
**מתי מציעים שיחה:** תמיד כאפשרות, דגש אם `temperature = warm/cold`

---

#### Flow A2: סגירת עוסק פטור

**הודעת פתיחה:**
```
שלום {{lead_name}} 👋
ראיתי שהתעניינת בסגירת עוסק פטור.
התהליך כולל סגירה מול מע״מ, מס הכנסה וביטוח לאומי — ואנחנו יכולים לטפל בהכל בשבילך.
```

**שלב 1:**
```
איפה אתה נמצא בתהליך?
```
| כפתור | temperature |
|--------|-------------|
| 🚀 רוצה לסגור עכשיו | hot |
| 📅 מתכנן לסגור בקרוב | warm |
| 🔍 רק בודק מה צריך | cold |

**שלב 2:**
```
למה אתה רוצה לסגור?
```
| כפתור |
|--------|
| 🛑 הפסקתי לעבוד |
| 🔄 עובר לעוסק מורשה / חברה |
| ❓ לא בטוח אם כדאי לסגור |

**CTA:**
```
אנחנו יכולים לטפל בכל התהליך בשבילך.
```
| כפתור | outcome |
|--------|---------|
| 📄 לשלוח ת"ז ולהתחיל סגירה | `sent_documents` |
| 📞 לקבוע שיחה קצרה | `booked_call` |
| 💰 כמה זה עולה | → pricing |
| ❓ לשאול שאלה | `asked_question` |

---

#### Flow A3: שירותי אפליקציה (לוגו / מיתוג)

**הודעת פתיחה:**
```
שלום {{lead_name}} 👋
ראיתי שהתעניינת ב-{{page_title}}.
אני כאן כדי לעזור לך להתחיל — מה בדיוק חיפשת?
```

**שלב 1:**
```
מה הכי חשוב לך עכשיו?
```
| כפתור | temperature |
|--------|-------------|
| 🚀 רוצה להתחיל עכשיו | hot |
| 💰 רוצה לשמוע מחיר | warm |
| 🔍 רוצה לראות דוגמאות | cold |

**CTA (לפי בחירה):**
- **התחיל עכשיו** → קישור ל-checkout
- **מחיר** → הצגת מחירון + CTA
- **דוגמאות** → קישור לדוגמאות + follow-up

---

### FLOW B: comparison_flow — דפי השוואה / התלבטות

**דפים שמפעילים:**
- `/patur-vs-murshe` — עוסק פטור או מורשה
- `/patur-vs-murshe-quiz` — קוויז התאמה
- `/compare/osek-patur-vs-murshe` — דף השוואה
- `/guides/which-business-type` — איזה סוג עסק
- `/guides/comparisons` — השוואות

**מטרה:** לייעץ, לבנות אמון, ולהוביל לשיחת התאמה או פתיחה.

**טון:** ייעוצי, סבלני, לא דוחף. "בוא נבדוק ביחד."

**מספר שלבים:** 3 + CTA

---

#### Flow B1: עוסק פטור או מורשה

**הודעת פתיחה:**
```
שלום {{lead_name}} 👋
ראיתי שהתעניינת בנושא עוסק פטור או מורשה.
אני יכול לעזור לך להבין מה כנראה יותר מתאים לך בכמה שאלות קצרות.
```

**שלב 1 — תזמון:**
```
מתי אתה מתכנן להתחיל את העסק?
```
| כפתור | temperature |
|--------|-------------|
| 📅 בשבועות הקרובים | hot |
| 🗓️ בחודשים הקרובים | warm |
| 🔍 רק בודק אפשרויות | cold |

→ שמור: `first_answer`, `temperature`

**שלב 2 — תחום:**
```
מה תחום הפעילות שלך?
```
| כפתור |
|--------|
| 💼 שירותים / פרילנס |
| 📦 מכירת מוצרים |
| 🎓 מקצוע חופשי |
| ❓ עדיין לא בטוח |

→ שמור: `second_answer`, `profession`

**שלב 3 — הכנסה:**
```
כמה אתה מעריך שתכניס בשנה?
```
| כפתור |
|--------|
| 💰 עד 120,000 ₪ |
| 💰💰 120,000–300,000 ₪ |
| 💰💰💰 מעל 300,000 ₪ |
| 🤷 עדיין לא יודע |

→ שמור: `third_answer`, `estimated_value`

**הודעת תוצאה + CTA:**
```
לפי הנתונים שלך נראה שיש כיוון די ברור למה יכול להתאים לך יותר.
כדי שלא יהיו טעויות מול מס הכנסה ומע״מ, אפשר להתקדם עכשיו:
```
| כפתור | outcome |
|--------|---------|
| 📞 שיחת התאמה קצרה | `booked_call` |
| 📝 לקבל הסבר מסודר | `warm_followup_needed` |
| 🚀 לפתוח עכשיו | `started_checkout` |
| ❓ לשאול שאלה | `asked_question` |

**כללי מעבר:**
- **לעולם לא לבקש ת"ז ישירות** — המשתמש בשלב התלבטות
- אם `temperature = hot` + הכנסה > 120K → להציע עוסק מורשה + שיחה
- אם `temperature = hot` + הכנסה < 120K → להציע עוסק פטור + התחלה
- אם `temperature = cold` → להציע הסבר מסודר / שיחה

---

### FLOW C: guide_flow — דפי מדריך / מידע

**דפים שמפעילים:**
- `/osek-patur/how-to-open` — איך פותחים עוסק פטור
- `/osek-patur/taxes` — מיסוי עוסק פטור
- `/osek-patur/tax-reporting` — דיווח שנתי
- `/osek-patur/income-ceiling` — תקרת הכנסה
- `/osek-patur/rights` — זכויות עוסק פטור
- `/osek-patur/faq` — שאלות נפוצות
- `/osek-murshe/how-to-open` — איך פותחים מורשה
- `/osek-murshe/taxes`, `/vat-guide`, `/reports`, `/faq`
- `/hevra-bam/how-to-open`, `/management`, `/reports`, `/shareholders`, `/faq`
- `/sgirat-tikim/authorities`, `/consequences`, `/faq`
- `/guides/opening-business`, `/taxation`, `/freelancers`, `/tools`, `/faq`
- כל דפי בלוג באפליקציה

**מטרה:** להעביר מצריכת מידע לפעולה. לא לדחוף, אלא להציע עזרה.

**טון:** עוזר, מסביר, נעים. "אם תרצה, אני יכול לעזור."

**מספר שלבים:** 2 + CTA

---

#### Flow C1: איך פותחים עוסק פטור

**הודעת פתיחה:**
```
שלום {{lead_name}} 👋
ראיתי שהשארת פרטים לגבי איך פותחים עוסק פטור.
אם תרצה, אני יכול לעשות לך סדר קצר בתהליך ולעזור לך להתקדם בלי טעויות.
```

**שלב 1 — מיקום:**
```
כבר התחלת לעבוד או שזה עדיין בתכנון?
```
| כפתור | temperature |
|--------|-------------|
| ✅ כבר התחלתי | hot |
| 📅 מתחיל בקרוב | warm |
| 🔍 עדיין רק בודק | cold |

→ שמור: `first_answer`, `temperature`

**שלב 2 — מה רוצה:**
```
מה היית רוצה עכשיו?
```
| כפתור | next |
|--------|------|
| 📋 להבין את השלבים | explain_steps |
| 📞 לדבר עם רואה חשבון | `booked_call` |
| 🚀 להתחיל פתיחה | `sent_documents` |
| ❓ לשאול שאלה | `asked_question` |

→ שמור: `second_answer`, `desired_action`

**אם בחר "להבין את השלבים":**
```
בגדול התהליך כולל פתיחה מול:
• מע״מ
• מס הכנסה
• ביטוח לאומי

אנחנו יכולים ללוות אותך בכל השלבים כדי שלא יהיו טעויות או עיכובים.
```
| כפתור | outcome |
|--------|---------|
| 📞 לדבר עם רואה חשבון | `booked_call` |
| 📄 להתחיל פתיחת תיק | `sent_documents` |
| ❓ לשאול שאלה | `asked_question` |

**כללי מעבר:**
- לא לבקש ת"ז בשלב ראשון — המשתמש עדיין לומד
- אם `temperature = hot` → להציע "להתחיל עכשיו" בולט
- אם `temperature = cold` → להדגיש "לדבר עם רואה חשבון"

---

#### Flow C2: guide_flow גנרי (לכל דפי מידע)

**הודעת פתיחה (template):**
```
שלום {{lead_name}} 👋
ראיתי שהשארת פרטים בנושא {{page_title}}.
אם תרצה, אני יכול לעזור לך להתקדם בנושא הזה.
```

**שלב 1:**
```
מה הכי חשוב לך עכשיו?
```
| כפתור | temperature |
|--------|-------------|
| 🚀 רוצה להתקדם עכשיו | hot |
| 📞 לדבר עם מומחה | warm |
| 🔍 רק מחפש מידע | cold |

**CTA (לפי temperature):**

**hot:**
```
מעולה! אפשר להתחיל עכשיו:
```
| 📄 לשלוח מסמכים | 📞 שיחה | 🚀 התחלה |

**warm:**
```
אשמח לעזור! מה מתאים לך?
```
| 📞 שיחה עם מומחה | 💰 הצעת מחיר | ❓ שאלה |

**cold:**
```
אני כאן אם תצטרך עזרה 🙂
```
| 📞 לדבר עם מומחה | ❓ לשאול שאלה |

---

### FLOW D: pricing_flow — דפי מחיר

**דפים שמפעילים:**
- `/osek-patur/cost` — עלות עוסק פטור
- `/osek-murshe/cost` — עלות עוסק מורשה
- `/hevra-bam/cost` — עלות חברה
- `/Pricing` — מחירון אפליקציה
- `/PricingPerfectBizAI` — מחירון AI

**מטרה:** לתת מענה מהיר למחיר ולמשוך לפעולה.

**טון:** ישיר, שקוף, ללא מחיר חבוי. "הנה המחיר, בוא נתקדם."

**מספר שלבים:** 1 (מחיר) + CTA

---

#### Flow D1: כמה עולה רואה חשבון לעוסק פטור

**הודעת פתיחה:**
```
שלום {{lead_name}} 👋
ראיתי שהתעניינת ב-כמה עולה רואה חשבון לעוסק פטור.
אני יכול לתת לך כיוון למחיר ולעזור לך להבין מה בדיוק כלול.
```

**הודעת מחיר (מיידית):**
```
ברוב המקרים השירות הוא סביב:
💰 200 ₪ + מע״מ לחודש
💰 250 ₪ + מע״מ חד פעמי (פתיחת תיק)

זה כולל:
✅ דוח שנתי
✅ ליווי וייעוץ
✅ התנהלות מול הרשויות
✅ אפליקציה להוצאת קבלות
✅ מנהלת תיק זמינה
```

**שלב 1 — מה רוצה:**
```
מה היית רוצה עכשיו?
```
| כפתור | outcome |
|--------|---------|
| 📝 לקבל הצעת מחיר מדויקת | `requested_quote` |
| 📞 לדבר עם רואה חשבון | `booked_call` |
| 🚀 להתחיל פתיחה | `started_checkout` |
| ❓ לשאול שאלה | `asked_question` |

**כללי מעבר:**
- לתת מחיר **מיד** — זה מה שהמשתמש חיפש
- לא לשאול שאלות לפני שנותנים מחיר
- אחרי מחיר → CTA ישיר

---

#### Flow D2: pricing_flow גנרי (עלות עוסק מורשה / חברה)

**הודעת פתיחה:**
```
שלום {{lead_name}} 👋
ראיתי שהתעניינת ב-{{page_title}}.
```

**מחיר לפי service_type:**

**עוסק מורשה:**
```
💰 ליווי חודשי: 400-600 ₪ + מע״מ
💰 פתיחת תיק: 350 ₪ + מע״מ

כולל: דיווח דו-חודשי, מע״מ, דוח שנתי, ייעוץ.
```

**חברה בע"מ:**
```
💰 ליווי חודשי: החל מ-800 ₪ + מע״מ
💰 הקמת חברה: החל מ-2,500 ₪ + מע״מ

כולל: הנהלת חשבונות, דוחות, שכר, ייעוץ מס.
```

**סגירת תיק:**
```
💰 סגירת עוסק פטור: 350 ₪ + מע״מ
💰 סגירת עוסק מורשה: 500 ₪ + מע״מ
💰 סגירת חברה: החל מ-1,500 ₪ + מע״מ
```

→ אחרי כל מחיר אותם כפתורי CTA

---

### FLOW E: accounting_svc_flow — שירות רואה חשבון

**דפים שמפעילים:**
- `/accountant-osek-patur` — רואה חשבון לעוסק פטור
- `/osek-patur/accountant` — מאמר רו"ח
- `/osek-patur/management` — ניהול עוסק פטור
- `/osek-murshe/management` — ניהול עוסק מורשה

**מטרה:** להוביל להצעת מחיר, שיחה, או הצטרפות.

**טון:** מקצועי, מציע ערך. "הנה מה שכלול, בוא נתקדם."

**מספר שלבים:** 2 + CTA

---

#### Flow E1: רואה חשבון לעוסק פטור

**הודעת פתיחה:**
```
שלום {{lead_name}} 👋
ראיתי שהתעניינת בשירות רואה חשבון לעוסק פטור.
אני יכול להסביר לך בקצרה מה השירות כולל ולעזור לך להבין איך הכי נכון להתקדם.
```

**שלב 1 — עדיפות:**
```
מה הכי חשוב לך כרגע?
```
| כפתור | signal |
|--------|--------|
| 💰 מחיר | → show pricing |
| 🤝 ליווי שוטף | warm |
| 📊 דוח שנתי | warm |
| 😌 שקט נפשי | hot |

→ שמור: `first_answer`

**שלב 2 — מצב נוכחי:**
```
יש לך כבר עוסק פטור פעיל?
```
| כפתור | service_type_refined |
|--------|---------------------|
| ✅ כן | `existing_osek_patur` |
| ❌ עדיין לא | `needs_opening` |
| 🔄 בתהליך פתיחה | `in_process` |

→ שמור: `second_answer`

**הודעת הצעת ערך:**
```
השירות כולל ליווי מול מס הכנסה, מע״מ וביטוח לאומי, דוח שנתי, מענה שוטף ואפליקציה להוצאת קבלות.
```

**CTA:**
| כפתור | outcome |
|--------|---------|
| 💰 לקבל הצעת מחיר | `requested_quote` |
| 📞 לדבר עם רואה חשבון | `booked_call` |
| 🚀 להצטרף עכשיו | `started_checkout` |
| ❓ לשאול שאלה | `asked_question` |

**אם בחר "מחיר" בשלב 1:**
→ דלג ישר להודעת מחיר (כמו pricing_flow) + CTA

---

### FLOW F: generic_flow — דפים ללא intent ברור

**דפים שמפעילים:**
- `/` (portal home)
- `/Features`
- `/FAQ`
- כל דף שלא תואם לאף intent ספציפי

**מטרה:** לזהות מה המשתמש צריך ולנתב ל-flow מתאים.

**טון:** ידידותי, פתוח.

**מספר שלבים:** 1 + ניתוב

**הודעת פתיחה:**
```
שלום {{lead_name}} 👋
תודה שהשארת פרטים.
אני כאן כדי לעזור — במה אוכל לסייע?
```

**שלב 1 — ניתוב:**
| כפתור | routes_to |
|--------|-----------|
| 🏢 פתיחת עסק | → service_flow |
| 🤔 לא יודע מה מתאים לי | → comparison_flow |
| 📞 לדבר עם מומחה | → `booked_call` |
| 💰 לשמוע מחיר | → pricing_flow |
| ❓ לשאול שאלה | → `asked_question` |

---

## 7. Dynamic Opening Message Engine

### 7.1 Template System

כל הודעת פתיחה מורכבת מ-3 חלקים:

```
[1. ברכה] שלום {{lead_name}} 👋
[2. הקשר] ראיתי ש{{context_phrase}}
[3. הצעת ערך] {{value_phrase}}
```

### 7.2 Context Phrases לפי Intent

| page_intent | context_phrase |
|-------------|---------------|
| `service` | `השארת פרטים לגבי {{page_title}}` |
| `comparison` | `התעניינת בנושא {{page_title}}` |
| `guide` | `השארת פרטים לגבי {{page_title}}` |
| `pricing` | `התעניינת ב-{{page_title}}` |
| `accounting_service` | `התעניינת בשירות {{page_title}}` |

### 7.3 Value Phrases לפי Intent

| page_intent | value_phrase |
|-------------|-------------|
| `service` | `אני כאן כדי לעזור לך להתחיל בצורה מסודרת. נשאל 2 שאלות קצרות ונתקדם.` |
| `comparison` | `אני יכול לעזור לך להבין מה כנראה יותר מתאים לך בכמה שאלות קצרות.` |
| `guide` | `אם תרצה, אני יכול לעשות לך סדר קצר בנושא ולעזור לך להתקדם בלי טעויות.` |
| `pricing` | `אני יכול לתת לך כיוון למחיר ולעזור לך להבין מה בדיוק כלול.` |
| `accounting_service` | `אני יכול להסביר לך בקצרה מה השירות כולל ולעזור לך להבין איך הכי נכון להתקדם.` |

---

## 8. CRM Schema — שדות בוט

### 8.1 שדות חדשים לטבלת `leads`

| שדה | סוג | תיאור | מי כותב |
|-----|------|--------|---------|
| `page_intent` | VARCHAR(30) | intent שזוהה | Bot Engine |
| `flow_type` | VARCHAR(30) | flow שהופעל | Bot Engine |
| `bot_first_answer` | TEXT | תשובה לשאלה 1 | Bot |
| `bot_second_answer` | TEXT | תשובה לשאלה 2 | Bot |
| `bot_third_answer` | TEXT | תשובה לשאלה 3 (אם יש) | Bot |
| `bot_current_step` | VARCHAR(30) | שלב נוכחי ב-flow | Bot |
| `bot_desired_action` | VARCHAR(30) | פעולה רצויה | Bot |
| `bot_outcome_state` | VARCHAR(30) | מצב סיום | Bot |
| `bot_handoff_reason` | TEXT | סיבת העברה לנציג | Bot |
| `bot_last_message_at` | TIMESTAMPTZ | זמן הודעה אחרונה | Bot |
| `bot_messages_count` | INTEGER | מספר הודעות | Bot |
| `bot_started_at` | TIMESTAMPTZ | מתי התחיל ה-flow | Bot |
| `bot_completed_at` | TIMESTAMPTZ | מתי הסתיים | Bot |

### 8.2 עדכון שדות קיימים

| שדה קיים | מקור נתון חדש |
|-----------|---------------|
| `temperature` | Bot מעדכן לפי תשובות (hot/warm/cold) |
| `service_type` | Bot מעדכן/מעדן לפי תשובות |
| `source_page` | כבר קיים — page_slug |
| `profession` | Bot מעדכן מתשובת "תחום פעילות" |
| `estimated_value` | Bot מעדכן מתשובת "כמה מעריך שתכניס" |
| `interaction_type` | ערך חדש: `bot` (בנוסף ל-form/manual/whatsapp) |

### 8.3 Lead Temperature Logic

| temperature | תנאים |
|-------------|--------|
| **hot** | בחר "רוצה להתחיל עכשיו" / ביקש מחיר / ביקש לשלוח ת"ז / ביקש שיחה מיידית |
| **warm** | בחר "מתחיל בקרוב" / מתעניין בשירות / רוצה להבין תהליך |
| **cold** | בחר "רק בודק" / "רק מחפש מידע" / שואל מידע כללי בלבד |

### 8.4 Outcome States

| outcome_state | תיאור | פעולה הבאה |
|---------------|--------|------------|
| `booked_call` | הליד קבע שיחה | נציג מתקשר |
| `requested_quote` | הליד ביקש הצעת מחיר | שליחת הצעה |
| `sent_documents` | הליד שלח ת"ז/מסמכים | פתיחת תיק |
| `started_checkout` | הליד התחיל תשלום | מעקב השלמה |
| `asked_question` | הליד שאל שאלה | נציג עונה |
| `handoff_to_agent` | הועבר לנציג | נציג ממשיך |
| `no_response` | הליד לא ענה | follow-up אוטומטי |
| `warm_followup_needed` | ליד חם שצריך מעקב | נציג יוזם קשר |

---

## 9. Automation Rules

### 9.1 Follow-up אם אין תשובה

**Rule 1 — 5 דקות ללא תשובה:**
```
רק בודק אם תרצה שאעזור לך להתקדם 🙂
אפשר להתחיל כאן, לקבוע שיחה קצרה או פשוט לשאול שאלה.
```
→ CRM: `bot_outcome_state = no_response`, `contact_attempts += 1`

**Rule 2 — 60 דקות ללא תשובה:**
```
אני כאן אם תרצה עזרה לגבי {{page_title}}.
אפשר גם לשלוח ת"ז ולהתחיל, או לקבוע שיחה קצרה.
```
→ CRM: `contact_attempts += 1`

**Rule 3 — 24 שעות ללא תשובה:**
→ אין הודעה נוספת מהבוט
→ CRM: `bot_outcome_state = no_response`, `pipeline_stage = no_answer`
→ Trigger: התראה לנציג לחזור ידנית

### 9.2 כללי ניתוב

| תנאי | פעולה |
|-------|-------|
| לחץ "לשאול שאלה" | מעבר למסלול פתוח → אם אין תשובה אוטומטית → `handoff_to_agent` |
| לחץ "לדבר עם נציג" | `handoff_to_agent` מיידי |
| `page_intent = service` + `temperature = hot` | push ישיר לפעולה, בלי שאלות מיותרות |
| `page_intent = comparison` | לא לבקש ת"ז, לא לדחוף לתשלום |
| `page_intent = pricing` | לתת מחיר מיד, אחר כך CTA |
| `page_intent = guide` + `temperature = cold` | להציע מידע + שיחה, לא לדחוף |
| משתמש כותב "רוצה להתחיל" / "תן מחיר" / "איפה שולחים ת"ז" | `temperature = hot` → מעבר ישיר ל-CTA |

### 9.3 כללי SLA לבוט

| אירוע | SLA |
|--------|-----|
| ליד חדש → הודעת פתיחה | < 30 שניות |
| תשובת משתמש → הודעה הבאה | < 5 שניות |
| `handoff_to_agent` → נציג מקבל התראה | < 2 דקות |
| `booked_call` → אישור SMS | < 1 דקה |

---

## 10. KPI & Analytics

### 10.1 Events לניטור

| Event | תיאור | מדד |
|-------|--------|------|
| `bot_flow_started` | בוט שלח הודעת פתיחה | `bot_start_rate` |
| `bot_first_response` | ליד ענה להודעה ראשונה | `first_response_rate` |
| `bot_step_completed` | ליד השלים שלב | `step_completion_rate` |
| `bot_cta_clicked` | ליד לחץ CTA | `CTA_click_rate` |
| `bot_call_booked` | ליד קבע שיחה | `call_booking_rate` |
| `bot_documents_sent` | ליד שלח מסמכים | `document_send_rate` |
| `bot_checkout_started` | ליד התחיל תשלום | `payment_start_rate` |
| `bot_handoff` | הועבר לנציג | `handoff_rate` |
| `bot_no_response` | ליד לא ענה | `no_response_rate` |
| `bot_completed` | flow הסתיים בהצלחה | `completion_rate` |

### 10.2 מדדים עיקריים

| KPI | נוסחה | יעד |
|-----|--------|-----|
| **bot_start_rate** | flows started / leads created | > 95% |
| **first_response_rate** | first responses / flows started | > 60% |
| **step_completion_rate** | completed steps / total steps | > 70% |
| **CTA_click_rate** | CTA clicks / flows with response | > 40% |
| **call_booking_rate** | calls booked / CTA clicks | > 25% |
| **document_send_rate** | docs sent / CTA clicks | > 15% |
| **lead_to_action_rate** | (call + docs + checkout) / all leads | > 30% |
| **handoff_rate** | handoffs / flows with response | < 20% |

### 10.3 Breakdown לפי Intent

כל KPI צריך להיות ניתן לחיתוך לפי:
- `page_intent`
- `flow_type`
- `page_slug`
- `utm_source`
- `utm_campaign`
- `temperature`

---

## 11. UX Guidelines

### 11.1 כללי כתיבה

| כלל | דוגמה |
|------|--------|
| **קצר** | מקסימום 3 שורות בהודעה רגילה |
| **נעים** | "אני כאן כדי לעזור" ולא "אנא מלא את הפרטים" |
| **כפתורים** | 3-4 כפתורים מקסימום בכל שלב |
| **לא חוקר** | 2-3 שאלות מקסימום, לא יותר |
| **מובייל** | כפתורים רחבים, טקסט קצר |
| **אנושי** | שימוש ב-👋 🙂 👍 (אבל לא יותר מדי) |
| **RTL** | כל ההודעות בעברית, ימין לשמאל |

### 11.2 אין מה לעשות

| ❌ לא | ✅ כן |
|--------|-------|
| לשאול 5+ שאלות | 2-3 שאלות מקסימום |
| לבקש אימייל | רק שם + טלפון |
| טקסט ארוך | הודעות קצרות + כפתורים |
| לדחוף בדף השוואה | לייעץ ולהציע שיחה |
| שאלות פתוחות | כפתורי בחירה |
| "מה תעסוק שלך?" | "מה תחום הפעילות שלך?" |

### 11.3 עיצוב כפתורים

```
┌─────────────────────────────────┐
│  🚀  להתחיל עכשיו              │  ← primary (hot)
├─────────────────────────────────┤
│  📞  לקבוע שיחה קצרה           │  ← secondary
├─────────────────────────────────┤
│  💰  כמה זה עולה               │  ← secondary
├─────────────────────────────────┤
│  ❓  לשאול שאלה                │  ← tertiary
└─────────────────────────────────┘
```

- כפתור ראשי: צבע מודגש
- כפתורים משניים: צבע רגיל
- כפתור שלישוני: outline / link style

---

## 12. MVP Implementation Plan

### Phase 1 — Foundation (שבוע 1-2)

**מטרה:** בוט עובד על WhatsApp עבור 5 דפים מרכזיים

| משימה | פירוט |
|--------|--------|
| 1. Schema update | הוספת שדות בוט לטבלת `leads` (migration) |
| 2. Intent classifier | פונקציה שמקבלת `page_slug` ומחזירה `intent` + `flow_type` |
| 3. Flow engine | מנוע שמריץ flow לפי `flow_type` — כולל steps, buttons, transitions |
| 4. Message templates | 5 flows מלאים (A1, B1, C1, D1, E1) |
| 5. WhatsApp integration | חיבור ל-GreenAPI — שליחת הודעות + קבלת תשובות |
| 6. CRM write-back | כתיבה של שדות בוט ל-leads בכל שלב |

**דפים ב-MVP:**
1. `/open-osek-patur` — service_flow
2. `/patur-vs-murshe` — comparison_flow
3. `/osek-patur/how-to-open` — guide_flow
4. `/accountant-osek-patur` — accounting_svc_flow
5. `/osek-patur/cost` — pricing_flow

### Phase 2 — Scale (שבוע 3-4)

| משימה | פירוט |
|--------|--------|
| 7. Follow-up automation | הודעות 5 דקות + 60 דקות |
| 8. Temperature scoring | חישוב אוטומטי לפי תשובות |
| 9. All landing pages | flows לכל 6 דפי נחיתה |
| 10. Handoff flow | העברה חלקה לנציג עם context מלא |
| 11. Analytics events | tracking לכל event ב-KPI |

### Phase 3 — Intelligence (שבוע 5-6)

| משימה | פירוט |
|--------|--------|
| 12. All article pages | flows גנריים לכל 40+ מאמרים |
| 13. Free text handling | זיהוי כוונת קנייה מטקסט חופשי |
| 14. A/B testing | בדיקת הודעות פתיחה שונות |
| 15. Dashboard | לוח בקרה ל-KPIs |
| 16. Optimization | שיפור flows לפי נתונים |

### Tech Stack מומלץ

| רכיב | טכנולוגיה |
|-------|-----------|
| Bot Engine | N8N workflow / Supabase Edge Function |
| State Management | טבלת `bot_sessions` ב-Supabase |
| WhatsApp | GreenAPI (כבר מחובר) |
| Intent Classifier | JSON config map (פשוט) → ML (בהמשך) |
| Templates | JSON files / DB table |
| Analytics | Supabase + custom dashboard |
| CRM | טבלת `leads` קיימת + שדות חדשים |

### מבנה DB מוצע — `bot_sessions`

```sql
CREATE TABLE bot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  phone VARCHAR(20) NOT NULL,
  flow_type VARCHAR(30) NOT NULL,
  page_intent VARCHAR(30) NOT NULL,
  page_slug VARCHAR(100),
  current_step VARCHAR(30) DEFAULT 'opening',
  answers JSONB DEFAULT '{}',
  temperature VARCHAR(10),
  outcome_state VARCHAR(30),
  messages_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 13. Page Intent Config Map (JSON)

מבנה ה-config שכל דף ממפה ל-flow:

```json
{
  "open-osek-patur": {
    "page_intent": "service",
    "service_type": "open_osek_patur",
    "flow_type": "service_flow",
    "flow_variant": "open_osek_patur",
    "pricing": {
      "setup": "250 ₪ + מע״מ",
      "monthly": "200 ₪ + מע״מ",
      "includes": ["דוח שנתי", "ליווי שוטף", "אפליקציה להוצאת קבלות", "מנהלת תיק"]
    }
  },
  "patur-vs-murshe": {
    "page_intent": "comparison",
    "service_type": "patur_vs_murshe",
    "flow_type": "comparison_flow",
    "flow_variant": "patur_vs_murshe"
  },
  "osek-patur/how-to-open": {
    "page_intent": "guide",
    "service_type": "open_osek_patur",
    "flow_type": "guide_flow",
    "flow_variant": "how_to_open_patur"
  },
  "accountant-osek-patur": {
    "page_intent": "accounting_service",
    "service_type": "accountant_osek_patur",
    "flow_type": "accounting_svc_flow",
    "flow_variant": "accountant_patur",
    "pricing": {
      "setup": "250 ₪ + מע״מ",
      "monthly": "200 ₪ + מע״מ",
      "includes": ["דוח שנתי", "ליווי וייעוץ", "התנהלות מול הרשויות", "אפליקציה להוצאת קבלות", "מנהלת תיק זמינה"]
    }
  },
  "osek-patur/cost": {
    "page_intent": "pricing",
    "service_type": "cost_osek_patur",
    "flow_type": "pricing_flow",
    "flow_variant": "cost_patur",
    "pricing": {
      "setup": "250 ₪ + מע״מ",
      "monthly": "200 ₪ + מע״מ",
      "includes": ["דוח שנתי", "ליווי וייעוץ", "התנהלות מול הרשויות", "אפליקציה להוצאת קבלות", "מנהלת תיק זמינה"]
    }
  }
}
```

---

## סיכום

מערכת Bot Flow Engine מאפשרת:
- **בוט אחד** שמתנהג כמו 6 בוטים שונים
- **התאמה אוטומטית** לפי דף מקור, intent, וטמפרטורת ליד
- **2-4 שלבים בלבד** — קצר, נעים, לא שאלון
- **כפתורים** — רוב האינטראקציה בכפתורים, לא טקסט חופשי
- **CRM enrichment** — כל תשובה נשמרת ומעשירה את כרטיס הליד
- **מדידה** — KPIs ברורים לכל flow, intent, ודף

**MVP בשבועיים:** 5 flows מרכזיים, WhatsApp, CRM integration.
