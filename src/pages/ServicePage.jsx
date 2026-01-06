import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Phone, MessageCircle, AlertTriangle } from 'lucide-react';
import LeadForm from '../components/forms/LeadForm';

const servicesData = {
  'ptihat-osek-patur': {
    title: 'פתיחת עוסק פטור',
    subtitle: 'ליווי מקצועי מא\' ועד ת\'',
    description: 'פתיחת עוסק פטור היא הצעד הראשון להתחלת עסק עצמאי בישראל. אנחנו מטפלים בכל הבירוקרטיה עבורך - פתיחת תיק במס הכנסה, רישום במע"מ כפטור, ופתיחת תיק בביטוח לאומי.',
    color: '#27AE60',
    price: '199₪+מע"מ',
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
    color: '#3498DB',
    price: '199₪+מע"מ',
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
    color: '#D4AF37',
    price: '149₪+מע"מ לחודש',
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
    color: '#E67E22',
    price: '500₪+מע"מ',
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

  return (
    <main className="pt-20">
      {/* Hero */}
      <section 
        className="py-20"
        style={{ backgroundColor: service.color + '15' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-4">
              {service.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
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
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                  📌 על השירות
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {service.description}
                </p>
              </motion.div>

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
  );
}