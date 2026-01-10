import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Phone, MessageCircle } from 'lucide-react';

export default function ReceiptsIncome() {
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
        source_page: 'קבלות והכנסות',
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
        title="קבלות והכנסות לעוסק פטור - מדריך נכון | Perfect One"
        description="איך מנהלים קבלות והכנסות כעוסק פטור בצורה מסודרת וחוקית."
        canonical="https://perfect1.co.il/receipts-income"
      />

      <main className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black text-[#1E3A5F] mb-6 text-center">
              קבלות והכנסות לעוסק פטור
            </h1>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              איך מארגנים קבלות והכנסות כדי להישאר תקני מול מס הכנסה
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">קבלות חוקיות</h3>
                <p className="text-gray-600 mb-3">דרישות לקבלה חוקית:</p>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ שם וכתובת הקבלן</li>
                  <li>✓ תיאור השירות/המוצר</li>
                  <li>✓ סכום החיוב</li>
                  <li>✓ תאריך</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">ניהול הכנסות</h3>
                <p className="text-gray-600 mb-3">דברים חשובים:</p>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ שמירת כל הקבלות בארכיון</li>
                  <li>✓ תיעוד הכנסות חודשיות</li>
                  <li>✓ דיווח נכון למס הכנסה</li>
                  <li>✓ ניהול מסודר של חשבונות</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl font-black mb-8 text-center">
                בואו ניצור לך מערכת קבלות מסודרת
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
                  className="w-full h-12 bg-white text-amber-600 hover:bg-gray-100 font-bold"
                >
                  {isSubmitting ? 'שולח...' : 'קבל ייעוץ על ניהול קבלות'}
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