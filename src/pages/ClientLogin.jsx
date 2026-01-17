import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, User, Zap, LogIn } from 'lucide-react';
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

  const handleGoogleLogin = () => {
    window.location.href = '/api/functions/googleAuthStart';
  };

  return (
    <>
      <Helmet>
        <title>כניסה ל-BizPilot | ניהול העסק במקום אחד</title>
        <meta name="robots" content="noindex, nofollow" />
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
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-14 text-lg bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold rounded-xl shadow-md hover:shadow-lg transition-all mb-4 flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  התחבר עם Google
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">או התחבר עם סיסמה</span>
                  </div>
                </div>

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