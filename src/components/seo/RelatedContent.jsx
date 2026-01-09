import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, FileText, Briefcase } from 'lucide-react';

/**
 * RelatedContent - תוכן קשור אוטומטי
 * מציג קישורים לתוכן רלוונטי בהתבסס על סוג הדף
 * מחזק קישור פנימי ומונע דפים יתומים
 * 
 * Props:
 * - pageType: סוג הדף (guide/comparison/action/support)
 * - category: קטגוריה (אופציונלי)
 * - relatedLinks: קישורים ידניים (אופציונלי)
 */
export default function RelatedContent({ 
  pageType = 'guide', 
  category = null,
  relatedLinks = []
}) {
  // קישורים אוטומטיים לפי סוג דף
  const getAutoLinks = () => {
    const baseLinks = {
      guide: [
        { icon: Briefcase, title: 'פתיחת עוסק פטור', url: createPageUrl('OsekPaturLanding'), desc: 'התחל את התהליך היום' }
      ],
      comparison: [
        { icon: Briefcase, title: 'פתיחת עוסק פטור', url: createPageUrl('OsekPaturLanding'), desc: 'התחל את התהליך עכשיו' }
      ],
      action: [
        { icon: Briefcase, title: 'פתיחת עוסק פטור', url: createPageUrl('OsekPaturLanding'), desc: 'קרא את המדריך המלא' }
      ],
      support: [
        { icon: Briefcase, title: 'פתיחת עוסק פטור', url: createPageUrl('OsekPaturLanding'), desc: 'חזרה לדף הבית' }
      ],
      landing: [
        { icon: Briefcase, title: 'פתיחת עוסק פטור', url: createPageUrl('OsekPaturLanding'), desc: 'למדריך המלא' }
      ]
    };

    return baseLinks[pageType] || baseLinks.guide;
  };

  const links = relatedLinks.length > 0 ? relatedLinks : getAutoLinks();

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-black text-[#1E3A5F] mb-2">
            📌 תוכן קשור שעשוי לעניין אותך
          </h2>
          <p className="text-gray-600">המשך לקרוא ולגלות עוד</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {links.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={link.url}>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-[#27AE60]/30 group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#27AE60]/20 transition-colors">
                      <link.icon className="w-6 h-6 text-[#1E3A5F] group-hover:text-[#27AE60] transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#1E3A5F] mb-1 group-hover:text-[#27AE60] transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {link.desc}
                      </p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-[#27AE60] group-hover:-translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * דוגמת שימוש:
 * 
 * // אוטומטי לפי סוג
 * <RelatedContent pageType="guide" />
 * 
 * // עם קישורים מותאמים
 * <RelatedContent 
 *   pageType="comparison"
 *   relatedLinks={[
 *     { icon: BookOpen, title: 'מדריך', url: '/guide', desc: 'קרא עוד' }
 *   ]}
 * />
 */