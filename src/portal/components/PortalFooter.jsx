import React from 'react';
import { Link } from 'react-router-dom';
import { PORTAL_CATEGORIES, PORTAL_BRAND, PORTAL_CTA } from '../config/navigation';
import { Phone, Mail, MessageCircle } from 'lucide-react';

export default function PortalFooter() {
  return (
    <footer className="bg-portal-navy text-white" dir="rtl">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-portal-teal to-portal-teal-light rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">P</span>
              </div>
              <span className="font-bold text-xl">{PORTAL_BRAND.name}</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              מרכז מידע מקצועי לפתיחה, ניהול וסגירת עסקים בישראל. ליווי אישי מהרגע הראשון.
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <a href={`tel:${PORTAL_CTA.phone}`} className="flex items-center gap-2 hover:text-portal-teal transition-colors">
                <Phone className="w-4 h-4" /> {PORTAL_CTA.phone}
              </a>
              <a href={`mailto:${PORTAL_CTA.email}`} className="flex items-center gap-2 hover:text-portal-teal transition-colors">
                <Mail className="w-4 h-4" /> {PORTAL_CTA.email}
              </a>
            </div>
          </div>

          {/* Category Columns */}
          {PORTAL_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <Link to={cat.href} className="font-bold text-base mb-3 block hover:text-portal-teal transition-colors">
                {cat.title}
              </Link>
              <ul className="space-y-2">
                {cat.subcategories.map((sub) => (
                  <li key={sub.href}>
                    <Link
                      to={sub.href}
                      className="text-sm text-white/50 hover:text-portal-teal transition-colors"
                    >
                      {sub.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} {PORTAL_BRAND.name}. כל הזכויות שמורות.
          </p>
          <div className="flex items-center gap-4 text-sm text-white/40">
            <Link to="/Privacy" className="hover:text-white/70 transition-colors">מדיניות פרטיות</Link>
            <Link to="/Terms" className="hover:text-white/70 transition-colors">תנאי שימוש</Link>
            <span>שירות פרטי — לא אתר ממשלתי</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
