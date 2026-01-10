import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Phone, MessageCircle, AlertTriangle } from 'lucide-react';
import LeadForm from '../components/forms/LeadForm';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import AnswerBlock from '../components/seo/AnswerBlock';
import InternalLinker from '../components/seo/InternalLinker';
import MicroCTA from '../components/cro/MicroCTA';
import SEOOptimized, { schemaTemplates } from './SEOOptimized';

const servicesData = {
  'ptihat-osek-patur': {
    title: 'פתיחת עוסק פטור',
    subtitle: 'ליווי מקצועי מא\' ועד ת\'',
    description: 'פתיחת עוסק פטור היא הצעד הראשון להתחלת עסק עצמאי בישראל. אנחנו מטפלים בכל הבירוקרטיה עבורך - פתיחת תיק במס הכנסה, רישום במע"מ כפטור, ופתיחת תיק בביטוח לאומי.',
    quickAnswer: 'פתיחת עוסק פטור בישראל היא תהליך רישום רשמי במס הכנסה המאפשר לעצמאים לעבוד חוקית. התהליך כולל פתיחת תיק במס הכנסה, פטור ממע"מ ורישום בביטוח לאומי תוך 24-72 שעות.',
    color: '#27AE60',
    price: '249₪',
    features: [
      'פתיחת תיק במס הכנסה',
      'רישום במע"מ כעוסק פטור',
      'פתיחת תיק בביטוח לאומי',
      'הדרכה על חובות ודיווחים',
      'הכוונה להפקת קבלות',
      'תמיכה טלפונית'
    ],
    steps: [
      'שיחת ייעוץ ראשונית',
      'איסוף מסמכים נדרשים (ת.ז., אישור בנק)',
      'הגשת בקשות לרשויות',
      'קבלת אישורים תוך 24-72 שעות',
      'הדרכה על התחלת העבודה'
    ],
    faq: [
      {
        q: 'כמה זמן לוקח לפתוח עוסק פטור?',
        a: 'בדרך כלל 24-72 שעות עסקים.'
      },
      {
        q: 'מה המסמכים הנדרשים?',
        a: 'תעודת זהות, אישור ניהול חשבון בנק, ופרטי העסק.'
      },
      {
        q: 'האם צריך להגיע פיזית למשרדים?',
        a: 'לא, אנחנו מטפלים בהכל מרחוק.'
      }
    ]
  },
  'ptihat-osek-patur-online': {
    title: 'פתיחת עוסק פטור אונליין',
    subtitle: 'הכל דיגיטלי - ללא יציאה מהבית',
    description: 'תהליך מקוון לחלוטין לפתיחת עוסק פטור. חתימה דיגיטלית, העלאת מסמכים מהנייד, ומעקב סטטוס בזמן אמת.',
    quickAnswer: 'פתיחת עוסק פטור אונליין בישראל היא תהליך דיגיטלי מלא ללא יציאה מהבית. כולל העלאת מסמכים מהנייד, חתימה דיגיטלית מאובטחת ומעקב סטטוס בזמן אמת.',
    color: '#3498DB',
    price: '249₪',
    features: [
      'תהליך מקוון לחלוטין',
      'חתימה דיגיטלית מאובטחת',
      'העלאת מסמכים מהנייד',
      'מעקב סטטוס בזמן אמת',
      'תמיכה בוואטסאפ',
      'ללא צורך להגיע פיזית'
    ],
    steps: [
      'מילוי טופס מקוון',
      'העלאת מסמכים (צילום ת.ז., אישור בנק)',
      'חתימה דיגיטלית',
      'אנחנו מגישים את הבקשות',
      'קבלת אישורים למייל'
    ],
    faq: []
  },
  'livui-chodshi': {
    title: 'ליווי חודשי',
    subtitle: 'רו"ח זמין לכל שאלה',
    description: 'ליווי שוטף הכולל אפליקציה לניהול הכנסות והוצאות, דיווחים לרשויות, וגישה לרואה חשבון או יועץ מס לכל שאלה.',
    quickAnswer: 'ליווי חודשי לעוסק פטור בישראל כולל אפליקציה לניהול הכנסות והוצאות, דיווחים שוטפים לרשויות, וגישה ישירה לרואה חשבון מוסמך לכל שאלה.',
    color: '#D4AF37',
    price: '199₪ לחודש',
    features: [
      'אפליקציה להפקת קבלות',
      'מעקב הכנסות והוצאות',
      'דיווחים שוטפים לרשויות',
      'גישה לרו"ח/יועץ מס',
      'ייעוץ מס שוטף',
      'סגירת תיק בעת הצורך'
    ],
    steps: [],
    faq: []
  },
  'doch-shnati': {
    title: 'הגשת דוח שנתי',
    subtitle: 'נדאג להגשה בזמן',
    description: 'הכנה והגשת דוח שנתי למס הכנסה (טופס 1301). נרכז את כל הנתונים, נכין את הדוח, ונגיש אותו בזמן.',
    quickAnswer: 'דוח שנתי עוסק פטור (טופס 1301) הוא דוח חובה למס הכנסה שמוגש עד 30 באפריל. כולל ריכוז הכנסות והוצאות, חישוב מס והגשה דיגיטלית לרשויות.',
    color: '#E67E22',
    price: '1,199₪',
    features: [
      'ריכוז כל ההכנסות וההוצאות',
      'חישוב מס לתשלום/החזר',
      'הכנת טופס 1301',
      'הגשה דיגיטלית למס הכנסה',
      'מענה לפניות הרשויות',
      'ייעוץ להפחתת מס'
    ],
    steps: [],
    faq: []
  }
};

const defaultService = {
  title: 'שירות',
  subtitle: 'ליווי מקצועי',
  description: 'שירות מקצועי לעוסקים פטורים עם ליווי אישי לאורך כל הדרך.',
  color: '#1E3A5F',
  price: 'צור קשר למחיר',
  features: [
    'ליווי מקצועי',
    'תמיכה טלפונית',
    'מענה לשאלות',
    'סיוע מול הרשויות'
  ],
  steps: [],
  faq: []
};

export default function ServicePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('service') || 'ptihat-osek-patur';
  
  const service = servicesData[serviceId] || defaultService;

  // Enhanced Service Schema with offers and hasOfferCatalog
  const enhancedSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.quickAnswer || service.description,
    "serviceType": service.title,
    "provider": {
      "@type": "ProfessionalService",
      "name": "Perfect One",
      "url": "https://perfect1.co.il",
      "telephone": "+972-50-227-7087",
      "email": "info@perfect1.co.il",
      "logo": "https://perfect1.co.il/logo.png",
      "sameAs": [
        "https://www.facebook.com/perfect1.co.il",
        "https://www.linkedin.com/company/perfect1",
        "https://www.instagram.com/perfect1.co.il"
      ]
    },
    "areaServed": {
      "@type": "Country",
      "name": "ישראל"
    },
    "offers": {
      "@type": "Offer",
      "price": service.price.replace(/[^\d]/g, ''),
      "priceCurrency": "ILS",
      "availability": "https://schema.org/InStock",
      "url": `https://perfect1.co.il${createPageUrl('ServicePage')}?service=${serviceId}`
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "שירותים לעוסקים פטורים",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "פתיחת עוסק פטור",
            "description": "תהליך פתיחה מלא במס הכנסה, מע\"מ וביטוח לאומי"
          },
          "price": "249",
          "priceCurrency": "ILS"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "פתיחת עוסק פטור אונליין",
            "description": "תהליך דיגיטלי מלא ללא יציאה מהבית"
          },
          "price": "249",
          "priceCurrency": "ILS"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "ליווי חודשי",
            "description": "ליווי שוטף עם אפליקציה ורו\"ח זמין"
          },
          "price": "199",
          "priceCurrency": "ILS"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "הגשת דוח שנתי",
            "description": "הכנה והגשת דוח שנתי למס הכנסה"
          },
          "price": "1199",
          "priceCurrency": "ILS"
        }
      ]
    },
    "about": {
      "@type": "Thing",
      "name": "עוסק פטור בישראל",
      "description": "שירותי פתיחה וליווי עוסקים פטורים"
    }
  };

  const answerBlockData = {
    'ptihat-osek-patur': {
      question: 'מה זה פתיחת עוסק פטור?',
      answer: 'פתיחת עוסק פטור היא רישום רשמי במס הכנסה המאפשר לעצמאים להתחיל לעבוד באופן חוקי בישראל. התהליך כולל פתיחת תיק במס הכנסה, רישום כפטור ממע"מ, ופתיחת תיק בביטוח לאומי. הליך זה נמשך 24-72 שעות וחובה לכל מי שרוצה לעבוד כעצמאי בישראל.'
    },
    'ptihat-osek-patur-online': {
      question: 'איך פותחים עוסק פטור אונליין?',
      answer: 'ניתן לפתוח עוסק פטור אונליין באמצעות תהליך דיגיטלי מלא, כולל העלאת מסמכים מהנייד וחתימה דיגיטלית. המשמעות היא שאין צורך להגיע פיזית למשרדים או לרשויות. התהליך כולל מילוי טופס מקוון, העלאת תעודת זהות ואישור בנק, וחתימה דיגיטלית מאובטחת.'
    },
    'livui-chodshi': {
      question: 'מה כולל ליווי חודשי לעוסק פטור?',
      answer: 'ליווי חודשי לעוסק פטור כולל אפליקציה לניהול הכנסות והוצאות, הפקת קבלות, דיווחים שוטפים לרשויות, וגישה ישירה לרואה חשבון או יועץ מס. השירות נועד להבטיח שכל החובות המשפטיים והחשבונאיים מתקיימים, תוך חיסכון בזמן ובטעויות עבור העצמאי.'
    },
    'doch-shnati': {
      question: 'מה זה דוח שנתי לעוסק פטור?',
      answer: 'דוח שנתי (טופס 1301) הוא דוח חובה שכל עוסק פטור חייב להגיש למס הכנסה עד ה-30 באפריל. הדוח מרכז את כל ההכנסות וההוצאות המוכרות במהלך השנה, ומחשב את המס שיש לשלם או את ההחזר המגיע. הגשת דוח מאוחרת עלולה להביא לקנסות ולעיכובים.'
    }
  };

  const currentAnswerBlock = answerBlockData[serviceId];

  const localBusinessSchema = {
    ...schemaTemplates.organization,
    "@type": "ProfessionalService",
    "name": service.title,
    "description": service.description,
    "areaServed": {
      "@type": "Country",
      "name": "ישראל"
    }
  };

  return (
    <>
      <SEOOptimized
        title={`${service.title} בישראל 2024 - ליווי מקצועי | Perfect One`}
        description={service.quickAnswer || service.description}
        keywords={`${service.title}, ${service.title} בישראל, עוסק פטור, עצמאים בישראל, שירותים לעוסקים`}
        canonical={`https://perfect1.co.il${createPageUrl('ServicePage')}?service=${serviceId}`}
        schema={enhancedSchema}
      />
      <main className="pt-20">
         {/* Hero with Breadcrumbs */}
         <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-12">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
             <Breadcrumbs 
               items={[
                 { label: 'בית', url: 'Home' },
                 { label: 'שירותים', url: 'Services' },
                 { label: service.title }
               ]}
             />
           </div>
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {service.title} בישראל
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-6">
              {service.subtitle}
            </p>
            <div 
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white font-bold text-xl"
              style={{ backgroundColor: service.color }}
            >
              {service.price}
            </div>
            </motion.div>
            </div>
            </section>

            {/* Content */}
            <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Quick Answer - AEO */}
              {service.quickAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-blue-50 border-r-4 border-blue-600 rounded-xl p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-blue-900 mb-2">
                        תשובה מהירה - {service.title}
                      </h2>
                      <p className="text-gray-800 leading-relaxed">
                        {service.quickAnswer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Answer Block */}
              {currentAnswerBlock && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <AnswerBlock 
                    question={currentAnswerBlock.question}
                    answer={currentAnswerBlock.answer}
                  />
                </motion.div>
              )}

              {/* Description */}
              <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
              >
               <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                 על השירות
               </h2>
               <div className="text-gray-600 leading-relaxed text-lg">
                 <InternalLinker content={service.description} currentPage="ServicePage" />
                 {serviceId === 'livui-chodshi' && (
                   <p className="mt-4">
                     אם אתה עדיין לא פתחת עוסק פטור, תוכל לעשות זאת בקלות דרך{' '}
                     <Link 
                       to={createPageUrl('OsekPaturOnlineLanding')}
                       className="text-[#1E3A5F] underline font-bold hover:text-[#2C5282]"
                     >
                       פתיחת עוסק פטור אונליין
                     </Link>
                     {' '}והליווי החודשי יתחיל מיד לאחר מכן.
                   </p>
                 )}
               </div>
              </motion.div>

              <MicroCTA text="רוצה להבין אם זה מתאים לך?" cta="בדיקה מהירה ללא עלות" variant="subtle" />

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                  📌 מה כולל השירות
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                      <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Steps */}
              {service.steps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                    📌 איך זה עובד
                  </h2>
                  <div className="space-y-4">
                    {service.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{ backgroundColor: service.color }}
                        >
                          {index + 1}
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 flex-1">
                          <span className="text-gray-700">{step}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* FAQ */}
              {service.faq.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                    📌 שאלות נפוצות
                  </h2>
                  <div className="space-y-4">
                    {service.faq.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-bold text-gray-800 mb-2">{item.q}</h3>
                        <p className="text-gray-600">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a 
                  href={`https://wa.me/972502277087?text=היי, מעוניין לשמוע עוד על ${service.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full h-14 text-lg font-bold rounded-xl bg-[#25D366] hover:bg-[#128C7E]">
                    <MessageCircle className="w-5 h-5 ml-2" />
                    שלח וואטסאפ
                  </Button>
                </a>
                <a href="tel:0502277087" className="flex-1">
                  <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-xl border-[#1E3A5F] text-[#1E3A5F]">
                    <Phone className="w-5 h-5 ml-2" />
                    0502277087
                  </Button>
                </a>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <LeadForm 
                  title="רוצה להתחיל?"
                  subtitle="השאר פרטים ונחזור אליך"
                  sourcePage={`דף שירות - ${service.title}`}
                  variant="card"
                />
              </div>
            </div>
          </div>
          </div>
          </section>
          </main>
          </>
          );
          }