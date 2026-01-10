import React, { useState } from 'react';

export default function SalesAgentHandbook() {
  const [openSection, setOpenSection] = useState(null);

  return (
    <div dir="rtl" className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">חוברת הדרכה לסוכן מכירות</h1>
      
      <div className="max-w-4xl mx-auto space-y-4">
        
        <div className="border border-gray-300 rounded">
          <button 
            onClick={() => setOpenSection(openSection === 1 ? null : 1)}
            className="w-full bg-gray-900 text-white p-4 font-bold text-left hover:bg-gray-800"
          >
            🎯 מטרת התפקיד שלך
          </button>
          {openSection === 1 && (
            <div className="p-6 bg-gray-50">
              <p className="mb-4">אתה לא מוכר מוצר. אתה נותן לאנשים <strong>שקט, ביטחון וראש שקט</strong> מול הרשויות.</p>
              <ul className="space-y-2 text-sm">
                <li>• מפחד מטעויות</li>
                <li>• לא מבין מס</li>
                <li>• לא רוצה הסתבכויות</li>
                <li>• מרגיש לבד בעסק</li>
              </ul>
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded">
          <button 
            onClick={() => setOpenSection(openSection === 2 ? null : 2)}
            className="w-full bg-gray-900 text-white p-4 font-bold text-left hover:bg-gray-800"
          >
            🧠 איך לחשוב נכון כמוכר
          </button>
          {openSection === 2 && (
            <div className="p-6 bg-gray-50 space-y-4">
              <div className="bg-red-50 p-3 rounded border-l-4 border-red-600">
                <p className="font-bold text-sm mb-1">❌ מה לא להגיד:</p>
                <p className="text-sm">"אנחנו מוכרים דוח שנתי"</p>
              </div>
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-600">
                <p className="font-bold text-sm mb-1">✅ מה כן להגיד:</p>
                <p className="text-sm">"אנחנו לוקחים אחריות"</p>
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded">
          <button 
            onClick={() => setOpenSection(openSection === 3 ? null : 3)}
            className="w-full bg-gray-900 text-white p-4 font-bold text-left hover:bg-gray-800"
          >
            💬 משפטי מפתח שמוכרים נכון
          </button>
          {openSection === 3 && (
            <div className="p-6 bg-gray-50 space-y-2">
              <p className="text-sm">"המטרה שלנו זה שלא תצטרך לחשוב על מסים בכלל"</p>
              <p className="text-sm">"רוב הלקוחות שלנו באו אלינו אחרי טעויות שהם לא ידעו שעשו"</p>
              <p className="text-sm">"יש לך גם מלווה חכם שמלווה אותך ביום־יום"</p>
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded">
          <button 
            onClick={() => setOpenSection(openSection === 4 ? null : 4)}
            className="w-full bg-gray-900 text-white p-4 font-bold text-left hover:bg-gray-800"
          >
            🛑 התנגדויות נפוצות
          </button>
          {openSection === 4 && (
            <div className="p-6 bg-gray-50 space-y-4">
              <div>
                <p className="font-bold text-sm mb-1">❓ "אני יכול לעשות את זה לבד"</p>
                <p className="text-sm">✅ נכון, אבל השאלה אם שווה לקחת את הסיכון מול רשויות המס – ועוד לבד.</p>
              </div>
              <div>
                <p className="font-bold text-sm mb-1">❓ "זה יקר לי"</p>
                <p className="text-sm">✅ טעויות במסים עולות הרבה יותר. כאן אתה קונה שקט וליווי חכם.</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-900 text-white p-6 rounded mt-8">
          <h3 className="text-lg font-bold mb-3">🧠 משפט הזהב לסיום שיחה</h3>
          <p>"המטרה שלנו היא שתוכל להתעסק בעסק שלך – ואנחנו נדאג לשקט, לסדר, וגם לעזור לך להתקדם."</p>
        </div>

      </div>
    </div>
  );
}