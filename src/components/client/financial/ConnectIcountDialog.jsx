import React, { useState } from 'react';
import { Link2, Loader2, ExternalLink, ShieldCheck, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export default function ConnectIcountDialog({ open, onClose, onConnect, loading }) {
  const [cid, setCid] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const handleConnect = () => {
    onConnect('icount', 'session', { cid, username, password });
  };

  const isValid = cid.trim() && username.trim() && password.trim();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border"
              style={{ backgroundColor: '#eef2ff', borderColor: '#a5b4fc' }}>
              <span className="font-black text-xs" style={{ color: '#3730a3' }}>iCount</span>
            </div>
            <span>חיבור חשבון iCount שלך</span>
          </DialogTitle>
          <DialogDescription className="text-right">
            חבר את חשבון ה-iCount האישי שלך כדי להפיק מסמכים, לסנכרן לקוחות ועוד
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4" dir="rtl">
          {/* Company ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מזהה חברה (CID)</label>
            <Input
              type="text"
              placeholder="הכנס את מזהה החברה שלך ב-iCount"
              value={cid}
              onChange={e => setCid(e.target.value)}
              className="text-left"
              dir="ltr"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם משתמש</label>
            <Input
              type="text"
              placeholder="שם המשתמש ב-iCount"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="text-left"
              dir="ltr"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
            <Input
              type="password"
              placeholder="הסיסמה שלך ב-iCount"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="text-left"
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-1">הפרטים נשמרים באופן מאובטח ומשמשים רק לחשבון שלך</p>
          </div>

          {/* How to guide */}
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors py-2"
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span>איפה מוצאים את הפרטים?</span>
            {showGuide ? <ChevronUp className="w-4 h-4 mr-auto" /> : <ChevronDown className="w-4 h-4 mr-auto" />}
          </button>

          {showGuide && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 text-sm text-blue-900 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="font-medium">הדרכה שלב אחרי שלב:</p>
              </div>
              <ol className="list-decimal list-inside space-y-2 pr-2 text-blue-800">
                <li>היכנס לחשבון ה-iCount שלך ב-<strong>app.icount.co.il</strong></li>
                <li><strong>מזהה חברה (CID)</strong> - מופיע בכתובת האתר או בהגדרות החשבון</li>
                <li><strong>שם משתמש</strong> - שם המשתמש שאיתו אתה נכנס ל-iCount</li>
                <li><strong>סיסמה</strong> - הסיסמה שלך ב-iCount</li>
              </ol>
              <div className="pt-1 border-t border-blue-200">
                <a 
                  href="https://app.icount.co.il" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  פתח את חשבון iCount שלי
                </a>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleConnect} disabled={loading || !isValid}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Link2 className="w-4 h-4 ml-2" />}
            חבר את החשבון
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}