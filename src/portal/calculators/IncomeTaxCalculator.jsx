import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calculator, AlertTriangle, Phone, User } from 'lucide-react';
import { calcIncomeTax, DEFAULT_CREDIT_POINTS, TAX_BRACKETS, TAX_YEAR } from './calcIncomeTax';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';

const formatCurrency = (num) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(num);

const parseNumber = (str) => {
  const n = Number(String(str).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
};

const STATUS_CREDIT_POINTS = {
  single: DEFAULT_CREDIT_POINTS.single,
  married: DEFAULT_CREDIT_POINTS.married,
  married_kids: DEFAULT_CREDIT_POINTS.married_kids,
};

function ResultRow({ label, value, highlight, negative, isPercent }) {
  return (
    <div
      className={`flex items-center justify-between py-3 ${
        highlight ? 'border-t-2 border-portal-teal pt-4' : 'border-b border-gray-100'
      }`}
    >
      <span className={`text-sm ${highlight ? 'text-lg font-bold text-portal-navy' : 'text-gray-600'}`}>
        {label}
      </span>
      <span
        className={`font-bold tabular-nums ${
          highlight ? 'text-2xl text-portal-teal' : negative ? 'text-red-500' : 'text-portal-navy'
        }`}
      >
        {isPercent
          ? `${value}%`
          : `${negative ? '−' : ''}${formatCurrency(Math.abs(value))}`}
      </span>
    </div>
  );
}

function BracketTable({ breakdown }) {
  if (!breakdown || breakdown.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgb(0_0_0_/0.04),0_1px_3px_0_rgb(0_0_0_/0.08)] border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h4 className="font-bold text-portal-navy tracking-tight">פירוט מדרגות מס</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-gray-100">
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">מדרגה</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">הכנסה חייבת</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">שיעור מס</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">מס במדרגה</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((b, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-[#FAFAFA] transition-colors duration-150">
                <td className="px-5 py-3 text-gray-600 tabular-nums whitespace-nowrap">
                  {formatCurrency(b.from)} – {b.to === Infinity ? 'ומעלה' : formatCurrency(b.to)}
                </td>
                <td className="px-5 py-3 text-portal-navy font-medium tabular-nums">
                  {formatCurrency(b.taxable)}
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-portal-navy/8 text-portal-navy">
                    <span className="w-1.5 h-1.5 rounded-full bg-portal-navy/40 inline-block" />
                    {(b.rate * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-5 py-3 text-left text-red-500 font-semibold tabular-nums">
                  {formatCurrency(b.tax)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function IncomeTaxCalculator() {
  const [form, setForm] = useState({
    monthlyIncome: '',
    monthlyExpenses: '',
    status: 'single',
    creditPoints: String(DEFAULT_CREDIT_POINTS.single),
    businessType: 'patur',
    hasAdditionalIncome: false,
    additionalIncome: '',
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [leadForm, setLeadForm] = useState({ name: '', phone: '' });
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const resultRef = useRef(null);

  const set = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      // Auto-set credit points when status changes
      if (key === 'status') {
        next.creditPoints = String(STATUS_CREDIT_POINTS[val] ?? DEFAULT_CREDIT_POINTS.single);
      }
      return next;
    });
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    const income = parseNumber(form.monthlyIncome);
    if (!form.monthlyIncome || income <= 0) e.monthlyIncome = 'יש להזין הכנסה חיובית';
    if (form.monthlyExpenses === '') e.monthlyExpenses = 'יש להזין סכום (או 0)';
    if (parseNumber(form.monthlyExpenses) < 0) e.monthlyExpenses = 'לא יכול להיות שלילי';
    const cp = parseNumber(form.creditPoints);
    if (cp < 0 || cp > 15) e.creditPoints = 'ערך לא תקין';
    if (form.hasAdditionalIncome) {
      const add = parseNumber(form.additionalIncome);
      if (!form.additionalIncome || add < 0) e.additionalIncome = 'יש להזין סכום תקין';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = calcIncomeTax({
      monthlyIncome: parseNumber(form.monthlyIncome),
      monthlyExpenses: parseNumber(form.monthlyExpenses),
      creditPoints: parseNumber(form.creditPoints),
      businessType: form.businessType,
      additionalIncome: form.hasAdditionalIncome ? parseNumber(form.additionalIncome) : 0,
    });
    setResult(res);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.name.trim() || !leadForm.phone.trim()) {
      toast.error('יש למלא שם וטלפון');
      return;
    }
    setLeadLoading(true);
    try {
      await supabase.from('leads').insert({
        name: leadForm.name.trim(),
        phone: leadForm.phone.trim(),
        source: 'tax_calculator',
        source_page: 'מחשבון מס לעצמאי',
        notes: result
          ? `הכנסה: ${result.monthlyIncome}₪, מס: ${result.monthlyTax}₪, נטו: ${result.monthlyNet}₪`
          : '',
      });
      setLeadSent(true);
      toast.success('פרטייך נשלחו בהצלחה — ניצור קשר בקרוב');
    } catch {
      toast.error('שגיאה בשליחה, אנא נסה שוב');
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      {/* Calculator Form Card */}
      <div className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgb(0_0_0_/0.04),0_4px_16px_-2px_rgb(0_0_0_/0.10)] border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-portal-navy to-portal-navy-light px-6 py-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calculator className="w-6 h-6 text-white" strokeWidth={1.75} />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              מחשבון מס הכנסה לעצמאי
            </h2>
          </div>
          <p className="text-white/75 text-sm">חישוב משוער לשנת המס {TAX_YEAR}</p>
        </div>

        <form onSubmit={handleCalculate} className="p-6 space-y-5">
          {/* Monthly Income */}
          <div>
            <Label className="mb-1.5 block text-portal-navy font-semibold text-sm">
              הכנסה חודשית לפני מס *
            </Label>
            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                value={form.monthlyIncome}
                onChange={(e) => set('monthlyIncome', e.target.value)}
                placeholder="לדוגמה 18,000"
                className={`h-12 rounded-xl text-base pr-4 pl-10 border-gray-200 focus:border-portal-teal focus:ring-portal-teal ${errors.monthlyIncome ? 'border-red-400' : ''}`}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
            </div>
            {errors.monthlyIncome && <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome}</p>}
          </div>

          {/* Monthly Expenses */}
          <div>
            <Label className="mb-1.5 block text-portal-navy font-semibold text-sm">
              הוצאות חודשיות מוכרות *
            </Label>
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

          {/* Marital Status */}
          <div>
            <Label className="mb-1.5 block text-portal-navy font-semibold text-sm">מצב משפחתי</Label>
            <Select value={form.status} onValueChange={(v) => set('status', v)}>
              <SelectTrigger className="h-12 rounded-xl text-base border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">רווק / רווקה</SelectItem>
                <SelectItem value="married">נשוי / נשואה</SelectItem>
                <SelectItem value="married_kids">נשוי / נשואה + ילדים</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Credit Points */}
          <div>
            <Label className="mb-1.5 block text-portal-navy font-semibold text-sm">
              נקודות זיכוי
              <span className="text-gray-400 text-xs font-normal mr-2">
                (מחושב אוטומטית לפי מצב משפחתי, ניתן לערוך)
              </span>
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
            <Label className="mb-1.5 block text-portal-navy font-semibold text-sm">סוג עוסק</Label>
            <Select value={form.businessType} onValueChange={(v) => set('businessType', v)}>
              <SelectTrigger className="h-12 rounded-xl text-base border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patur">עוסק פטור</SelectItem>
                <SelectItem value="murshe">עוסק מורשה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Income Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <Label className="text-portal-navy font-semibold text-sm cursor-pointer">
                יש לי הכנסה נוספת כשכיר
              </Label>
              <Switch
                checked={form.hasAdditionalIncome}
                onCheckedChange={(v) => set('hasAdditionalIncome', v)}
                aria-label="הכנסה נוספת כשכיר"
              />
            </div>

            {form.hasAdditionalIncome && (
              <div>
                <Label className="mb-1.5 block text-gray-600 font-medium text-sm">
                  הכנסה חודשית כשכיר
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={form.additionalIncome}
                    onChange={(e) => set('additionalIncome', e.target.value)}
                    placeholder="לדוגמה 8,000"
                    className={`h-12 rounded-xl text-base pr-4 pl-10 border-gray-200 focus:border-portal-teal focus:ring-portal-teal ${errors.additionalIncome ? 'border-red-400' : ''}`}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
                </div>
                {errors.additionalIncome && (
                  <p className="text-red-500 text-xs mt-1">{errors.additionalIncome}</p>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-sm bg-portal-teal hover:bg-portal-teal-dark hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 text-white"
          >
            <Calculator className="ml-2 h-5 w-5" strokeWidth={1.75} />
            חשב את מס ההכנסה שלי
          </Button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div ref={resultRef} className="mt-8 space-y-6">
          {/* Main Result Card */}
          <div className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgb(0_0_0_/0.04),0_4px_16px_-2px_rgb(0_0_0_/0.10)] border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-l from-portal-teal to-portal-teal-dark px-6 py-4 text-center">
              <h3 className="text-xl font-bold text-white tracking-tight">תוצאות חישוב המס</h3>
            </div>
            <div className="p-6">
              <ResultRow label="הכנסה חודשית" value={result.monthlyIncome} />
              <ResultRow label="הוצאות מוכרות" value={result.monthlyExpenses} negative />
              <ResultRow label="רווח חודשי לפני מס" value={result.monthlyProfit} />
              <ResultRow label="מס הכנסה חודשי" value={result.monthlyTax} negative />
              <ResultRow label="נשאר נטו (לפני ביטוח לאומי)" value={result.monthlyNet} highlight />

              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200/60 text-sm font-medium text-gray-600 tabular-nums">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  שיעור מס אפקטיבי: {result.effectiveRate}%
                </span>
              </div>

              <div className="mt-4 flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-xs text-gray-500 leading-relaxed">
                  המחשבון נותן הערכה כללית בלבד ואינו מהווה ייעוץ מס.
                </p>
              </div>
            </div>
          </div>

          {/* Bracket Breakdown */}
          {result.bracketBreakdown && result.bracketBreakdown.length > 0 && (
            <BracketTable breakdown={result.bracketBreakdown} />
          )}

          {/* Lead Capture Card */}
          <div className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgb(0_0_0_/0.04),0_4px_16px_-2px_rgb(0_0_0_/0.10)] border-2 border-portal-teal/20 overflow-hidden">
            <div className="p-6">
              {!leadSent ? (
                <>
                  <div className="mb-5">
                    <h4 className="text-lg font-bold text-portal-navy tracking-tight mb-1">
                      רוצה לבדוק אם אפשר לשלם פחות מס?
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      לפעמים ניתן לחסוך אלפי שקלים במס בעזרת תכנון נכון. השאר פרטים ונבדוק יחד.
                    </p>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-1.5 block text-gray-700 font-medium text-sm">שם מלא</Label>
                        <div className="relative">
                          <Input
                            type="text"
                            value={leadForm.name}
                            onChange={(e) => setLeadForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="ישראל ישראלי"
                            className="h-12 rounded-xl text-base pr-10 border-gray-200 focus:border-portal-teal focus:ring-portal-teal"
                          />
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.75} />
                        </div>
                      </div>
                      <div>
                        <Label className="mb-1.5 block text-gray-700 font-medium text-sm">טלפון</Label>
                        <div className="relative">
                          <Input
                            type="tel"
                            value={leadForm.phone}
                            onChange={(e) => setLeadForm(p => ({ ...p, phone: e.target.value }))}
                            placeholder="050-0000000"
                            className="h-12 rounded-xl text-base pr-10 border-gray-200 focus:border-portal-teal focus:ring-portal-teal"
                            dir="ltr"
                          />
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.75} />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={leadLoading}
                      className="w-full h-12 rounded-xl text-base font-bold bg-portal-teal hover:bg-portal-teal-dark active:scale-[0.98] transition-all duration-200 text-white disabled:opacity-60"
                    >
                      {leadLoading ? 'שולח...' : 'בדיקת חיסכון במס'}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-portal-teal/10 flex items-center justify-center mx-auto mb-3">
                    <Calculator className="w-6 h-6 text-portal-teal" strokeWidth={1.75} />
                  </div>
                  <h4 className="text-lg font-bold text-portal-navy mb-1">תודה, קיבלנו את הפרטים</h4>
                  <p className="text-sm text-gray-500">ניצור קשר בקרוב לבדיקת חיסכון במס</p>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-gray-400 leading-relaxed px-4">
            המחשבון נותן הערכה כללית בלבד ואינו מהווה ייעוץ מס. לחישוב מדויק יש להתייעץ עם רואה חשבון.
          </p>
        </div>
      )}
    </div>
  );
}
