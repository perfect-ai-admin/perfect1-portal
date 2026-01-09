import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';
import SEOOptimized from './SEOOptimized';

export default function Regulation() {
  return (
    <>
      <SEOOptimized
        title="רגולציה והחוקים | Perfect One"
        description="מידע על החוקים והרגולציה לעוסקים פטורים בישראל"
        canonical="https://perfect1.co.il/Regulation"
      />
      <main className="pt-32 min-h-screen bg-gradient-to-b from-[#F8F9FA] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-4">רגולציה והחוקים</h1>
            <p className="text-xl text-gray-600">
              כל מה שצריך לדעת על חוקים וקנויות לעוסקים פטורים בישראל
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg space-y-8"
          >
            <section>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#27AE60]" />
                תקרת הכנסה
              </h2>
              <p className="text-gray-600">
                תקרת ההכנסה השנתית לעוסק פטור עומדת על 120,000 שקל לשנה קלנדרית.
                אם אתה צפוי להרוויח יותר, כדאי לפתוח עוסק מורשה.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#27AE60]" />
                דיווח למס הכנסה
              </h2>
              <p className="text-gray-600">
                עוסק פטור חייב להגיש דוח שנתי למס הכנסה בתוך 3 חודשים מסיום שנת המס.
                הדיווח כולל הכנסות והוצאות מוכרות.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#27AE60]" />
                ביטוח לאומי
              </h2>
              <p className="text-gray-600">
                עוסק פטור חייב להירשם בביטוח לאומי ולשלם דמי ביטוח חודשיים.
                זה מכסה גמלאות, אובדן כושר עבודה ושירותי בריאות.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                חשוב לדעת
              </h2>
              <p className="text-gray-600">
                אם אתה עובר את תקרת ההכנסה או משנה סוג הפעילות, חוב לדווח למס הכנסה בהקדם.
                עוברות עלויות תוספיות וכי יכול להוביל לשיקום או קנסות.
              </p>
            </section>
          </motion.div>
        </div>
      </main>
    </>
  );
}