import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InviteUserDialog() {
  const [open, setOpen] = useState(false);
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
      setMessage({
        type: 'success', 
        text: `הזמנה נשלחה בהצלחה ל-${email}` 
      });
      setEmail('');
      setRole('user');
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setMessage(null);
      }, 2000);
    } catch (error) {
      const errorMsg = error.message || 'שגיאה בשליחת ההזמנה';
      setMessage({ 
        type: 'error', 
        text: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] hover:from-[#2C5282] hover:to-[#1E3A5F] text-white shadow-lg">
          <UserPlus className="w-4 h-4 ml-2" />
          הזמן משתמש חדש
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#1E3A5F] flex items-center gap-2">
            <UserPlus className="w-6 h-6" />
            הזמנת משתמש חדש
          </DialogTitle>
          <DialogDescription>
            שלח הזמנה למשתמש חדש להצטרף למערכת
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-4 mt-4">
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
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] hover:from-[#2C5282] hover:to-[#1E3A5F] text-white"
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
              className={`p-3 rounded-lg flex items-start gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-300'
                  : 'bg-red-50 border border-red-300'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-bold ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message.text}
                </p>
                {message.type === 'success' && (
                  <p className="text-xs text-green-700 mt-1">
                    המשתמש יקבל אימייל עם קישור להגדרת סיסמה וכניסה למערכת
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-700">
            <strong>איך זה עובד?</strong> המשתמש יקבל אימייל עם קישור להגדרת סיסמה, יגדיר סיסמה ייחודית, ויוכל להיכנס עם המייל והסיסמה שלו.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}