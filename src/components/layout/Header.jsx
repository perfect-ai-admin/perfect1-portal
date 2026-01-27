import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
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
  const [isOsekPaturOpen, setIsOsekPaturOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isOsekMurashOpen, setIsOsekMurashOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  const osekPaturCategories = [
    {
      name: '🔹 פתיחת עוסק פטור',
      items: [
        { name: 'פתיחת עוסק פטור', href: createPageUrl('OsekPaturLanding') },
        { name: 'פתיחת עוסק פטור אונליין', href: createPageUrl('OsekPaturOnlineLanding') },
        { name: 'איך פותחים עוסק פטור', href: createPageUrl('HowToOpenOsekPatur') },
        { name: 'פתיחת עוסק פטור – שלבים', href: createPageUrl('OsekPaturSteps') }
      ]
    },
    {
      name: '🔹 ניהול שוטף לעוסק פטור',
      items: [
        { name: 'ליווי חודשי לעוסק פטור', href: createPageUrl('MonthlyReportOsekPatur') },
        { name: 'דוח שנתי לעוסק פטור', href: createPageUrl('AnnualReportOsekPatur') },
        { name: 'קבלות והכנסות', href: createPageUrl('ReceiptsIncome') },
        { name: 'אפליקציה לעצמאים', href: createPageUrl('InvoicesAppLanding') }
      ]
    },
    {
      name: '🔹 חובות מול רשויות',
      items: [
        { name: 'ביטוח לאומי לעוסק פטור', href: createPageUrl('BituchLeumiLanding') },
        { name: 'מס הכנסה לעוסק פטור', href: createPageUrl('MasHaKnasaOsekPatur') },
        { name: 'מע״מ לעוסק פטור', href: createPageUrl('MaamatOsekPatur') }
      ]
    },
    {
      name: '🔹 עלויות והחלטות',
      items: [
        { name: 'כמה עולה לפתוח עוסק פטור', href: createPageUrl('PricingCost') },
        { name: 'חשבונית לעוסק פטור', href: createPageUrl('UrgentInvoice') },
        { name: 'תקרת עוסק פטור', href: createPageUrl('TakratOsekPatur') },
        { name: 'צריך רואה חשבון לעוסק?', href: createPageUrl('NeedAccountantOsekPatur') },
        { name: 'עוסק פטור או מורשה', href: createPageUrl('OsekPaturVsMorasha') }
      ]
    },
    {
      name: '🔹 סגירת עוסק פטור',
      items: [
        { name: 'סגירת עוסק פטור', href: createPageUrl('CloseOsekPaturComprehensive') },
        { name: 'איך סוגרים עוסק פטור', href: createPageUrl('HowToCloseOsekPatur') },
        { name: 'סגירת עוסק פטור מס הכנסה', href: createPageUrl('CloseOsekPaturTaxAuthority') },
        { name: 'סגירת עוסק פטור ביטוח לאומי', href: createPageUrl('CloseOsekPaturBituachLeumi') }
      ]
    }
  ];

  const osekMorshaCategories = [
    {
      name: '🔹 פתיחת עוסק מורשה',
      items: [
        { name: 'פתיחת עוסק מורשה', href: createPageUrl('OsekMorshaLanding') },
        { name: 'פתיחת עוסק מורשה – שלבים', href: createPageUrl('OsekMorshaSteps') },
        { name: 'פתיחת עוסק מורשה – כמה זמן לוקח', href: createPageUrl('OsekMorshaTime') }
      ]
    },
    {
      name: '🔹 מתי צריך להיות עוסק מורשה',
      items: [
        { name: 'מתי חייבים להיות עוסק מורשה', href: createPageUrl('WhenNeedOsekMorsha') },
        { name: 'מעבר מעוסק פטור למורשה', href: createPageUrl('TransitionOsekPaturToMorsha') },
        { name: 'תקרת עוסק פטור ומעבר למורשה', href: createPageUrl('OsekPaturThresholdAndTransition') },
        { name: 'מי לא יכול להיות עוסק פטור', href: createPageUrl('WhoCannotBeOsekPatur') }
      ]
    },
    {
      name: '🔹 מע״מ לעוסק מורשה',
      items: [
        { name: 'מע״מ לעוסק מורשה', href: createPageUrl('VatOsekMorsha') },
        { name: 'דיווח מע״מ לעוסק מורשה', href: createPageUrl('VatReportingOsekMorsha') },
        { name: 'תשלום מע״מ – איך מחשבים', href: createPageUrl('VatPaymentCalculation') },
        { name: 'החזר מע״מ לעוסק מורשה', href: createPageUrl('VatReturnOsekMorsha') }
      ]
    },
    {
      name: '🔹 מס הכנסה לעוסק מורשה',
      items: [
        { name: 'מס הכנסה לעוסק מורשה', href: createPageUrl('IncomeTaxOsekMorsha') },
        { name: 'תשלום מס הכנסה', href: createPageUrl('IncomeTaxPayment') },
        { name: 'מקדמות מס', href: createPageUrl('TaxAdvances') },
        { name: 'דוח שנתי לעוסק מורשה', href: createPageUrl('AnnualReportOsekMorshaPage') }
      ]
    },
    {
      name: '🔹 ביטוח לאומי לעוסק מורשה',
      items: [
        { name: 'ביטוח לאומי לעוסק מורשה', href: createPageUrl('NationalInsuranceOsekMorsha') },
        { name: 'כמה משלם עוסק מורשה', href: createPageUrl('HowMuchOsekMorshaPayNI') },
        { name: 'מקדמות ביטוח לאומי', href: createPageUrl('NationalInsuranceAdvances') },
        { name: 'זכויות עוסק מורשה', href: createPageUrl('OsekMorshaRights') }
      ]
    },
    {
      name: '🔹 עלויות וניהול שוטף',
      items: [
        { name: 'עלויות עוסק מורשה', href: createPageUrl('CostsOsekMorsha') },
        { name: 'כמה עולה לנהל עוסק מורשה', href: createPageUrl('HowMuchToManageOsekMorsha') },
        { name: 'רואה חשבון לעוסק מורשה', href: createPageUrl('AccountantForOsekMorsha') },
        { name: 'הנהלת חשבונות לעוסק מורשה', href: createPageUrl('BookkeepingOsekMorsha') }
      ]
    },
    {
      name: '🔹 טעויות ובעיות נפוצות',
      items: [
        { name: 'טעויות נפוצות בעוסק מורשה', href: createPageUrl('CommonMistakesOsekMorsha') },
        { name: 'קנסות מע״מ', href: createPageUrl('VatPenalties') },
        { name: 'חובות מס', href: createPageUrl('TaxDebts') },
        { name: 'אי דיווח הכנסות', href: createPageUrl('FailureToReportIncome') }
      ]
    },
    {
      name: '🔹 סגירת עוסק מורשה',
      items: [
        { name: 'סגירת עוסק מורשה', href: createPageUrl('CloseOsekMorsha') },
        { name: 'איך סוגרים עוסק מורשה', href: createPageUrl('HowToCloseOsekMorsha') },
        { name: 'סגירת עוסק מורשה במע״מ', href: createPageUrl('CloseOsekMorshaVat') },
        { name: 'סגירת תיק במס הכנסה', href: createPageUrl('CloseOsekMorshaIncomeTax') }
      ]
    }
  ];

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
    { name: 'ביטוח לאומי לעוסק פטור', href: createPageUrl('BituchLeumiLanding'), isLink: true },
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
            className="flex items-center gap-3 hover:opacity-90 transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#27AE60] flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:shadow-2xl group-hover:shadow-blue-900/30 transition-all duration-300 group-hover:scale-105 border border-white/20">
              <span className="text-white font-black text-2xl tracking-tight">P1</span>
            </div>
            <div>
              <h1 className="font-black text-2xl text-[#1E3A5F] leading-tight tracking-tight group-hover:text-[#2C5282] transition-colors">פרפקט וואן</h1>
              <p className="text-sm text-[#27AE60] font-bold tracking-wide">הבית לעצמאים</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all">
                עוסק פטור
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('Professions')} className="cursor-pointer text-base">
                    מקצועות
                  </Link>
                </DropdownMenuItem>

                <div className="border-t border-gray-100 my-2" />

                {osekPaturCategories.map((category, idx) => (
                  <DropdownMenu key={idx}>
                    <DropdownMenuTrigger className="w-full flex items-center justify-between px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md">
                      <span className="font-semibold text-gray-700">{category.name}</span>
                      <ChevronDown className="w-3 h-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left" className="w-64">
                      {category.items.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link 
                            to={item.href}
                            className="cursor-pointer text-sm py-2"
                          >
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all">
                עוסק מורשה
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {osekMorshaCategories.map((category, idx) => (
                  <DropdownMenu key={idx}>
                    <DropdownMenuTrigger className="w-full flex items-center justify-between px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md">
                      <span className="font-semibold text-gray-700">{category.name}</span>
                      <ChevronDown className="w-3 h-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left" className="w-64">
                      {category.items.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link 
                            to={item.href}
                            className="cursor-pointer text-sm py-2"
                          >
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

             <DropdownMenu>
               <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all">
                 חברה בע״מ
                 <ChevronDown className="w-4 h-4" />
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-64">
                 <DropdownMenuItem asChild>
                   <Link to={createPageUrl('CompanyLanding')} className="cursor-pointer text-base">
                     פתיחת חברה בע״מ
                   </Link>
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>

            <Link
              to={createPageUrl('Blog')}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              בלוג
            </Link>

            <Link
              to={createPageUrl('CloseBusinessLanding')}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all"
            >
              סגירת עסק
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-50 rounded-xl font-semibold transition-all">
                מי אנחנו
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('About')} className="cursor-pointer text-base">
                    אודות
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl('BizPilot')} className="cursor-pointer text-base">
                    BizPilot
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
            {/* Client Area Button - Desktop */}
            <Button 
              size="lg"
              onClick={async () => {
                const isAuth = await base44.auth.isAuthenticated();
                if (isAuth) {
                  window.location.href = createPageUrl('ClientDashboard');
                } else {
                  base44.auth.redirectToLogin(createPageUrl('ClientDashboard'));
                }
              }}
              className="hidden lg:flex bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white font-bold rounded-xl px-5 h-12 shadow-md hover:shadow-lg transition-all"
            >
              🔐 אזור אישי
            </Button>

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
              href="https://wa.me/972559700641?text=היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור"
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
                size="icon"
                className="border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white rounded-xl w-12 h-12 shadow-sm"
              >
                <Phone className="w-5 h-5" />
              </Button>
            </a>

            <a
              href="https://wa.me/972559700641?text=היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex"
              onClick={() => trackWhatsAppClick('header', 'היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור')}
            >
              <Button 
                size="icon"
                className="bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white rounded-xl w-12 h-12 shadow-lg hover:shadow-xl transition-all"
              >
                <MessageCircle className="w-5 h-5" />
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
                        <button
                          onClick={async () => {
                            setIsMobileMenuOpen(false);
                            const isAuth = await base44.auth.isAuthenticated();
                            if (isAuth) {
                              window.location.href = createPageUrl('ClientDashboard');
                            } else {
                              base44.auth.redirectToLogin(createPageUrl('ClientDashboard'));
                            }
                          }}
                          className="w-full flex items-center py-3 px-4 rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] text-white font-bold transition-all text-lg shadow-lg mb-4"
                        >
                          🔐 אזור אישי ללקוחות
                        </button>
                      </li>
                      <li>
                        <Link
                          to={createPageUrl('Home')}
                          onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          דף הבית
                        </Link>
                      </li>

                      {/* עוסק פטור */}
                      <li>
                        <button
                          onClick={() => setIsOsekPaturOpen(!isOsekPaturOpen)}
                          className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          <span>עוסק פטור</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isOsekPaturOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOsekPaturOpen && (
                          <ul className="mr-4 space-y-1 mt-2">
                            <li>
                              <Link
                                to={createPageUrl('Professions')}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center py-2 px-4 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-[#1E3A5F] transition-all"
                              >
                                מקצועות
                              </Link>
                            </li>
                            {osekPaturCategories.map((category, idx) => (
                              <li key={idx}>
                                <button
                                  onClick={() => setExpandedCategory(expandedCategory === idx ? null : idx)}
                                  className="w-full flex items-center justify-between py-2 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] transition-all font-bold"
                                >
                                  <span>{category.name}</span>
                                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedCategory === idx ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedCategory === idx && (
                                  <ul className="mr-4 space-y-1 mt-1">
                                    {category.items.map((item) => (
                                      <li key={item.name}>
                                        <Link
                                          to={item.href}
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="flex items-center py-2 px-4 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-[#1E3A5F] transition-all text-sm"
                                        >
                                          {item.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>

                      {/* עוסק מורשה */}
                      <li>
                        <button
                          onClick={() => setIsOsekMurashOpen(!isOsekMurashOpen)}
                          className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          <span>עוסק מורשה</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isOsekMurashOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOsekMurashOpen && (
                          <ul className="mr-4 space-y-1 mt-2">
                            {osekMorshaCategories.map((category, idx) => (
                              <li key={idx}>
                                <button
                                  onClick={() => setExpandedCategory(expandedCategory === idx + 100 ? null : idx + 100)}
                                  className="w-full flex items-center justify-between py-2 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] transition-all font-bold text-sm"
                                >
                                  <span>{category.name}</span>
                                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedCategory === idx + 100 ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedCategory === idx + 100 && (
                                  <ul className="mr-4 space-y-1 mt-1">
                                    {category.items.map((item) => (
                                      <li key={item.name}>
                                        <Link
                                          to={item.href}
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="flex items-center py-2 px-4 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-[#1E3A5F] transition-all text-xs"
                                        >
                                          {item.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>

                      {/* חברה בע"מ */}
                      <li>
                        <Link
                          to={createPageUrl('CompanyLanding')}
                          onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          חברה בע״מ
                        </Link>
                      </li>

                      <li>
                        <Link
                          to={createPageUrl('CloseBusinessLanding')}
                          onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          סגירת עסק
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
                          to={createPageUrl('About')}
                          onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          אודות
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={createPageUrl('BizPilot')}
                          onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex items-center py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1E3A5F] font-semibold transition-all text-lg"
                        >
                          BizPilot
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
                      href="https://wa.me/972559700641?text=היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור"
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