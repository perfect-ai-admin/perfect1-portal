import React from 'react';
import { Target, Clock, Lightbulb, Ban } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const FOCUS_CONFIG = {
  growth: {
    label: 'צמיחה',
    color: 'bg-green-100 text-green-800',
    icon: Target
  },
  stability: {
    label: 'ייצוב',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock
  },
  optimization: {
    label: 'אופטימיזציה',
    color: 'bg-purple-100 text-purple-800',
    icon: Lightbulb
  },
  survival: {
    label: 'הישרדות',
    color: 'bg-red-100 text-red-800',
    icon: Ban
  }
};

export default function FocusDashboard({ focusState }) {
  if (!focusState) {
    return null;
  }

  const currentFocus = focusState.current_strategic_focus 
    ? FOCUS_CONFIG[focusState.current_strategic_focus] 
    : null;

  const activeInitiatives = focusState.active_initiatives || [];
  const deferredIdeas = focusState.deferred_ideas || [];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-600" />
        פוקוס אסטרטגי
      </h3>

      {currentFocus && (
        <div className={`${currentFocus.color} rounded-lg p-4 mb-4 border`}>
          <div className="flex items-center gap-2 mb-1">
            <currentFocus.icon className="w-5 h-5" />
            <span className="font-bold">כיוון נוכחי: {currentFocus.label}</span>
          </div>
        </div>
      )}

      {/* Active Initiatives */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-700">יוזמות פעילות</h4>
          <span className="text-xs text-gray-500">{activeInitiatives.length}/3 מקסימום</span>
        </div>
        
        {activeInitiatives.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">אין יוזמות פעילות כרגע</p>
            <p className="text-xs text-gray-500 mt-1">התחל ביוזמה אחת ממוקדת</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeInitiatives.map((initiative, idx) => (
              <div key={idx} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-blue-900">{initiative.title}</p>
                    <p className="text-xs text-blue-700">תחום: {initiative.area}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-800">
                    עדיפות {initiative.priority}
                  </span>
                </div>
                {initiative.progress !== undefined && (
                  <div className="space-y-1">
                    <Progress value={initiative.progress} className="h-2" />
                    <p className="text-xs text-blue-600">{initiative.progress}% התקדמות</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeInitiatives.length >= 3 && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              ⚠️ הגעת למקסימום יוזמות פעילות. סיים אחת לפני שתתחיל חדשה.
            </p>
          </div>
        )}
      </div>

      {/* Deferred Ideas */}
      {deferredIdeas.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            רעיונות נדחים ({deferredIdeas.length})
          </h4>
          <div className="space-y-2">
            {deferredIdeas.slice(0, 3).map((idea, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-800">{idea.idea}</p>
                <p className="text-xs text-gray-600 mt-1">
                  סיבה: {idea.reason_deferred}
                </p>
                {idea.reconsider_date && (
                  <p className="text-xs text-gray-500 mt-1">
                    לבדוק שוב ב: {new Date(idea.reconsider_date).toLocaleDateString('he-IL')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}