import React from 'react';
import { useOutreachThread } from '../../hooks/useOutreach';

const INTENT_LABELS = {
  interested: 'מעוניין',
  not_interested: 'לא מעוניין',
  ask_price: 'שואל מחיר',
  ask_details: 'שואל פרטים',
  partnership: 'שותפות',
  unknown: 'לא ברור',
};

const STATUS_LABELS = {
  sent: 'נשלח',
  delivered: 'הגיע',
  opened: 'נפתח',
  replied: 'ענו',
  approved: 'מאושר',
  positive: 'חיובי',
  neutral: 'נייטרלי',
  negative: 'שלילי',
  needs_review: 'לבדיקה',
};

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('he-IL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OutreachThreadTimeline({ websiteId }) {
  const { data: items = [], isLoading } = useOutreachThread(websiteId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">אין הודעות בשרשור זה</div>
    );
  }

  return (
    <div className="space-y-3 overflow-auto flex-1 px-1 pb-2">
      {items.map((item) => {
        const isOutbound = item.type === 'outbound';
        return (
          <div
            key={`${item.type}-${item.id}`}
            className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                isOutbound
                  ? 'bg-slate-100 text-slate-800 rounded-br-none'
                  : 'bg-blue-50 text-slate-800 rounded-bl-none border border-blue-100'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center gap-2 mb-1 text-xs text-slate-500 ${isOutbound ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="font-medium">{isOutbound ? 'יוצא' : 'נכנס'}</span>
                {item.step != null && <span className="bg-slate-200 rounded px-1">שלב {item.step}</span>}
                {item.intent && item.intent !== 'unknown' && (
                  <span className="bg-blue-100 text-blue-700 rounded px-1">{INTENT_LABELS[item.intent] || item.intent}</span>
                )}
                {item.status && STATUS_LABELS[item.status] && (
                  <span className="text-slate-400">{STATUS_LABELS[item.status]}</span>
                )}
              </div>

              {/* Subject */}
              {item.subject && (
                <p className="font-semibold text-xs text-slate-600 mb-1 truncate">{item.subject}</p>
              )}

              {/* Body */}
              <p className="whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">{item.body || '—'}</p>

              {/* Timestamp */}
              <p className={`text-[10px] text-slate-400 mt-1 ${isOutbound ? 'text-left' : 'text-right'}`}>
                {formatDate(item.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
