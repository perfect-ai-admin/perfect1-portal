import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail, Download, ArrowLeft, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { createPageUrl } from '@/utils';

export default function LogoThankYou() {
  const location = useLocation();
  const { businessName, email } = location.state || {};

  useEffect(() => {
    // Trigger confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults, 
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, 
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-2xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-b from-green-50 to-white p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-100/50 via-transparent to-transparent animate-pulse" />
            </div>
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 relative z-10">
              תודה רבה{businessName ? `, ${businessName}` : ''}!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 relative z-10">
              הלוגו החדש שלך מוכן ויוצא לדרך 🚀
            </p>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12 pt-0 space-y-8">
            
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">נשלח למייל</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    קבצי הלוגו (PNG, SVG, PDF) נשלחו לכתובת:
                    <br/>
                    <span className="font-semibold text-gray-900 dir-ltr inline-block">{email || 'האימייל שלך'}</span>
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 flex items-start gap-4">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">הורדה מיידית</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    ניתן להוריד את הקבצים גם ישירות מאזור "הנכסים שלי" בדשבורד.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">מה הצעד הבא?</h3>
              <div className="grid grid-cols-1 gap-3">
                 <Link to={createPageUrl('ClientDashboard')} className="group block">
                  <div className="bg-white border-2 border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <Star className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <span className="block font-bold text-gray-900">חזרה לדשבורד</span>
                        <span className="text-sm text-gray-500">לניהול העסק והנכסים שלך</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transform group-hover:-translate-x-1 transition-all" />
                  </div>
                </Link>
                
                <Link to={createPageUrl('LandingPageBuilder')} className="group block">
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white rounded-xl p-4 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="block font-bold">בנה דף נחיתה עם הלוגו</span>
                        <span className="text-sm text-gray-300">השתמש בלוגו החדש בדף ממיר</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white transform group-hover:-translate-x-1 transition-all" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400">מספר הזמנה: #{Math.floor(Math.random() * 1000000)}</p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}