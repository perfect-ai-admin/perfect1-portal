import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Link2, ExternalLink, XCircle, RefreshCw, Loader2, Wifi, WifiOff, AlertCircle, Settings, Key, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function ConnectionsTab({ data }) {
  const [finbotStatus, setFinbotStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState({});
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [strategy, setStrategy] = useState('apikey');
  const [credentials, setCredentials] = useState({ api_key: '', username: '', password: '' });

  const fetchStatus = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('finbotGetConnectionStatus');
    setFinbotStatus(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleConnect = async () => {
    setConnectLoading(true);
    // Step 1: Start connection
    const startRes = await base44.functions.invoke('finbotStartConnect', { strategy });
    
    if (strategy === 'oauth' && startRes.data?.redirect_url) {
      window.location.href = startRes.data.redirect_url;
      return;
    }

    // Step 2: Complete connection with credentials
    const payload = strategy === 'apikey'
      ? { api_key: credentials.api_key }
      : { username: credentials.username, password: credentials.password };

    const completeRes = await base44.functions.invoke('finbotCompleteConnect', payload);
    setConnectLoading(false);

    if (completeRes.data?.status === 'connected') {
      toast.success('התחברת ל-Finbot בהצלחה!');
      setShowConnectDialog(false);
      setCredentials({ api_key: '', username: '', password: '' });
      fetchStatus();
    } else {
      toast.error(completeRes.data?.message || 'שגיאה בהתחברות');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('בטוח שברצונך להתנתק מ-Finbot?')) return;
    setDisconnectLoading(true);
    await base44.functions.invoke('finbotDisconnect');
    setDisconnectLoading(false);
    toast.success('התנתקת מ-Finbot');
    fetchStatus();
  };

  const handleSync = async (resource) => {
    setSyncLoading(prev => ({ ...prev, [resource]: true }));
    const res = await base44.functions.invoke('finbotSyncPull', { resource });
    setSyncLoading(prev => ({ ...prev, [resource]: false }));
    
    if (res.data?.status === 'success') {
      toast.success(`סונכרנו ${res.data.synced_count || 0} רשומות`);
      fetchStatus();
    } else {
      toast.error(res.data?.error || 'שגיאה בסנכרון');
    }
  };

  const isConnected = finbotStatus?.connected;

  const otherConnections = [
    { id: 'bank', name: 'סנכרון בנק', description: 'עדכון עסקאות בנק בזמן אמת', status: 'coming_soon', icon: '🏦' },
    { id: 'processing', name: 'סליקה', description: 'קישור למעבדי סליקה וחיובים', status: 'coming_soon', icon: '💳' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">חיבורים</h2>
      <p className="text-sm text-gray-600">חבר שירותים חיצוניים כדי לשפר את זרימת העבודה הפיננסית</p>

      {/* Finbot Connection Card */}
      <div className={`border-2 rounded-xl p-5 transition-all ${isConnected ? 'border-green-300 bg-green-50/50' : 'border-blue-300 bg-blue-50/50'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-3xl mt-0.5">🤖</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-gray-900">FinBot</p>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ) : isConnected ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <Wifi className="w-3 h-3" /> מחובר
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    <WifiOff className="w-3 h-3" /> לא מחובר
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">ניהול מסמכים, הוצאות ודוחות עם AI</p>
              
              {finbotStatus?.last_sync_at && (
                <p className="text-xs text-gray-500 mt-2">
                  סנכרון אחרון: {new Date(finbotStatus.last_sync_at).toLocaleString('he-IL')}
                </p>
              )}
              {finbotStatus?.last_error && (
                <div className="flex items-start gap-1.5 mt-2 text-xs text-red-600 bg-red-50 rounded p-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{finbotStatus.last_error}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {!isConnected ? (
            <Button size="sm" className="gap-2" onClick={() => setShowConnectDialog(true)}>
              <Link2 className="w-4 h-4" /> התחבר ל-Finbot
            </Button>
          ) : (
            <>
              {['customers', 'documents', 'expenses'].map(resource => (
                <Button
                  key={resource}
                  size="sm"
                  variant="outline"
                  className="gap-2 h-8 text-xs"
                  disabled={syncLoading[resource]}
                  onClick={() => handleSync(resource)}
                >
                  {syncLoading[resource] ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  {resource === 'customers' ? 'סנכרן לקוחות' : resource === 'documents' ? 'סנכרן מסמכים' : 'סנכרן הוצאות'}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="gap-2 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={disconnectLoading}
                onClick={handleDisconnect}
              >
                {disconnectLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                התנתק
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Other Connections */}
      {otherConnections.map((conn, idx) => (
        <div key={conn.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{conn.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{conn.name}</p>
                <p className="text-xs text-gray-600">{conn.description}</p>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">בקרוב</span>
          </div>
        </div>
      ))}

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">התחברות ל-Finbot</DialogTitle>
          </DialogHeader>

          <div className="space-y-4" dir="rtl">
            {/* Strategy Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">שיטת התחברות</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStrategy('apikey')}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm ${
                    strategy === 'apikey' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span className="font-medium">API Key</span>
                </button>
                <button
                  onClick={() => setStrategy('credentials')}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm ${
                    strategy === 'credentials' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">שם משתמש</span>
                </button>
              </div>
            </div>

            {/* Credentials Input */}
            {strategy === 'apikey' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <Input
                  type="password"
                  placeholder="הכנס את ה-API Key שלך מ-Finbot"
                  value={credentials.api_key}
                  onChange={e => setCredentials(prev => ({ ...prev, api_key: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">ניתן למצוא את ה-API Key בהגדרות חשבון Finbot שלך</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם משתמש</label>
                  <Input
                    placeholder="שם משתמש ב-Finbot"
                    value={credentials.username}
                    onChange={e => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
                  <Input
                    type="password"
                    placeholder="סיסמה"
                    value={credentials.password}
                    onChange={e => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>ביטול</Button>
            <Button
              onClick={handleConnect}
              disabled={connectLoading || (strategy === 'apikey' ? !credentials.api_key : !credentials.username || !credentials.password)}
            >
              {connectLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Link2 className="w-4 h-4 ml-2" />}
              התחבר
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}