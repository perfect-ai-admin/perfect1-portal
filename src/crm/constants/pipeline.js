// CRM Pipeline Configuration

export const PIPELINE_STAGES = [
  { slug: 'new_lead', label: 'ליד חדש', color: '#3B82F6', slaHours: 1, type: 'open' },
  { slug: 'contacted', label: 'נוצר קשר', color: '#F59E0B', slaHours: 24, type: 'open' },
  { slug: 'no_answer', label: 'אין מענה', color: '#F97316', slaHours: 4, type: 'open' },
  { slug: 'qualifying', label: 'בסינון', color: '#06B6D4', slaHours: 48, type: 'open' },
  { slug: 'qualified', label: 'מתאים', color: '#8B5CF6', slaHours: 24, type: 'open' },
  { slug: 'proposal_sent', label: 'נשלחה הצעה', color: '#4F46E5', slaHours: 72, type: 'open' },
  { slug: 'payment_pending', label: 'ממתין לתשלום', color: '#8B5CF6', slaHours: 24, type: 'open' },
  { slug: 'follow_up', label: 'במעקב', color: '#14B8A6', slaHours: 48, type: 'open' },
  { slug: 'awaiting_docs', label: 'ממתין למסמכים', color: '#0EA5E9', slaHours: 120, type: 'open' },
  { slug: 'paid_opening_file', label: 'שילם – פתיחת תיק', color: '#10B981', type: 'open' },
  { slug: 'converted', label: 'נסגר', color: '#22C55E', type: 'closed_won' },
  { slug: 'not_interested', label: 'לא מעוניין', color: '#EF4444', type: 'closed_lost' },
  { slug: 'disqualified', label: 'פסול', color: '#6B7280', type: 'closed_lost' },
  { slug: 'duplicate', label: 'כפול', color: '#9CA3AF', type: 'closed' },
  { slug: 'spam', label: 'ספאם', color: '#374151', type: 'closed' },
];

export const OPEN_STAGES = PIPELINE_STAGES.filter(s => s.type === 'open');
export const CLOSED_STAGES = PIPELINE_STAGES.filter(s => s.type !== 'open');

export const STAGE_MAP = Object.fromEntries(PIPELINE_STAGES.map(s => [s.slug, s]));

export const TEMPERATURE_OPTIONS = [
  { value: 'hot', label: 'חם', color: '#EF4444', emoji: '🔥' },
  { value: 'warm', label: 'חמים', color: '#F59E0B', emoji: '☀️' },
  { value: 'cold', label: 'קר', color: '#3B82F6', emoji: '❄️' },
];

export const TEMPERATURE_MAP = Object.fromEntries(TEMPERATURE_OPTIONS.map(t => [t.value, t]));

export const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'דחוף', color: '#EF4444' },
  { value: 'high', label: 'גבוה', color: '#F97316' },
  { value: 'medium', label: 'בינוני', color: '#F59E0B' },
  { value: 'low', label: 'נמוך', color: '#6B7280' },
];

export const PRIORITY_MAP = Object.fromEntries(PRIORITY_OPTIONS.map(p => [p.value, p]));

export const CHANNEL_OPTIONS = [
  { value: 'phone', label: 'טלפון', icon: 'Phone' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
  { value: 'email', label: 'אימייל', icon: 'Mail' },
  { value: 'sms', label: 'SMS', icon: 'MessageSquare' },
  { value: 'meeting', label: 'פגישה', icon: 'Users' },
  { value: 'note', label: 'הערה', icon: 'FileText' },
];

export const OUTCOME_OPTIONS = [
  { value: 'answered', label: 'ענה' },
  { value: 'no_answer', label: 'לא ענה' },
  { value: 'voicemail', label: 'הודעה קולית' },
  { value: 'callback_requested', label: 'ביקש שנחזור' },
  { value: 'left_message', label: 'הושארה הודעה' },
];

export const TASK_TYPE_OPTIONS = [
  { value: 'call', label: 'שיחה' },
  { value: 'follow_up', label: 'מעקב' },
  { value: 'document_collect', label: 'איסוף מסמכים' },
  { value: 'review', label: 'בדיקה' },
  { value: 'meeting', label: 'פגישה' },
  { value: 'onboarding_step', label: 'שלב קליטה' },
  { value: 'general', label: 'כללי' },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'none', label: 'אין', color: '#9CA3AF' },
  { value: 'link_sent', label: 'קישור נשלח', color: '#3B82F6' },
  { value: 'pending', label: 'ממתין', color: '#F59E0B' },
  { value: 'paid', label: 'שולם', color: '#22C55E' },
  { value: 'failed', label: 'נכשל', color: '#EF4444' },
];

export const ONBOARDING_STATUS_OPTIONS = [
  { value: 'not_started', label: 'לא התחיל', color: '#9CA3AF' },
  { value: 'in_progress', label: 'בתהליך', color: '#3B82F6' },
  { value: 'docs_pending', label: 'ממתין למסמכים', color: '#F59E0B' },
  { value: 'docs_received', label: 'מסמכים התקבלו', color: '#8B5CF6' },
  { value: 'completed', label: 'הסתיים', color: '#22C55E' },
];

export const LOST_REASON_CATEGORIES = [
  { value: 'already_has_accountant', label: 'כבר יש רואה חשבון' },
  { value: 'price', label: 'יקר / לא שווה' },
  { value: 'not_opening_business', label: 'לא פותח עסק כרגע' },
  { value: 'timing', label: 'לא מתאים עכשיו — אולי בהמשך' },
  { value: 'went_to_competitor', label: 'סגר עם מישהו אחר' },
  { value: 'no_answer', label: 'לא עונה / לא חוזר' },
  { value: 'wrong_number', label: 'מספר שגוי / לא רלוונטי' },
  { value: 'just_info', label: 'רק רצה מידע — לא צריך שירות' },
  { value: 'other', label: 'אחר' },
];
