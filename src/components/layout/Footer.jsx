import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Phone, MessageCircle, Mail, MapPin, Clock, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1E3A5F] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="text-[#D4AF37] font-bold text-xl">P1</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">פרפקט וואן</h3>
                <p className="text-sm text-gray-300">המרכז לעוסקים פטורים</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              המרכז הארצי לעוסקים פטורים בישראל. פותחים כ-2,000 עוסקים פטורים בשנה עם ליווי מקצועי מא' ועד ת'.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-[#D4AF37]">קישורים מהירים</h4>
            <ul className="space-y-3">
              <li>
                <Link to={createPageUrl('Home')} className="text-gray-300 hover:text-white transition-colors">
                  דף הבית
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Professions')} className="text-gray-300 hover:text-white transition-colors">
                  מקצועות
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Pricing')} className="text-gray-300 hover:text-white transition-colors">
                  מחירון
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('About')} className="text-gray-300 hover:text-white transition-colors">
                  אודות
                </Link>
              </li>

              <li>
                <Link to={createPageUrl('Methodology')} className="text-gray-300 hover:text-white transition-colors">
                  המתודולוגיה
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Regulation')} className="text-gray-300 hover:text-white transition-colors">
                  רגולציה
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Contact')} className="text-gray-300 hover:text-white transition-colors">
                  צור קשר
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Terms')} className="text-gray-300 hover:text-white transition-colors">
                  תנאי שימוש
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Privacy')} className="text-gray-300 hover:text-white transition-colors">
                  פרטיות
                </Link>
              </li>
              </ul>
              </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-[#D4AF37]">שירותים</h4>
            <ul className="space-y-3">
              <li>
                <Link to={createPageUrl('ServicePage') + '?service=ptihat-osek-patur'} className="text-gray-300 hover:text-white transition-colors">
                  פתיחת עוסק פטור
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('ServicePage') + '?service=ptihat-osek-patur-online'} className="text-gray-300 hover:text-white transition-colors">
                  פתיחת עוסק אונליין
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('ServicePage') + '?service=doch-shnati'} className="text-gray-300 hover:text-white transition-colors">
                  דוח שנתי
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('ServicePage') + '?service=livui-chodshi'} className="text-gray-300 hover:text-white transition-colors">
                  ליווי חודשי
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-[#D4AF37]">צור קשר</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:0502277087" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>0502277087</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/972502277087"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <span>וואטסאפ</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span>א'-ה' 9:00-18:00</span>
              </li>
              <li>
                <a 
                  href="https://maps.google.com/?q=Perfect+One+Israel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>גוגל מפות</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-white/10 bg-[#152842]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <p className="text-yellow-400 font-semibold text-sm md:text-base">
              ⚠️ השירות ניתן על ידי גורם פרטי לצורכי ייעוץ וליווי בלבד.<br />
              האתר אינו אתר ממשלתי!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} פרפקט וואן - המרכז לעוסקים פטורים. כל הזכויות שמורות.
              </p>
              <a 
                href="https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D4AF37] hover:text-white text-sm font-medium transition-colors"
              >
                ⭐ דרגו אותנו בגוגל
              </a>
            </div>
            <Button
              onClick={scrollToTop}
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}