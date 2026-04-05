import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rawRedirect = searchParams.get('returnTo') || searchParams.get('redirect') || searchParams.get('from_url') || '/APP';
  // If from_url is a full URL, extract just the pathname
  const redirectTo = rawRedirect.startsWith('http') ? new URL(rawRedirect).pathname : rawRedirect;

  // If already logged in, redirect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(redirectTo, { replace: true });
      }
    });
  }, [navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: email.split('@')[0] }
          }
        });
        if (error) throw error;
        setMessage('נשלח אליך מייל אימות. בדוק את תיבת הדואר שלך.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      if (err.message?.includes('Invalid login')) {
        setError('אימייל או סיסמה שגויים');
      } else if (err.message?.includes('already registered')) {
        setError('המשתמש כבר רשום. נסה להתחבר.');
      } else {
        setError(err.message || 'שגיאה בהתחברות');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
      }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'יצירת חשבון' : 'התחברות'}
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1">
            {isSignUp ? 'צור חשבון חדש כדי להתחיל' : 'היכנס לחשבון שלך'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium"
            onClick={handleGoogleLogin}
            type="button"
          >
            <img src="https://www.google.com/favicon.ico" alt="" loading="lazy" decoding="async" className="w-4 h-4 ml-2" />
            המשך עם Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">או</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-10 h-11"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 pl-10 h-11"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm text-center">
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : (
                <LogIn className="h-4 w-4 ml-2" />
              )}
              {isSignUp ? 'צור חשבון' : 'התחבר'}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            {isSignUp ? 'כבר יש לך חשבון?' : 'אין לך חשבון?'}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
              className="text-purple-600 font-medium hover:underline mr-1"
            >
              {isSignUp ? 'התחבר' : 'צור חשבון'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
