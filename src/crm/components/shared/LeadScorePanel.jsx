import React from 'react';
import { Flame, TrendingUp, Zap, Target } from 'lucide-react';

const STATE_LABELS = {
  entry_menu: { label: 'תפריט ראשי', color: 'bg-slate-100 text-slate-700' },
  payment_started: { label: 'התחיל תשלום', color: 'bg-blue-100 text-blue-700' },
  payment_abandoned_followup: { label: 'נטש תשלום', color: 'bg-amber-100 text-amber-700' },
  payment_completed_waiting_id: { label: 'שולם, ממתין לת.ז.', color: 'bg-purple-100 text-purple-700' },
  post_payment_questionnaire: { label: 'שאלון onboarding', color: 'bg-green-100 text-green-700' },
  awaiting_accountant_callback: { label: 'ממתין לשיחת רו״ח', color: 'bg-indigo-100 text-indigo-700' },
  free_question_mode: { label: 'שאלות חופשיות', color: 'bg-purple-100 text-purple-700' },
  sales_recovery_mode: { label: 'שחזור מכירה', color: 'bg-orange-100 text-orange-700' },
};

function getScoreColor(score) {
  if (score >= 70) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'חם 🔥' };
  if (score >= 40) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'חמים 🌡️' };
  if (score >= 20) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'פושר' };
  return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', label: 'קר ❄️' };
}

export default function LeadScorePanel({ lead }) {
  const score = lead.lead_score || 0;
  const state = lead.bot_state || null;
  const path = lead.selected_path || null;
  const nextAction = lead.next_recommended_action || null;

  if (score === 0 && !state && !path) return null;

  const scoreColors = getScoreColor(score);
  const stateInfo = state ? STATE_LABELS[state] : null;

  return (
    <div className={`rounded-lg border ${scoreColors.border} ${scoreColors.bg} p-4`}>
      <h3 className={`text-sm font-medium ${scoreColors.text} mb-3 flex items-center gap-1.5`}>
        <Flame size={14} />
        Lead Score
      </h3>

      {/* Score badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={`text-3xl font-bold ${scoreColors.text}`}>{score}</div>
        <div className={`text-xs px-2 py-1 rounded-full ${scoreColors.bg} ${scoreColors.text} border ${scoreColors.border}`}>
          {scoreColors.label}
        </div>
      </div>

      {/* State + path */}
      {stateInfo && (
        <div className="flex items-center gap-2 mb-2">
          <Zap size={12} className="text-slate-400" />
          <span className="text-xs text-slate-500">State:</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${stateInfo.color}`}>
            {stateInfo.label}
          </span>
        </div>
      )}

      {path && (
        <div className="flex items-center gap-2 mb-2">
          <Target size={12} className="text-slate-400" />
          <span className="text-xs text-slate-500">מסלול:</span>
          <span className="text-xs text-slate-700 font-medium">{path}</span>
        </div>
      )}

      {nextAction && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-2">
          <TrendingUp size={12} className="text-slate-400" />
          <span className="text-xs text-slate-500">Next:</span>
          <span className="text-xs text-slate-700 font-medium">{nextAction}</span>
        </div>
      )}
    </div>
  );
}
