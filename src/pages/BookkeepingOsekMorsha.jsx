import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UnifiedLeadForm from '@/components/forms/UnifiedLeadForm';

export default function BookkeepingOsekMorsha() {
  const [showLeadForm, setShowLeadForm] = useState(false);

  return (
    <main className="pt-20 min-h-screen bg-[#F8F9FA]">
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            הנהלת חשבונות לעוסק מורשה
          </motion.h1>
          <p className="text-blue-100 text-lg">שירות פרטי לפתיחת עוסק פטור, לא גוף ממשלתי.</p>
        </div>
      </section>
      
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Button onClick={() => setShowLeadForm(true)} className="bg-blue-600 hover:bg-blue-700">
          צור קשר
        </Button>
      </section>

      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>שירות פרטי לפתיחת עוסק פטור, לא גוף ממשלתי.</DialogTitle>
            <DialogDescription>
              בואו נתחיל עם פרטים בסיסיים
            </DialogDescription>
          </DialogHeader>
          <UnifiedLeadForm onClose={() => setShowLeadForm(false)} />
        </DialogContent>
      </Dialog>
    </main>
  );
}