import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Phone, MessageCircle, ChevronDown } from 'lucide-react';
import { trackPhoneClick, trackWhatsAppClick } from '../tracking/EventTracker';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'פתיחת עוסק פטור', href: createPageUrl('OsekPaturLanding') },
    { name: 'פתיחת עוסק אונליין', href: createPageUrl('OsekPaturOnlineLanding') },
    { name: 'ליווי חודשי', href: createPageUrl('ServicePage') + '?service=livui-chodshi' },
    { name: 'דוח שנתי', href: createPageUrl('ServicePage') + '?service=doch-shnati' },
    { name: 'אפליקציה לעצמאים', href: createPageUrl('InvoicesAppLanding') },
    { name: '💰 כמה עולה לפתוח עוסק?', href: createPageUrl('PricingLanding') },
    { name: '🚨 צריך חשבונית עכשיו?', href: createPageUrl('UrgentInvoice') },
    { name: 'כל השירותים', href: createPageUrl('Services') }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-lg border-b border-gray-100'
          : 'bg-white/95 backdrop-blur-md shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Clickable */}
          <Link 
            to={createPageUrl('Home')} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-md">
              <span className="text-white font-black text-2xl">P1</span>
            </div>
            <div>
              <h1 className="font-black text-xl text-[#1E3A5F] leading-tight">פרפקט וואן</h1>
              <p className="text-xs text-gray-500 font-medium">המרכז לעוסקים פטורים</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link
              to={createPageUrl('Home')}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              דף הבית
            </Link>

            <Link
              to={createPageUrl('Blog')}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              בלוג
            </Link>
            
            <Link
              to={createPageUrl('Professions')}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              מקצועות
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all">
                שירותים
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {menuItems.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link 
                      to={item.href}
                      className="cursor-pointer text-base"
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to={createPageUrl('Pricing')}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              מחירון
            </Link>

            <Link
              to={createPageUrl('About')}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              מי אנחנו
            </Link>

            <Link
              to={createPageUrl('Contact')}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              צור קשר
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            {/* Mobile CTA Buttons - Show on all screens */}
            <a
              href="tel:0502277087"
              className="sm:hidden"
              onClick={() => trackPhoneClick('header_mobile')}
            >
              <Button 
                variant="outline" 
                size="icon"
                className="border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white h-10 w-10 rounded-lg"
              >
                <Phone className="w-5 h-5" />
              </Button>
            </a>

            <a
              href="https://wa.me/972502277087?text=היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden"
              onClick={() => trackWhatsAppClick('header_mobile', 'היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור')}
            >
              <Button 
                size="icon"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white h-10 w-10 rounded-lg shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </a>

            {/* Desktop CTA Buttons */}
            <a
              href="tel:0502277087"
              className="hidden md:flex"
              onClick={() => trackPhoneClick('header')}
            >
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white font-bold rounded-xl px-6 h-12 shadow-sm"
              >
                <Phone className="w-5 h-5 ml-2" />
                <span className="text-base">0502277087</span>
              </Button>
            </a>

            <a
              href="https://wa.me/972502277087?text=היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex"
              onClick={() => trackWhatsAppClick('header', 'היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור')}
            >
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white font-bold rounded-xl px-6 h-12 shadow-lg hover:shadow-xl transition-all"
              >
                <MessageCircle className="w-5 h-5 ml-2" />
                <span className="text-base">וואטסאפ</span>
              </Button>
            </a>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="relative">
                  <Menu className="w-6 h-6 text-[#1E3A5F]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                        <span className="text-white font-bold">P1</span>
                      </div>
                      <div>
                        <h2 className="font-bold text-[#1E3A5F]">פרפקט וואן</h2>
                        <p className="text-xs text-gray-500">המרכז לעוסקים פטורים</p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="flex-1 p-6 overflow-y-auto">
                    <ul className="space-y-2">
                      <li>
                        <Link
                          to={createPageUrl('Home')}
                          onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          דף הבית
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={createPageUrl('Blog')}
                          onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          בלוג
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={createPageUrl('Professions')}
                          onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          מקצועות
                        </Link>
                      </li>
                      <li>
                        <div className="px-4 py-2 text-gray-400 text-sm font-semibold">שירותים</div>
                        <ul className="mr-4 space-y-1">
                          {menuItems.map((item) => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center py-2 px-4 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-[#1E3A5F] transition-all"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li>
                        <Link
                          to={createPageUrl('Pricing')}
                          onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          מחירון
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={createPageUrl('About')}
                          onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          מי אנחנו
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={createPageUrl('Contact')}
                          onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          צור קשר
                        </Link>
                      </li>
                    </ul>
                  </nav>
                  
                  <div className="p-6 border-t bg-gray-50 space-y-3">
                    <a href="tel:0502277087" className="block" onClick={() => trackPhoneClick('mobile_menu')}>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="w-full border-2 border-[#1E3A5F] text-[#1E3A5F] font-bold h-14 text-lg"
                      >
                        <Phone className="w-5 h-5 ml-2" />
                        0502277087
                      </Button>
                    </a>
                    <a
                      href="https://wa.me/972502277087?text=היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      onClick={() => trackWhatsAppClick('mobile_menu', 'היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור')}
                    >
                      <Button 
                        size="lg"
                        className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white font-bold h-14 text-lg shadow-lg"
                      >
                        <MessageCircle className="w-5 h-5 ml-2" />
                        שלח וואטסאפ
                      </Button>
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}