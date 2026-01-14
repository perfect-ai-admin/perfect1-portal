import React from 'react';
import { AlertCircle, TrendingUp, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

const STAGE_CONFIG = {
  pre_revenue: {
    label: 'טרום הכנסות',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: Zap,
    description: 'בניית יסודות'
  },
  early_revenue: {
    label: 'הכנסות ראשוניות',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: TrendingUp,
    description: 'התחלת צמיחה'
  },
  growing: {
    label: 'צומח',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: TrendingUp,
    description: 'מוכן לצמיחה'
  },
  stable: {
    label: 'יציב',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: CheckCircle,
    description: 'תקופת ייצוב'
  },
  declining: {
    label: 'בירידה',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: AlertTriangle,
    description: 'דורש תשומת לב'
  },
  crisis: {
    label: 'משבר',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: AlertCircle,
    description: 'פוקוס על בסיס'
  }
};

const CHALLENGE_CONFIG = {
  no_leads: { label: 'חוסר לידים', severity: 'high' },
  low_conversion: { label: 'המרה נמוכה', severity: 'medium' },
  overload: { label: 'עומס', severity: 'high' },
  cash_flow: { label: 'תזרים מזומנים', severity: 'critical' },
  retention: { label: 'שימור לקוחות', severity: 'medium' },
  focus: { label: 'חוסר פוקוס', severity: 'medium' }
};

export default function BusinessStateIndicator({ businessState, compact = false }) {
  if (!businessState || !businessState.stage) {
    return null;
  }

  const stageConfig = STAGE_CONFIG[businessState.stage] || STAGE_CONFIG.pre_revenue;
  const Icon = stageConfig.icon;
  const challenge = businessState.primary_challenge 
    ? CHALLENGE_CONFIG[businessState.primary_challenge] 
    : null;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${stageConfig.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{stageConfig.label}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg ${stageConfig.color} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">מצב עסקי</h3>
            <p className="text-sm text-gray-600">{stageConfig.description}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg border ${stageConfig.color}`}>
          <span className="text-sm font-bold">{stageConfig.label}</span>
        </div>
      </div>

      {challenge && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-900">אתגר מרכזי</span>
          </div>
          <p className="text-sm text-amber-800">{challenge.label}</p>
        </div>
      )}

      {businessState.unified_recommendation && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-blue-900 mb-2">הפעולה הבאה שלך</h4>
            <p className="text-sm text-blue-800 font-medium mb-2">
              {businessState.unified_recommendation.single_next_action}
            </p>
            {businessState.unified_recommendation.why_this_matters && (
              <p className="text-xs text-blue-700">
                💡 {businessState.unified_recommendation.why_this_matters}
              </p>
            )}
          </div>

          {businessState.unified_recommendation.what_not_doing_now?.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-xs font-bold text-gray-700 mb-2">מה לא עושים עכשיו:</h4>
              <ul className="space-y-1">
                {businessState.unified_recommendation.what_not_doing_now.map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}