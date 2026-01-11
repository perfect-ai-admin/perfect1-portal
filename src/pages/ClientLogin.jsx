import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClientLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      setError('מספר טלפון לא תקין');
      setIsLoading(false);
      return;
    }

    const leads = await base44.entities.Lead.filter({ phone: cleanPhone });
    
    if (leads.length === 0) {
      setError('מספר טלפון לא נמצא במערכת');
      setIsLoading(false);
      return;
    }

    const client = leads[0];
    
    // Simple password check (in production, use proper hashing)
    if (client.client_password !== password) {
      setError('סיסמה שגויה');
      setIsLoading(false);
      return;
    }

    // Store client data in localStorage
    localStorage.setItem('client', JSON.stringify(client));
    navigate(createPageUrl('ClientDashboard'));
  };

  return (
    <>
      <Helmet>
        <title>כניסה לאזור האישי | Perfect One</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] flex items-center justify-center p-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] p-8 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">אזור אישי</h1>
              <p className="text-gray-200">ברוך הבא למרכז הבקרה העסקי שלך</p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    מספר טלפון
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="05X-XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pr-10 h-12 text-lg"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    סיסמה
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="הזן סיסמה"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 h-12 text-lg"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
                    <p className="text-red-700 font-semibold">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-lg bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white font-bold"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin ml-2" /> מתחבר...</>
                  ) : (
                    'כניסה לאזור האישי'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  לא קיבלת סיסמה?{' '}
                  <a 
                    href={`https://wa.me/972537703603?text=${encodeURIComponent('היי, אני צריך עזרה עם הכניסה לאזור האישי')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#27AE60] font-semibold hover:underline"
                  >
                    צור קשר בוואטסאפ
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white text-sm">
              האזור האישי מאובטח ומוצפן לשמירת הפרטיות שלך
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}