import React from 'react';
import { Link } from 'react-router-dom';
import { PORTAL_CATEGORIES, PORTAL_BRAND, PORTAL_CTA } from '../config/navigation';
import { Phone, Mail, MessageCircle } from 'lucide-react';

export default function PortalFooter() {
  return (
    <footer className="bg-portal-navy text-white" dir="rtl">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1">
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

      {/* Disclaimer */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-xs text-white/30 text-center leading-relaxed">
            האתר מופעל על ידי חברה פרטית המספקת שירותי ייעוץ וליווי עסקי.
            האתר אינו אתר ממשלתי ואינו פועל מטעם רשות המסים, מע״מ או ביטוח לאומי.
          </p>
        </div>
      </div>

      {/* Company Info */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-white/40 text-center">
            <span>פרפקט וואן — ח.פ 516309747</span>
            <span className="hidden sm:inline">|</span>
            <a href="tel:0502277087" className="hover:text-white/70 transition-colors">טלפון: 050-227-7087</a>
            <span className="hidden sm:inline">|</span>
            <a href="mailto:yositaxes@gmail.com" className="hover:text-white/70 transition-colors">yositaxes@gmail.com</a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/40 text-center md:text-right">
            © {new Date().getFullYear()} {PORTAL_BRAND.name}. כל הזכויות שמורות.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm text-white/40">
            <Link to="/About" className="hover:text-white/70 transition-colors">אודות</Link>
            <Link to="/Privacy" className="hover:text-white/70 transition-colors">מדיניות פרטיות</Link>
            <Link to="/Terms" className="hover:text-white/70 transition-colors">תנאי שימוש</Link>
            <Link to="/Accessibility" className="hover:text-white/70 transition-colors">הצהרת נגישות</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
