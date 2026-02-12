import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link2, Loader2, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, ExternalLink, X } from 'lucide-react';

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

function ConnectProviderDialogInner({ provider, onConnect, onClose, loading }) {
  const [credentials, setCredentials] = useState({});
  const [showGuide, setShowGuide] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const authFields = provider.authFields || [];
  const guide = PROVIDER_GUIDES[provider.id];

  async function doConnect() {
    if (submitting || loading) return;
    setSubmitting(true);
    console.log('📡 doConnect:', provider.id, Object.keys(credentials));
    try {
      await onConnect(provider.id, { ...credentials });
    } catch (err) {
      console.error('doConnect error:', err);
    }
    setSubmitting(false);
  }

  const isLoading = loading || submitting;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, direction: 'rtl' }}>
      <div 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)' }}
        onMouseDown={onClose}
      />
      
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
        <div 
          style={{ background: 'white', borderRadius: 12, boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: 440, pointerEvents: 'auto', position: 'relative' }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div 
            style={{ position: 'absolute', top: 12, left: 12, cursor: 'pointer', padding: 4, borderRadius: '50%', color: '#9ca3af' }}
            onMouseDown={(e) => { e.stopPropagation(); onClose(); }}
          >
            <X className="w-5 h-5" />
          </div>

          <div style={{ padding: '24px 24px 16px' }}>
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

          <div style={{ padding: '0 24px', maxHeight: '50vh', overflowY: 'auto' }}>
            <div className="space-y-4">
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
                    onChange={e => {
                      const val = e.target.value;
                      setCredentials(prev => ({ ...prev, [field.name]: val }));
                    }}
                    dir="ltr"
                    autoComplete="off"
                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none' }}
                  />
                </div>
              ))}

              {guide && (
                <>
                  <div
                    onMouseDown={() => setShowGuide(!showGuide)}
                    className="w-full flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors py-1 cursor-pointer select-none"
                  >
                    <HelpCircle className="w-4 h-4 flex-shrink-0" />
                    <span>איפה מוצאים את הפרטים?</span>
                    {showGuide ? <ChevronUp className="w-4 h-4 mr-auto" /> : <ChevronDown className="w-4 h-4 mr-auto" />}
                  </div>
                  {showGuide && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 text-sm text-blue-900">
                      <ol className="list-decimal list-inside space-y-2 pr-2 text-blue-800">
                        {guide.steps.map((step, i) => <li key={i}>{step}</li>)}
                      </ol>
                      {guide.link && (
                        <div className="pt-1 border-t border-blue-200">
                          <a href={guide.link.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-medium">
                            <ExternalLink className="w-3.5 h-3.5" /> {guide.link.label}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{ padding: '16px 24px 24px', display: 'flex', gap: 8, borderTop: '1px solid #f3f4f6', marginTop: 8 }}>
            <div
              role="button"
              tabIndex={0}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isLoading) doConnect();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isLoading) doConnect();
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', background: isLoading ? '#94a3b8' : '#1E3A5F', color: 'white',
                borderRadius: 8, fontWeight: 500, fontSize: 14,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                userSelect: 'none',
              }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              חבר את החשבון
            </div>
            <div
              role="button"
              tabIndex={0}
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
              style={{
                padding: '10px 16px', background: 'white', border: '1px solid #d1d5db',
                color: '#374151', borderRadius: 8, fontWeight: 500, fontSize: 14,
                cursor: 'pointer', userSelect: 'none',
              }}
            >
              ביטול
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConnectProviderDialog({ open, onClose, provider, onConnect, loading }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open || !provider) return null;

  return ReactDOM.createPortal(
    <ConnectProviderDialogInner 
      provider={provider} 
      onConnect={onConnect} 
      onClose={onClose} 
      loading={loading} 
    />,
    document.body
  );
}