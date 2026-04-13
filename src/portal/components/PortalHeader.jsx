import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone, MessageCircle, FileText, Briefcase, Building2, FolderX, BookOpen, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PORTAL_CATEGORIES, PORTAL_BRAND, PORTAL_CTA } from '../config/navigation';

const ICONS = { FileText, Briefcase, Building2, FolderX, BookOpen, Calculator };

const COLOR_DOTS = {
  teal: 'bg-teal-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
};

export default function PortalHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [expandedMobileCat, setExpandedMobileCat] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setExpandedMobileCat(null);
  }, [location.pathname]);

  const toggleMobileCat = (catId) => {
    setExpandedMobileCat(prev => prev === catId ? null : catId);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 md:h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/opening-business-israel" className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-portal-teal to-portal-teal-dark rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-base sm:text-lg">P</span>
          </div>
          <span className="font-bold text-lg sm:text-xl text-portal-navy">{PORTAL_BRAND.name}</span>
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
                <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                    <p className="text-xs text-gray-500 font-medium">{cat.description}</p>
                  </div>
                  {cat.subcategories.map((sub) => (
                    <Link
                      key={sub.href}
                      to={sub.href}
                      className="block px-4 py-2.5 hover:bg-portal-teal/5 transition-colors group"
                    >
                      <span className="block text-sm font-medium text-gray-700 group-hover:text-portal-teal">{sub.title}</span>
                      {sub.description && (
                        <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">{sub.description}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link to="/About" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-portal-navy">
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

        {/* Mobile: CTA + Menu */}
        <div className="lg:hidden flex items-center gap-2">
          <a href={`tel:${PORTAL_CTA.phone}`} aria-label="התקשר אלינו" className="flex items-center justify-center w-9 h-9 rounded-full bg-portal-teal text-white">
            <Phone className="w-4 h-4" />
          </a>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button aria-label="פתח תפריט ניווט" className="p-2 text-portal-navy">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm p-0 overflow-y-auto" dir="rtl">
              {/* Mobile Header */}
              <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-portal-teal to-portal-teal-dark rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-base">P</span>
                  </div>
                  <span className="font-bold text-lg text-portal-navy">{PORTAL_BRAND.name}</span>
                </div>
              </div>

              {/* Mobile Categories — Accordion Style */}
              <nav className="px-5 py-4">
                {PORTAL_CATEGORIES.map((cat) => {
                  const Icon = ICONS[cat.icon] || FileText;
                  const isExpanded = expandedMobileCat === cat.id;
                  const isActive = location.pathname.startsWith(cat.href);

                  return (
                    <div key={cat.id} className="border-b border-gray-100 last:border-b-0">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleMobileCat(cat.id)}
                        className={`w-full flex items-center gap-3 py-3.5 transition-colors ${
                          isActive ? 'text-portal-teal' : 'text-portal-navy'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-portal-teal/10' : 'bg-gray-50'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-right">
                          <span className="block text-base font-bold">{cat.title}</span>
                          <span className="block text-xs text-gray-500 mt-0.5">{cat.description}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Subcategories - expandable */}
                      {isExpanded && (
                        <div className="pb-3 mr-12 space-y-0.5">
                          <Link
                            to={cat.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 px-3 rounded-lg text-sm font-bold text-portal-teal bg-portal-teal/5 mb-1"
                          >
                            כל הנושאים
                          </Link>
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub.href}
                              to={sub.href}
                              onClick={() => setMobileOpen(false)}
                              className="block py-2 px-3 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-portal-teal transition-colors"
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* About link */}
                <Link
                  to="/About"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-3.5 text-portal-navy"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-base font-bold">אודות</span>
                </Link>
              </nav>

              {/* Mobile CTA Buttons */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 space-y-2.5">
                <a href={`tel:${PORTAL_CTA.phone}`} className="block">
                  <Button className="w-full h-12 rounded-xl bg-portal-teal hover:bg-portal-teal-dark text-white font-bold text-base">
                    <Phone className="ml-2 h-5 w-5" />
                    ייעוץ חינם — {PORTAL_CTA.phone}
                  </Button>
                </a>
                <a href={PORTAL_CTA.whatsapp} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full h-11 rounded-xl border-2 border-green-500 text-green-600 font-bold text-sm">
                    <MessageCircle className="ml-2 h-4 w-4" />
                    שלח הודעת WhatsApp
                  </Button>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
