import React from 'react';

import { getSignupUrl } from '@/components/utils/tracking';

export default function Footer() {
  const SIGNUP_URL = getSignupUrl();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-bold text-lg text-gray-900">ClientDashboard</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              מערכת ניהול עסק מקיפה לעסקים קטנים, עצמאים ויזמים
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">מוצר</h4>
            <ul className="space-y-3">
              <li>
                <a href="/Features" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  תכונות
                </a>
              </li>
              <li>
                <a href="/Pricing" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  מחירים
                </a>
              </li>
              <li>
                <a href="/FAQ" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  שאלות נפוצות
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">משפטי</h4>
            <ul className="space-y-3">
              <li>
                <a href="/Privacy" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  מדיניות פרטיות
                </a>
              </li>
              <li>
                <a href="/Terms" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  תנאי שימוש
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">התחל עכשיו</h4>
            <a
              href={SIGNUP_URL}
              className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors shadow-lg shadow-violet-600/25"
            >
              כניסה למערכת
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} ClientDashboard. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}