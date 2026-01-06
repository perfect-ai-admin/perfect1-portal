import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Phone, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'בית', href: createPageUrl('Home') },
    { name: 'מקצועות', href: createPageUrl('Professions') },
    { name: 'שירותים', href: createPageUrl('Services') },
    { name: 'מחירון', href: createPageUrl('Pricing') },
    { name: 'אודות', href: createPageUrl('About') },
    { name: 'צור קשר', href: createPageUrl('Contact') },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-elegant'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">P1</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-[#1E3A5F]">פרפקט וואן</h1>
              <p className="text-xs text-gray-500">הבית לעצמאים</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-gray-700 hover:text-[#1E3A5F] font-medium transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="tel:0502277087"
              className="hidden md:flex items-center gap-2 text-[#1E3A5F] hover:text-[#D4AF37] transition-colors font-medium"
            >
              <Phone className="w-4 h-4" />
              <span>0502277087</span>
            </a>
            
            <a
              href="https://wa.me/972502277087?text=היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex"
            >
              <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 rounded-full px-5">
                <MessageCircle className="w-4 h-4" />
                וואטסאפ
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
                        <p className="text-xs text-gray-500">הבית לעצמאים</p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="flex-1 p-6">
                    <ul className="space-y-4">
                      {navLinks.map((link) => (
                        <li key={link.name}>
                          <Link
                            to={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-medium transition-all"
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  
                  <div className="p-6 border-t bg-gray-50 space-y-3">
                    <a href="tel:0502277087" className="block">
                      <Button variant="outline" className="w-full gap-2">
                        <Phone className="w-4 h-4" />
                        0502277087
                      </Button>
                    </a>
                    <a
                      href="https://wa.me/972502277087?text=היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2">
                        <MessageCircle className="w-4 h-4" />
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