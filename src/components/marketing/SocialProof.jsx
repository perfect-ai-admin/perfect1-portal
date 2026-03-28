import React from 'react';
import { User, Briefcase, Lightbulb, Rocket, Check } from 'lucide-react';

const audiences = [
  { icon: User, label: 'עצמאים' },
  { icon: Briefcase, label: 'עסקים קטנים' },
  { icon: Lightbulb, label: 'יזמים' },
  { icon: Rocket, label: 'סטארטאפים' },
];

const firstWeek = [
  'הגדרת מטרה ותוכנית פעולה ראשונית',
  'יצירת נכסי מיתוג בסיסיים (לוגו, כרטיס ביקור)',
  'הבנה של המצב הפיננסי הנוכחי',
];

export default function SocialProof() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* For Who */}
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              למי זה מתאים?
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {audiences.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm"
                >
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* First Week */}
          <div className="bg-emerald-50 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              מה תקבל בשבוע הראשון?
            </h3>
            <ul className="space-y-4">
              {firstWeek.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-emerald-700" />
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}