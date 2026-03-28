import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Calendar, Target, AlertTriangle, CheckCircle } from 'lucide-react';

// Marketing Investment Advisor (section 4.5.4)
function analyzeDecisionFactors(data) {
  const factors = {
    revenue: { score: 0, status: '', message: '' },
    cashReserves: { score: 0, status: '', message: '' },
    clientAcquisition: { score: 0, status: '', message: '' },
    seasonal: { score: 0, status: '', message: '' },
    goals: { score: 0, status: '', message: '' }
  };

  // 1. Revenue Analysis
  const currentRevenue = data.business_metrics?.current_revenue || 0;
  const previousRevenue = data.business_metrics?.previous_revenue || 0;
  const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  if (currentRevenue < 5000) {
    factors.revenue = { score: 2, status: 'warning', message: 'הכנסה נמוכה - כדאי להתמקד בשיפור השירות תחילה' };
  } else if (revenueGrowth > 10) {
    factors.revenue = { score: 10, status: 'good', message: `צמיחה של ${revenueGrowth.toFixed(1)}% - זמן מצוין להשקיע!` };
  } else if (revenueGrowth < -10) {
    factors.revenue = { score: 3, status: 'warning', message: 'ירידה בהכנסות - עדיף לייצב לפני השקעה' };
  } else {
    factors.revenue = { score: 7, status: 'ok', message: `הכנסה יציבה של ₪${currentRevenue.toLocaleString()}` };
  }

  // 2. Cash Reserves
  const cashReserves = data.business_metrics?.cash_reserves || 0;
  const monthlyExpenses = data.business_metrics?.monthly_expenses || 5000;
  const reservesMonths = cashReserves / monthlyExpenses;

  if (reservesMonths >= 6) {
    factors.cashReserves = { score: 10, status: 'good', message: `${reservesMonths.toFixed(1)} חודשי עתודה - מעולה!` };
  } else if (reservesMonths >= 3) {
    factors.cashReserves = { score: 7, status: 'ok', message: `${reservesMonths.toFixed(1)} חודשי עתודה - סביר` };
  } else {
    factors.cashReserves = { score: 3, status: 'warning', message: 'עתודות נמוכות - הקפד על תקציב זהיר' };
  }

  // 3. Client Acquisition Cost
  const cac = data.business_metrics?.cac || 500;
  const averageOrderValue = data.business_metrics?.average_order_value || 2000;
  const cacRatio = (cac / averageOrderValue) * 100;

  if (cacRatio < 20) {
    factors.clientAcquisition = { score: 10, status: 'good', message: `עלות השגת לקוח ${cacRatio.toFixed(0)}% מהרכישה - מצוין` };
  } else if (cacRatio < 40) {
    factors.clientAcquisition = { score: 7, status: 'ok', message: `עלות השגת לקוח ${cacRatio.toFixed(0)}% - סביר` };
  } else {
    factors.clientAcquisition = { score: 4, status: 'warning', message: 'עלות השגת לקוח גבוהה - שפר המרות תחילה' };
  }

  // 4. Seasonal Patterns
  const currentMonth = new Date().getMonth();
  const highSeasonMonths = [8, 9, 10, 11]; // Sept-Dec
  const isHighSeason = highSeasonMonths.includes(currentMonth);

  if (isHighSeason) {
    factors.seasonal = { score: 9, status: 'good', message: 'עונת שיא - זמן מצוין לשיווק אגרסיבי' };
  } else if ([5, 6, 7].includes(currentMonth)) {
    factors.seasonal = { score: 5, status: 'ok', message: 'קיץ - תקופה איטית יותר, תקציב זהיר' };
  } else {
    factors.seasonal = { score: 7, status: 'ok', message: 'תקופה רגילה לשיווק' };
  }

  // 5. Goals Alignment
  const hasRevenueGoal = data.active_goals?.some(g => g.category === 'revenue');
  const hasClientGoal = data.active_goals?.some(g => g.category === 'clients');

  if (hasRevenueGoal && hasClientGoal) {
    factors.goals = { score: 10, status: 'good', message: 'מטרות ברורות - שיווק יעזור להשגתן' };
  } else if (hasRevenueGoal || hasClientGoal) {
    factors.goals = { score: 7, status: 'ok', message: 'יש מטרה אחת - הגדר יעדים נוספים' };
  } else {
    factors.goals = { score: 4, status: 'warning', message: 'אין מטרות מוגדרות - קשה למדוד הצלחה' };
  }

  return factors;
}

function generateRecommendation(factors, data) {
  const totalScore = Object.values(factors).reduce((sum, f) => sum + f.score, 0);
  const maxScore = 50;
  const scorePercent = (totalScore / maxScore) * 100;

  let recommendation = {
    decision: '',
    reasoning: '',
    suggestedBudget: { min: 0, max: 0 },
    channels: [],
    expectedROI: '',
    timeline: ''
  };

  const currentRevenue = data.business_metrics?.current_revenue || 10000;
  const suggestedBudgetPercent = scorePercent >= 70 ? 15 : scorePercent >= 50 ? 10 : 5;

  if (scorePercent >= 70) {
    recommendation = {
      decision: 'כן, זה זמן מצוין להשקיע בשיווק! 🚀',
      reasoning: 'המצב העסקי שלך חזק ויציב. יש לך את התשתית, המשאבים והתנאים הנכונים להשקעה משתלמת בשיווק.',
      suggestedBudget: {
        min: Math.round(currentRevenue * (suggestedBudgetPercent / 100) * 0.8),
        max: Math.round(currentRevenue * (suggestedBudgetPercent / 100) * 1.2)
      },
      channels: [
        { name: 'Google Ads', reason: 'כוונה גבוהה, תוצאות מהירות', priority: 'high' },
        { name: 'Facebook/Instagram', reason: 'בניית מודעות למותג', priority: 'high' },
        { name: 'SEO', reason: 'השקעה ארוכת טווח', priority: 'medium' }
      ],
      expectedROI: '3-5x החזר על ההשקעה תוך 6 חודשים',
      timeline: 'תוצאות ראשוניות תוך 2-4 שבועות, תוצאות מלאות תוך 3-6 חודשים'
    };
  } else if (scorePercent >= 50) {
    recommendation = {
      decision: 'אפשר להשקיע, אבל בזהירות ⚠️',
      reasoning: 'המצב העסקי שלך סביר, אבל יש כמה גורמים שדורשים תשומת לב. התחל עם תקציב קטן ונמוך סיכון.',
      suggestedBudget: {
        min: Math.round(currentRevenue * (suggestedBudgetPercent / 100) * 0.8),
        max: Math.round(currentRevenue * (suggestedBudgetPercent / 100) * 1.2)
      },
      channels: [
        { name: 'Google Ads', reason: 'תוצאות מדידות ומהירות', priority: 'high' },
        { name: 'שיווק אורגני', reason: 'עלות נמוכה, זמן ארוך', priority: 'medium' }
      ],
      expectedROI: '2-3x החזר על ההשקעה תוך 6-9 חודשים',
      timeline: 'התחל קטן, נטר תוצאות, והרחב בהדרגה'
    };
  } else {
    recommendation = {
      decision: 'עדיף לא - יש דברים חשובים יותר 🛑',
      reasoning: 'העסק צריך חיזוק בתחומים אחרים לפני השקעה בשיווק. תתמקד בשיפור השירות, יעילות, ויציבות פיננסית.',
      suggestedBudget: { min: 0, max: 0 },
      channels: [
        { name: 'שיווק אורגני', reason: 'בחינם - פוסטים ברשתות', priority: 'high' },
        { name: 'המלצות לקוחות', reason: 'העלות הכי נמוכה', priority: 'high' }
      ],
      expectedROI: 'תתמקד בהכנסות ויציבות לפני השקעה',
      timeline: 'חזור לנושא בעוד 2-3 חודשים'
    };
  }

  return { ...recommendation, totalScore, scorePercent };
}

export default function MarketingInvestmentAdvisor({ data }) {
  const [factors, setFactors] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    const analyzedFactors = analyzeDecisionFactors(data);
    const rec = generateRecommendation(analyzedFactors, data);
    setFactors(analyzedFactors);
    setRecommendation(rec);
  }, [data]);

  if (!factors || !recommendation) {
    return <div className="text-center py-8 text-gray-500">מנתח נתונים...</div>;
  }

  const statusColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    ok: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    warning: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <div className="space-y-6">
      {/* Main Recommendation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl shadow-xl p-8 ${
          recommendation.scorePercent >= 70 ? 'bg-gradient-to-br from-green-500 to-green-600' :
          recommendation.scorePercent >= 50 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
          'bg-gradient-to-br from-red-500 to-red-600'
        } text-white`}
      >
        <div className="flex items-start gap-4 mb-6">
          {recommendation.scorePercent >= 70 ? <CheckCircle className="w-12 h-12" /> :
           recommendation.scorePercent >= 50 ? <AlertTriangle className="w-12 h-12" /> :
           <AlertTriangle className="w-12 h-12" />}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{recommendation.decision}</h2>
            <p className="text-lg opacity-90">{recommendation.reasoning}</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold">{recommendation.scorePercent.toFixed(0)}%</div>
            <div className="text-sm opacity-80">ציון מוכנות</div>
          </div>
        </div>

        {recommendation.suggestedBudget.max > 0 && (
          <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-4">
            <h3 className="font-bold mb-2">💰 תקציב מומלץ (חודשי):</h3>
            <div className="text-2xl font-bold">
              ₪{recommendation.suggestedBudget.min.toLocaleString()} - ₪{recommendation.suggestedBudget.max.toLocaleString()}
            </div>
            <p className="text-sm opacity-80 mt-1">
              {((recommendation.suggestedBudget.max / (data.business_metrics?.current_revenue || 10000)) * 100).toFixed(0)}% מההכנסה החודשית
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <h3 className="font-bold mb-2">📊 ROI צפוי:</h3>
            <p className="text-sm">{recommendation.expectedROI}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <h3 className="font-bold mb-2">⏱ ציר זמן:</h3>
            <p className="text-sm">{recommendation.timeline}</p>
          </div>
        </div>
      </motion.div>

      {/* Recommended Channels */}
      {recommendation.channels.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">ערוצים מומלצים</h3>
          <div className="space-y-3">
            {recommendation.channels.map((channel, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  channel.priority === 'high' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">{channel.name}</h4>
                    <p className="text-sm text-gray-600">{channel.reason}</p>
                  </div>
                  {channel.priority === 'high' && (
                    <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full">
                      עדיפות גבוהה
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Factors Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">ניתוח גורמי החלטה</h3>
        <div className="space-y-3">
          {Object.entries(factors).map(([key, factor], i) => {
            const icons = {
              revenue: TrendingUp,
              cashReserves: DollarSign,
              clientAcquisition: Users,
              seasonal: Calendar,
              goals: Target
            };
            const Icon = icons[key];
            const labels = {
              revenue: 'הכנסות ומגמה',
              cashReserves: 'עתודות כספיות',
              clientAcquisition: 'עלות השגת לקוח',
              seasonal: 'עונתיות',
              goals: 'התאמה למטרות'
            };

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-lg border-2 ${statusColors[factor.status]}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold">{labels[key]}</h4>
                      <span className="text-sm font-semibold">{factor.score}/10</span>
                    </div>
                    <p className="text-sm">{factor.message}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}