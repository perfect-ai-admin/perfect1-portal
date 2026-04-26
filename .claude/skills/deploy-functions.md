---
name: deploy-functions
description: "Deploy Edge Functions לסופאבייס. שימוש: /deploy-functions {name | all}. מופעל כש: deploy, העלאה לproduction, עדכון פונקציה. קשור ל: edge-function, backend-agent."
user_invocable: true
---

# Skill: Deploy Edge Functions

**קלט:** `$ARGUMENTS` — שם פונקציה או `all`

## תהליך

1. **אם ריק** — שאל מה ל-deploy
2. **בדוק שגיאות TypeScript** לפני deploy:
   ```bash
   deno check supabase/functions/{name}/index.ts
   ```
3. **הראה diff** — מה השתנה מאז ה-deploy האחרון
4. **אשר עם המשתמש** — "ל-deploy את `{name}` ל-production?"
5. **Deploy:**
   ```bash
   npx supabase functions deploy {name} --no-verify-jwt
   ```
6. **אמת** — exit code 0 = הצלחה
7. **דווח:**
   ```
   ✅ Deployed: {name}
   ⏱️ זמן: {X}s
   ```

## אם `all`

קרא `scripts/deploy-crm-functions.sh` לרשימת פונקציות, deploy כל אחת בנפרד.

## כללים

- **אל ת-deploy בלי אישור**
- TypeScript errors = תקן לפני deploy
- אם deploy נכשל — הראה error מלא
