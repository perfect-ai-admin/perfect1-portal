import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Link2, Loader2, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, ExternalLink, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PROVIDER_GUIDES = {
  morning: {
    steps: [
      'היכנס לחשבון Morning (חשבונית ירוקה) שלך',
      'לחץ על "פרופיל" > "כלים למפתחים"',
      'לחץ על "הוספת מפתח"',
      'העתק את ה-API Key וה-API Secret שנוצרו',
      'הדבק את שניהם כאן',
    ],
    link: { url: 'https://app.greeninvoice.co.il/settings/api-keys', label: 'פתח את הגדרות API ב-Morning' },
  },
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
      'לחץ על "יצירת מפתח API"',
      'העתק את הטוקן והדבק אותו כאן',
    ],
    link: { url: 'https://bros.finbot.co.il/hs-user/index.php', label: 'פתח את חשבון Finbot שלי' },
  },
};

// This component handles EVERYTHING internally - no dependency on parent state
function ConnectProviderDialogInner({ provider, onSuccess, onClose }) {
  const [credentials, setCredentials] = useState({});
  const [showGuide, setShowGuide] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSavedCreds, setHasSavedCreds] = useState(false);
  const [checkingCreds, setCheckingCreds] = useState(true);

  const authFields = provider.authFields || [];
  const guide = PROVIDER_GUIDES[provider.id];

  const allFieldsFilled = authFields.every(f => (credentials[f.name] || '').trim().length > 0);

  // Check if saved credentials exist (but don't auto-connect)
  React.useEffect(() => {
    let cancelled = false;
    async function checkSavedCreds() {
      setCheckingCreds(true);
      try {
        const res = await base44.functions.invoke('acctGetConnectionStatus', {});
        if (cancelled) return;
        const savedProviders = res.data?.saved_providers || [];
        if (savedProviders.includes(provider.id)) {
          setHasSavedCreds(true);
        }
      } catch (err) {
        console.log('Check saved creds error:', err);
      }
      if (!cancelled) setCheckingCreds(false);
    }
    checkSavedCreds();
    return () => { cancelled = true; };
  }, [provider.id]);

  async function doConnect() {
    if (status === 'connecting') return;
    if (!allFieldsFilled) {
      setErrorMsg('אנא מלא את כל השדות');
      setStatus('error');
      return;
    }

    setStatus('connecting');
    setErrorMsg('');

    try {
      console.log('📡 Connecting to', provider.id, '...');
      const res = await base44.functions.invoke('acctConnectProvider', {
        provider: provider.id,
        credentials
      });
      console.log('📡 Response:', JSON.stringify(res.data));

      if (res.data?.status === 'connected') {
        setStatus('success');
        toast.success(`חשבון ${provider.name} חובר בהצלחה! מסנכרנים את כל הנתונים...`, { duration: 8000 });
        
        // Trigger full sync in background - use correct function per provider
        const syncFnMap = { morning: 'morningSyncPull', icount: 'icountSyncPull', finbot: 'finbotSyncPull' };
        const syncFn = syncFnMap[provider.id] || 'acctSyncPull';
        base44.functions.invoke(syncFn, { resource: 'all' })
          .then(syncRes => {
            const r = syncRes.data?.results || {};
            toast.success(`סנכרון הושלם! ${r.customers || 0} לקוחות, ${r.documents || 0} מסמכים, ${r.expenses || 0} הוצאות`, { duration: 8000 });
          })
          .catch(err => {
            console.log('Background sync error:', err);
            toast.info('הסנכרון ירוץ ברקע, תוכל לסנכרן ידנית מאוחר יותר');
          });

        // Wait a moment to show success state, then close
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setStatus('error');
        setErrorMsg(res.data?.error || 'שגיאה לא צפויה בהתחברות');
      }
    } catch (err) {
      console.error('📡 Connect error:', err);
      setStatus('error');
      const msg = err?.response?.data?.error || err?.message || 'שגיאה בהתחברות';
      setErrorMsg(msg);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, direction: 'rtl' }}>
      {/* Overlay */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
        onClick={() => { if (status !== 'connecting') onClose(); }}
      />

      {/* Dialog */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
        <div
          style={{ background: 'white', borderRadius: 12, boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: 440, pointerEvents: 'auto', position: 'relative' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={status === 'connecting'}
            style={{ position: 'absolute', top: 12, left: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
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

          {/* Reconnecting state */}
          {status === 'reconnecting' ? (
            <div style={{ padding: '32px 24px', textAlign: 'center' }}>
              <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-3 animate-spin" />
              <p className="text-base font-bold text-gray-700">מתחבר עם הפרטים השמורים...</p>
              <p className="text-sm text-gray-500 mt-1">רגע אחד</p>
            </div>
          ) : status === 'success' ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-bold text-green-700">החשבון חובר בהצלחה!</p>
              <p className="text-sm text-gray-500 mt-1">מסנכרנים נתונים ברקע...</p>
            </div>
          ) : (
            <>
              {/* Form */}
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
                        onChange={e => setCredentials(prev => ({ ...prev, [field.name]: e.target.value }))}
                        disabled={status === 'connecting'}
                        dir="ltr"
                        autoComplete="off"
                        style={{
                          width: '100%', textAlign: 'left', padding: '8px 12px',
                          border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none',
                          opacity: status === 'connecting' ? 0.6 : 1
                        }}
                      />
                    </div>
                  ))}

                  {/* Error message */}
                  {status === 'error' && errorMsg && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Guide */}
                  {guide && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowGuide(!showGuide)}
                        className="w-full flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors py-1"
                        style={{ background: 'none', border: 'none' }}
                      >
                        <HelpCircle className="w-4 h-4 flex-shrink-0" />
                        <span>איפה מוצאים את הפרטים?</span>
                        {showGuide ? <ChevronUp className="w-4 h-4 mr-auto" /> : <ChevronDown className="w-4 h-4 mr-auto" />}
                      </button>
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

              {/* Footer buttons */}
              <div style={{ padding: '16px 24px 24px', display: 'flex', gap: 8, borderTop: '1px solid #f3f4f6', marginTop: 8 }}>
                <button
                  type="button"
                  disabled={status === 'connecting' || !allFieldsFilled}
                  onClick={doConnect}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px',
                    background: (status === 'connecting' || !allFieldsFilled) ? '#94a3b8' : '#1E3A5F',
                    color: 'white', borderRadius: 8, fontWeight: 500, fontSize: 14,
                    cursor: (status === 'connecting' || !allFieldsFilled) ? 'not-allowed' : 'pointer',
                    border: 'none',
                  }}
                >
                  {status === 'connecting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  {status === 'connecting' ? 'מתחבר...' : 'חבר את החשבון'}
                </button>
                <button
                  type="button"
                  disabled={status === 'connecting'}
                  onClick={onClose}
                  style={{
                    padding: '10px 16px', background: 'white', border: '1px solid #d1d5db',
                    color: '#374151', borderRadius: 8, fontWeight: 500, fontSize: 14,
                    cursor: status === 'connecting' ? 'not-allowed' : 'pointer',
                  }}
                >
                  ביטול
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConnectProviderDialog({ open, onClose, provider, onConnect, loading }) {
  if (!open || !provider) return null;

  return ReactDOM.createPortal(
    <ConnectProviderDialogInner
      provider={provider}
      onSuccess={onConnect ? () => onConnect(provider.id, {}) : undefined}
      onClose={onClose}
    />,
    document.body
  );
}