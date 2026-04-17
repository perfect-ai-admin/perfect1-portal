import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Shield, AlertTriangle, Phone, User, TrendingUp, ChevronDown } from 'lucide-react';
import { calcNationalInsurance, calcComparisonTable, NI_CONFIG, TAX_YEAR } from './calcNationalInsurance';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';

const fmt = (n) => Math.round(n).toLocaleString('he-IL');

function ResultRow({ label, value, negative, highlight, suffix = '₪' }) {
  return (
    <div className={`flex items-center justify-between py-2.5 px-1 ${highlight ? 'border-t-2 border-portal-teal pt-4 mt-2' : ''}`}>
      <span className={`text-sm ${highlight ? 'font-bold text-portal-navy text-base' : 'text-gray-600'}`}>{label}</span>
      <span className={`font-semibold tabular-nums ${highlight ? 'text-xl text-portal-teal' : negative ? 'text-red-600' : 'text-portal-navy'}`}>
        {negative && !highlight ? '−' : ''}{fmt(Math.abs(value))} {suffix}
      </span>
    </div>
  );
}

export default function NationalInsuranceCalculator() {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [businessType, setBusinessType] = useState('patur');
  const [activeMonths, setActiveMonths] = useState('12');
  const [hasAdditional, setHasAdditional] = useState(false);
  const [additionalIncome, setAdditionalIncome] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [leadSent, setLeadSent] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const resultRef = useRef(null);

  const validate = () => {
    const e = {};
    const inc = parseFloat(income);
    if (!income || isNaN(inc) || inc <= 0) e.income = 'הזינו הכנסה חודשית';
    return e;
  };

  const handleCalc = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const r = calcNationalInsurance({
      monthlyIncome: parseFloat(income),
      monthlyExpenses: parseFloat(expenses) || 0,
      businessType,
      activeMonths: parseInt(activeMonths) || 12,
      additionalIncome: hasAdditional ? (parseFloat(additionalIncome) || 0) : 0,
      isNewBusiness: isNew,
    });
    setResult(r);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleLead = async () => {
    if (!leadName || !leadPhone) return toast.error('אנא מלאו שם וטלפון');
    try {
      await supabase.from('leads').insert({
        name: leadName, phone: leadPhone,
        source: 'ni_calculator', source_page: 'מחשבון ביטוח לאומי',
        notes: result ? `הכנסה: ${result.monthlyIncome}₪, ביטוח לאומי: ${result.monthlyTotal}₪/חודש, נשאר: ${result.monthlyRemaining}₪` : '',
      });
      setLeadSent(true);
      toast.success('הפרטים נשלחו בהצלחה');
    } catch { toast.error('שגיאה בשליחה'); }
  };

  const comparison = showComparison ? calcComparisonTable(parseFloat(expenses) || 0) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Calculator Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-portal-navy to-[#2a4f7a] p-5 text-white">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7" strokeWidth={1.75} />
            <div>
              <h2 className="text-lg font-bold">מחשבון ביטוח לאומי לעצמאי</h2>
              <p className="text-sm text-white/70">חישוב משוער לשנת המס {TAX_YEAR}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCalc} className="p-5 space-y-4">
          {/* Income */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">הכנסה חודשית לפני מס</label>
            <div className="relative">
              <Input type="text" inputMode="numeric" placeholder="0" className="h-12 rounded-xl pr-10 text-lg"
                value={income} onChange={e => setIncome(e.target.value.replace(/[^\d.]/g, ''))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
            </div>
            {errors.income && <p className="text-red-500 text-xs mt-1">{errors.income}</p>}
          </div>

          {/* Expenses */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">הוצאות חודשיות מוכרות</label>
            <div className="relative">
              <Input type="text" inputMode="numeric" placeholder="0" className="h-12 rounded-xl pr-10"
                value={expenses} onChange={e => setExpenses(e.target.value.replace(/[^\d.]/g, ''))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Business Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">סוג עוסק</label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="patur">עוסק פטור</SelectItem>
                  <SelectItem value="murshe">עוסק מורשה</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Months */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">חודשי פעילות בשנה</label>
              <Select value={activeMonths} onValueChange={setActiveMonths}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[12,11,10,9,8,7,6,5,4,3,2,1].map(m => <SelectItem key={m} value={String(m)}>{m} חודשים</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Income */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-700">יש לי הכנסה נוספת כשכיר</span>
            <Switch checked={hasAdditional} onCheckedChange={setHasAdditional} />
          </div>
          {hasAdditional && (
            <div className="relative">
              <Input type="text" inputMode="numeric" placeholder="הכנסה חודשית נוספת" className="h-12 rounded-xl pr-10"
                value={additionalIncome} onChange={e => setAdditionalIncome(e.target.value.replace(/[^\d.]/g, ''))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
            </div>
          )}

          {/* New Business */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-700">אני בתחילת פעילות כעצמאי</span>
            <Switch checked={isNew} onCheckedChange={setIsNew} />
          </div>

          <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold bg-portal-teal hover:bg-portal-teal/90">
            חשב ביטוח לאומי
          </Button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div ref={resultRef} className="space-y-6">
          {/* Main Result Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-l from-portal-teal to-emerald-500 p-5 text-white text-center">
              <p className="text-sm text-white/80 mb-1">הערכת ביטוח לאומי ומס בריאות שלך:</p>
              <p className="text-4xl font-extrabold">{fmt(result.monthlyTotal)} ₪</p>
              <p className="text-sm text-white/70 mt-1">לחודש | {fmt(result.annualTotal)} ₪ בשנה</p>
            </div>

            <div className="p-5">
              <ResultRow label="הכנסה חודשית" value={result.monthlyIncome} />
              <ResultRow label="הוצאות מוכרות" value={result.monthlyExpenses} negative />
              <ResultRow label="רווח חודשי" value={result.monthlyProfit} />
              <div className="border-t my-2" />
              <ResultRow label="ביטוח לאומי" value={result.monthlyNI} negative />
              <ResultRow label="מס בריאות" value={result.monthlyHealth} negative />
              <ResultRow label="סה״כ ביטוח לאומי + מס בריאות" value={result.monthlyTotal} negative />
              <ResultRow label="נשאר לאחר ביטוח לאומי" value={result.monthlyRemaining} highlight />

              <div className="text-center mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${parseFloat(result.effectiveRate) > 12 ? 'bg-red-400' : parseFloat(result.effectiveRate) > 8 ? 'bg-amber-400' : 'bg-green-400'}`} />
                  שיעור אפקטיבי: {result.effectiveRate}%
                </span>
              </div>

              {/* Rate Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-800">
                <p className="font-medium mb-1">פירוט שיעורים:</p>
                <p>ביטוח לאומי: {(result.niReducedRate * 100).toFixed(2)}% על {fmt(NI_CONFIG.reducedThreshold)} ₪ הראשונים{!result.isReducedOnly && ` + ${(result.niFullRate * 100).toFixed(2)}% על היתרה`}</p>
                <p>מס בריאות: {(result.healthReducedRate * 100).toFixed(2)}% על {fmt(NI_CONFIG.reducedThreshold)} ₪ הראשונים{!result.isReducedOnly && ` + ${(result.healthFullRate * 100).toFixed(2)}% על היתרה`}</p>
                {result.isMaxed && <p className="text-amber-700 mt-1">ההכנסה שלך מעל תקרת ביטוח לאומי ({fmt(NI_CONFIG.maxInsurableIncome)} ₪/חודש) — התשלום מחושב עד התקרה בלבד.</p>}
              </div>

              {/* Disclaimer */}
              <div className="mt-3 flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500">חישוב משוער בלבד. התוצאה בפועל תלויה בדיווחים, מעמד בביטוח לאומי, הכנסות נוספות וגורמים אישיים. לחישוב מדויק פנו לרואה חשבון.</p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-portal-navy mb-2">איך החישוב בוצע?</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              החישוב מבוסס על הרווח החודשי שלך (הכנסה פחות הוצאות). ביטוח לאומי לעצמאים מחושב ב-2 מדרגות:
              עד {fmt(NI_CONFIG.reducedThreshold)} ₪ — שיעור מופחת ({((NI_CONFIG.niReducedRate + NI_CONFIG.healthReducedRate) * 100).toFixed(2)}%),
              ומעל — שיעור מלא ({((NI_CONFIG.niFullRate + NI_CONFIG.healthFullRate) * 100).toFixed(2)}%).
              התקרה לחישוב: {fmt(NI_CONFIG.maxInsurableIncome)} ₪ לחודש.
            </p>
          </div>

          {/* Comparison Toggle */}
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-portal-navy font-medium hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-portal-teal" />
            השוואה בין הכנסות שונות
            <ChevronDown className={`w-4 h-4 transition-transform ${showComparison ? 'rotate-180' : ''}`} />
          </button>

          {showComparison && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-portal-navy text-sm">כמה ביטוח לאומי משלמים לפי רמות הכנסה?</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-portal-navy text-white">
                    <tr>
                      <th className="p-3 text-right">הכנסה</th>
                      <th className="p-3 text-right">רווח</th>
                      <th className="p-3 text-right">ביט״ל</th>
                      <th className="p-3 text-right">בריאות</th>
                      <th className="p-3 text-right">סה״כ</th>
                      <th className="p-3 text-right">שיעור</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 font-medium">{fmt(row.income)} ₪</td>
                        <td className="p-3">{fmt(row.profit)} ₪</td>
                        <td className="p-3 text-red-600">{fmt(row.ni)} ₪</td>
                        <td className="p-3 text-red-600">{fmt(row.health)} ₪</td>
                        <td className="p-3 font-bold">{fmt(row.total)} ₪</td>
                        <td className="p-3">{row.effectiveRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Lead Form */}
          {!leadSent ? (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-portal-teal/20 overflow-hidden">
              <div className="p-5 text-center">
                <h3 className="text-lg font-bold text-portal-navy mb-1">רוצה לבדוק אם אפשר לשלם פחות?</h3>
                <p className="text-sm text-gray-500 mb-4">לפעמים מבנה עסקי נכון, הוצאות מוכרות או תכנון נכון יכולים לחסוך אלפי שקלים בשנה.</p>
                <div className="space-y-3 max-w-sm mx-auto">
                  <div className="relative">
                    <Input placeholder="שם" className="h-12 rounded-xl pr-10" value={leadName} onChange={e => setLeadName(e.target.value)} />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <div className="relative">
                    <Input placeholder="טלפון" type="tel" className="h-12 rounded-xl pr-10" value={leadPhone} onChange={e => setLeadPhone(e.target.value)} />
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <Button onClick={handleLead} className="w-full h-12 rounded-xl font-bold bg-portal-teal hover:bg-portal-teal/90">
                    בדיקה אישית לחיסכון
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
              <p className="text-green-700 font-medium">הפרטים נשלחו בהצלחה! ניצור אתכם קשר בהקדם.</p>
            </div>
          )}

          {/* Secondary CTA */}
          <div className="bg-portal-bg rounded-2xl p-5 text-center">
            <h3 className="font-bold text-portal-navy mb-1">לא בטוח אם עדיף לך להישאר עוסק או לעבור למבנה אחר?</h3>
            <p className="text-sm text-gray-500 mb-3">אם ההכנסה שלך עולה, ייתכן שמבנה עסקי אחר יהיה משתלם יותר.</p>
            <Button variant="outline" className="rounded-xl" onClick={() => window.location.href = '/hevra-bam/transition'}>
              בדוק כדאיות עם איש מקצוע
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
