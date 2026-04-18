import React, { useState, useRef } from 'react';
import { Calculator, ChevronDown, AlertTriangle, TrendingDown, Award, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateNetIncome } from './calcNetIncome';
import { TAX_YEAR } from './taxConfig2026';
import CalcLeadPopup from './CalcLeadPopup';

const formatCurrency = (num) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(num);

const parseNumber = (str) => {
  const n = Number(String(str).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
};

function ResultRow({ label, value, highlight, negative }) {
  return (
    <div className={`flex items-center justify-between py-3 ${highlight ? 'border-t-2 border-portal-teal pt-4' : 'border-b border-gray-100'}`}>
      <span className={`text-sm ${highlight ? 'text-lg font-bold text-portal-navy' : 'text-gray-600'}`}>{label}</span>
      <span className={`font-bold tabular-nums ${highlight ? 'text-2xl text-portal-teal' : negative ? 'text-red-500' : 'text-portal-navy'}`}>
        {negative && '−'}{formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

function Insight({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
      <Icon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}

export default function NetIncomeCalculator() {
  const [form, setForm] = useState({
    monthlyGross: '',
    monthlyExpenses: '',
    creditPoints: '2.25',
    businessType: 'osek_murshe',
    status: 'single',
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const resultRef = useRef(null);

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    const gross = parseNumber(form.monthlyGross);
    if (!form.monthlyGross || gross <= 0) e.monthlyGross = 'יש להזין הכנסה חיובית';
    if (form.monthlyExpenses === '') e.monthlyExpenses = 'יש להזין סכום (או 0)';
    const expenses = parseNumber(form.monthlyExpenses);
    if (expenses < 0) e.monthlyExpenses = 'הסכום לא יכול להיות שלילי';
    const cp = parseNumber(form.creditPoints);
    if (cp < 0 || cp > 10) e.creditPoints = 'ערך לא תקין';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = calculateNetIncome({
      monthlyGross: parseNumber(form.monthlyGross),
      monthlyExpenses: parseNumber(form.monthlyExpenses),
      creditPoints: parseNumber(form.creditPoints),
    });
    setResult(res);

    // Scroll to result
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const getInsights = (r) => {
    const insights = [];
    if (r.monthlyExpenses > r.monthlyGross * 0.4) {
      insights.push({ icon: TrendingDown, text: 'נראה שההוצאות שלכם משפיעות משמעותית על הרווח החייב במס. כדאי לבדוק אילו הוצאות ניתן לצמצם.' });
    }
    if (r.monthlyIncomeTax < r.monthlyProfit * 0.1 && r.monthlyProfit > 0) {
      insights.push({ icon: Award, text: 'נקודות הזיכוי מפחיתות משמעותית את מס ההכנסה המשוער שלכם.' });
    }
    if (r.monthlyNet < r.monthlyGross * 0.5 && r.monthlyGross > 0) {
      insights.push({ icon: BarChart3, text: 'ייתכן שכדאי לבדוק תכנון מס נכון יותר או מבנה פעילות מתאים יותר. השאירו פרטים ונבדוק יחד.' });
    }
    return insights;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <CalcLeadPopup type="net-income" />
      {/* Calculator Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-portal-navy to-portal-navy-light px-6 py-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calculator className="w-6 h-6 text-white" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">מחשבון נטו לעצמאי</h2>
          </div>
          <p className="text-white/80 text-sm">חישוב משוער לשנת המס {TAX_YEAR}</p>
        </div>

        <form onSubmit={handleCalculate} className="p-6 space-y-5">
          {/* Monthly Gross */}
          <div>
            <Label className="mb-1.5 block text-portal-navy font-medium">הכנסה חודשית ברוטו *</Label>
            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                value={form.monthlyGross}
                onChange={(e) => set('monthlyGross', e.target.value)}
                placeholder="לדוגמה 18,000"
                className={`h-12 rounded-xl text-base pr-4 pl-10 border-gray-200 focus:border-portal-teal focus:ring-portal-teal ${errors.monthlyGross ? 'border-red-400' : ''}`}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
            </div>
            {errors.monthlyGross && <p className="text-red-500 text-xs mt-1">{errors.monthlyGross}</p>}
          </div>

          {/* Monthly Expenses */}
          <div>
            <Label className="mb-1.5 block text-portal-navy font-medium">הוצאות חודשיות מוכרות *</Label>
            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                value={form.monthlyExpenses}
                onChange={(e) => set('monthlyExpenses', e.target.value)}
                placeholder="לדוגמה 3,500"
                className={`h-12 rounded-xl text-base pr-4 pl-10 border-gray-200 focus:border-portal-teal focus:ring-portal-teal ${errors.monthlyExpenses ? 'border-red-400' : ''}`}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
            </div>
            {errors.monthlyExpenses && <p className="text-red-500 text-xs mt-1">{errors.monthlyExpenses}</p>}
          </div>

          {/* Credit Points */}
          <div>
            <Label className="mb-1.5 block text-portal-navy font-medium">
              נקודות זיכוי
              <span className="text-gray-400 text-xs font-normal mr-2">(אם אינכם בטוחים, השאירו ברירת מחדל)</span>
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              value={form.creditPoints}
              onChange={(e) => set('creditPoints', e.target.value)}
              placeholder="2.25"
              className={`h-12 rounded-xl text-base border-gray-200 focus:border-portal-teal focus:ring-portal-teal ${errors.creditPoints ? 'border-red-400' : ''}`}
            />
            {errors.creditPoints && <p className="text-red-500 text-xs mt-1">{errors.creditPoints}</p>}
          </div>

          {/* Business Type */}
          <div>
            <Label className="mb-1.5 block text-portal-navy font-medium">סוג עוסק</Label>
            <Select value={form.businessType} onValueChange={(v) => set('businessType', v)}>
              <SelectTrigger className="h-12 rounded-xl text-base border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="osek_patur">עוסק פטור</SelectItem>
                <SelectItem value="osek_murshe">עוסק מורשה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label className="mb-1.5 block text-portal-navy font-medium">סטטוס</Label>
            <Select value={form.status} onValueChange={(v) => set('status', v)}>
              <SelectTrigger className="h-12 rounded-xl text-base border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">יחיד/ה</SelectItem>
                <SelectItem value="married">נשוי/אה</SelectItem>
                <SelectItem value="parent">הורה לילדים</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg bg-portal-teal hover:bg-portal-teal-dark hover:scale-[1.02] active:scale-100 transition-all text-white"
          >
            <Calculator className="ml-2 h-5 w-5" />
            חשב כמה נשאר לי נטו
          </Button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div ref={resultRef} className="mt-8 space-y-6">
          {/* Result Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-l from-portal-teal to-portal-teal-dark px-6 py-4 text-center">
              <h3 className="text-xl font-bold text-white">הנטו המשוער שלכם כעצמאים</h3>
            </div>
            <div className="p-6">
              <ResultRow label="הכנסה חודשית" value={result.monthlyGross} />
              <ResultRow label="הוצאות חודשיות" value={result.monthlyExpenses} negative />
              <ResultRow label="רווח לפני מס" value={result.monthlyProfit} />
              <ResultRow label="מס הכנסה משוער" value={result.monthlyIncomeTax} negative />
              <ResultRow label="ביטוח לאומי + מס בריאות" value={result.monthlyNI} negative />
              <ResultRow label="נשאר לכם נטו משוער" value={result.monthlyNet} highlight />

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  שיעור מס אפקטיבי משוער: {result.effectiveTaxRate}%
                </p>
              </div>

              {/* Short disclaimer near result */}
              <div className="mt-4 flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500">
                  החישוב הוא משוער בלבד ואינו מהווה ייעוץ מקצועי.
                </p>
              </div>
            </div>
          </div>

          {/* Explanation block */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h4 className="font-bold text-portal-navy mb-3">איך חושב הנטו?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              כדי לחשב כמה נשאר נטו לעצמאי, מחשבים קודם את הרווח לאחר הוצאות, ולאחר מכן מפחיתים מס הכנסה וביטוח לאומי לפי חישוב משוער. בפועל ייתכנו הבדלים בהתאם לנתונים האישיים, הכנסות נוספות, זכאויות מס, סטטוס משפחתי, תשלומים שנתיים, התאמות ודוחות.
            </p>
          </div>

          {/* Dynamic Insights */}
          {getInsights(result).length > 0 && (
            <div className="space-y-3">
              {getInsights(result).map((insight, i) => (
                <Insight key={i} icon={insight.icon} text={insight.text} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
