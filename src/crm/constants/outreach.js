// Outreach System Constants

export const WEBSITE_STATUSES = [
  { slug: 'new', label: 'חדש', color: '#6B7280' },
  { slug: 'reviewed', label: 'נבדק', color: '#3B82F6' },
  { slug: 'approved', label: 'מאושר', color: '#8B5CF6' },
  { slug: 'rejected', label: 'נדחה', color: '#EF4444' },
  { slug: 'contacted', label: 'נוצר קשר', color: '#F59E0B' },
  { slug: 'replied', label: 'ענה', color: '#06B6D4' },
  { slug: 'negotiation', label: 'משא ומתן', color: '#F97316' },
  { slug: 'won', label: 'הושלם', color: '#22C55E' },
  { slug: 'lost', label: 'אבד', color: '#DC2626' },
  { slug: 'do_not_contact', label: 'אל תפנה', color: '#374151' },
];

export const WEBSITE_STATUS_MAP = Object.fromEntries(WEBSITE_STATUSES.map(s => [s.slug, s]));

export const CAMPAIGN_TYPES = [
  { value: 'link_exchange', label: 'החלפת קישורים', color: '#3B82F6' },
  { value: 'paid_link', label: 'קישור בתשלום', color: '#F59E0B' },
  { value: 'barter', label: 'ברטר', color: '#8B5CF6' },
  { value: 'collaboration', label: 'שיתוף פעולה', color: '#06B6D4' },
];

export const CAMPAIGN_TYPE_MAP = Object.fromEntries(CAMPAIGN_TYPES.map(t => [t.value, t]));

export const CAMPAIGN_STATUSES = [
  { slug: 'draft', label: 'טיוטה', color: '#6B7280' },
  { slug: 'active', label: 'פעיל', color: '#22C55E' },
  { slug: 'paused', label: 'מושהה', color: '#F59E0B' },
  { slug: 'completed', label: 'הושלם', color: '#3B82F6' },
];

export const CAMPAIGN_STATUS_MAP = Object.fromEntries(CAMPAIGN_STATUSES.map(s => [s.slug, s]));

export const MESSAGE_STATUSES = [
  { slug: 'queued', label: 'בתור', color: '#6B7280' },
  { slug: 'approved', label: 'מאושר', color: '#3B82F6' },
  { slug: 'sent', label: 'נשלח', color: '#8B5CF6' },
  { slug: 'delivered', label: 'נמסר', color: '#06B6D4' },
  { slug: 'opened', label: 'נפתח', color: '#F59E0B' },
  { slug: 'replied', label: 'ענה', color: '#22C55E' },
  { slug: 'bounced', label: 'חזר', color: '#EF4444' },
  { slug: 'failed', label: 'נכשל', color: '#DC2626' },
];

export const MESSAGE_STATUS_MAP = Object.fromEntries(MESSAGE_STATUSES.map(s => [s.slug, s]));

export const SEQUENCE_STEPS = [
  { value: 'initial', label: 'ראשוני' },
  { value: 'followup_1', label: 'מעקב 1' },
  { value: 'followup_2', label: 'מעקב 2' },
];

export const REPLY_SENTIMENTS = [
  { value: 'positive', label: 'חיובי', color: '#22C55E' },
  { value: 'neutral', label: 'ניטרלי', color: '#6B7280' },
  { value: 'negative', label: 'שלילי', color: '#EF4444' },
  { value: 'needs_review', label: 'דורש בדיקה', color: '#F59E0B' },
];

export const SENTIMENT_MAP = Object.fromEntries(REPLY_SENTIMENTS.map(s => [s.value, s]));

export const REPLY_INTENTS = [
  { value: 'interested', label: 'מעוניין', color: '#22C55E' },
  { value: 'not_interested', label: 'לא מעוניין', color: '#EF4444' },
  { value: 'ask_price', label: 'שואל מחיר', color: '#F59E0B' },
  { value: 'ask_details', label: 'שואל פרטים', color: '#3B82F6' },
  { value: 'partnership', label: 'שותפות', color: '#8B5CF6' },
  { value: 'unknown', label: 'לא ידוע', color: '#6B7280' },
];

export const INTENT_MAP = Object.fromEntries(REPLY_INTENTS.map(i => [i.value, i]));

export const CONTACT_SOURCES = [
  { value: 'manual', label: 'ידני' },
  { value: 'public_contact_page', label: 'עמוד צור קשר' },
  { value: 'imported_csv', label: 'ייבוא CSV' },
];

export const EMAIL_STATUSES = [
  { value: 'unknown', label: 'לא ידוע', color: '#6B7280' },
  { value: 'likely_valid', label: 'תקין כנראה', color: '#22C55E' },
  { value: 'bounced', label: 'חזר', color: '#EF4444' },
];

export const OUTREACH_TASK_TYPES = [
  { value: 'review_reply', label: 'בדוק תשובה' },
  { value: 'send_followup', label: 'שלח מעקב' },
  { value: 'negotiate', label: 'משא ומתן' },
  { value: 'publish_link', label: 'פרסם קישור' },
  { value: 'check_live_link', label: 'בדוק קישור חי' },
];

export const OUTREACH_TASK_STATUSES = [
  { value: 'open', label: 'פתוח', color: '#3B82F6' },
  { value: 'in_progress', label: 'בטיפול', color: '#F59E0B' },
  { value: 'done', label: 'הושלם', color: '#22C55E' },
];

export const TEMPLATE_TYPES = [
  { value: 'initial', label: 'פנייה ראשונית' },
  { value: 'followup', label: 'מעקב' },
  { value: 'barter', label: 'ברטר' },
  { value: 'paid_link', label: 'קישור בתשלום' },
  { value: 'link_exchange', label: 'החלפת קישורים' },
];

export const SPAM_WARNING_LEVELS = [
  { value: 'low', label: 'תקין', color: '#22C55E' },
  { value: 'medium', label: 'אזהרה', color: '#F59E0B' },
  { value: 'high', label: 'סכנה', color: '#EF4444' },
];
