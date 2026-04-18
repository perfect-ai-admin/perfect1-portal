import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Building2, AlertTriangle, Phone, User, ArrowDown, Trophy, TrendingUp, Briefcase } from 'lucide-react';
import { calcCompanyTax, COMPANY_TAX_CONFIG, TAX_YEAR } from './calcCompanyTax';
import CalcLeadPopup from './CalcLeadPopup';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';

const fmt = (n) => Math.round(n).toLocaleString('he-IL');

function FlowStep({ label, value, color = 'gray', icon }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    red: 'bg-red-50 border-red-200 text-red-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-800',
  };
  return (
    <div className={`rounded-xl border p-3 text-center ${colors[color]}`}>
      <div className="text-xs font-medium opacity-70">{label}</div>
      <div className="text-lg font-bold tabular-nums">{fmt(value)} ₪</div>
    </div>
  );
}

function ScenarioCard({ title, net, monthly, icon: Icon, highlight, tag }) {
  return (
    <div className={`rounded-xl border-2 p-4 text-center transition-all ${highlight ? 'border-portal-teal bg-teal-50 shadow-md scale-[1.02]' : 'border-gray-200 bg-white'}`}>
      {tag && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-portal-teal bg-teal-100 px-2 py-0.5 rounded-full mb-2"><Trophy className="w-3 h-3" />{tag}</span>}
      {Icon && <Icon className={`w-6 h-6 mx-auto mb-2 ${highlight ? 'text-portal-teal' : 'text-gray-400'}`} />}
      <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
      <div className={`text-2xl font-extrabold ${highlight ? 'text-portal-teal' : 'text-portal-navy'}`}>{fmt(net)} ₪</div>
      <div className="text-xs text-gray-400 mt-1">{fmt(monthly)} ₪ / חודש</div>
    </div>
  );
}

export default function CompanyTaxCalculator() {
  const [mode, setMode] = useState('annual'); // annual or monthly
  const [revenue, setRevenue] = useState('');
  const [expenses, setExpenses] = useState('');
  const [salary, setSalary] = useState('');
  const [wantDividend, setWantDividend] = useState(false);
  const [dividendAmt, setDividendAmt] = useState('');
  const [isControlling, setIsControlling] = useState(true);
  const [hasAdditional, setHasAdditional] = useState(false);
  const [additionalIncome, setAdditionalIncome] = useState('');

  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [leadSent, setLeadSent] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const resultRef = useRef(null);

  const handleCalc = (ev) => {
    ev.preventDefault();
    const rev = parseFloat(revenue);
    if (!revenue || isNaN(rev) || rev <= 0) { setErrors({ revenue: 'הזינו הכנסות' }); return; }
    setErrors({});

    const multiplier = mode === 'monthly' ? 12 : 1;
    const r = calcCompanyTax({
      annualRevenue: rev * multiplier,
      annualExpenses: (parseFloat(expenses) || 0) * multiplier,
      monthlySalary: parseFloat(salary) || 0,
      dividendAmount: wantDividend ? ((parseFloat(dividendAmt) || 0) * (mode === 'monthly' ? 12 : 1)) : 0,
      isControlling,
      additionalIncome: hasAdditional ? (parseFloat(additionalIncome) || 0) : 0,
    });
    setResult(r);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleLead = async () => {
    if (!leadName || !leadPhone) return toast.error('מלאו שם וטלפון');
    try {
      await supabase.from('leads').insert({
        name: leadName, phone: leadPhone,
        source: 'company_tax_calculator', source_page: 'מחשבון מיסוי חברה בעמ',
        notes: result ? `הכנסה: ${fmt(result.annualRevenue)}₪/שנה, מס חברות: ${fmt(result.corporateTax)}₪, נטו לבעלים: ${fmt(result.totalNetToOwner)}₪, ${result.comparison.betterLabel}` : '',
      });
      setLeadSent(true);
      toast.success('הפרטים נשלחו');
    } catch { toast.error('שגיאה'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CalcLeadPopup type="company-tax" />
      {/* Calculator Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-portal-navy to-[#2a4f7a] p-5 text-white">
          <div className="flex items-center gap-3">
            <Building2 className="w-7 h-7" strokeWidth={1.75} />
            <div>
              <h2 className="text-lg font-bold">מחשבון מיסוי לחברה בע"מ</h2>
              <p className="text-sm text-white/70">חישוב משוער לשנת המס {TAX_YEAR} · מס חברות {(COMPANY_TAX_CONFIG.corporateTaxRate * 100)}%</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCalc} className="p-5 space-y-4">
          {/* Mode toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 text-sm">
            <button type="button" onClick={() => setMode('annual')} className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === 'annual' ? 'bg-white shadow text-portal-navy' : 'text-gray-500'}`}>שנתי</button>
            <button type="button" onClick={() => setMode('monthly')} className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === 'monthly' ? 'bg-white shadow text-portal-navy' : 'text-gray-500'}`}>חודשי</button>
          </div>

          {/* Revenue */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">הכנסות {mode === 'monthly' ? 'חודשיות' : 'שנתיות'}</label>
            <div className="relative">
              <Input type="text" inputMode="numeric" placeholder="0" className="h-12 rounded-xl pr-10 text-lg"
                value={revenue} onChange={e => setRevenue(e.target.value.replace(/[^\d.]/g, ''))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
            </div>
            {errors.revenue && <p className="text-red-500 text-xs mt-1">{errors.revenue}</p>}
          </div>

          {/* Expenses */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">הוצאות מוכרות {mode === 'monthly' ? 'חודשיות' : 'שנתיות'} (ללא משכורת)</label>
            <div className="relative">
              <Input type="text" inputMode="numeric" placeholder="0" className="h-12 rounded-xl pr-10"
                value={expenses} onChange={e => setExpenses(e.target.value.replace(/[^\d.]/g, ''))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
            </div>
          </div>

          {/* Salary */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">משכורת חודשית לבעלים (ברוטו)</label>
            <div className="relative">
              <Input type="text" inputMode="numeric" placeholder="0" className="h-12 rounded-xl pr-10"
                value={salary} onChange={e => setSalary(e.target.value.replace(/[^\d.]/g, ''))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
            </div>
          </div>

          {/* Dividend */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-700">למשוך דיבידנד?</span>
            <Switch checked={wantDividend} onCheckedChange={setWantDividend} />
          </div>
          {wantDividend && (
            <div className="relative">
              <Input type="text" inputMode="numeric" placeholder={`סכום דיבידנד ${mode === 'monthly' ? 'חודשי' : 'שנתי'}`} className="h-12 rounded-xl pr-10"
                value={dividendAmt} onChange={e => setDividendAmt(e.target.value.replace(/[^\d.]/g, ''))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
            </div>
          )}

          {/* Controlling shareholder */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <span className="text-sm text-gray-700">בעל שליטה (מעל 10%)</span>
              <span className="text-xs text-gray-400 block">מס דיבידנד: {isControlling ? '30%' : '25%'}</span>
            </div>
            <Switch checked={isControlling} onCheckedChange={setIsControlling} />
          </div>

          {/* Additional income */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-700">הכנסות נוספות פרטיות (שנתי)</span>
            <Switch checked={hasAdditional} onCheckedChange={setHasAdditional} />
          </div>
          {hasAdditional && (
            <div className="relative">
              <Input type="text" inputMode="numeric" placeholder="הכנסה שנתית נוספת" className="h-12 rounded-xl pr-10"
                value={additionalIncome} onChange={e => setAdditionalIncome(e.target.value.replace(/[^\d.]/g, ''))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
            </div>
          )}

          <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold bg-portal-teal hover:bg-portal-teal/90">
            חשב מיסוי חברה
          </Button>
        </form>
      </div>

      {/* === RESULTS === */}
      {result && (
        <div ref={resultRef} className="space-y-6">

          {/* Money Flow Map */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-l from-indigo-600 to-indigo-500 p-4 text-white text-center">
              <p className="text-sm text-white/80">מפת הכסף של החברה שלך</p>
              <p className="text-3xl font-extrabold mt-1">{fmt(result.annualRevenue)} ₪ הכנסות</p>
            </div>
            <div className="p-5 space-y-2">
              <FlowStep label="הכנסות שנתיות" value={result.annualRevenue} color="blue" />
              <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-gray-300" /></div>
              <FlowStep label="הוצאות + עלות משכורת" value={result.annualExpenses + result.totalSalaryCostToCompany} color="red" />
              <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-gray-300" /></div>
              <FlowStep label="רווח לפני מס" value={result.profitBeforeTax} color="amber" />
              <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-gray-300" /></div>
              <FlowStep label={`מס חברות (${(result.corporateTaxRate * 100)}%)`} value={result.corporateTax} color="red" />
              <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-gray-300" /></div>
              <FlowStep label="רווח אחרי מס חברות" value={result.profitAfterTax} color="green" />
              {result.actualDividend > 0 && (
                <>
                  <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-gray-300" /></div>
                  <FlowStep label={`מס דיבידנד (${(result.dividendTaxRate * 100)}%)`} value={result.dividendTax} color="red" />
                </>
              )}
              <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-gray-300" /></div>
              <FlowStep label="נטו לבעלים (משכורת + דיבידנד)" value={result.totalNetToOwner} color="teal" />
            </div>
          </div>

          {/* 3 Scenarios — "מה הכי משתלם?" */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 text-center">
              <h3 className="font-bold text-portal-navy">מה הכי משתלם לך?</h3>
              <p className="text-xs text-gray-500">4 תרחישים למשיכת כסף מהחברה</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <ScenarioCard
                title="השאר בחברה"
                net={result.scenarios.keepInCompany}
                monthly={Math.round(result.scenarios.keepInCompany / 12)}
                icon={Building2}
                highlight={result.scenarios.bestMethod === 'keepInCompany'}
                tag={result.scenarios.bestMethod === 'keepInCompany' ? 'הכי משתלם' : null}
              />
              <ScenarioCard
                title="הכל כמשכורת"
                net={result.scenarios.allSalary}
                monthly={Math.round(result.scenarios.allSalary / 12)}
                icon={Briefcase}
                highlight={result.scenarios.bestMethod === 'allSalary'}
                tag={result.scenarios.bestMethod === 'allSalary' ? 'הכי משתלם' : null}
              />
              <ScenarioCard
                title="הכל כדיבידנד"
                net={result.scenarios.allDividend}
                monthly={Math.round(result.scenarios.allDividend / 12)}
                icon={TrendingUp}
                highlight={result.scenarios.bestMethod === 'allDividend'}
                tag={result.scenarios.bestMethod === 'allDividend' ? 'הכי משתלם' : null}
              />
              <ScenarioCard
                title="משכורת + דיבידנד"
                net={result.scenarios.optimal}
                monthly={Math.round(result.scenarios.optimal / 12)}
                icon={Trophy}
                highlight={result.scenarios.bestMethod === 'optimal'}
                tag={result.scenarios.bestMethod === 'optimal' ? 'הכי משתלם' : null}
              />
            </div>
            <div className="p-4 border-t bg-teal-50 text-center">
              <p className="text-sm text-portal-navy">
                <strong>המסלול המשתלם ביותר:</strong> {result.scenarios.bestLabel} — {fmt(result.scenarios.bestNet)} ₪ בשנה ({fmt(Math.round(result.scenarios.bestNet / 12))} ₪/חודש)
              </p>
            </div>
          </div>

          {/* Company vs Self-Employed */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 text-center">
              <h3 className="font-bold text-portal-navy">חברה בע"מ מול עוסק מורשה — השוואה</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className={`rounded-xl p-4 text-center border-2 ${result.comparison.betterOption === 'company' ? 'border-portal-teal bg-teal-50' : 'border-gray-200'}`}>
                {result.comparison.betterOption === 'company' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-portal-teal bg-teal-100 px-2 py-0.5 rounded-full mb-2"><Trophy className="w-3 h-3" />עדיף</span>}
                <Building2 className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                <div className="text-sm font-medium text-gray-500">חברה בע"מ</div>
                <div className="text-2xl font-extrabold text-portal-navy">{fmt(result.comparison.companyNet)} ₪</div>
                <div className="text-xs text-gray-400">נטו שנתי</div>
              </div>
              <div className={`rounded-xl p-4 text-center border-2 ${result.comparison.betterOption === 'selfEmployed' ? 'border-portal-teal bg-teal-50' : 'border-gray-200'}`}>
                {result.comparison.betterOption === 'selfEmployed' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-portal-teal bg-teal-100 px-2 py-0.5 rounded-full mb-2"><Trophy className="w-3 h-3" />עדיף</span>}
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <div className="text-sm font-medium text-gray-500">עוסק מורשה</div>
                <div className="text-2xl font-extrabold text-portal-navy">{fmt(result.comparison.selfEmployedNet)} ₪</div>
                <div className="text-xs text-gray-400">נטו שנתי</div>
              </div>
            </div>
            <div className="p-3 border-t text-center">
              <p className={`text-sm font-medium ${result.comparison.difference > 0 ? 'text-green-600' : result.comparison.difference < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {result.comparison.difference > 0
                  ? `חברה בע"מ חוסכת לך ${fmt(result.comparison.difference)} ₪ בשנה`
                  : result.comparison.difference < 0
                    ? `עוסק מורשה חוסך לך ${fmt(Math.abs(result.comparison.difference))} ₪ בשנה`
                    : 'ההבדל זניח'
                }
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-portal-navy mb-3">פירוט מלא</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between py-1.5"><span className="text-gray-600">הכנסות שנתיות</span><span className="font-medium">{fmt(result.annualRevenue)} ₪</span></div>
              <div className="flex justify-between py-1.5"><span className="text-gray-600">הוצאות</span><span className="text-red-600">−{fmt(result.annualExpenses)} ₪</span></div>
              <div className="flex justify-between py-1.5"><span className="text-gray-600">עלות משכורת לחברה</span><span className="text-red-600">−{fmt(result.totalSalaryCostToCompany)} ₪</span></div>
              <div className="flex justify-between py-1.5 border-t font-medium"><span>רווח לפני מס</span><span>{fmt(result.profitBeforeTax)} ₪</span></div>
              <div className="flex justify-between py-1.5"><span className="text-gray-600">מס חברות ({(result.corporateTaxRate * 100)}%)</span><span className="text-red-600">−{fmt(result.corporateTax)} ₪</span></div>
              <div className="flex justify-between py-1.5 font-medium"><span>רווח אחרי מס חברות</span><span className="text-green-600">{fmt(result.profitAfterTax)} ₪</span></div>
              {result.actualDividend > 0 && (
                <>
                  <div className="border-t my-2" />
                  <div className="flex justify-between py-1.5"><span className="text-gray-600">דיבידנד שנמשך</span><span>{fmt(result.actualDividend)} ₪</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-gray-600">מס דיבידנד ({(result.dividendTaxRate * 100)}%)</span><span className="text-red-600">−{fmt(result.dividendTax)} ₪</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-gray-600">נטו מדיבידנד</span><span className="text-green-600">{fmt(result.netDividend)} ₪</span></div>
                </>
              )}
              <div className="border-t my-2" />
              <div className="flex justify-between py-1.5"><span className="text-gray-600">נטו ממשכורת (שנתי)</span><span>{fmt(result.netSalaryAnnual)} ₪</span></div>
              <div className="flex justify-between py-1.5"><span className="text-gray-600">נשאר בחברה</span><span>{fmt(result.remainingInCompany)} ₪</span></div>
              <div className="flex justify-between py-2 border-t-2 border-portal-teal mt-2 text-base">
                <span className="font-bold text-portal-navy">סה"כ נטו לבעלים</span>
                <span className="font-extrabold text-xl text-portal-teal">{fmt(result.totalNetToOwner)} ₪</span>
              </div>
              <div className="text-center text-xs text-gray-400 mt-1">שיעור מס אפקטיבי כולל: {result.effectiveRate}%</div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-portal-navy mb-2">איך החישוב בוצע?</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              המחשבון מחשב קודם את הרווח של החברה (הכנסות פחות הוצאות ועלות משכורת), ואז מחיל מס חברות של {(COMPANY_TAX_CONFIG.corporateTaxRate * 100)}%.
              על דיבידנד — מס של {(COMPANY_TAX_CONFIG.dividendTaxRateControlling * 100)}% (בעל שליטה) או {(COMPANY_TAX_CONFIG.dividendTaxRate * 100)}%.
              על משכורת — מס הכנסה לפי מדרגות + ביטוח לאומי + הפרשות לפנסיה.
            </p>
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl mt-3">
              <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500">חישוב הערכה בלבד. התוצאה בפועל תלויה בהוצאות ספציפיות, הפרשות פנסיוניות, קרן השתלמות ופרמטרים נוספים. לחישוב מדויק פנו לרואה חשבון.</p>
            </div>
          </div>

          {/* Lead Form */}
          {!leadSent ? (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-portal-teal/20 overflow-hidden">
              <div className="p-5 text-center">
                <h3 className="text-lg font-bold text-portal-navy mb-1">רוצה לבדוק אם באמת משתלם לך לפתוח חברה?</h3>
                <p className="text-sm text-gray-500 mb-4">לפעמים ההבדל בין עוסק מורשה לחברה שווה עשרות אלפי שקלים בשנה. בדיקה ראשונית בחינם.</p>
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
                    בדיקת כדאיות אישית
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center">
              <p className="text-green-700 font-medium">הפרטים נשלחו! ניצור קשר בהקדם.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
