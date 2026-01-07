import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Lightbulb, AlertTriangle, ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import LeadForm from '../components/forms/LeadForm';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import AnswerBlock from '../components/seo/AnswerBlock';
import InternalLinker from '../components/seo/InternalLinker';
import SEOOptimized, { schemaTemplates } from './SEOOptimized';

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
  },
  'animator': { name: 'אנימטור', icon: '🎬', color: '#9B59B6' },
  'mayer': { name: 'מאייר', icon: '🖌️', color: '#E74C3C' },
  'orech-video': { name: 'עורך וידאו', icon: '🎥', color: '#3498DB' },
  'meatzev-pnim': { name: 'מעצב פנים', icon: '🏠', color: '#E67E22' },
  'meatzev-ofna': { name: 'מעצב אופנה', icon: '👗', color: '#FF69B4' },
  'tzalam-mutzarim': { name: 'צלם מוצרים', icon: '📷', color: '#00CED1' },
  'meatzev-tachshitim': { name: 'מעצב תכשיטים', icon: '💎', color: '#FFD700' },
  'oman-kaakuim': { name: 'אומן קעקועים', icon: '🎭', color: '#8B0000' },
  'kotev-tochen': { name: 'כותב תוכן', icon: '📝', color: '#1ABC9C' },
  'metargem': { name: 'מתרגם', icon: '🌐', color: '#34495E' },
  'sofer': { name: 'סופר', icon: '📚', color: '#8E44AD' },
  'blogger': { name: 'בלוגר', icon: '💻', color: '#16A085' },
  'kotev-techni': { name: 'כותב טכני', icon: '📄', color: '#2C3E50' },
  'kotev-creative': { name: 'כותב קריאייטיב', icon: '✨', color: '#9B59B6' },
  'orech-sfarim': { name: 'עורך ספרים', icon: '📖', color: '#6C5CE7' },
  'meatzev-ux-ui': { name: 'מעצב חווית משתמש', icon: '🖼️', color: '#E91E63' },
  'menahel-social': { name: 'מנהל מדיה חברתית', icon: '📱', color: '#00BCD4' },
  'momche-seo': { name: 'מומחה קידום אתרים', icon: '📈', color: '#FF9800' },
  'momche-excel': { name: 'מומחה אקסל', icon: '📊', color: '#217346' },
  'mefateach-apps': { name: 'מפתח אפליקציות', icon: '📲', color: '#5C6BC0' },
  'momche-automation': { name: 'מומחה אוטומציה', icon: '⚙️', color: '#607D8B' },
  'menahel-google-ads': { name: 'מנהל גוגל', icon: '🎯', color: '#4285F4' },
  'menahel-facebook-ads': { name: 'מנהל פייסבוק', icon: '📘', color: '#1877F2' },
  'data-analyst': { name: 'אנליסט נתונים', icon: '📉', color: '#00BFA5' },
  'muzikai': { name: 'מוזיקאי', icon: '🎵', color: '#673AB7' },
  'mafik-muzikali': { name: 'מפיק מוזיקלי', icon: '🎧', color: '#FF5722' },
  'more-lemuzika': { name: 'מורה למוזיקה', icon: '🎹', color: '#9C27B0' },
  'dj': { name: 'תקליטן', icon: '🎛️', color: '#E040FB' },
  'zamar': { name: 'זמר', icon: '🎤', color: '#F44336' },
  'more-leomanut': { name: 'מורה לאומנות', icon: '🎭', color: '#795548' },
  'metapel-alternativy': { name: 'מטפל אלטרנטיבי', icon: '🧘', color: '#4CAF50' },
  'yoetz-tzona': { name: 'יועץ תזונה', icon: '🥗', color: '#8BC34A' },
  'more-yoga': { name: 'מורה יוגה', icon: '🧘‍♀️', color: '#9C27B0' },
  'more-pilates': { name: 'מורה פילאטיס', icon: '🤸', color: '#E91E63' },
  'masagist': { name: 'מסאז\'יסט', icon: '💆', color: '#00BCD4' },
  'reflexolog': { name: 'רפלקסולוג', icon: '🦶', color: '#009688' },
  'meamen-ishi': { name: 'מאמן אישי', icon: '🏋️', color: '#FF5722' },
  'makeup-artist': { name: 'מאפרת', icon: '💄', color: '#FF69B4' },
  'cosmetician': { name: 'קוסמטיקאית', icon: '✨', color: '#DDA0DD' },
  'manicurist': { name: 'מניקוריסטית', icon: '💅', color: '#FF1493' },
  'eyebrow-stylist': { name: 'מעצבת גבות', icon: '👁️', color: '#CD853F' },
  'lash-artist': { name: 'מעצבת ריסים', icon: '👀', color: '#8B4789' },
  'hair-stylist': { name: 'מעצבת שיער', icon: '💇', color: '#FF6347' },
  'ozer-virtuali': { name: 'עוזר וירטואלי', icon: '👩‍💼', color: '#607D8B' },
  'menahel-projects': { name: 'מנהל פרויקטים', icon: '📋', color: '#00BCD4' },
  'yoetz-iski': { name: 'יועץ עסקי', icon: '💼', color: '#455A64' },
  'nahag-hovalot': { name: 'נהג הובלות', icon: '🚚', color: '#795548' },
  'ish-tachzuka': { name: 'איש תחזוקה', icon: '🔧', color: '#78909C' },
  'menake-batim': { name: 'מנקה בתים', icon: '🧹', color: '#4DD0E1' },
  'ganan': { name: 'גנן', icon: '🌱', color: '#66BB6A' },
  'instalator': { name: 'אינסטלטור', icon: '🔧', color: '#1565C0' },
  'chashmlay': { name: 'חשמלאי', icon: '⚡', color: '#FFC107' },
  'technay-mizug': { name: 'טכנאי מיזוג', icon: '❄️', color: '#03A9F4' },
  'chef-prati': { name: 'שף פרטי', icon: '👨‍🍳', color: '#FF7043' },
  'konditor': { name: 'קונדיטור', icon: '🧁', color: '#FF80AB' },
  'barman': { name: 'ברמן', icon: '🍸', color: '#5D4037' },
  'catering': { name: 'קייטרינג', icon: '🍽️', color: '#FF5722' },
  'meragen-eruim': { name: 'מארגן אירועים', icon: '🎉', color: '#E91E63' },
  'afiya-betit': { name: 'אפייה ביתית', icon: '🥐', color: '#FFAB91' },
  'more-prati': { name: 'מורה פרטי', icon: '📖', color: '#3F51B5' },
  'madrich-yeladim': { name: 'מדריך ילדים', icon: '🎈', color: '#FF9800' },
  'coach': { name: 'קואוצ\'ר', icon: '🎯', color: '#009688' },
  'more-lesfatot': { name: 'מורה לשפות', icon: '🗣️', color: '#673AB7' },
  'madrich-tiyulim': { name: 'מדריך טיולים', icon: '🧭', color: '#4CAF50' },
  'madrich-sport': { name: 'מדריך ספורט', icon: '⚽', color: '#F44336' }
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

  const answerBlock = {
    question: `איך פותחים עוסק פטור ${profession.name}?`,
    answer: `פתיחת עוסק פטור ${profession.name} כוללת רישום במס הכנסה, פטור ממע"מ, ופתיחת תיק בביטוח לאומי. התהליך אורך 24-72 שעות ומאפשר לעבוד באופן חוקי ולהפיק קבלות. אנחנו מטפלים בכל הבירוקרטיה והמסמכים הנדרשים, כך שתוכל להתחיל לעבוד במהירות.`
  };

  const localBusinessSchema = {
    ...schemaTemplates.organization,
    "@type": "ProfessionalService",
    "name": `פתיחת עוסק פטור ${profession.name}`,
    "description": profession.description,
    "areaServed": {
      "@type": "Country",
      "name": "ישראל"
    }
  };

  return (
    <>
      <SEOOptimized
        title={`פתיחת עוסק פטור ${profession.name} - ליווי מקצועי | Perfect One`}
        description={`${profession.description} ליווי מלא לפתיחת עוסק פטור ${profession.name} בישראל. ${profession.services && profession.services[0] ? `${profession.services[0]}, ${profession.services[1]} ועוד.` : ''} התקשרו: 0502277087`}
        keywords={`עוסק פטור ${profession.name}, פתיחת עוסק ${profession.name}, ${profession.name} עצמאי${profession.services ? ', ' + profession.services.join(', ') : ''}`}
        canonical={`https://perfect1.co.il${window.location.pathname}${window.location.search}`}
        schema={localBusinessSchema}
      />
      <Breadcrumbs 
        items={[
          { label: 'בית', url: 'Home' },
          { label: 'מקצועות', url: 'Professions' },
          { label: profession.name }
        ]}
      />
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
                פתיחת עוסק פטור - {profession.name}
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
                {/* Answer Block */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <AnswerBlock 
                    question={answerBlock.question}
                    answer={answerBlock.answer}
                  />
                </motion.div>

                {/* About */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                    📌 על המקצוע
                  </h2>
                  <div className="text-gray-600 leading-relaxed text-lg">
                    <InternalLinker content={profession.description} currentPage="ProfessionPage" />
                  </div>
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
                    📌 טיפים חשובים למקצוע
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
                      title="רוצה לפתוח עוסק פטור?"
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
      </main>
    </>
  );
}