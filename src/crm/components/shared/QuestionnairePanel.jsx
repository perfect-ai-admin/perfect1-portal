import React from 'react';
import { ClipboardList, User, Briefcase, Building2, TrendingUp, DollarSign, Phone, Target, Rocket, Route, MessageSquare } from 'lucide-react';

const FIELD_CONFIG = [
  { key: 'id_number', label: 'ת.ז.', icon: User, sensitive: true },
  { key: 'is_employee', label: 'שכיר', icon: User, format: v => v === 'yes' ? 'כן' : v === 'no' ? 'לא' : v },
  { key: 'salary', label: 'שכר חודשי', icon: DollarSign, format: formatRange },
  { key: 'business_name', label: 'שם עסק', icon: Building2 },
  { key: 'business_type', label: 'סוג עסק', icon: Briefcase },
  { key: 'income', label: 'צפי הכנסה', icon: TrendingUp, format: formatRange },
];

function formatRange(v) {
  const map = {
    'up-to-5000': 'עד 5,000 ₪',
    '5000-10000': '5,000–10,000 ₪',
    '10000-15000': '10,000–15,000 ₪',
    '10000-20000': '10,000–20,000 ₪',
    '15000-25000': '15,000–25,000 ₪',
    'above-20000': 'מעל 20,000 ₪',
    'above-25000': 'מעל 25,000 ₪',
  };
  return map[v] || v;
}

const ACCOUNTANT_FIELDS = [
  { key: 'business_field', label: 'תחום העסק', icon: Briefcase },
  { key: 'lead_gen_plan', label: 'איך מביא לקוחות', icon: Rocket },
  { key: 'yearly_goal', label: 'מטרה שנתית', icon: Target },
  { key: 'goal_plan', label: 'איך יגיע למטרה', icon: Route },
];

const PRE_PAYMENT_FIELDS = [
  { key: 'business_field', label: 'תחום העסק', icon: Briefcase },
  { key: 'offer_type', label: 'מוצר/שירות', icon: Building2 },
  { key: 'lead_gen_plan', label: 'איך מביא לקוחות', icon: Rocket },
  { key: 'near_term_goal', label: 'מטרה קרובה', icon: Target },
  { key: 'important_notes', label: 'הערות חשובות', icon: MessageSquare },
];

const POST_PAYMENT_FIELDS = [
  { key: 'business_field', label: 'תחום הפעילות', icon: Briefcase },
  { key: 'offer_type', label: 'מוצר/שירות', icon: Building2 },
  { key: 'business_stage', label: 'שלב העסק', icon: Target },
  { key: 'lead_gen_plan', label: 'איך מביא לקוחות', icon: Rocket },
  { key: 'short_term_goal', label: 'מטרה קצרת טווח', icon: Route },
];

export default function QuestionnairePanel({ lead }) {
  // Merge direct columns + questionnaire_data JSONB
  const data = {
    ...(lead.questionnaire_data || {}),
    id_number: lead.id_number || lead.questionnaire_data?.id_number,
    business_name: lead.business_name || lead.questionnaire_data?.business_name,
    business_type: lead.business_type || lead.questionnaire_data?.business_type,
    income: lead.income || lead.questionnaire_data?.income,
    is_employee: lead.is_employee || lead.questionnaire_data?.is_employee,
    salary: lead.salary || lead.questionnaire_data?.salary,
  };

  const accountantAnswers = lead.questionnaire_data?.accountant_callback || null;
  const prePaymentAnswers = lead.questionnaire_data?.pre_payment_recovery || null;
  const postPaymentAnswers = lead.questionnaire_data?.post_payment_onboarding || null;
  const freeQuestionHistory = lead.questionnaire_data?.free_question_history || null;

  const hasFormData = FIELD_CONFIG.some(f => data[f.key]);
  const hasAccountantData = accountantAnswers && ACCOUNTANT_FIELDS.some(f => accountantAnswers[f.key]);
  const hasPrePayment = prePaymentAnswers && PRE_PAYMENT_FIELDS.some(f => prePaymentAnswers[f.key]);
  const hasPostPayment = postPaymentAnswers && POST_PAYMENT_FIELDS.some(f => postPaymentAnswers[f.key]);
  const hasFreeQuestions = Array.isArray(freeQuestionHistory) && freeQuestionHistory.length > 0;

  if (!hasFormData && !hasAccountantData && !hasPrePayment && !hasPostPayment && !hasFreeQuestions) return null;

  return (
    <>
      {hasFormData && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-1.5">
            <ClipboardList size={14} />
            שאלון טופס
          </h3>
          <div className="space-y-2">
            {FIELD_CONFIG.map(({ key, label, icon: Icon, format, sensitive }) => {
              const value = data[key];
              if (!value) return null;
              const displayValue = format ? format(value) : value;
              return (
                <div key={key} className="flex items-center gap-2">
                  <Icon size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-400 w-20 flex-shrink-0">{label}</span>
                  <span className={`text-sm text-slate-700 ${sensitive ? 'font-mono' : ''}`}>
                    {sensitive ? maskSensitive(displayValue) : displayValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasAccountantData && (
        <FreeTextQuestionnaireBlock
          title="שאלון שיחה עם רו״ח"
          icon={Phone}
          color="blue"
          fields={ACCOUNTANT_FIELDS}
          answers={accountantAnswers}
        />
      )}

      {hasPrePayment && (
        <FreeTextQuestionnaireBlock
          title="שאלון לפני תשלום (abandoned recovery)"
          icon={ClipboardList}
          color="amber"
          fields={PRE_PAYMENT_FIELDS}
          answers={prePaymentAnswers}
        />
      )}

      {hasPostPayment && (
        <FreeTextQuestionnaireBlock
          title="שאלון אחרי תשלום (onboarding)"
          icon={Target}
          color="green"
          fields={POST_PAYMENT_FIELDS}
          answers={postPaymentAnswers}
        />
      )}

      {hasFreeQuestions && (
        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <h3 className="text-sm font-medium text-purple-700 mb-3 flex items-center gap-1.5">
            <MessageSquare size={14} />
            שאלות שהלקוח שאל ({freeQuestionHistory.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {freeQuestionHistory.map((item, i) => (
              <div key={i} className="bg-purple-50 rounded p-2 text-xs">
                <div className="font-medium text-purple-900 mb-1">❓ {item.q}</div>
                <div className="text-slate-600">{item.a?.substring(0, 100)}{item.a?.length > 100 ? '...' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function FreeTextQuestionnaireBlock({ title, icon: Icon, color, fields, answers }) {
  const colorMap = {
    blue: { border: 'border-blue-200', text: 'text-blue-700', iconColor: 'text-blue-400', labelColor: 'text-blue-500' },
    amber: { border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-400', labelColor: 'text-amber-500' },
    green: { border: 'border-green-200', text: 'text-green-700', iconColor: 'text-green-400', labelColor: 'text-green-500' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-lg border ${c.border} p-4`}>
      <h3 className={`text-sm font-medium ${c.text} mb-3 flex items-center gap-1.5`}>
        <Icon size={14} />
        {title}
      </h3>
      <div className="space-y-3">
        {fields.map(({ key, label, icon: FieldIcon }) => {
          const value = answers[key];
          if (!value) return null;
          return (
            <div key={key} className="flex items-start gap-2">
              <FieldIcon size={13} className={`${c.iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className={`text-xs ${c.labelColor} font-medium mb-0.5`}>{label}</div>
                <div className="text-sm text-slate-700 whitespace-pre-wrap break-words">{value}</div>
              </div>
            </div>
          );
        })}
        {answers.completed_at && (
          <div className={`text-[10px] text-slate-400 pt-2 border-t ${c.border}`}>
            הושלם: {new Date(answers.completed_at).toLocaleString('he-IL')}
          </div>
        )}
      </div>
    </div>
  );
}

function maskSensitive(value) {
  if (!value || value.length < 5) return value;
  return value.slice(0, 2) + '•'.repeat(value.length - 4) + value.slice(-2);
}
