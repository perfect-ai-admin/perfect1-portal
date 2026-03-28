import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BusinessCardSummary({ formData, onConfirm, onEdit }) {
  const details = [
    { label: 'שם מלא', value: formData.fullName },
    { label: 'עיסוק', value: formData.profession },
    { label: 'טלפון', value: formData.phone },
    { label: 'אימייל', value: formData.email },
    { label: 'סגנון נבחר', value: formData.preferredStyle === 'warm' ? 'חם ואישי' : formData.preferredStyle === 'light' ? 'נקי ומינימליסטי' : 'יוקרתי ומקצועי' },
  ];

  const services = [formData.service1, formData.service2, formData.service3].filter(Boolean);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="bg-gray-900 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-50" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-50" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/20">
               <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">סיכום פרטי הכרטיס</h2>
            <p className="text-gray-400 text-sm">אנא וודא שהפרטים נכונים לפני יצירת הכרטיס</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          
          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {details.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1 font-medium">{item.label}</span>
                <span className="text-gray-900 font-semibold text-lg">{item.value || '-'}</span>
              </div>
            ))}
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <span className="text-xs text-gray-500 block mb-3 font-medium">שירותים ומומחיות</span>
              <div className="flex flex-wrap gap-2">
                {services.map((service, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              onClick={onEdit}
              className="flex-1 h-12 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Edit2 className="w-4 h-4 ml-2" />
              חזור לעריכה
            </Button>
            
            <Button 
              onClick={onConfirm}
              className="flex-[2] h-12 rounded-xl bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200"
            >
              <Sparkles className="w-4 h-4 ml-2" />
              אשר וצור כרטיס
            </Button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}