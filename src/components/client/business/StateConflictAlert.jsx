import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StateConflictAlert({ businessState }) {
  if (!businessState || !businessState.marketing_state || !businessState.operations_state) {
    return null;
  }

  const conflicts = [];

  // Check for marketing vs operations conflict
  const marketingActive = businessState.marketing_state.current_phase === 'testing' || 
                          businessState.marketing_state.current_phase === 'scaling';
  const operationsOverloaded = businessState.operations_state.workload_status === 'overloaded' ||
                               businessState.operations_state.workload_status === 'near_limit';

  if (marketingActive && operationsOverloaded) {
    conflicts.push({
      type: 'critical',
      title: 'סתירה: שיווק פעיל בזמן עומס תפעולי',
      description: 'השיווק מייצר לידים חדשים אבל אין קיבולת לטפל בהם',
      recommendation: 'השהה שיווק עד לפתרון העומס התפעולי, או הוסף קיבולת'
    });
  }

  // Check for sales bottleneck vs marketing spend
  if (businessState.sales_state?.bottleneck === 'closing' && marketingActive) {
    conflicts.push({
      type: 'high',
      title: 'סתירה: השקעה בשיווק בזמן בעיית סגירה',
      description: 'יש מספיק לידים אבל הם לא נסגרים - לא צריך עוד לידים',
      recommendation: 'השהה שיווק, התמקד בשיפור תהליך הסגירה'
    });
  }

  // Check for growth focus vs survival stage
  if (businessState.focus_state?.current_strategic_focus === 'growth' && 
      businessState.stage === 'crisis') {
    conflicts.push({
      type: 'critical',
      title: 'סתירה: פוקוס צמיחה בזמן משבר',
      description: 'העסק במצב משבר אבל הפוקוס על צמיחה',
      recommendation: 'שנה פוקוס ל-survival, התמקד בייצוב ותזרים מזומנים'
    });
  }

  // Check for too many active initiatives
  const activeCount = businessState.focus_state?.active_initiatives?.length || 0;
  if (activeCount > 3) {
    conflicts.push({
      type: 'high',
      title: 'עומס יוזמות',
      description: `יש ${activeCount} יוזמות פעילות - זה יותר מדי`,
      recommendation: 'סגור או דחה יוזמות, התמקד ב-3 מקסימום'
    });
  }

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {conflicts.map((conflict, idx) => (
        <Alert 
          key={idx} 
          variant={conflict.type === 'critical' ? 'destructive' : 'default'}
          className={conflict.type === 'high' ? 'border-orange-300 bg-orange-50' : ''}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold">{conflict.title}</AlertTitle>
          <AlertDescription>
            <p className="text-sm mb-2">{conflict.description}</p>
            <div className="bg-white/50 rounded-lg p-2 mt-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <p className="text-sm font-medium text-gray-900">
                  💡 {conflict.recommendation}
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}