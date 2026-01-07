import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Phone, MessageCircle, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';

export default function ThankYou() {
  const [showMarketingPopup, setShowMarketingPopup] = useState(false);
  const [marketingForm, setMarketingForm] = useState({
    name: '',
    phone: '',
    business_type: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleMarketingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await base44.entities.Lead.create({
        ...marketingForm,
        source_page: 'דף תודה - ייעוץ שיווק',
        notes: `מעוניין בייעוץ שיווק דיגיטלי. סוג עסק: ${marketingForm.business_type}`,
        status: 'new'
      });

      const message = `🎯 ליד חדש - ייעוץ שיווק דיגיטלי!

👤 שם: ${marketingForm.name}
📞 טלפון: ${marketingForm.phone}
💼 סוג עסק: ${marketingForm.business_type}

📍 מקור: דף תודה
📅 תאריך: ${new Date().toLocaleString('he-IL')}`;

      window.open(`https://wa.me/972502277087?text=${encodeURIComponent(message)}`, '_blank');

      setSubmitted(true);
      setTimeout(() => {
        setShowMarketingPopup(false);
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      alert('אירעה שגיאה, נסה שוב');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOOptimized
        title="תודה על פנייתך | Perfect One"
        description="תודה שפנית אלינו. נציג יצור איתך קשר בהקדם."
        noIndex={true}
      />
      
      <main className="min-h-screen bg-gradient-to-br from-[#E8F4FD] to-white flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          {/* Success Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>

            {/* Thank You Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                תודה רבה! 🎉
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                קיבלנו את הפרטים שלך
              </p>
              <p className="text-lg text-gray-500 mb-8">
                נציג מהצוות שלנו יצור איתך קשר בהקדם האפשרי
              </p>
            </motion.div>

            {/* Contact Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <a href="https://wa.me/972502277087?text=היי, השארתי פרטים באתר" target="_blank" rel="noopener noreferrer">
                <Button className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white h-12 px-6">
                  <MessageCircle className="w-5 h-5 ml-2" />
                  שלח וואטסאפ עכשיו
                </Button>
              </a>
              <a href="tel:0502277087">
                <Button variant="outline" className="w-full sm:w-auto border-[#1E3A5F] text-[#1E3A5F] h-12 px-6">
                  <Phone className="w-5 h-5 ml-2" />
                  התקשר: 0502277087
                </Button>
              </a>
            </motion.div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">רגע לפני שאתה הולך...</span>
              </div>
            </div>

            {/* Marketing Offer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-[#D4AF37]/10 to-[#F4D03F]/10 rounded-2xl p-6 border-2 border-[#D4AF37]/30"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                <h3 className="text-xl font-bold text-[#1E3A5F]">הצעה מיוחדת רק בשבילך!</h3>
              </div>
              <p className="text-gray-600 mb-4">
                רוצה להתחיל לקבל לקוחות דרך האינטרנט?<br />
                קבל <strong>ייעוץ שיווק דיגיטלי ראשוני בחינם</strong> 🎁
              </p>
              <Button
                onClick={() => setShowMarketingPopup(true)}
                className="w-full h-12 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] hover:from-[#F4D03F] hover:to-[#D4AF37] text-white font-bold text-lg"
              >
                כן! אני רוצה ייעוץ בחינם
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Marketing Popup */}
        {showMarketingPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMarketingPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה!</h3>
                  <p className="text-gray-600">נחזור אליך בהקדם</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-[#1E3A5F]">ייעוץ שיווק בחינם</h3>
                    <button
                      onClick={() => setShowMarketingPopup(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-6">
                    השאר פרטים ונחזור אליך עם אסטרטגיית שיווק מותאמת לעסק שלך
                  </p>

                  <form onSubmit={handleMarketingSubmit} className="space-y-4">
                    <Input
                      placeholder="שם מלא *"
                      value={marketingForm.name}
                      onChange={(e) => setMarketingForm({ ...marketingForm, name: e.target.value })}
                      className="h-12"
                      required
                    />
                    <Input
                      type="tel"
                      placeholder="טלפון *"
                      value={marketingForm.phone}
                      onChange={(e) => setMarketingForm({ ...marketingForm, phone: e.target.value })}
                      className="h-12"
                      required
                    />
                    <Input
                      placeholder="איזה עסק יש לך?"
                      value={marketingForm.business_type}
                      onChange={(e) => setMarketingForm({ ...marketingForm, business_type: e.target.value })}
                      className="h-12"
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white font-bold"
                    >
                      {isSubmitting ? 'שולח...' : 'שלח בקשה'}
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </main>
    </>
  );
}