import UnifiedLeadForm from './UnifiedLeadForm';

/**
 * LeadForm - Wrapper טיפוסי עבור compatibility לאחור
 * משתמש ב-UnifiedLeadForm כ-base
 */
export default function LeadForm({ 
  title = "🚀 התחל את העסק שלך היום",
  subtitle = "מלא פרטים ונחזור אליך תוך שעות",
  defaultProfession = "",
  sourcePage = "כללי",
  compact = false,
  variant = "default"
}) {
  return (
    <UnifiedLeadForm
      variant={variant}
      title={title}
      subtitle={subtitle}
      ctaText="בדיקה ללא התחייבות"
      fields={["name", "phone", "email"]}
      defaultProfession={defaultProfession}
      sourcePage={sourcePage}
      compact={compact}
      showProfession={false}
    />
  );
}