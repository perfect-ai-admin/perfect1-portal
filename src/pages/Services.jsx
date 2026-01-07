import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import InternalLinker from '../components/seo/InternalLinker';
import MicroCTA from '../components/cro/MicroCTA';
import SEOOptimized, { seoPresets } from './SEOOptimized';
import { Button } from '@/components/ui/button';
import { 
  FileText, Laptop, Calculator, Receipt, BarChart3, XCircle, 
  Shield, Building2, ArrowLeft, CheckCircle 
} from 'lucide-react';

const services = [
  {
    id: 'ptihat-osek-patur',
    icon: FileText,
    title: 'פתיחת עוסק פטור',
    description: 'פתיחת תיק במס הכנסה, מע"מ וביטוח לאומי בתהליך מהיר ופשוט',
    color: '#27AE60',
    features: ['פתיחת תיק במס הכנסה', 'רישום במע"מ', 'ביטוח לאומי', 'הדרכה ראשונית']
  },
  {
    id: 'ptihat-osek-patur-online',
    icon: Laptop,
    title: 'פתיחת עוסק אונליין',
    description: 'כל התהליך מקוון - ללא צורך להגיע פיזית למשרדים',
    color: '#3498DB',
    features: ['תהליך מקוון לחלוטין', 'ללא הגעה למשרדים', 'חתימה דיגיטלית', 'מעקב סטטוס']
  },
  {
    id: 'livui-chodshi',
    icon: Calculator,
    title: 'ליווי חודשי',
    description: 'ליווי שוטף הכולל אפליקציה, דיווחים וגישה לרו"ח',
    color: '#D4AF37',
    features: ['אפליקציה לניהול', 'דיווחים לרשויות', 'רו"ח זמין', 'ייעוץ מס']
  },
  {
    id: 'hashbonit-osek-patur',
    icon: Receipt,
    title: 'חשבוניות וקבלות',
    description: 'מערכת להפקת קבלות דיגיטליות בקלות ובמהירות',
    color: '#9B59B6',
    features: ['הפקת קבלות', 'מעקב הכנסות', 'גיבוי בענן', 'דוחות אוטומטיים']
  },
  {
    id: 'doch-shnati',
    icon: BarChart3,
    title: 'דוח שנתי',
    description: 'הכנה והגשת דוח שנתי למס הכנסה',
    color: '#E67E22',
    features: ['ריכוז נתונים', 'הכנת הדוח', 'הגשה למס הכנסה', 'מענה לרשויות']
  },
  {
    id: 'sgirat-osek-patur',
    icon: XCircle,
    title: 'סגירת עוסק פטור',
    description: 'סגירת תיק בכל הרשויות במידה והפסקת את הפעילות',
    color: '#E74C3C',
    features: ['סגירה במס הכנסה', 'סגירה במע"מ', 'סגירה בביטוח לאומי', 'אישורי סגירה']
  },
  {
    id: 'bituach-leumi',
    icon: Shield,
    title: 'ביטוח לאומי לעוסק פטור',
    description: 'ניהול תשלומים ודיווחים לביטוח לאומי',
    color: '#00BCD4',
    features: ['חישוב דמי ביטוח', 'דיווחים שוטפים', 'טיפול בפניות', 'ייעוץ פטורים']
  },
  {
    id: 'mas-hachnasa',
    icon: Building2,
    title: 'מס הכנסה לעוסק פטור',
    description: 'ייעוץ וליווי בכל הנוגע למס הכנסה',
    color: '#607D8B',
    features: ['מדרגות מס', 'נקודות זיכוי', 'הוצאות מוכרות', 'תכנון מס']
  }
];

export default function Services() {
  return (
    <>
      <SEOOptimized 
        {...seoPresets.services}
        canonical="https://perfect1.co.il/services"
      />
      <main className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              השירותים שלנו
            </h1>
            <div className="text-xl text-white/80 max-w-2xl mx-auto">
              <InternalLinker
                content="מגוון שירותים מקיף לפתיחת עוסק פטור וליווי חודשי - הכל במקום אחד"
                currentPage="Services"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={createPageUrl('ServicePage') + `?service=${service.id}`}>
                  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-elegant-hover transition-all h-full group">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: service.color + '20' }}
                    >
                      <service.icon className="w-7 h-7" style={{ color: service.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center text-[#1E3A5F] font-medium group-hover:text-[#D4AF37] transition-colors">
                      <span>קרא עוד</span>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MicroCTA text="רוצה לשמוע עוד על השירותים?" cta="שיחה קצרה ללא התחייבות" />
      </div>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">
              לא בטוח מה מתאים לך?
            </h2>
            <div className="text-gray-600 text-lg mb-8">
              <InternalLinker
                content="צור קשר לייעוץ חינם ונעזור לך לפתוח עוסק פטור ולמצוא את השירות המתאים"
                currentPage="Services"
              />
            </div>
            <Link to={createPageUrl('Contact')}>
              <Button 
                size="lg"
                className="h-14 px-8 text-lg font-bold rounded-full bg-[#1E3A5F] hover:bg-[#2C5282]"
              >
                לייעוץ חינם
                <ArrowLeft className="mr-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      </main>
    </>
  );
}