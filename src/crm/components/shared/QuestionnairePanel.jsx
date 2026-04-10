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
  const hasFormData = FIELD_CONFIG.some(f => data[f.key]);
  const hasAccountantData = accountantAnswers && ACCOUNTANT_FIELDS.some(f => accountantAnswers[f.key]);

  if (!hasFormData && !hasAccountantData) return null;

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
        <div className="bg-white rounded-lg border border-blue-200 p-4">
          <h3 className="text-sm font-medium text-blue-700 mb-3 flex items-center gap-1.5">
            <Phone size={14} />
            שאלון שיחה עם רו״ח
          </h3>
          <div className="space-y-3">
            {ACCOUNTANT_FIELDS.map(({ key, label, icon: Icon }) => {
              const value = accountantAnswers[key];
              if (!value) return null;
              return (
                <div key={key} className="flex items-start gap-2">
                  <Icon size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-blue-500 font-medium mb-0.5">{label}</div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap break-words">{value}</div>
                  </div>
                </div>
              );
            })}
            {accountantAnswers.completed_at && (
              <div className="text-[10px] text-slate-400 pt-2 border-t border-blue-100">
                הושלם: {new Date(accountantAnswers.completed_at).toLocaleString('he-IL')}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function maskSensitive(value) {
  if (!value || value.length < 5) return value;
  return value.slice(0, 2) + '•'.repeat(value.length - 4) + value.slice(-2);
}
