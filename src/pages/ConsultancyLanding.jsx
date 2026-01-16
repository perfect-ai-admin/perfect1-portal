import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Phone, MessageSquare, Lightbulb, Users, BookOpen, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ConsultancyLanding() {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      console.log('Form submitted:', formData);
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', phone: '' });
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <>
      <Helmet>
        <title>ייעוץ וליווי מקצועי לעצמאים | Perfect One</title>
        <meta name="description" content="ייעוץ וליווי מקצועי לעצמאים בתחילת הדרך. הסבר מלא, הכוונה אישית וליווי מקצועי." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-white text-gray-900" dir="rtl">
        {/* SECTION 1 - HERO */}
        <section className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-white via-blue-50 to-white">
          <div className="max-w-5xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  ייעוץ וליווי מקצועי לעצמאים בתחילת הדרך
                </h1>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  הסבר, הכוונה וליווי אישי – ללא ביצוע פעולות ממשלתיות
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 px-8 rounded-lg font-semibold"
                  >
                    <Phone className="w-5 h-5 ml-2" />
                    קבל ייעוץ
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-300 h-12 px-8 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    <Lightbulb className="w-5 h-5 ml-2" />
                    בדיקת התאמה
                  </Button>
                </div>
              </motion.div>

              {/* Icon/Illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center md:justify-end"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
                  <Users className="w-16 h-16 md:w-20 md:h-20 text-blue-600 opacity-80" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 2 - WHAT'S INCLUDED */}
        <section className="py-16 md:py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">מה השירות כולל</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: BookOpen,
                  title: 'הסבר מלא על התהליך',
                  desc: 'הבנה ברורה של כל השלבים, האפשרויות והדרישות'
                },
                {
                  icon: Users,
                  title: 'הכוונה אישית לפי המצב שלך',
                  desc: 'ליווי מותאם לצרכים הייחודיים שלך ושלב הקריירה שלך'
                },
                {
                  icon: Shield,
                  title: 'ליווי מקצועי לפני החלטות',
                  desc: 'יעוץ מקומי לפני שאתה לוקח צעדים משמעותיים'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
                >
                  <item.icon className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3 - FOR WHOM */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">למי זה מתאים</h2>
            
            <div className="space-y-4">
              {[
                'עצמאים בתחילת הדרך',
                'מי שמחפש להבין את כל האפשרויות הפתוחות',
                'מי שרוצה ליווי מקצועי לפני קבלת החלטות',
                'מי שחושש מהתהליכים הממשלתיים ורוצה להבין אותם'
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-4"
                >
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-700">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 - HOW IT WORKS */}
        <section className="py-16 md:py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">איך זה עובד</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { num: '1', title: 'משאירים פרטים', desc: 'מלא טופס קצר עם המידע שלך' },
                { num: '2', title: 'שיחת ייעוץ', desc: 'אנחנו מתייעצים וממליצים לך' },
                { num: '3', title: 'הסבר וברור ומסודר', desc: 'אתה מקבל כל המידע שצריך' },
                { num: '4', title: 'אתה מבצע בעצמך', desc: 'הצעדים הבאים תבצע בעצמך' }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                  
                  {idx < 3 && (
                    <ArrowRight className="hidden md:block absolute -right-10 top-6 w-5 h-5 text-gray-300" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 - DISCLAIMER */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-amber-50 to-white">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border-2 border-amber-200 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl font-bold mb-6 text-amber-900">אנחנו רוצים להיות ברורים</h2>
              
              <div className="space-y-4 text-gray-700">
                <p className="font-semibold text-amber-900">
                  🛡️ שירות פרטי בלבד
                </p>
                <ul className="space-y-3 text-sm md:text-base">
                  <li>• איננו אתר ממשלתי ואיננו פועלים מטעם רשות כלשהי</li>
                  <li>• השירות כולל ייעוץ וליווי מקצועי בלבד</li>
                  <li>• איננו משדרגים, משנים או משדלים בשם שלך</li>
                  <li>• כל פעולה רשמית מבוצעת על ידיך בעצמך מול הרשויות</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6 - FORM */}
        <section className="py-16 md:py-24 px-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12 shadow-lg"
            >
              <h2 className="text-3xl font-bold mb-2 text-center">תרים קשר אתנו</h2>
              <p className="text-center text-gray-600 mb-8">
                אנחנו כאן כדי לעזור וליווי אותך בכל צעד
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">תודה!</h3>
                  <p className="text-green-800">אנחנו כבר בדרך - נחזור אליך בקרוב</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="שם מלא"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="tel"
                      placeholder="מספר טלפון"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg"
                  >
                    <MessageSquare className="w-5 h-5 ml-2" />
                    לתיאום ייעוץ
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="font-bold mb-3">Perfect One</h4>
                <p className="text-gray-400 text-sm">
                  ייעוץ וליווי מקצועי לעצמאים בתחילת הדרך
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-3">עמודים</h4>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li><a href="#" className="hover:text-white">בית</a></li>
                  <li><a href="#" className="hover:text-white">אודות</a></li>
                  <li><a href="#" className="hover:text-white">יצירת קשר</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-3">דין וחשבון</h4>
                <p className="text-gray-400 text-sm">
                  שירות פרטי - איננו אתר ממשלתי
                </p>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
              <p>© 2024 Perfect One. כל הזכויות שמורות.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}