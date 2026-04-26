---
name: workflow-status
description: "סטטוס n8n workflows — executions, שגיאות, active/inactive. שימוש: /workflow-status. מופעל כש: בדיקת workflows, n8n שגיאות, בוט לא עובד, אוטומציה תקועה. קשור ל: health, bot-agent."
user_invocable: true
---

# Skill: Workflow Status

בדיקת סטטוס כל ה-n8n workflows.

## תהליך

1. **`n8n_list_workflows`** — קבל רשימה מלאה
2. **לכל workflow** — `n8n_executions` (5 אחרונות)
3. **דווח:**

```
📊 n8n Workflows — {תאריך}
━━━━━━━━━━━━━━━━━━━━━━━━━━

| Workflow | סטטוס | הרצה אחרונה | ✅ | ❌ |
|----------|--------|-------------|-----|-----|
| Sales Bot V5 | 🟢 active | 10 min ago | 45 | 2 |
| FollowUp Bot | 🟢 active | 5 min ago | 120 | 0 |
| Post Purchase | 🔴 inactive | 3 days ago | 12 | 1 |

❌ שגיאות אחרונות:
- Sales Bot V5 (לפני 2h): "TypeError: Cannot read property 'phone'"
```

4. **אם יש workflow inactive שצריך להיות active** — התרע
5. **אם יש שגיאות חוזרות** — הצע לבדוק עם `bot-agent`
