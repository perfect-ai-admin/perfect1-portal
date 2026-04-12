import React, { useState, useRef } from 'react';
import { Award, ChevronLeft, ChevronRight, AlertTriangle, Sparkles, TrendingUp, Check, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateCreditPoints } from './calcCreditPoints';
import { CREDIT_POINT_MONTHLY_VALUE } from './creditPointsConfig';

const formatCurrency = (num) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(num);

const TOTAL_STEPS = 6;

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i < current ? 'bg-portal-teal w-8' : i === current ? 'bg-portal-navy w-10' : 'bg-gray-200 w-6'
          }`}
        />
      ))}
    </div>
  );
}

function Checkbox({ checked, onChange, label, sublabel }) {
  return (
    <label className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-portal-teal/40 transition-colors">
      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-portal-teal border-portal-teal' : 'border-gray-300'}`}>
        {checked && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <div>
        <span className="text-sm font-medium text-portal-navy">{label}</span>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    </label>
  );
}

function RadioGroup({ value, onChange, options }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
            value === opt.value
              ? 'border-portal-teal bg-portal-teal/5 text-portal-teal'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <input type="radio" value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} className="sr-only" />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function ChildAgeInput({ ages, onChange }) {
  const addChild = () => onChange([...ages, 5]);
  const removeChild = (i) => onChange(ages.filter((_, idx) => idx !== i));
  const setAge = (i, age) => {
    const next = [...ages];
    next[i] = Math.max(0, Math.min(18, Number(age) || 0));
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {ages.map((age, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-sm text-gray-500 w-16 flex-shrink-0">ילד/ה {i + 1}</span>
          <Input
            type="number"
            min={0}
            max={18}
            value={age}
            onChange={(e) => setAge(i, e.target.value)}
            className="h-10 rounded-xl text-center w-20 border-gray-200"
            inputMode="numeric"
          />
          <span className="text-xs text-gray-400">שנים</span>
          {ages.length > 1 && (
            <button onClick={() => removeChild(i)} className="text-red-400 hover:text-red-500 p-1">
              <Minus className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {ages.length < 10 && (
        <button
          type="button"
          onClick={addChild}
          className="flex items-center gap-1.5 text-sm text-portal-teal hover:text-portal-teal-dark font-medium mt-2"
        >
          <Plus className="w-4 h-4" />
          הוסף ילד/ה
        </button>
      )}
    </div>
  );
}

export default function CreditPointsCalculator() {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  const [form, setForm] = useState({
    monthlyIncome: '',
    incomeType: 'selfEmployed',
    gender: 'male',
    isResident: true,
    maritalStatus: 'single',
    spouseWorks: false,
    spouseGetsChildPoints: false,
    childrenAges: [],
    isSingleParent: false,
    specialStatus: { newImmigrant: false, returningResident: false, releasedSoldier: false, nationalService: false },
    education: { bachelor: false, master: false, phd: false, vocational: false },
    disabilities: { hasDisability: false, percent: 0, blind: false, specialNeedsChild: false },
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const setNested = (parent, key, val) =>
    setForm(prev => ({ ...prev, [parent]: { ...prev[parent], [key]: val } }));

  const canProceed = () => {
    if (step === 0 && (!form.monthlyIncome || Number(form.monthlyIncome) <= 0)) return false;
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
    } else {
      // Calculate
      const res = calculateCreditPoints({
        monthlyIncome: Number(form.monthlyIncome) || 0,
        incomeType: form.incomeType,
        gender: form.gender,
        isResident: form.isResident,
        maritalStatus: form.maritalStatus,
        spouseWorks: form.spouseWorks,
        spouseGetsChildPoints: form.spouseGetsChildPoints,
        childrenAges: form.childrenAges,
        isSingleParent: form.isSingleParent,
        specialStatus: form.specialStatus,
        education: form.education,
        disabilities: form.disabilities,
      });
      setResult(res);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  };

  const handleBack = () => step > 0 && setStep(s => s - 1);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-portal-navy">פרטים בסיסיים</h3>
            <div>
              <Label className="mb-1.5 block text-portal-navy font-medium">הכנסה חודשית ברוטו *</Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={form.monthlyIncome}
                  onChange={(e) => set('monthlyIncome', e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="לדוגמה 15,000"
                  className="h-12 rounded-xl text-base pr-4 pl-10 border-gray-200 focus:border-portal-teal focus:ring-portal-teal"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₪</span>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-portal-navy font-medium">סוג הכנסה</Label>
              <RadioGroup
                value={form.incomeType}
                onChange={(v) => set('incomeType', v)}
                options={[
                  { value: 'employee', label: 'שכיר/ה' },
                  { value: 'selfEmployed', label: 'עצמאי/ת' },
                ]}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-portal-navy font-medium">מגדר</Label>
              <RadioGroup
                value={form.gender}
                onChange={(v) => set('gender', v)}
                options={[
                  { value: 'male', label: 'גבר' },
                  { value: 'female', label: 'אישה' },
                ]}
              />
              {form.gender === 'female' && (
                <p className="text-xs text-portal-teal mt-2">נשים מקבלות חצי נקודת זיכוי נוספת</p>
              )}
            </div>
            <Checkbox
              checked={form.isResident}
              onChange={(e) => set('isResident', e.target.checked)}
              label="תושב/ת ישראל"
              sublabel="2.25 נקודות זיכוי בסיסיות"
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-portal-navy">מצב משפחתי</h3>
            <div>
              <Label className="mb-1.5 block text-portal-navy font-medium">סטטוס</Label>
              <Select value={form.maritalStatus} onValueChange={(v) => set('maritalStatus', v)}>
                <SelectTrigger className="h-12 rounded-xl text-base border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">רווק/ה</SelectItem>
                  <SelectItem value="married">נשוי/אה</SelectItem>
                  <SelectItem value="divorced">גרוש/ה</SelectItem>
                  <SelectItem value="widowed">אלמן/ה</SelectItem>
                  <SelectItem value="commonLaw">ידועים בציבור</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(form.maritalStatus === 'married' || form.maritalStatus === 'commonLaw') && (
              <>
                <Checkbox
                  checked={form.spouseWorks}
                  onChange={(e) => set('spouseWorks', e.target.checked)}
                  label="בן/בת הזוג עובד/ת"
                />
                <Checkbox
                  checked={form.spouseGetsChildPoints}
                  onChange={(e) => set('spouseGetsChildPoints', e.target.checked)}
                  label="בן/בת הזוג מקבל/ת נקודות זיכוי על הילדים"
                  sublabel="אם כן, הנקודות יחולקו"
                />
              </>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-portal-navy">ילדים</h3>
            <div>
              <Label className="mb-2 block text-portal-navy font-medium">כמה ילדים יש לך?</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => set('childrenAges', form.childrenAges.slice(0, -1))}
                  disabled={form.childrenAges.length === 0}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-portal-teal disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-bold text-portal-navy w-10 text-center">{form.childrenAges.length}</span>
                <button
                  type="button"
                  onClick={() => set('childrenAges', [...form.childrenAges, 5])}
                  disabled={form.childrenAges.length >= 10}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-portal-teal disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            {form.childrenAges.length > 0 && (
              <>
                <div>
                  <Label className="mb-2 block text-portal-navy font-medium">גיל כל ילד/ה</Label>
                  <ChildAgeInput ages={form.childrenAges} onChange={(a) => set('childrenAges', a)} />
                </div>
                <Checkbox
                  checked={form.isSingleParent}
                  onChange={(e) => set('isSingleParent', e.target.checked)}
                  label="הורה יחיד/נית"
                  sublabel="נקודת זיכוי נוספת"
                />
              </>
            )}
            {form.childrenAges.length === 0 && (
              <p className="text-sm text-gray-400">אם אין ילדים, אפשר להמשיך לשלב הבא.</p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-portal-navy">סטטוס מיוחד</h3>
            <p className="text-sm text-gray-500">סמנו את מה שרלוונטי:</p>
            <Checkbox
              checked={form.specialStatus.newImmigrant}
              onChange={(e) => setNested('specialStatus', 'newImmigrant', e.target.checked)}
              label="עולה חדש/ה"
              sublabel="3 נקודות ב-18 חודשים הראשונים"
            />
            <Checkbox
              checked={form.specialStatus.returningResident}
              onChange={(e) => setNested('specialStatus', 'returningResident', e.target.checked)}
              label="תושב/ת חוזר/ת"
              sublabel="נקודת זיכוי ל-2 שנים"
            />
            <Checkbox
              checked={form.specialStatus.releasedSoldier}
              onChange={(e) => setNested('specialStatus', 'releasedSoldier', e.target.checked)}
              label="חייל/ת משוחרר/ת"
              sublabel="2 נקודות ל-3 שנים לאחר השחרור"
            />
            <Checkbox
              checked={form.specialStatus.nationalService}
              onChange={(e) => setNested('specialStatus', 'nationalService', e.target.checked)}
              label="שירות לאומי"
              sublabel="נקודת זיכוי ל-3 שנים"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-portal-navy">לימודים ותארים</h3>
            <p className="text-sm text-gray-500">סמנו תארים שסיימתם (בשנים האחרונות):</p>
            <Checkbox
              checked={form.education.bachelor}
              onChange={(e) => setNested('education', 'bachelor', e.target.checked)}
              label="תואר ראשון"
              sublabel="נקודת זיכוי אחת"
            />
            <Checkbox
              checked={form.education.master}
              onChange={(e) => setNested('education', 'master', e.target.checked)}
              label="תואר שני"
              sublabel="חצי נקודת זיכוי"
            />
            <Checkbox
              checked={form.education.phd}
              onChange={(e) => setNested('education', 'phd', e.target.checked)}
              label="תואר שלישי (דוקטורט)"
              sublabel="נקודת זיכוי אחת"
            />
            <Checkbox
              checked={form.education.vocational}
              onChange={(e) => setNested('education', 'vocational', e.target.checked)}
              label="תעודת הנדסאי / מקצועי"
              sublabel="נקודת זיכוי אחת"
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-portal-navy">זכויות מיוחדות</h3>
            <Checkbox
              checked={form.disabilities.hasDisability}
              onChange={(e) => setNested('disabilities', 'hasDisability', e.target.checked)}
              label="נכות מוכרת (90%+)"
              sublabel="2 נקודות זיכוי"
            />
            <Checkbox
              checked={form.disabilities.blind}
              onChange={(e) => setNested('disabilities', 'blind', e.target.checked)}
              label="עיוורון"
              sublabel="2 נקודות זיכוי"
            />
            <Checkbox
              checked={form.disabilities.specialNeedsChild}
              onChange={(e) => setNested('disabilities', 'specialNeedsChild', e.target.checked)}
              label="ילד/ה עם צרכים מיוחדים"
              sublabel="נקודת זיכוי נוספת"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Calculator Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-portal-navy to-portal-navy-light px-6 py-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-6 h-6 text-white" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">מחשבון נקודות זיכוי</h2>
          </div>
          <p className="text-white/80 text-sm">שלב {step + 1} מתוך {TOTAL_STEPS}</p>
        </div>

        <div className="p-6">
          <StepIndicator current={step} total={TOTAL_STEPS} />

          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0}
              className="text-gray-500 disabled:opacity-30"
            >
              <ChevronRight className="ml-1 w-4 h-4" />
              הקודם
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="h-12 px-8 rounded-2xl text-base font-bold shadow-lg bg-portal-teal hover:bg-portal-teal-dark text-white disabled:opacity-50"
            >
              {step === TOTAL_STEPS - 1 ? (
                <>
                  <Award className="ml-2 w-5 h-5" />
                  חשב נקודות זיכוי
                </>
              ) : (
                <>
                  הבא
                  <ChevronLeft className="mr-1 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div ref={resultRef} className="mt-8 space-y-6">
          {/* Main Result */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-l from-portal-teal to-portal-teal-dark px-6 py-5 text-center">
              <p className="text-white/80 text-sm mb-1">מגיעות לכם</p>
              <p className="text-5xl font-extrabold text-white">{result.totalPoints}</p>
              <p className="text-white/80 text-lg mt-1">נקודות זיכוי</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Savings highlight */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                  <p className="text-sm text-gray-500 mb-1">חיסכון חודשי</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(result.monthlySaving)}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                  <p className="text-sm text-gray-500 mb-1">חיסכון שנתי</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(result.annualSaving)}</p>
                </div>
              </div>

              {/* Tax comparison */}
              {result.monthlyIncome > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">מס לפני נקודות זיכוי</span>
                    <span className="text-red-500 font-medium">{formatCurrency(result.monthlyTaxBefore)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">מס אחרי נקודות זיכוי</span>
                    <span className="text-portal-teal font-bold">{formatCurrency(result.monthlyTaxAfter)}</span>
                  </div>
                </div>
              )}

              {/* Breakdown table */}
              <div>
                <h4 className="font-bold text-portal-navy text-sm mb-3">פירוט נקודות</h4>
                <div className="space-y-1">
                  {result.breakdown.map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{row.source}</span>
                      <span className="font-bold text-portal-navy">{row.points}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2 px-3 bg-portal-navy/5 rounded-lg border border-portal-navy/10">
                    <span className="font-bold text-portal-navy">סה״כ</span>
                    <span className="font-extrabold text-portal-teal text-lg">{result.totalPoints}</span>
                  </div>
                </div>
              </div>

              {/* Short disclaimer */}
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500">
                  החישוב הוא משוער בלבד ואינו מהווה ייעוץ מקצועי.
                </p>
              </div>
            </div>
          </div>

          {/* Upsell — missed credits */}
          <div className="bg-gradient-to-bl from-amber-50 to-white rounded-2xl border border-amber-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-portal-navy text-lg">ייתכן שמגיע לכם יותר</h4>
                <p className="text-sm text-gray-600 mt-1">
                  הרבה ישראלים לא מקבלים את כל נקודות הזיכוי שמגיעות להם. בדיקה עם יועץ מס יכולה לחשוף:
                </p>
              </div>
            </div>
            <ul className="space-y-2 mb-4 mr-9">
              {['נקודות זיכוי נוספות שלא ידעתם עליהן', 'החזרי מס עד 6 שנים אחורה', 'הטבות והפחתות שלא נוצלו'].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            {result.monthlyIncome >= 12000 && (
              <div className="p-3 bg-white rounded-xl border border-amber-100 mb-4 text-center">
                <p className="text-sm text-gray-500">ייתכן שמגיע לכם החזר מס של</p>
                <p className="text-2xl font-bold text-portal-navy">3,000–15,000 ₪</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
