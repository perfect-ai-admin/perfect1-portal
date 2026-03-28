import React, { useState } from 'react';
import { Menu, X, ChevronDown, Sparkles, Layers, Tag, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getSignupUrl } from '@/components/utils/tracking';

export default function Header() {
  const SIGNUP_URL = getSignupUrl();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandingProducts = [
    { label: 'יצירת לוגו חכם', href: '/SmartLogo' },
    { label: 'דף נחיתה ממותג', href: '/BrandedLandingPage' },
    { label: 'מצגת עסקית', href: '/BusinessPresentation' },
    { label: 'סטיקר לעסק', href: '/BusinessSticker' },
    { label: 'עיצובים לרשתות', href: '/SocialDesigns' },
    { label: 'כרטיס ביקור דיגיטלי', href: '/DigitalBusinessCard' },
    { label: 'אווטר AI לעסק', href: '/AvatarAi' },
    { label: 'הצעת מחיר ממותגת', href: '/BrandedQuote' },
  ];

  const navLinks = [
    { label: 'מנטור AI', href: '/AiMentor', special: true },
    { label: 'מחירים', href: '/Pricing', icon: Tag },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900">ClientDashboard</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                מיתוג ופיתוח מותג
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {brandingProducts.map((product) => (
                  <DropdownMenuItem key={product.label} asChild>
                    <a href={product.href} className="cursor-pointer">
                      {product.label}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`transition-all duration-300 text-sm font-medium flex items-center gap-1.5 ${
                  link.special 
                    ? "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent font-bold hover:scale-105" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.special && <Sparkles className="w-4 h-4 text-fuchsia-500 animate-pulse" />}
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={SIGNUP_URL}
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              התחברות
            </a>
            <a href={SIGNUP_URL}>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-5 h-11 text-sm font-medium shadow-lg shadow-violet-600/25">
                התחל עכשיו
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl p-6 md:hidden flex flex-col gap-6 animate-in slide-in-from-top-5 duration-300 h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="flex flex-col gap-6">

              {/* Highlighted Link for Mobile */}
              {navLinks.filter(l => l.special).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-fuchsia-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                      {link.label}
                    </span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-violet-300 -rotate-90" />
                </a>
              ))}

              <div className="pt-2">
                <p className="text-gray-900 text-sm font-black mb-4 px-2 flex items-center gap-2"><span className="w-1 h-4 bg-violet-600 rounded-full"></span>מיתוג ופיתוח מותג</p>
                <div className="grid grid-cols-2 gap-3">
                  {brandingProducts.map((product) => (
                    <a
                      key={product.label}
                      href={product.href}
                      className="text-gray-600 bg-gray-50 hover:bg-white hover:text-violet-600 hover:shadow-md hover:border-violet-100 border border-transparent transition-all py-3 px-3 rounded-xl text-sm font-medium text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {product.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                  <a
                    href="/Pricing"
                    className="flex items-center gap-4 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm active:scale-98 transition-all group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-violet-50 group-hover:text-violet-600 flex items-center justify-center transition-colors">
                      <Tag size={20} />
                    </div>
                    <span className="text-base font-bold text-gray-700 group-hover:text-gray-900">מחירים</span>
                    <ChevronDown className="w-4 h-4 text-gray-300 mr-auto -rotate-90" />
                  </a>
              </div>
              
              <div className="pt-6 border-t border-gray-100 mt-auto flex flex-col gap-4 pb-8">
                <a href={SIGNUP_URL}>
                  <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-14 text-lg font-bold shadow-xl shadow-violet-200">
                    התחל עכשיו בחינם
                  </Button>
                </a>
                <a
                  href={SIGNUP_URL}
                  className="text-gray-500 hover:text-gray-900 transition-colors py-2 text-sm font-medium text-center"
                >
                  כבר יש לך חשבון? <span className="text-violet-600 underline">התחבר</span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}