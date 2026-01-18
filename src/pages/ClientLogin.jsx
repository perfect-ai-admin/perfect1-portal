import React, { useState, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Phone, ArrowRight, Sparkles, Zap } from 'lucide-react';

function ClientLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already logged in or returning from Google OAuth
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const authData = params.get('authData');

    // Handle Google OAuth callback
    if (code) {
      setIsLoading(true);
      handleGoogleOAuthCallback(code);
      return;
    }

    if (authData) {
      try {
        const userData = JSON.parse(atob(authData));
        localStorage.setItem('user', JSON.stringify(userData));
        window.location.href = '/ClientDashboard';
      } catch (err) {
        console.error('Auth data decode error:', err);
        setError('שגיאה בתהליך ההתחברות');
      }
      return;
    }

    const user = localStorage.getItem('user');
    if (user) {
      window.location.href = '/ClientDashboard';
    }
  }, []);

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

      // Store user data in localStorage with id ensured
      const userToStore = {
        id: user.id || user.created_by,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        status: user.status
      };
      localStorage.setItem('user', JSON.stringify(userToStore));
      window.location.href = '/ClientDashboard';
    } catch (err) {
    console.error('Login error:', err);
    setError('שגיאה בתהליך הכניסה. אנא נסה שוב.');
    setIsLoading(false);
    }
    }

    const BrandingSide = memo(() => (
    <div className="hidden lg:flex w-1/2 bg-[#F8F9FA] relative items-center justify-center p-20 overflow-hidden">
    <div className="absolute inset-0 opacity-40">
     <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
     <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
    </div>
    <div className="relative z-10 text-center max-w-lg">
     <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-8 transform -rotate-6 transition-transform hover:rotate-0 duration-500">
       <Sparkles className="w-10 h-10 text-[#1E3A5F]" />
     </div>
     <h2 className="text-4xl font-bold text-[#1E3A5F] mb-4 tracking-tight">Perfect Biz AI</h2>
     <p className="text-xl text-gray-500 font-light leading-relaxed">טכנולוגיה חכמה לניהול עסקי פשוט.</p>
    </div>
    </div>
    ));

  const handleGoogleOAuthCallback = async (code) => {
    try {
      const response = await base44.functions.invoke('googleAuthCallback', { code });

      if (response.data && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.href = '/ClientDashboard';
      } else {
        setError('שגיאה בתהליך ההתחברות');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      setError(`שגיאה בתהליך ההתחברות: ${error.message}`);
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

      <div className="min-h-screen bg-white flex" dir="rtl">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 z-10">
          <div className="w-full max-w-[380px] space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-4 justify-center">
                <div className="w-8 h-8 bg-[#1E3A5F] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#1E3A5F]">Perfect Biz AI</h2>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                כניסה לאזור האישי
              </h1>
            </div>

            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    מספר טלפון
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="05X-XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pr-9 h-10 text-base bg-white border-gray-200 focus:border-[#1E3A5F] focus:ring-[#1E3A5F] transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    סיסמה
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-9 h-10 text-base bg-white border-gray-200 focus:border-[#1E3A5F] focus:ring-[#1E3A5F] transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2"
                  >
                    <div className="mt-0.5">
                       <Zap className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 text-base bg-[#1E3A5F] hover:bg-[#162B47] text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      כניסה
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-400">או</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full h-10 text-sm font-medium border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>

              <div className="text-center pt-2">
                <a 
                  href={`https://wa.me/972537703603?text=${encodeURIComponent('היי, אני צריך עזרה עם הכניסה לאזור האישי')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-[#1E3A5F] transition-colors"
                >
                  נתקלת בבעיה? פנה לתמיכה
                </a>
              </div>
            </div>
          </div>
        </div>

        <BrandingSide />
      </div>
    </>
  );
}

export default memo(ClientLogin);