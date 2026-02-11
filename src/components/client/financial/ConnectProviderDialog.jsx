import React, { useState } from 'react';
import { Link2, Loader2, ExternalLink, ShieldCheck, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import ConnectIcountDialog from './ConnectIcountDialog';

export default function ConnectProviderDialog({ open, onClose, provider, onConnect, loading }) {
  const [apiKey, setApiKey] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  if (!provider) return null;

  // iCount uses credentials (cid + user + pass), not API key
  if (provider.id === 'icount') {
    return (
      <ConnectIcountDialog
        open={open}
        onClose={onClose}
        onConnect={onConnect}
        loading={loading}
      />
    );
  }

  const handleConnect = () => {
    onConnect(provider.id, 'apikey', { api_key: apiKey });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border"
              style={{ backgroundColor: provider.logoColors.bg, borderColor: provider.logoColors.border }}>
              <span className="font-black text-xs" style={{ color: provider.logoColors.text }}>{provider.logoText}</span>
            </div>
            <span>חיבור חשבון {provider.name} שלך</span>
          </DialogTitle>
          <DialogDescription className="text-right">
            חבר את חשבון ה-{provider.name} האישי שלך כדי להפיק מסמכים, לסנכרן לקוחות ועוד
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4" dir="rtl">
          {/* API Key input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מפתח API (טוקן)</label>
            <Input
              type="password"
              placeholder="הדבק כאן את ה-API Key שלך"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="text-left"
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-1">המפתח נשמר באופן מאובטח ומשמש רק לחשבון שלך</p>
          </div>

          {/* How to get API Key - expandable guide */}
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors py-2"
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span>איך מוצאים את ה-API Key?</span>
            {showGuide ? <ChevronUp className="w-4 h-4 mr-auto" /> : <ChevronDown className="w-4 h-4 mr-auto" />}
          </button>

          {showGuide && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 text-sm text-blue-900 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="font-medium">הדרכה שלב אחרי שלב:</p>
              </div>
              <ol className="list-decimal list-inside space-y-2 pr-2 text-blue-800">
                <li>היכנס לחשבון ה-{provider.name} שלך</li>
                <li>לך ל<strong>הגדרות העסק</strong></li>
                <li>בחר <strong>מפתח API להפקת הכנסות</strong></li>
                <li>לחץ על <strong>"יצירת מפתח API"</strong></li>
                <li>העתק את המפתח שנוצר והדבק אותו למעלה</li>
              </ol>
              <div className="pt-1 border-t border-blue-200">
                <a 
                  href="https://app.finbotai.co.il" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  פתח את חשבון Finbot שלי
                </a>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleConnect} disabled={loading || !apiKey.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Link2 className="w-4 h-4 ml-2" />}
            חבר את החשבון
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}