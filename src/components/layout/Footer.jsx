import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Phone, MessageCircle, Mail, MapPin, Clock, ArrowUp, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1E3A5F] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#D4AF37] font-bold text-lg md:text-xl">P1</span>
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg">פרפקט וואן</h3>
                <p className="text-xs md:text-sm text-gray-300">ח.פ: 516309747</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-3">
              פרפקט וואן היא חברה פרטית המספקת ייעוץ וליווי בפתיחת עסקים בישראל.
            </p>
            <p className="text-gray-400 text-xs leading-relaxed">
              האתר אינו אתר ממשלתי ואינו פועל מטעם רשות כלשהי. השירות ניתן ע״י גורם פרטי.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-base md:text-lg mb-4 md:mb-6 text-[#D4AF37]">קישורים מהירים</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link to={createPageUrl('Home')} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  דף הבית
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Professions')} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  מקצועות
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Pricing')} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  מחירון
                </Link>
              </li>
              <li className="hidden md:block">
                <Link to={createPageUrl('About')} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  אודות
                </Link>
              </li>

              <li className="hidden md:block">
                <Link to={createPageUrl('Methodology')} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  המתודולוגיה
                </Link>
              </li>
              <li className="hidden lg:block">
                <Link to={createPageUrl('Regulation')} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  רגולציה
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Contact')} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  צור קשר
                </Link>
              </li>
              <li className="hidden md:block">
                <Link to={createPageUrl('Terms')} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  תנאי שימוש
                </Link>
              </li>
              <li className="hidden md:block">
                <Link to={createPageUrl('Privacy')} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  פרטיות
                </Link>
              </li>
              </ul>
              </div>

          {/* Services */}
          <div className="hidden md:block">
            <h4 className="font-bold text-base md:text-lg mb-4 md:mb-6 text-[#D4AF37]">שירותים</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link to={createPageUrl('ServicePage') + '?service=ptihat-osek-patur'} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  פתיחת עוסק פטור
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('ServicePage') + '?service=ptihat-osek-patur-online'} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  פתיחת עוסק אונליין
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('ServicePage') + '?service=doch-shnati'} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  דוח שנתי
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('ServicePage') + '?service=livui-chodshi'} className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  ליווי חודשי
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-base md:text-lg mb-4 md:mb-6 text-[#D4AF37]">צור קשר</h4>
            <ul className="space-y-3 md:space-y-4">
              <li>
                <a href="tel:0502277087" className="flex items-center gap-2 md:gap-3 text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <span>0502277087</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/972502277087"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 md:gap-3 text-gray-300 hover:text-white transition-colors text-sm md:text-base"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-[#25D366]" />
                  </div>
                  <span>וואטסאפ</span>
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/perfectone_is"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 md:gap-3 text-gray-300 hover:text-white transition-colors text-sm md:text-base"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#0088cc]/20 flex items-center justify-center flex-shrink-0">
                    <Send className="w-3 h-3 md:w-4 md:h-4 text-[#0088cc]" />
                  </div>
                  <span>ערוץ טלגרם - טיפים וכלים לעצמאים</span>
                </a>
              </li>
              <li className="flex items-center gap-2 md:gap-3 text-gray-300 text-sm md:text-base">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                </div>
                <span>א'-ה' 9:00-18:00</span>
              </li>
              <li className="hidden md:block">
                <a 
                  href="https://maps.google.com/?q=Perfect+One+Israel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 md:gap-3 text-gray-300 hover:text-white transition-colors text-sm md:text-base"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <span>גוגל מפות</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>



      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
              <p className="text-gray-400 text-xs md:text-sm">
                © {new Date().getFullYear()} פרפקט וואן - כל הזכויות שמורות.
              </p>
              <a 
                href="https://g.page/r/CfGNIjNs_YVeEBM/review"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D4AF37] hover:text-white text-xs md:text-sm font-medium transition-colors"
              >
                ⭐ דרגו אותנו
              </a>
            </div>
            <Button
              onClick={scrollToTop}
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/10 hover:bg-white/20 text-white h-8 w-8 md:h-10 md:w-10"
            >
              <ArrowUp className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}