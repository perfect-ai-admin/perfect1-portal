import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InviteUser() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInvite = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'יש להזין כתובת אימייל' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await base44.users.inviteUser(email, role);
      setMessage({ 
        type: 'success', 
        text: `הזמנה נשלחה בהצלחה ל-${email}` 
      });
      setEmail('');
      setRole('user');
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'שגיאה בשליחת ההזמנה' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-blue-50/30 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl border-t-4 border-[#1E3A5F]">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-black text-[#1E3A5F]">
                הזמנת משתמש חדש
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                שלח הזמנה למשתמש חדש להצטרף למערכת
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleInvite} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-bold text-gray-700">
                    כתובת אימייל
                  </Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@company.com"
                      className="pr-12 h-12 text-base"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-base font-bold text-gray-700">
                    תפקיד במערכת
                  </Label>
                  <Select value={role} onValueChange={setRole} disabled={loading}>
                    <SelectTrigger id="role" className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">משתמש רגיל</SelectItem>
                      <SelectItem value="admin">מנהל מערכת</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    {role === 'admin' 
                      ? '⚠️ מנהל מערכת יקבל גישה מלאה לכל הנתונים והמשתמשים'
                      : 'משתמש רגיל יקבל גישה למודולים שלו בלבד'}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] hover:from-[#2C5282] hover:to-[#1E3A5F] text-white shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      שולח הזמנה...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      שלח הזמנה
                    </span>
                  )}
                </Button>
              </form>

              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
                      message.type === 'success'
                        ? 'bg-green-50 border-2 border-green-300'
                        : 'bg-red-50 border-2 border-red-300'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-bold ${
                        message.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {message.text}
                      </p>
                      {message.type === 'success' && (
                        <p className="text-sm text-green-700 mt-1">
                          המשתמש יקבל אימייל עם קישור להגדרת סיסמה וכניסה למערכת
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-[#1E3A5F] mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  איך זה עובד?
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ המשתמש יקבל אימייל הזמנה</li>
                  <li>✅ הוא יקליק על הקישור ויגדיר סיסמה</li>
                  <li>✅ אחרי זה יוכל להיכנס עם המייל והסיסמה</li>
                  <li>✅ אפשר גם להיכנס דרך Google אם יש לו חשבון</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}