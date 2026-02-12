import React, { useState } from 'react';
import { Link2, Loader2, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

// Provider-specific help guides
const PROVIDER_GUIDES = {
  icount: {
    steps: [
      'היכנס לחשבון ה-iCount שלך ב-app.icount.co.il',
      'מזהה חברה (CID) - מופיע בכתובת האתר או בהגדרות החשבון',
      'שם משתמש - שם המשתמש שאיתו אתה נכנס ל-iCount',
      'סיסמה - הסיסמה שלך ב-iCount',
    ],
    link: { url: 'https://app.icount.co.il', label: 'פתח את חשבון iCount שלי' },
  },
  finbot: {
    steps: [
      'היכנס לאפליקציית Finbot שלך',
      'עבור ללשונית "הגדרות העסק"',
      'חפש את השדה "מפתח API להפקת הכנסות"',
      'לחץ על "יצירת מפתח API" — המערכת תיצור עבורך טוקן',
      'העתק את הטוקן והדבק אותו כאן',
    ],
    link: { url: 'https://bros.finbot.co.il/hs-user/index.php', label: 'פתח את חשבון Finbot שלי' },
  },
  morning: {
    steps: [
      'היכנס לחשבון Morning (חשבונית ירוקה) שלך',
      'לחץ על "הגדרות" > "מפתחות API"',
      'לחץ על "צור מפתח API חדש"',
      'העתק את ה-API Key וה-API Secret שנוצרו',
      'הדבק את שניהם כאן',
    ],
    link: { url: 'https://app.greeninvoice.co.il/settings/api-keys', label: 'פתח את הגדרות API ב-Morning' },
  },
  sumit: {
    steps: [
      'היכנס לחשבון Sumit שלך',
      'עבור להגדרות > אינטגרציות',
      'העתק את ה-API Key',
    ],
    link: { url: 'https://app.sumit.co.il', label: 'פתח את חשבון Sumit שלי' },
  },
};

export default function ConnectProviderDialog({ open, onClose, provider, onConnect, loading }) {
  const [credentials, setCredentials] = useState({});
  const [showGuide, setShowGuide] = useState(false);

  if (!provider) return null;

  const authFields = provider.authFields || [];
  const guide = PROVIDER_GUIDES[provider.id];

  const handleFieldChange = (fieldName, value) => {
    setCredentials(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleConnect = () => {
    onConnect(provider.id, credentials);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border"
              style={{ backgroundColor: provider.logoColors.bg, borderColor: provider.logoColors.border }}>
              <span className="font-black text-xs" style={{ color: provider.logoColors.text }}>{provider.logoText}</span>
            </div>
            <span>חיבור חשבון {provider.name}</span>
          </DialogTitle>
          <DialogDescription className="text-right">
            חבר את חשבון ה-{provider.name} שלך כדי להפיק מסמכים, לסנכרן לקוחות ועוד
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>החיבור מאובטח ומוצפן. הנתונים נשמרים רק בחשבון שלך.</span>
          </div>

          {authFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <Input
                type={field.type || 'text'}
                placeholder={field.placeholder || ''}
                value={credentials[field.name] || ''}
                onChange={e => handleFieldChange(field.name, e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>
          ))}

          {/* How-to guide */}
          {guide && (
            <>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="w-full flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors py-1"
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
                    {guide.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                  {guide.link && (
                    <div className="pt-1 border-t border-blue-200">
                      <a
                        href={guide.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {guide.link.label}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleConnect} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Link2 className="w-4 h-4 ml-2" />}
            חבר את החשבון
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}