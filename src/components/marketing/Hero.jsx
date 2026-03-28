import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';
import { motion } from 'framer-motion';

import { getSignupUrl } from '@/components/utils/tracking';

export default function Hero({ scrollToTools }) {
  const SIGNUP_URL = getSignupUrl();
  return (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      {/* Background Gradient - Soft Glassy Look */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-50/80 via-white to-white -z-10" />
      
      {/* Delicate Background Shapes */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-indigo-100/30 rounded-full blur-[100px] -z-10" 
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-[100px] -z-10" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-right"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white border border-violet-100 text-violet-700 rounded-full px-5 py-2 text-sm font-medium mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
              </span>
              פלטפורמת SaaS בעברית
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-8 tracking-tight">
              העסק שלך, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">מנוהל חכם יותר.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 font-light">
              מגדירים יעד, מקבלים תכנית פעולה וכלים מוכנים לביצוע: מיתוג, קמפיינים, תוכן ודוחות – הכל במקום אחד פשוט.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href={SIGNUP_URL}>
                <Button className="w-full sm:w-auto h-14 text-lg shadow-xl shadow-violet-600/20 hover:shadow-violet-600/30 hover:-translate-y-1 transition-all">
                  התחל עכשיו בחינם
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </a>
              <Button
                variant="outline"
                onClick={scrollToTools}
                className="w-full sm:w-auto h-14 text-lg border-2 hover:bg-gray-50/80"
              >
                <Play className="ml-2 h-5 w-5 fill-current" />
                איך זה עובד?
              </Button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-6 mt-8 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ללא כרטיס אשראי
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                התקנה מיידית
              </span>
            </div>
          </motion.div>
          
          {/* Visual */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* Abstract background blobs for product feel */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-violet-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] border border-white/20 p-6 md:p-8 transform transition-transform hover:scale-[1.02] duration-500">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 rounded-t-3xl" />
              
              {/* Mockup Grid */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {/* Tools Card */}
                <div className="bg-gray-50/80 rounded-2xl p-5 col-span-2 border border-gray-100/50">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">כלים למיתוג</div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400/20"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-400/20"></div>
                      <div className="w-2 h-2 rounded-full bg-green-400/20"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {['🎨', '📄', '📊', '🏷️'].map((emoji, i) => (
                      <div key={i} className="aspect-square bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm hover:shadow-md transition-shadow cursor-default border border-gray-100">
                        {emoji}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Campaign Card */}
                <div className="bg-violet-50/50 rounded-2xl p-5 border border-violet-100/50">
                  <div className="text-xs font-semibold text-violet-600 mb-2 uppercase tracking-wider">קמפיין פעיל</div>
                  <div className="text-base font-bold text-gray-900 mb-3">רשתות חברתיות</div>
                  <div className="space-y-2">
                    <div className="h-2 bg-violet-100 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-violet-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>התקדמות</span>
                      <span>67%</span>
                    </div>
                  </div>
                </div>
                
                {/* Goals Card */}
                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/50">
                  <div className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wider">יעד חודשי</div>
                  <div className="text-base font-bold text-gray-900">הכנסות</div>
                  <div className="flex items-end gap-2 mt-1">
                    <div className="text-2xl font-bold text-emerald-600">+24%</div>
                    <div className="mb-1">
                       <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}