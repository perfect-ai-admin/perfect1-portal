import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ACCOUNTING_PROVIDERS, getProvider } from '../accountingProviders';
import ProviderCard from '../ProviderCard';
import ConnectAccountingSoftwareDialog from '../ConnectAccountingSoftwareDialog';
import ConnectProviderDialog from '../ConnectProviderDialog';

export default function ConnectionsTab({ data }) {
  const [statuses, setStatuses] = useState({}); // {finbot: {connected, ...}, ...}
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState({});
  const [syncLoading, setSyncLoading] = useState({});
  const [connectProvider, setConnectProvider] = useState(null); // provider to connect
  const [showSoftwareDialog, setShowSoftwareDialog] = useState(false); // intro dialog
  const [dialogStep, setDialogStep] = useState('intro'); // 'intro' | 'apikey'

  // Fetch status for all available providers
  const fetchAllStatuses = async () => {
    setLoading(true);
    const newStatuses = {};

    for (const provider of ACCOUNTING_PROVIDERS) {
      if (provider.status === 'available' && provider.statusFunction) {
        const res = await base44.functions.invoke(provider.statusFunction);
        newStatuses[provider.id] = res.data;
      }
    }

    setStatuses(newStatuses);
    setLoading(false);
  };

  useEffect(() => { fetchAllStatuses(); }, []);

  const handleConnect = async (providerId, strategy, credentials) => {
    const provider = getProvider(providerId);
    if (!provider?.completeFunction) return;

    setConnectLoading(true);

    // Direct connect - send API key to complete function
    const completeRes = await base44.functions.invoke(provider.completeFunction, credentials);
    setConnectLoading(false);

    if (completeRes.data?.status === 'connected') {
      toast.success(`חשבון ${provider.name} חובר בהצלחה! 🎉`);
      setConnectProvider(null);
      fetchAllStatuses();
    } else {
      toast.error(completeRes.data?.message || 'שגיאה בהתחברות. בדוק שה-API Key תקין.');
    }
  };

  const handleDisconnect = async (providerId) => {
    const provider = getProvider(providerId);
    if (!provider?.disconnectFunction) return;
    if (!confirm(`בטוח שברצונך להתנתק מ-${provider.name}?`)) return;

    setDisconnectLoading(p => ({ ...p, [providerId]: true }));
    await base44.functions.invoke(provider.disconnectFunction);
    setDisconnectLoading(p => ({ ...p, [providerId]: false }));
    toast.success(`התנתקת מ-${provider.name}`);
    fetchAllStatuses();
  };

  const handleSync = async (providerId, resource) => {
    const provider = getProvider(providerId);
    if (!provider?.syncFunction) return;

    const key = `${providerId}_${resource}`;
    setSyncLoading(p => ({ ...p, [key]: true }));

    const res = await base44.functions.invoke(provider.syncFunction, { resource });
    setSyncLoading(p => ({ ...p, [key]: false }));

    if (res.data?.status === 'success') {
      toast.success(`סונכרנו ${res.data.synced_count || 0} רשומות מ-${provider.name}`);
      fetchAllStatuses();
    } else {
      toast.error(res.data?.error || 'שגיאה בסנכרון');
    }
  };

  // Build sync loading map per provider
  const getSyncLoadingForProvider = (providerId) => {
    const result = {};
    for (const [key, val] of Object.entries(syncLoading)) {
      if (key.startsWith(`${providerId}_`)) {
        const resource = key.replace(`${providerId}_`, '');
        result[resource] = val;
      }
    }
    return result;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">חיבור למערכת הנהלת חשבונות</h2>
        <p className="text-sm text-gray-600 mt-0.5">
          חבר את מערכת החשבונות שלך כדי לסנכרן לקוחות, מסמכים והוצאות אוטומטית
        </p>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ACCOUNTING_PROVIDERS.map((provider, idx) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <ProviderCard
              provider={provider}
              connectionStatus={statuses[provider.id]}
              loading={loading && provider.status === 'available'}
              syncLoading={getSyncLoadingForProvider(provider.id)}
              disconnectLoading={disconnectLoading[provider.id]}
              onConnect={() => {
                setConnectProvider(provider);
                setDialogStep('intro');
              }}
              onDisconnect={() => handleDisconnect(provider.id)}
              onSync={(resource) => handleSync(provider.id, resource)}
            />
          </motion.div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          💡 <span className="font-medium">טיפ:</span> אין לך עדיין מערכת חשבונות? {' '}
          <a href="https://www.finbot.co.il" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
            לחץ כאן לפתיחה מהירה של מערכת חשבונות ↗
          </a>
        </p>
      </div>

      {/* Step 1: Intro / Software Selection Dialog */}
      <ConnectAccountingSoftwareDialog
        open={!!connectProvider && dialogStep === 'intro'}
        onOpenChange={(val) => {
          if (!val) {
            setConnectProvider(null);
          }
        }}
        selectedProvider={connectProvider}
        onContinue={() => {
          setDialogStep('apikey');
        }}
      />

      {/* Step 2: API Key Dialog */}
      <ConnectProviderDialog
        open={!!connectProvider && dialogStep === 'apikey'}
        onClose={() => setConnectProvider(null)}
        provider={connectProvider}
        onConnect={handleConnect}
        loading={connectLoading}
      />
    </motion.div>
  );
}