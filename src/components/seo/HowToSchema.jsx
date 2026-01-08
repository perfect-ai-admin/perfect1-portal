import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

/**
 * HowToSchema - מדריך שלב-אחר-שלב עם Schema
 * מייצר תצוגה ויזואלית + HowTo Schema לגוגל
 * 
 * Props:
 * - title: כותרת המדריך
 * - description: תיאור קצר
 * - steps: מערך של {name, text, image?}
 * - totalTime: זמן ביצוע (אופציונלי, פורמט ISO 8601 כמו "PT30M")
 */
export default function HowToSchema({ 
  title, 
  description, 
  steps, 
  totalTime = null 
}) {
  // יצירת Schema.org HowTo
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    ...(totalTime && { "totalTime": totalTime }),
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && {
        "image": {
          "@type": "ImageObject",
          "url": step.image
        }
      })
    }))
  };

  return (
    <>
      {/* הטמעת Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* תצוגת HowTo */}
      <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600">
              {description}
            </p>
            {totalTime && (
              <p className="text-sm text-gray-500 mt-2">
                ⏱️ זמן ביצוע משוער: {formatDuration(totalTime)}
              </p>
            )}
          </motion.div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-[#27AE60]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#27AE60] to-[#2ECC71] flex items-center justify-center text-white text-xl font-black">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">
                      {step.name}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {step.text}
                    </p>
                    {step.image && (
                      <img 
                        src={step.image} 
                        alt={step.name}
                        className="mt-4 rounded-lg shadow-md w-full max-w-md"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// פונקציית עזר להמרת ISO 8601 לעברית
function formatDuration(isoDuration) {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  const parts = [];
  if (hours) parts.push(`${hours} שעות`);
  if (minutes) parts.push(`${minutes} דקות`);
  if (seconds) parts.push(`${seconds} שניות`);
  
  return parts.join(' ו-');
}

/**
 * דוגמת שימוש:
 * 
 * const steps = [
 *   {
 *     name: "צור קשר",
 *     text: "התקשר או שלח הודעה בווטסאפ למספר 050-227-7087"
 *   },
 *   {
 *     name: "מילוי טפסים",
 *     text: "נעזור לך למלא את כל הטפסים הנדרשים",
 *     image: "/images/forms.jpg"
 *   },
 *   {
 *     name: "קבלת אישורים",
 *     text: "תקבל את כל האישורים תוך 24-48 שעות"
 *   }
 * ];
 * 
 * <HowToSchema 
 *   title="איך פותחים עוסק פטור"
 *   description="תהליך פשוט ומהיר לפתיחת עוסק פטור"
 *   steps={steps}
 *   totalTime="PT48H"
 * />
 */