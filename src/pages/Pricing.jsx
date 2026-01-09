import React from 'react';
import { motion } from 'framer-motion';
import PricingSection from '../components/home/PricingSection';
import FAQSection from '../components/home/FAQSection';
import CTASection from '../components/home/CTASection';
import InternalLinker from '../components/seo/InternalLinker';
import SEOOptimized, { seoPresets, schemaTemplates } from './SEOOptimized';
import { CheckCircle, Info } from 'lucide-react';

export default function Pricing() {
  // Enhanced Pricing Schema with isPartOf and sameAs
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "PriceSpecification",
    "name": "מחירון עוסק פטור בישראל",
    "description": "מחירים שקופים לפתיחת וליווי עוסק פטור",
    "priceCurrency": "ILS",
    "offers": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "פתיחת עוסק פטור",
          "description": "תהליך פתיחה מלא"
        },
        "price": "199",
        "priceCurrency": "ILS",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "ליווי חודשי",
          "description": "ליווי שוטף ואפליקציה"
        },
        "price": "149",
        "priceCurrency": "ILS",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "דוח שנתי",
          "description": "הכנה והגשת דוח שנתי"
        },
        "price": "500",
        "priceCurrency": "ILS",
        "availability": "https://schema.org/InStock"
      }
    ],
    "seller": {
      "@type": "Organization",
      "name": "Perfect One",
      "url": "https://perfect1.co.il",
      "sameAs": [
        "https://www.facebook.com/perfect1.co.il",
        "https://www.linkedin.com/company/perfect1",
        "https://www.instagram.com/perfect1.co.il"
      ]
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "Perfect One",
      "url": "https://perfect1.co.il"
    }
  };

  return (
    <>
      <SEOOptimized 
        {...seoPresets.pricing}
        canonical="https://perfect1.co.il/pricing"
        schema={pricingSchema}
      />
      <main className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              💰 מחירון שקוף ללא הפתעות
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              מחירון <span className="text-[#D4AF37]">פתיחת עוסק פטור</span> בישראל 2026
            </h1>
            <div className="text-xl text-white/80 max-w-2xl mx-auto">
              <InternalLinker 
                content="מחיר פתיחת עוסק פטור שקוף וברור - בלי אותיות קטנות, בלי עמלות נסתרות"
                currentPage="Pricing"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <div className="-mt-8">
        <PricingSection />
      </div>

      {/* What's Included */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">
              מה כולל כל חבילה?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#F8F9FA] rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">פתיחת תיק (199₪)</h3>
              <ul className="space-y-3">
                {[
                  'רישום במס הכנסה',
                  'פתיחת תיק במע"מ כפטור',
                  'פתיחת תיק בביטוח לאומי',
                  'הסבר על חובות ודיווחים',
                  'הדרכה על הפקת קבלות'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#27AE60]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#F8F9FA] rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">ליווי חודשי (149₪)</h3>
              <ul className="space-y-3">
                {[
                  'אפליקציה להפקת קבלות',
                  'מעקב הכנסות והוצאות',
                  'דיווחים שוטפים לרשויות',
                  'גישה לרו"ח/יועץ מס',
                  'ייעוץ מס ותכנון',
                  'סגירת תיק בעת הצורך'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#27AE60]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-blue-50 rounded-2xl p-6 flex items-start gap-4"
          >
            <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-gray-800 mb-2">חשוב לדעת</h4>
              <div className="text-gray-600">
                <InternalLinker 
                  content='כל המחירים הם + מע"מ. ניתן לבטל את ליווי חודשי בכל עת ללא קנסות. דוח שנתי נדרש רק פעם בשנה ואינו חובה לכל עוסק פטור.'
                  currentPage="Pricing"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <FAQSection />
      <CTASection />
      </main>
    </>
  );
}