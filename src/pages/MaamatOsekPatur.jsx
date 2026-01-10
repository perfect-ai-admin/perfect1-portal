import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Phone, MessageCircle } from 'lucide-react';

export default function MaamatOsekPatur() {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: 'מע״מ לעוסק פטור',
        category: 'osek_patur',
        status: 'new'
      });
      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOOptimized
        title="מע״מ לעוסק פטור - פטור וחובות | Perfect One"
        description="הסבר מלא על מע״מ לעוסק פטור בישראל - מתי צריך להירשם, תשלומים וחובות."
        canonical="https://perfect1.co.il/maamat-osek-patur"
      />

      <main className="min-h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black text-[#1E3A5F] mb-6 text-center">
              מע״מ לעוסק פטור
            </h1>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              הכל על פטור מע״מ, מתי צריך להירשם ומה הן החובות
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <h3 className="text-2xl font-bold text-green-700 mb-4">פטור מע״מ</h3>
                <p className="text-gray-700">
                  עוסק פטור פטור מע״מ כל עוד הכנסתו לא עוברת סך מסוים בשנה. זהו חיסכון משמעותי.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
                <h3 className="text-2xl font-bold text-orange-700 mb-4">כשצריך להירשם?</h3>
                <p className="text-gray-700">
                  כשהכנסתך עוברת את התקרה, חייב להירשם כעוסק מורשה ולשלם מע״מ.
                </p>
              </div>
            </div>

            <div className="bg-red-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl font-black mb-8 text-center">
                שאלות על מע״מ? אנחנו כאן לעזור
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <Input
                  placeholder="שם מלא *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 bg-white/20 border-white/30 text-white placeholder-white/70"
                  required
                />
                <Input
                  type="tel"
                  placeholder="טלפון *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 bg-white/20 border-white/30 text-white placeholder-white/70"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-white text-red-600 hover:bg-gray-100 font-bold"
                >
                  {isSubmitting ? 'שולח...' : 'בדיקה סטטוס מע״מ'}
                </Button>
              </form>

              <div className="flex gap-4 pt-6 border-t border-white/20">
                <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full h-12 bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}