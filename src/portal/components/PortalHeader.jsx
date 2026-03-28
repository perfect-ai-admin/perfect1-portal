import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PORTAL_CATEGORIES, PORTAL_BRAND, PORTAL_CTA } from '../config/navigation';

export default function PortalHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/opening-business-israel" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-portal-teal to-portal-teal-dark rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">P</span>
          </div>
          <span className="font-bold text-xl text-portal-navy hidden sm:block">{PORTAL_BRAND.name}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {PORTAL_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={() => setOpenDropdown(cat.id)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                to={cat.href}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith(cat.href)
                    ? 'text-portal-teal bg-portal-teal/5'
                    : 'text-gray-700 hover:text-portal-navy hover:bg-gray-50'
                }`}
              >
                {cat.title}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === cat.id ? 'rotate-180' : ''}`} />
              </Link>

              {/* Dropdown */}
              {openDropdown === cat.id && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {cat.subcategories.map((sub) => (
                    <Link
                      key={sub.href}
                      to={sub.href}
                      className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-portal-teal/5 hover:text-portal-teal transition-colors"
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link to="/opening-business-israel#about" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-portal-navy">
            אודות
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a href={`tel:${PORTAL_CTA.phone}`}>
            <Button className="h-11 px-6 rounded-xl bg-portal-teal hover:bg-portal-teal-dark text-white font-bold text-sm shadow-sm">
              <Phone className="ml-2 h-4 w-4" />
              ייעוץ חינם
            </Button>
          </a>
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="p-2 text-portal-navy">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 overflow-y-auto" dir="rtl">
              <div className="p-6">
                {/* Mobile Logo */}
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-9 h-9 bg-gradient-to-br from-portal-teal to-portal-teal-dark rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-lg">P</span>
                  </div>
                  <span className="font-bold text-xl text-portal-navy">{PORTAL_BRAND.name}</span>
                </div>

                {/* Mobile Categories */}
                <nav className="space-y-4">
                  {PORTAL_CATEGORIES.map((cat) => (
                    <div key={cat.id}>
                      <Link
                        to={cat.href}
                        className="block text-lg font-bold text-portal-navy mb-2"
                        onClick={() => setMobileOpen(false)}
                      >
                        {cat.title}
                      </Link>
                      <div className="space-y-1 mr-4">
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.href}
                            to={sub.href}
                            className="block py-1.5 text-sm text-gray-500 hover:text-portal-teal"
                            onClick={() => setMobileOpen(false)}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>

                {/* Mobile CTA */}
                <div className="mt-8 space-y-3">
                  <a href={`tel:${PORTAL_CTA.phone}`} className="block">
                    <Button className="w-full h-12 rounded-xl bg-portal-teal hover:bg-portal-teal-dark text-white font-bold">
                      <Phone className="ml-2 h-5 w-5" />
                      התקשר עכשיו
                    </Button>
                  </a>
                  <a href={PORTAL_CTA.whatsapp} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full h-12 rounded-xl border-2 border-green-500 text-green-600 font-bold">
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
