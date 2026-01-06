import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Lightbulb, AlertTriangle, ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import LeadForm from '../components/forms/LeadForm';

const professionsData = {
  'meatzev-grafi': {
    name: 'מעצב גרפי',
    icon: '🎨',
    color: '#FF6B6B',
    description: 'עולם העיצוב הגרפי מציע אינסוף הזדמנויות לעצמאים. מעצבים גרפיים עצמאים נהנים מגמישות בעבודה, יכולת לבחור פרויקטים ולקוחות, ופוטנציאל הכנסה גבוה.',
    services: [
      'עיצוב לוגואים ומיתוג',
      'עיצוב כרטיסי ביקור ונייר פירמה',
      'עיצוב ברושורים וקטלוגים',
      'עיצוב לרשתות חברתיות',
      'עיצוב אריזות מוצרים',
      'עיצוב אתרים ואפליקציות'
    ],
    tips: [
      'הוצאות על תוכנות עיצוב (Adobe CC) מוכרות',
      'ציוד מחשוב וטאבלט גרפי מוכרים כהוצאה',
      'קורסים והשתלמויות מקצועיות מוכרים',
      'שמור קבלות על כל רכישה מקצועית'
    ]
  },
  'tzalam': {
    name: 'צלם',
    icon: '📸',
    color: '#4ECDC4',
    description: 'צילום הוא מקצוע יצירתי עם ביקוש גבוה בישראל. צלמים עצמאים עובדים באירועים, צילום מוצרים, פורטרטים ועוד.',
    services: [
      'צילום אירועים (חתונות, בר מצוות)',
      'צילום עסקי ותדמית',
      'צילום מוצרים לחנויות אונליין',
      'צילום אוכל למסעדות',
      'צילום נדל"ן',
      'צילום פורטרטים'
    ],
    tips: [
      'ציוד צילום מוכר כהוצאה עסקית',
      'תוכנות עריכה (Lightroom, Photoshop) מוכרות',
      'הוצאות נסיעה לאירועים מוכרות',
      'אחסון בענן לגיבויים מוכר כהוצאה'
    ]
  },
  'copywriter': {
    name: 'קופירייטר',
    icon: '✍️',
    color: '#F39C12',
    description: 'קופירייטינג הוא אחד המקצועות המבוקשים ביותר בעידן הדיגיטלי. קופירייטרים עצמאים כותבים תוכן שיווקי לעסקים מכל הסוגים.',
    services: [
      'כתיבת תוכן לאתרים',
      'ניהול תוכן לרשתות חברתיות',
      'כתיבת מיילים שיווקיים',
      'כתיבת מודעות פרסום',
      'כתיבת סלוגנים ומיתוג',
      'כתיבת תוכן SEO'
    ],
    tips: [
      'מנויים לכלי כתיבה (Grammarly) מוכרים',
      'ספרות מקצועית מוכרת כהוצאה',
      'קורסי כתיבה והשתלמויות מוכרים',
      'תוכנות ניהול פרויקטים מוכרות'
    ]
  },
  'mefateach-atarim': {
    name: 'מפתח אתרים',
    icon: '💻',
    color: '#2ECC71',
    description: 'פיתוח אתרים הוא מקצוע עם ביקוש גבוה ופוטנציאל הכנסה מעולה. מפתחי אתרים עצמאים בונים אתרים לעסקים ויזמים.',
    services: [
      'בניית אתרי תדמית',
      'בניית חנויות אונליין',
      'פיתוח אפליקציות ווב',
      'תחזוקת אתרים',
      'אופטימיזציה לביצועים',
      'אינטגרציות ו-APIs'
    ],
    tips: [
      'מנויים לשירותי ענן מוכרים כהוצאה',
      'רישיונות תוכנה ופלאגינים מוכרים',
      'ציוד מחשוב ומסכים מוכרים',
      'קורסים ולמידה מקצועית מוכרים'
    ]
  },
  'meamen-kosher': {
    name: 'מאמן כושר',
    icon: '💪',
    color: '#E53935',
    description: 'אימון כושר אישי הוא מקצוע צומח עם ביקוש גבוה. מאמני כושר עצמאים יכולים לעבוד עם לקוחות פרטיים או בחדרי כושר.',
    services: [
      'אימון אישי 1 על 1',
      'אימונים קבוצתיים',
      'תוכניות אימון מותאמות אישית',
      'ייעוץ תזונתי בסיסי',
      'אימונים אונליין',
      'אימוני חוץ'
    ],
    tips: [
      'ציוד אימון מוכר כהוצאה עסקית',
      'קורסי הסמכה מוכרים',
      'ביטוח מקצועי מוכר כהוצאה',
      'הוצאות נסיעה ללקוחות מוכרות'
    ]
  }
};

// Default data for professions not in the detailed list
const defaultProfessionData = {
  description: 'מקצוע זה מציע הזדמנויות רבות לעצמאים בישראל. עם פתיחת עוסק פטור תוכל להתחיל לעבוד בצורה חוקית ומסודרת.',
  services: [
    'שירותים מותאמים אישית ללקוחות',
    'עבודה עם עסקים קטנים ובינוניים',
    'פרויקטים מזדמנים',
    'שיתופי פעולה עם עצמאים אחרים'
  ],
  tips: [
    'שמור את כל הקבלות על הוצאות מקצועיות',
    'ציוד מקצועי מוכר כהוצאה עסקית',
    'קורסי השתלמות מוכרים',
    'הוצאות נסיעה לעבודה מוכרות'
  ]
};

export default function ProfessionPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || 'meatzev-grafi';
  
  const professionDetails = professionsData[slug];
  
  // Get basic profession info from the grid data or use defaults
  const professionBasic = professionDetails || {
    name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    icon: '💼',
    color: '#1E3A5F'
  };
  
  const profession = {
    ...professionBasic,
    ...(professionDetails || defaultProfessionData)
  };

  const whatsappMessage = `היי, אני ${profession.name} ומעוניין לפתוח עוסק פטור. אשמח לייעוץ`;

  return (
    <main className="pt-20">
      {/* Hero */}
      <section 
        className="py-20 relative overflow-hidden"
        style={{ backgroundColor: profession.color + '15' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div 
              className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-lg"
              style={{ backgroundColor: profession.color + '30' }}
            >
              {profession.icon}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-4">
              פתיחת עוסק פטור ל{profession.name}ים
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              ליווי מקצועי מהצעד הראשון ועד ניהול העסק השוטף
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`https://wa.me/972502277087?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg font-bold rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                >
                  <MessageCircle className="w-5 h-5 ml-2" />
                  דברו איתנו בוואטסאפ
                </Button>
              </a>
              <a href="tel:0502277087">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-14 px-8 text-lg font-bold rounded-full border-[#1E3A5F] text-[#1E3A5F]"
                >
                  <Phone className="w-5 h-5 ml-2" />
                  0502277087
                </Button>
              </a>
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
              {/* About */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                  📌 על המקצוע
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {profession.description}
                </p>
              </motion.div>

              {/* Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                  📌 שירותים נפוצים במקצוע
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {profession.services.map((service, index) => (
                    <li key={index} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                      <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                      <span className="text-gray-700">{service}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* What's Included */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                  📌 מה כולל תהליך הפתיחה
                </h2>
                <div className="bg-gradient-to-br from-[#E8F4FD] to-white rounded-2xl p-6 border border-[#1E3A5F]/10">
                  <ul className="space-y-3">
                    {[
                      'פתיחת תיק במס הכנסה',
                      'רישום כעוסק פטור במע"מ',
                      'פתיחת תיק בביטוח לאומי',
                      'הנפקת חשבוניות/קבלות',
                      'ליווי שוטף ודיווחים'
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#1E3A5F] flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                  📌 טיפים חשובים ל{profession.name}ים
                </h2>
                <div className="space-y-3">
                  {profession.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 bg-[#D4AF37]/10 rounded-xl p-4">
                      <Lightbulb className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{tip}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Warning */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-amber-50 rounded-2xl p-6 border border-amber-200"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">חשוב לדעת</h3>
                    <p className="text-gray-600">
                      תקרת הכנסה לעוסק פטור: <strong>120,000₪ לשנה</strong> (נכון ל-2024). 
                      אם אתה צפוי להרוויח יותר, כדאי לשקול לפתוח עוסק מורשה.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <LeadForm 
                    title={`רוצה לפתוח עוסק פטור כ${profession.name}?`}
                    subtitle="השאר פרטים ונחזור אליך"
                    defaultProfession={profession.name}
                    sourcePage={`דף מקצוע - ${profession.name}`}
                    variant="card"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}