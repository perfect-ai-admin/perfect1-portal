import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Phone, MessageCircle } from 'lucide-react';

export default function OsekPaturVsMorasha() {
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
        source_page: 'עוסק פטור או מורשה',
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
        title="עוסק פטור או מורשה - איזה טוב לך? | Perfect One"
        description="השוואה מלאה בין עוסק פטור לעוסק מורשה - יתרונות, חסרונות והחלטה מתבקשת."
        canonical="https://perfect1.co.il/osek-patur-vs-morasha"
      />

      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black text-[#1E3A5F] mb-6 text-center">
              עוסק פטור או מורשה?
            </h1>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              איזה מודל עסקי טוב יותר עבורך?
            </p>

            <div className="overflow-x-auto mb-16">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-4 text-right font-bold text-[#1E3A5F]">תכונה</th>
                    <th className="border p-4 text-right font-bold text-blue-600">עוסק פטור</th>
                    <th className="border p-4 text-right font-bold text-green-600">עוסק מורשה</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-4 font-bold text-gray-700">מע״מ</td>
                    <td className="border p-4 text-blue-600">פטור ✓</td>
                    <td className="border p-4 text-gray-700">חייב</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-4 font-bold text-gray-700">תקרת הכנסה</td>
                    <td className="border p-4 text-blue-600">יש תקרה</td>
                    <td className="border p-4 text-gray-700">ללא תקרה</td>
                  </tr>
                  <tr>
                    <td className="border p-4 font-bold text-gray-700">מורכבות ניהול</td>
                    <td className="border p-4 text-blue-600">פשוט ✓</td>
                    <td className="border p-4 text-gray-700">מורכב</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border p-4 font-bold text-gray-700">עלויות</td>
                    <td className="border p-4 text-blue-600">נמוכות</td>
                    <td className="border p-4 text-gray-700">גבוהות</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl font-black mb-8 text-center">
                איזה מודל מתאים לך?
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
                  className="w-full h-12 bg-white text-indigo-600 hover:bg-gray-100 font-bold"
                >
                  {isSubmitting ? 'שולח...' : 'בדיקה אישית בחינם'}
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