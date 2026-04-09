import React from 'react';
import { ClipboardList, User, Briefcase, Building2, TrendingUp, DollarSign } from 'lucide-react';

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

  const hasData = FIELD_CONFIG.some(f => data[f.key]);
  if (!hasData) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-1.5">
        <ClipboardList size={14} />
        שאלון לקוח
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
  );
}

function maskSensitive(value) {
  if (!value || value.length < 5) return value;
  return value.slice(0, 2) + '•'.repeat(value.length - 4) + value.slice(-2);
}
