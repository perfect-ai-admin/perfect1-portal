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

  const services = [
    { name: 'פתיחת עוסק פטור', href: createPageUrl('ServicePage') + '?service=ptihat-osek-patur' },
    { name: 'פתיחת עוסק אונליין', href: createPageUrl('ServicePage') + '?service=ptihat-osek-patur-online' },
    { name: 'ליווי חודשי', href: createPageUrl('ServicePage') + '?service=livui-chodshi' },
    { name: 'דוח שנתי', href: createPageUrl('ServicePage') + '?service=doch-shnati' },
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
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              דף הבית
            </Link>
            
            <Link
              to={createPageUrl('Professions')}
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
                {services.map((service) => (
                  <DropdownMenuItem key={service.name} asChild>
                    <Link 
                      to={service.href}
                      className="cursor-pointer text-base"
                    >
                      {service.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to={createPageUrl('Pricing')}
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              מחירון
            </Link>

            <Link
              to={createPageUrl('About')}
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              מי אנחנו
            </Link>

            <Link
              to={createPageUrl('Contact')}
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              צור קשר
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="tel:0502277087"
              className="hidden md:flex"
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
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          דף הבית
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={createPageUrl('Professions')}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          מקצועות
                        </Link>
                      </li>
                      <li>
                        <div className="px-4 py-2 text-gray-400 text-sm font-semibold">שירותים</div>
                        <ul className="mr-4 space-y-1">
                          {services.map((service) => (
                            <li key={service.name}>
                              <Link
                                to={service.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center py-2 px-4 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-[#1E3A5F] transition-all"
                              >
                                {service.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li>
                        <Link
                          to={createPageUrl('Pricing')}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          מחירון
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={createPageUrl('About')}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          מי אנחנו
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={createPageUrl('Contact')}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          צור קשר
                        </Link>
                      </li>
                    </ul>
                  </nav>
                  
                  <div className="p-6 border-t bg-gray-50 space-y-3">
                    <a href="tel:0502277087" className="block">
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