import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AggresiveLeadPopup({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        // User not logged in
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone.trim() || !formData.name.trim() || !formData.email.trim()) {
      toast.error('נא למלא שם, טלפון ומייל');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await base44.functions.invoke('submitLeadToN8N', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: 'פתיחת תיק תוך 48 שעות',
        pageSlug: 'osek-patur-steps',
        businessName: 'Perfect One - Osek Patur'
      });

      if (response.data.success) {
        setFormData({ name: '', phone: '', email: '' });
        setShowSuggestions(false);
        onClose();
        toast.success('נקלטנו! נחזור אליך בקרוב');
      }
    } catch (error) {
      toast.error('שגיאה בשליחה');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-black text-[#1E3A5F]">
                  פתיחת תיק תוך 48 שעות
                </h2>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                השאר פרטים ואנחנו נטפל בפתיחת העוסק הפטור שלך תוך 48 שעות בלבד
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="שם מלא"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 rounded-lg border-2"
                  required
                />

                {/* Phone & Email Row */}
                {showSuggestions && user ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                    />
                    <div className="flex-1 flex flex-col gap-1 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <Phone className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-gray-800">{user.phone}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <Mail className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-gray-800">{user.email}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, phone: user.phone, email: user.email });
                        setShowSuggestions(false);
                      }}
                      className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                    >
                      בחר
                    </button>
                  </div>
                ) : (
                  <>
                    <Input
                      type="tel"
                      placeholder="טלפון"
                      value={formData.phone}
                      onFocus={() => user && setShowSuggestions(true)}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-11 rounded-lg border-2"
                      required
                    />
                    <Input
                      type="email"
                      placeholder="מייל"
                      value={formData.email}
                      onFocus={() => user && setShowSuggestions(true)}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-11 rounded-lg border-2"
                      required
                    />
                  </>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                >
                  {isSubmitting ? 'שולח...' : 'אני רוצה פתיחה תוך 48 שעות'}
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                נחזור אליך בטלפון שהשארת
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}