import React, { useState, useMemo } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULTS = {
  shareholders: 1,
  customArticles: false,
  accountant: true,
  bankAccount: true,
};

export default function CostCalculator({ section }) {
  const [options, setOptions] = useState(DEFAULTS);
  const [open, setOpen] = useState(true);

  const costs = useMemo(() => {
    const items = [];

    // Registration fee
    items.push({ label: 'אגרת רישום ברשם החברות', min: 2145, max: 2634, note: 'מקוון / ידני' });

    // Lawyer — always needed for signature verification
    if (options.customArticles) {
      items.push({ label: 'עורך דין (תקנון מותאם + אימות)', min: 3000, max: 5000 });
    } else {
      items.push({ label: 'עורך דין (אימות חתימות בלבד)', min: 500, max: 1500 });
    }

    // Extra shareholders cost
    if (options.shareholders > 1) {
      items.push({ label: `הסכם מייסדים (${options.shareholders} שותפים)`, min: 3000, max: 8000 });
    }

    // Stamp
    items.push({ label: 'חותמת חברה', min: 100, max: 300 });

    // Accountant setup
    if (options.accountant) {
      items.push({ label: 'הקמה אצל רו"ח (חד-פעמי)', min: 1000, max: 3000 });
    }

    const totalMin = items.reduce((s, i) => s + i.min, 0);
    const totalMax = items.reduce((s, i) => s + i.max, 0);

    return { items, totalMin, totalMax };
  }, [options]);

  const toggle = (key) => setOptions(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div id={section?.id} className="scroll-mt-24">
      {section?.title && <h2 className="portal-h2 mb-4">{section.title}</h2>}
      {section?.description && <p className="portal-body mb-6">{section.description}</p>}

      <div className="bg-white rounded-2xl border-2 border-portal-teal/20 overflow-hidden shadow-sm">
        {/* Header */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-l from-portal-teal/5 to-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-portal-teal/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-portal-teal" />
            </div>
            <span className="font-bold text-lg text-portal-navy">מחשבון עלויות הקמה</span>
          </div>
          {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {open && (
          <div className="px-5 sm:px-6 pb-6">
            {/* Options */}
            <div className="grid sm:grid-cols-2 gap-4 py-5 border-b border-gray-100">
              {/* Shareholders */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">מספר בעלי מניות</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      onClick={() => setOptions(prev => ({ ...prev, shareholders: n, customArticles: n > 1 ? true : prev.customArticles }))}
                      className={`w-12 h-10 rounded-lg border-2 font-bold text-sm transition-all ${
                        options.shareholders === n
                          ? 'border-portal-teal bg-portal-teal/10 text-portal-teal'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {n}{n === 3 ? '+' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <ToggleOption
                  label="תקנון מותאם אישית"
                  checked={options.customArticles}
                  onChange={() => toggle('customArticles')}
                  hint={options.shareholders > 1 ? 'מומלץ עם שותפים' : ''}
                />
                <ToggleOption
                  label="הקמה אצל רואה חשבון"
                  checked={options.accountant}
                  onChange={() => toggle('accountant')}
                />
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="mt-5 space-y-2.5">
              {costs.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-portal-navy tabular-nums">
                    {item.min.toLocaleString()}₪ – {item.max.toLocaleString()}₪
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-5 pt-4 border-t-2 border-portal-teal/20 flex items-center justify-between">
              <span className="text-lg font-bold text-portal-navy">סה"כ משוער</span>
              <span className="text-2xl font-extrabold text-portal-teal tabular-nums">
                {costs.totalMin.toLocaleString()}₪ – {costs.totalMax.toLocaleString()}₪
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-2 text-center">* הסכומים הם הערכה בלבד ועשויים להשתנות</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleOption({ label, checked, onChange, hint }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={onChange}
        className={`w-10 h-6 rounded-full transition-colors relative ${checked ? 'bg-portal-teal' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'right-0.5' : 'right-[18px]'}`} />
      </div>
      <span className="text-sm text-gray-700 group-hover:text-portal-navy transition-colors">
        {label}
        {hint && <span className="text-xs text-portal-teal mr-1">({hint})</span>}
      </span>
    </label>
  );
}
