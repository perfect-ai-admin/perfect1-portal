import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Phone, Zap, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
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

    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 9) {
        setError('מספר טלפון לא תקין');
        setIsLoading(false);
        return;
      }

      // Search for Lead by phone
      const leads = await base44.entities.Lead.filter({ phone: cleanPhone });

      if (leads.length === 0) {
        setError('מספר טלפון לא נמצא במערכת');
        setIsLoading(false);
        return;
      }

      const lead = leads[0];

      // Verify password (all clients use 123456)
      if (password !== '123456') {
        setError('סיסמה שגויה');
        setIsLoading(false);
        return;
      }

      // Find or create User for this Lead
      let user;
      const usersByEmail = await base44.entities.User.filter({ email: lead.email });

      if (usersByEmail.length > 0) {
        // User exists
        user = usersByEmail[0];
        await base44.entities.User.update(user.id, {
          last_login_at: new Date().toISOString()
        });
      } else {
        // Create new User from Lead
        const freePlans = await base44.entities.Plan.filter({ name: 'חינמי' });
        const freePlan = freePlans.length > 0 ? freePlans[0] : null;

        user = await base44.entities.User.create({
          full_name: lead.name || 'משתמש חדש',
          email: lead.email || `lead_${lead.phone}@bizpilot.local`,
          phone: cleanPhone,
          status: 'active',
          last_login_at: new Date().toISOString(),
          current_plan_id: freePlan?.id || null,
          plan_start_date: new Date().toISOString(),
          marketing_enabled: freePlan?.marketing_enabled || false,
          mentor_enabled: freePlan?.mentor_enabled || true,
          finance_enabled: freePlan?.finance_enabled || false,
          goals_limit: freePlan?.goals_limit || 1,
          max_active_goals: freePlan?.max_active_goals || 1
        });
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      navigate(createPageUrl('ClientDashboard'));
    } catch (err) {
      console.error('Login error:', err);
      setError('שגיאה בתהליך הכניסה. אנא נסה שוב.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await base44.functions.invoke('googleAuthStart', {});
      
      if (response.data && response.data.url) {
        sessionStorage.setItem('oauth_state', response.data.state);
        window.location.href = response.data.url;
      } else {
        console.error('Invalid response:', response);
        setError(`שגיאה בהתחברות עם Google: ${response.data?.error || 'תשובה לא תקינה מהשרת'}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError(`שגיאה בהתחברות עם Google: ${error.message || 'שגיאה לא צפויה'}`);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>כניסה לאזור האישי | Perfect Biz AI</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex" dir="rtl">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 bg-white shadow-xl lg:shadow-none z-10">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 mb-2 lg:mb-0">
                <div className="w-10 h-10 bg-gradient-to-br from-[#27AE60] to-[#2ECC71] rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-[#1E3A5F]">Perfect Biz AI</h2>
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                ברוכים הבאים לאזור האישי
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                המקום שלך לניהול, צמיחה וקבלת תובנות עסקיות חכמות.
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    מספר טלפון
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="05X-XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pr-10 h-12 text-lg bg-gray-50 border-gray-200 focus:bg-white transition-colors"
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
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 h-12 text-lg bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="bg-red-100 p-1 rounded-full shrink-0">
                       <Zap className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-lg bg-[#1E3A5F] hover:bg-[#162B47] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      כניסה למערכת
                      <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">או</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full h-12 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-xl flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                התחבר באמצעות Google
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  צריך עזרה?{' '}
                  <a 
                    href={`https://wa.me/972537703603?text=${encodeURIComponent('היי, אני צריך עזרה עם הכניסה לאזור האישי של Perfect Biz AI')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#27AE60] font-semibold hover:underline"
                  >
                    דבר איתנו בוואטסאפ
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Branding/Image (Hidden on Mobile) */}
        <div className="hidden lg:flex w-1/2 bg-[#1E3A5F] relative overflow-hidden flex-col justify-between p-20 text-white">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#27AE60]/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-medium mb-8">
                 <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                 <span>הבינה המלאכותית שתזניק את העסק שלך</span>
              </div>
              <h2 className="text-5xl font-bold leading-tight mb-6">
                ניהול חכם יותר.<br/>
                פשוט יותר.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2ECC71] to-[#D4AF37]">
                  רווחי יותר.
                </span>
              </h2>
              <p className="text-xl text-blue-100 max-w-lg leading-relaxed">
                מערכת Perfect Biz AI מרכזת עבורך את כל הנתונים, המשימות והתובנות במקום אחד, ועוזרת לך לקבל החלטות טובות יותר בכל יום.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="font-bold text-lg mb-1">אוטומציה חכמה</h3>
                <p className="text-sm text-blue-100">חסוך זמן יקר עם תהליכים אוטומטיים שמותאמים לעסק שלך</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-[#2ECC71]" />
                </div>
                <h3 className="font-bold text-lg mb-1">מעקב מטרות</h3>
                <p className="text-sm text-blue-100">הגדר יעדים ועקוב אחר ההתקדמות שלך בזמן אמת</p>
              </div>
            </div>

            <div className="relative z-10 mt-12 flex items-center gap-4 text-sm text-blue-200">
               <p>© 2025 Perfect Biz AI. כל הזכויות שמורות.</p>
            </div>
        </div>
      </div>
    </>
  );
}