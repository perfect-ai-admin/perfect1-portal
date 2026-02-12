import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Link2, Loader2, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, ExternalLink, X } from 'lucide-react';

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

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setCredentials({});
      setShowGuide(false);
    }
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  const handleFieldChange = useCallback((fieldName, value) => {
    setCredentials(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    console.log('🔌 Connect clicked!', provider?.id, credentials);
    if (provider && onConnect) {
      onConnect(provider.id, credentials);
    }
  }, [provider, credentials, onConnect]);

  if (!open || !provider) return null;

  const authFields = provider.authFields || [];
  const guide = PROVIDER_GUIDES[provider.id];

  const dialogContent = (
    <div 
      className="fixed inset-0" 
      style={{ zIndex: 99999 }} 
      dir="rtl"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Centering container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md relative"
          style={{ zIndex: 100000 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button 
            type="button"
            className="absolute top-3 left-3 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center border"
                style={{ backgroundColor: provider.logoColors?.bg, borderColor: provider.logoColors?.border }}>
                <span className="font-black text-xs" style={{ color: provider.logoColors?.text }}>{provider.logoText}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">חיבור חשבון {provider.name}</h2>
            </div>
            <p className="text-sm text-gray-500">
              חבר את חשבון ה-{provider.name} שלך כדי להפיק מסמכים, לסנכרן לקוחות ועוד
            </p>
          </div>

          {/* Body */}
          <div className="px-6 space-y-4 max-h-[50vh] overflow-y-auto">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>החיבור מאובטח ומוצפן. הנתונים נשמרים רק בחשבון שלך.</span>
            </div>

            {authFields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder || ''}
                  value={credentials[field.name] || ''}
                  onChange={e => handleFieldChange(field.name, e.target.value)}
                  dir="ltr"
                  className="w-full text-left px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  autoComplete="off"
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 text-sm text-blue-900">
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

          {/* Footer */}
          <div className="p-6 pt-4 flex gap-2 justify-start border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A5F] text-white rounded-lg font-medium text-sm hover:bg-[#2C5282] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              חבר את החשבון
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render via portal to document.body to avoid any parent overflow/z-index issues
  return ReactDOM.createPortal(dialogContent, document.body);
}