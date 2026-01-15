import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, User, Zap } from 'lucide-react';
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

    // Check password first
    if (password !== '123456') {
      setError('סיסמה שגויה');
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

    // Store client data in localStorage
    localStorage.setItem('client', JSON.stringify(client));
    navigate(createPageUrl('ClientDashboard'));
  };

  return (
    <>
      <Helmet>
        <title>כניסה ל-BizPilot | ניהול העסק במקום אחד</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="google-site-verification" content="bLaptZTTD_btTGoFrlW9uYdfP6oYBsoLSXdM3HDyWJg" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] flex items-center justify-center p-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-white/30">
                  <Zap className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-black text-white mb-2">BizPilot</h1>
                <p className="text-white/90 text-lg font-medium">ניהול העסק במקום אחד</p>
              </div>
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
                  className="w-full h-14 text-lg bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin ml-2" /> מתחבר...</>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 ml-2" />
                      כניסה ל-BizPilot
                    </>
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

          <div className="mt-8 text-center space-y-3">
            <p className="text-white/90 text-sm font-medium">
              🔒 מאובטח ומוצפן לשמירת הפרטיות שלך
            </p>
            <div className="flex items-center justify-center gap-6 text-white/70 text-xs">
              <span>💼 ניהול עסקי</span>
              <span>📊 דיווחים</span>
              <span>📈 צמיחה</span>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}