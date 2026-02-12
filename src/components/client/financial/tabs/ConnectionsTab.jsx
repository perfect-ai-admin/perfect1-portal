import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ACCOUNTING_PROVIDERS, getProvider } from '../accountingProviders';
import ProviderCard from '../ProviderCard';
import ConnectAccountingSoftwareDialog from '../ConnectAccountingSoftwareDialog';
import ProviderSelectionDialog from '../ProviderSelectionDialog';
import ConnectProviderDialog from '../ConnectProviderDialog';

export default function ConnectionsTab({ data }) {
  const queryClient = useQueryClient();
  const [statuses, setStatuses] = useState({}); // {finbot: {connected, ...}, ...}
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState({});
  const [syncLoading, setSyncLoading] = useState({});
  const [connectProvider, setConnectProvider] = useState(null); // provider to connect
  const [showSoftwareDialog, setShowSoftwareDialog] = useState(false); // step 1: intro
  const [showProviderSelection, setShowProviderSelection] = useState(false); // step 2: choose provider

  // Fetch unified connection status
  const fetchAllStatuses = async () => {
    setLoading(true);
    const newStatuses = {};

    try {
      const res = await base44.functions.invoke('acctGetConnectionStatus');
      if (res.data?.connected) {
        newStatuses[res.data.provider] = res.data;
      }
    } catch (err) {
      console.log('Status fetch error:', err);
    }

    setStatuses(newStatuses);
    setLoading(false);
  };

  useEffect(() => { fetchAllStatuses(); }, []);

  const handleConnect = async (providerId, credentials) => {
    const provider = getProvider(providerId);
    setConnectLoading(true);

    try {
      const res = await base44.functions.invoke('acctConnectProvider', { 
        provider: providerId, 
        credentials 
      });

      if (res.data?.status === 'connected') {
        toast.success(res.data.message || `חשבון ${provider.name} חובר בהצלחה! 🎉`, { duration: 6000 });
        setConnectProvider(null);
        queryClient.invalidateQueries({ queryKey: ['active-accounting-connection'] });
        fetchAllStatuses();
      } else {
        toast.error(res.data?.error || 'שגיאה בהתחברות');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'שגיאה בהתחברות');
    }
    setConnectLoading(false);
  };

  const handleDisconnect = async (providerId) => {
    const provider = getProvider(providerId);
    if (!confirm(`בטוח שברצונך להתנתק מ-${provider.name}?`)) return;

    setDisconnectLoading(p => ({ ...p, [providerId]: true }));
    await base44.functions.invoke('acctDisconnectProvider');
    setDisconnectLoading(p => ({ ...p, [providerId]: false }));
    toast.success(`התנתקת מ-${provider.name}`);
    queryClient.setQueryData(['active-accounting-connection'], null);
    queryClient.invalidateQueries({ queryKey: ['active-accounting-connection'] });
    fetchAllStatuses();
  };

  const handleSync = async (providerId, resource) => {
    const provider = getProvider(providerId);
    const key = `${providerId}_${resource}`;
    setSyncLoading(p => ({ ...p, [key]: true }));

    try {
      const res = await base44.functions.invoke('acctSyncPull', { resource });
      
      if (res.data?.status === 'success') {
        toast.success(`סונכרנו ${res.data.synced_count || 0} רשומות מ-${provider.name}`);
        fetchAllStatuses();
      } else {
        toast.error(res.data?.error || 'שגיאה בסנכרון');
      }
    } catch (err) {
      toast.error('שגיאה בסנכרון');
    }
    setSyncLoading(p => ({ ...p, [key]: false }));
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
                setShowSoftwareDialog(true);
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

      {/* Step 1: Intro Dialog — then skip to step 3 (credentials) since provider already chosen */}
      <ConnectAccountingSoftwareDialog
        open={showSoftwareDialog}
        onOpenChange={(val) => {
          setShowSoftwareDialog(val);
          if (!val) setConnectProvider(null);
        }}
        onContinue={() => {
          setShowSoftwareDialog(false);
          // If provider already selected (clicked from card), go straight to credentials
          if (connectProvider) {
            // Dialog will open via connectProvider state
          } else {
            setShowProviderSelection(true);
          }
        }}
      />

      {/* Step 2: Provider Selection Dialog (only when no provider pre-selected) */}
      <ProviderSelectionDialog
        open={showProviderSelection}
        onOpenChange={(val) => {
          setShowProviderSelection(val);
          if (!val) setConnectProvider(null);
        }}
        onSelectProvider={(provider) => {
          setConnectProvider(provider);
          setShowProviderSelection(false);
        }}
      />

      {/* Step 3: Provider-specific Credentials Dialog */}
      <ConnectProviderDialog
        open={!!connectProvider && !showSoftwareDialog && !showProviderSelection}
        onClose={() => setConnectProvider(null)}
        provider={connectProvider}
        onConnect={handleConnect}
        loading={connectLoading}
      />
    </motion.div>
  );
}