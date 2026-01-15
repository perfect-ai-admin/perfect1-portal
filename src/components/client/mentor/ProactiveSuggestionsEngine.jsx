import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingDown, FileText, Target, Calendar, X, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Proactive Suggestion Triggers (section 4.6.4)
export function checkProactiveTriggers(data) {
  const suggestions = [];
  const now = new Date();

  // 1. Revenue decline > 10%
  if (data.business_metrics?.revenue_trend) {
    const currentMonth = data.business_metrics.current_revenue || 0;
    const previousMonth = data.business_metrics.previous_revenue || 0;
    
    if (previousMonth > 0) {
      const decline = ((previousMonth - currentMonth) / previousMonth) * 100;
      if (decline > 10) {
        suggestions.push({
          id: 'revenue_decline',
          type: 'financial_health',
          severity: 'high',
          icon: TrendingDown,
          title: 'ירידה בהכנסות - בדיקת בריאות פיננסית',
          description: `ההכנסות שלך ירדו ב-${decline.toFixed(1)}% בהשוואה לחודש שעבר. בואו נבדוק מה קורה.`,
          action: 'financial_checkup',
          actionLabel: 'התחל בדיקה'
        });
      }
    }
  }

  // 2. No invoices in 14+ days
  const lastInvoiceDate = data.last_invoice_date ? new Date(data.last_invoice_date) : null;
  if (lastInvoiceDate) {
    const daysSinceLastInvoice = Math.floor((now - lastInvoiceDate) / (1000 * 60 * 60 * 24));
    if (daysSinceLastInvoice >= 14) {
      suggestions.push({
        id: 'no_invoices',
        type: 'client_outreach',
        severity: 'medium',
        icon: FileText,
        title: 'לא יצרת חשבוניות כבר 14 יום',
        description: `עבר ${daysSinceLastInvoice} יום מאז החשבונית האחרונה. הגיע הזמן ליצור קשר עם לקוחות?`,
        action: 'client_outreach',
        actionLabel: 'תזכורת ללקוחות'
      });
    }
  }

  // 3. Goal deadline approaching
  if (data.active_goals?.length > 0) {
    data.active_goals.forEach(goal => {
      if (goal.deadline) {
        const deadline = new Date(goal.deadline);
        const daysUntil = Math.floor((deadline - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 7 && daysUntil >= 0 && goal.progress < 80) {
          suggestions.push({
            id: `goal_${goal.id}`,
            type: 'goal_progress',
            severity: 'medium',
            icon: Target,
            title: `המטרה "${goal.title}" מתקרבת`,
            description: `נשארו ${daysUntil} ימים והשגת ${goal.progress}% מהמטרה. בואו נדחוף קדימה!`,
            action: 'goal_nudge',
            actionLabel: 'עבוד על המטרה',
            metadata: { goal_id: goal.id }
          });
        }
      }
    });
  }

  // 4. Upcoming tax deadline
  const taxDeadlines = [
    { month: 1, day: 31, name: 'דוח שנתי' },
    { month: 4, day: 30, name: 'תשלום מקדמות' },
    { month: 7, day: 31, name: 'תשלום מקדמות' },
    { month: 10, day: 31, name: 'תשלום מקדמות' }
  ];

  taxDeadlines.forEach(deadline => {
    const deadlineDate = new Date(now.getFullYear(), deadline.month - 1, deadline.day);
    const daysUntil = Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 14 && daysUntil >= 0) {
      suggestions.push({
        id: `tax_${deadline.month}`,
        type: 'compliance',
        severity: 'high',
        icon: Calendar,
        title: `תאריך יעד: ${deadline.name}`,
        description: `נשארו ${daysUntil} ימים עד ${deadline.name}. וודא שהכל מוכן!`,
        action: 'tax_reminder',
        actionLabel: 'הכן מסמכים'
      });
    }
  });

  // 5. New feature announcement
  const newFeatures = checkForNewFeatures(data);
  if (newFeatures.length > 0) {
    newFeatures.forEach(feature => {
      suggestions.push({
        id: `feature_${feature.id}`,
        type: 'new_feature',
        severity: 'low',
        icon: Sparkles,
        title: `תכונה חדשה: ${feature.name}`,
        description: feature.description,
        action: 'explore_feature',
        actionLabel: 'גלה עכשיו',
        metadata: { feature_id: feature.id }
      });
    });
  }

  return suggestions.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// Check for new features that user hasn't seen
function checkForNewFeatures(data) {
  const features = [
    {
      id: 'marketing_roi_tracker',
      name: 'מעקב ROI שיווקי',
      description: 'כלי חדש למעקב אחר ביצועי קמפיינים שיווקיים והמלצות מבוססות נתונים',
      releaseDate: '2026-01-15',
      category: 'marketing'
    },
    {
      id: 'celebration_sharing',
      name: 'שיתוף הישגים',
      description: 'עכשיו אפשר לשתף הישגים ואבני דרך ברשתות חברתיות ישירות מהמערכת',
      releaseDate: '2026-01-15',
      category: 'progress'
    }
  ];

  const seenFeatures = JSON.parse(localStorage.getItem('seen_features') || '[]');
  const now = new Date();

  return features.filter(feature => {
    const releaseDate = new Date(feature.releaseDate);
    const daysSinceRelease = Math.floor((now - releaseDate) / (1000 * 60 * 60 * 24));
    
    // Show features released in the last 30 days that user hasn't seen
    return daysSinceRelease <= 30 && daysSinceRelease >= 0 && !seenFeatures.includes(feature.id);
  });
}

export default function ProactiveSuggestionsEngine({ data, onAction }) {
  const [suggestions, setSuggestions] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    const allSuggestions = checkProactiveTriggers(data);
    const activeSuggestions = allSuggestions.filter(s => !dismissed.includes(s.id));
    setSuggestions(activeSuggestions);
  }, [data, dismissed]);

  const handleDismiss = (id) => {
    setDismissed(prev => [...prev, id]);
    localStorage.setItem('dismissed_suggestions', JSON.stringify([...dismissed, id]));
    
    // Mark new feature as seen
    if (id.startsWith('feature_')) {
      const seenFeatures = JSON.parse(localStorage.getItem('seen_features') || '[]');
      const featureId = id.replace('feature_', '');
      if (!seenFeatures.includes(featureId)) {
        seenFeatures.push(featureId);
        localStorage.setItem('seen_features', JSON.stringify(seenFeatures));
      }
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">התראות חכמות</h3>
      <AnimatePresence>
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          const severityColors = {
            high: 'border-red-200 bg-red-50',
            medium: 'border-yellow-200 bg-yellow-50',
            low: 'border-blue-200 bg-blue-50'
          };

          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`border-2 rounded-xl p-4 ${severityColors[suggestion.severity]}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  suggestion.severity === 'high' ? 'bg-red-600' :
                  suggestion.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                }`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-gray-900">{suggestion.title}</h4>
                    <button
                      onClick={() => handleDismiss(suggestion.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
                  <Button
                    onClick={() => {
                      onAction(suggestion.action, suggestion.metadata);
                      if (suggestion.type === 'new_feature') {
                        handleDismiss(suggestion.id);
                      }
                    }}
                    size="sm"
                    className={
                      suggestion.severity === 'high' ? 'bg-red-600 hover:bg-red-700' :
                      suggestion.severity === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      'bg-blue-600 hover:bg-blue-700'
                    }
                  >
                    {suggestion.actionLabel}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}