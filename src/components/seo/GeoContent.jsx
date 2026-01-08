import React from 'react';
import { MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * GeoContent - תוכן GEO לחיזוק SEO מקומי
 * מוסיף אזכורים של ערים ישראליות
 */
export default function GeoContent({ 
  title = "שירות ארצי - זמינים בכל מקום בישראל",
  showStats = true 
}) {
  const cities = [
    { name: 'תל אביב', count: '450+' },
    { name: 'ירושלים', count: '320+' },
    { name: 'חיפה', count: '180+' },
    { name: 'באר שבע', count: '150+' },
    { name: 'אשקלון', count: '120+' },
    { name: 'אשדוד', count: '140+' },
    { name: 'נתניה', count: '110+' },
    { name: 'פתח תקווה', count: '130+' },
    { name: 'ראשון לציון', count: '125+' },
    { name: 'רחובות', count: '95+' },
    { name: 'הרצליה', count: '85+' },
    { name: 'כפר סבא', count: '70+' }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
            <MapPin className="w-4 h-4" />
            שירות ארצי
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
            {title}
          </h2>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            עוזרים לעצמאים לפתוח עוסק פטור בכל רחבי הארץ - 
            <strong> מרכז, צפון, דרום ומושבים</strong>. 
            השירות שלנו דיגיטלי ונגיש לכולם.
          </p>
        </motion.div>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {cities.map((city, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center"
            >
              <MapPin className="w-6 h-6 text-[#27AE60] mx-auto mb-2" />
              <h3 className="font-bold text-[#1E3A5F] mb-1">{city.name}</h3>
              {showStats && (
                <p className="text-sm text-gray-600">{city.count} לקוחות</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <Users className="w-12 h-12 text-[#27AE60] mx-auto mb-4" />
          <h3 className="text-2xl font-black text-[#1E3A5F] mb-3">
            גם אם אתם לא רואים את העיר שלכם ברשימה
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            השירות שלנו דיגיטלי ומתאים לכל מקום בישראל - 
            <strong> מקיבוץ קטן ועד למרכז תל אביב</strong>. 
            פותחים עוסק פטור מהבית, בלי לצאת החוצה.
          </p>
          <div className="inline-flex flex-wrap gap-2 justify-center">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              🏙️ ערים גדולות
            </span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              🏡 יישובים קטנים
            </span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
              🌾 מושבים וקיבוצים
            </span>
            <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
              🌴 דרום ואזורי פריפריה
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}