import React from 'react';
import { HelpTooltip, FeatureHint } from './HelpSystem';

// Contextual Help Components for different features (section 9.3)

export function ProgressTabHelp() {
  return (
    <>
      <FeatureHint
        id="progress-first-visit"
        title="ברוכים הבאים למעקב התקדמות!"
        message="כאן תוכל לעקוב אחרי המסע העסקי שלך, להגדיר מטרות ולצפות בהישגים. המערכת תלווה אותך בכל שלב."
        action={{
          label: 'הצג את המטרות שלי',
          onClick: () => {}
        }}
      />
    </>
  );
}

export function FinancialTabHelp() {
  return (
    <FeatureHint
      id="financial-first-visit"
      title="הכלים הפיננסיים שלך"
      message="צור חשבוניות, סרוק קבלות, סנכרן עם הבנק, וקבל דוחות מס - הכל במקום אחד."
      action={{
        label: 'צור חשבונית ראשונה',
        onClick: () => {}
      }}
    />
  );
}

export function MentorTabHelp() {
  return (
    <FeatureHint
      id="mentor-first-visit"
      title="המנטור החכם שלך"
      message="שאל כל שאלה עסקית - מניתוח מכירות ועד עצות שיווקיות. המנטור לומד את העסק שלך ונותן המלצות מותאמות."
      action={{
        label: 'התחל שיחה',
        onClick: () => {}
      }}
    />
  );
}

export function GoalsTabHelp() {
  return (
    <FeatureHint
      id="goals-first-visit"
      title="הגדר מטרות ועקוב אחריהן"
      message="מטרות ברורות הן המפתח להצלחה. הגדר יעדים והמערכת תעזור לך להשיג אותם."
      action={{
        label: 'הוסף מטרה ראשונה',
        onClick: () => {}
      }}
    />
  );
}

export function MarketingTabHelp() {
  return (
    <FeatureHint
      id="marketing-first-visit"
      title="כלי שיווק לעסק קטן"
      message="צור לוגו, בנה קמפיינים, ונהל את הנוכחות שלך ב-Google - גם בלי ניסיון בשיווק."
      action={{
        label: 'צור לוגו',
        onClick: () => {}
      }}
    />
  );
}

// Tooltips for specific features
export function InvoiceTooltip() {
  return (
    <HelpTooltip
      id="invoice-help"
      content="חשבונית מס היא מסמך רשמי שמאפשר לך לגבות תשלום ולדווח למס הכנסה"
      position="top"
    >
      <span className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-help">
        מהי חשבונית?
      </span>
    </HelpTooltip>
  );
}

export function VATTooltip() {
  return (
    <HelpTooltip
      id="vat-help"
      content="מע״מ (מס ערך מוסף) הוא מס עקיף שמוטל על מוצרים ושירותים. עוסק פטור לא גובה מע״מ עד תקרת הכנסה של ~100,000 ₪"
      position="top"
    >
      <span className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-help">
        מהו מע״מ?
      </span>
    </HelpTooltip>
  );
}

export function GoalTooltip() {
  return (
    <HelpTooltip
      id="goal-help"
      content="מטרה עסקית היא יעד מדיד שאתה רוצה להשיג. למשל: הכנסה חודשית של 15,000 ₪ או 10 לקוחות חדשים"
      position="top"
    >
      <span className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-help">
        איך להגדיר מטרה?
      </span>
    </HelpTooltip>
  );
}