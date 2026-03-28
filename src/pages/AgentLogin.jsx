import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn } from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';

export default function AgentLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await invokeFunction('agentLogin', { username, password });
      const agent = result.agent;

      if (!agent) {
        setError('שם משתמש או סיסמה שגויים');
        setIsLoading(false);
        return;
      }

      if (!agent.active) {
        setError('חשבון זה אינו פעיל');
        setIsLoading(false);
        return;
      }

      // שמירת הנציג ב-localStorage
      localStorage.setItem('agent', JSON.stringify(agent));
      navigate('/AgentCRM');
    } catch (err) {
      setError('שגיאה בהתחברות');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">כניסת נציגים</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">שם משתמש</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="שם משתמש"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">סיסמה</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="סיסמה"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-[#27AE60] hover:bg-[#2ECC71]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  מתחבר...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 ml-2" />
                  התחבר
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}