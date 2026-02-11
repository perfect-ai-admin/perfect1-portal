import React, { useState } from 'react';
import { Link2, Key, Loader2, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

export default function ConnectProviderDialog({ open, onClose, provider, onConnect, loading }) {
  const [apiKey, setApiKey] = useState('');

  if (!provider) return null;

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
          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">איפה מוצאים את ה-API Key?</p>
              <p>היכנס לחשבון {provider.name} שלך ← הגדרות העסק ← מפתח API להפקת הכנסות ← לחץ "יצירת מפתח API"</p>
            </div>
          </div>

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

          {/* Link to Finbot */}
          {provider.id === 'finbot' && (
            <a 
              href="https://app.finbotai.co.il" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              פתח את חשבון Finbot שלי
            </a>
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