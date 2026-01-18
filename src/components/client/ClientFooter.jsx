import React from 'react';
import { Link } from 'react-router-dom';

export default function ClientFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">PerfectBiz AI</span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span>המערכת החכמה לניהול העסק</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/Terms" className="hover:text-blue-600 transition-colors">תנאי שימוש</Link>
            <Link to="/Privacy" className="hover:text-blue-600 transition-colors">מדיניות פרטיות</Link>
            <a href="https://wa.me/972500000000" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">תמיכה טכנית</a>
          </div>
          
          <div className="text-xs text-gray-400 dir-ltr">
            © {currentYear} All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
}