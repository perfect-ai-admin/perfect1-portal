import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Phone, MessageCircle, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FAQSchema from '../components/seo/FAQSchema';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import PageTracker from '../components/seo/PageTracker';

export default function HowToCloseOsekPatur() {
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
        source_page: 'איך סוגרים עוסק פטור',
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
        title="איך סוגרים עוסק פטור - מדריך סגירה | Perfect One"
        description="מדריך מלא לסגירת עוסק פטור - שלבים, מסמכים וכיצד לסיים כל דבר כראוי."
        canonical="https://perfect1.co.il/how-to-close-osek-patur"
      />

      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black text-[#1E3A5F] mb-6 text-center">
              איך סוגרים עוסק פטור?
            </h1>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              מדריך שלב אחר שלב לסגירת עוסק פטור בצורה חוקית וברורה
            </p>

            <div className="space-y-6 mb-16">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border-r-4 border-gray-600">
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">1. התראה למס הכנסה</h3>
                <p className="text-gray-700">הודעה על סגירת העסק למס הכנסה</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-r-4 border-blue-600">
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">2. דוח סיום לביטוח לאומי</h3>
                <p className="text-gray-700">התראה לביטוח לאומי על סיום העסק</p>
              </div>

              <div className="bg-gradient-to-r from-cyan-50 to-green-50 rounded-2xl p-6 border-r-4 border-green-600">
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">3. דוח סגירה שנתי</h3>
                <p className="text-gray-700">דיווח הכנסות סופי עד לתאריך הסגירה</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-r-4 border-emerald-600">
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">4. סגירה סופית</h3>
                <p className="text-gray-700">סיום כל התחייבויות פיננסיות</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl font-black mb-8 text-center">
                בואו נעשה את הסגירה בנכון ובלי בעיות
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
                  className="w-full h-12 bg-white text-gray-800 hover:bg-gray-100 font-bold"
                >
                  {isSubmitting ? 'שולח...' : 'קבל הכוונה לסגירה'}
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