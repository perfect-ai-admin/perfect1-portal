import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  CheckSquare, 
  Lightbulb, 
  BarChart3,
  Palette,
  FileText,
  Megaphone,
  Search,
  Receipt,
  PieChart,
  Calculator,
  ArrowLeft
} from 'lucide-react';

import { getSignupUrl } from '@/components/utils/tracking';

const SIGNUP_URL = "https://www.perfect1.co.il/login?from_url=https%3A%2F%2Fwww.perfect1.co.il%2FAPP"; // Fallback

const modules = [
  {
    title: 'מודול מנטורינג',
    subtitle: 'ניהול יעדים',
    description: 'ליווי והכוונה להגשמת היעדים שלך',
    color: 'violet',
    features: [
      { icon: Target, text: 'הגדרת יעדים + מעקב' },
      { icon: CheckSquare, text: 'משימות שבועיות' },
      { icon: Lightbulb, text: 'תובנות והמלצות' },
      { icon: BarChart3, text: 'דוחות התקדמות' },
    ],
  },
  {
    title: 'מודול שיווק',
    subtitle: 'קידום ומיתוג',
    description: 'כל הכלים לבניית נוכחות שיווקית',
    color: 'emerald',
    features: [
      { icon: Palette, text: 'מיתוג (לוגו/נראות)' },
      { icon: FileText, text: 'דפי נחיתה' },
      { icon: Megaphone, text: 'קמפיינים ותוכן' },
      { icon: Search, text: 'SEO ודוחות' },
    ],
  },
  {
    title: 'מודול פיננסי',
    subtitle: 'ניהול כספים',
    description: 'שליטה מלאה בכסף של העסק',
    color: 'blue',
    features: [
      { icon: Receipt, text: 'הפקת חשבוניות/קבלות' },
      { icon: PieChart, text: 'דוחות תזרים ורווח/הפסד' },
      { icon: Calculator, text: 'סדר פיננסי מלא' },
      { icon: BarChart3, text: 'תחזיות וניתוחים' },
    ],
  },
];

const colorClasses = {
  violet: {
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    icon: 'text-violet-600',
    badge: 'bg-violet-100 text-violet-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
};

export default function Modules() {
  const signupUrl = getSignupUrl();
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            3 מודולים שמחזיקים עסק
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            כל מה שעסק צריך כדי לצמוח – מטרות, שיווק וכספים
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const colors = colorClasses[module.color];
            return (
              <div
                key={index}
                className={`${colors.bg} border ${colors.border} rounded-2xl p-6 md:p-8 transition-all hover:shadow-lg`}
              >
                <div className={`${colors.badge} inline-block rounded-full px-3 py-1 text-xs font-medium mb-4`}>
                  {module.subtitle}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {module.title}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {module.description}
                </p>
                
                <ul className="space-y-3 mb-6">
                  {module.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${colors.icon}`}>
                        <feature.icon className="w-4 h-4" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                
                <a href={signupUrl}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center text-gray-700 hover:bg-white/50 rounded-xl h-11"
                  >
                    כניסה למערכת
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}