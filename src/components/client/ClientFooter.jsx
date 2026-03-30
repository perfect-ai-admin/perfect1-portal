import React from 'react';
import { Link } from 'react-router-dom';

export default function ClientFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto print:hidden" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">פרפקט וואן</span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span>המערכת החכמה לניהול העסק</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/About" className="hover:text-blue-600 transition-colors">אודות</Link>
            <Link to="/Terms" className="hover:text-blue-600 transition-colors">תנאי שימוש</Link>
            <Link to="/Privacy" className="hover:text-blue-600 transition-colors">מדיניות פרטיות</Link>
            <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">תמיכה טכנית</a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-gray-400 text-center">
          <span>פרפקט וואן — ח.פ 516309747</span>
          <span className="hidden sm:inline">|</span>
          <a href="tel:0502277087" className="hover:text-gray-600 transition-colors">טלפון: 050-227-7087</a>
          <span className="hidden sm:inline">|</span>
          <a href="mailto:yositaxes@gmail.com" className="hover:text-gray-600 transition-colors">yositaxes@gmail.com</a>
        </div>

        <p className="text-xs text-gray-300 text-center leading-relaxed">
          האתר מופעל על ידי חברה פרטית המספקת שירותי ייעוץ וליווי עסקי.
          האתר אינו אתר ממשלתי ואינו פועל מטעם רשות המסים, מע״מ או ביטוח לאומי.
        </p>

        <div className="text-xs text-gray-400 text-center">
          © {currentYear} פרפקט וואן. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
}