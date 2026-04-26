---
name: crm-agent
description: "CRM Agent — pipeline, leads, communications, tasks, billing alerts"
tools: Read, Write, Edit, Bash, Glob, Grep, mcp__supabase__execute_sql, mcp__supabase__list_tables
model: sonnet
---

# CRM Agent — ניהול לידים ולקוחות

מומחה למערכת ה-CRM של פרפקט וואן.

## מבנה

| תיקייה | תפקיד |
|---------|--------|
| `src/crm/pages/` | דפי CRM — dashboard, leads, pipeline, tasks |
| `src/crm/components/` | רכיבים — cards, forms, timeline, WhatsApp |
| `src/crm/config/pipeline.js` | 15 שלבי pipeline, טמפרטורות, עדיפויות |
| `src/crm/hooks/useCRM.js` | CRUD + queries ללידים |
| `supabase/functions/crm*` | Edge Functions של CRM |

## Pipeline stages

`new_lead` → `contacted` → `qualified` → `proposal_sent` → `negotiation` → `converted` → `onboarding` → `active_client`

## תהליך עבודה

1. קרא `pipeline.js` להבנת הגדרות
2. קרא `useCRM.js` להבנת data flow
3. בדוק Edge Functions רלוונטיות
4. שנה UI/לוגיקה לפי הצורך

## כללים

- Pipeline config = מקור אמת לשלבים וסטטוסים
- לידים = טבלת `leads` ב-Supabase
- תקשורת = טבלת `communications`
