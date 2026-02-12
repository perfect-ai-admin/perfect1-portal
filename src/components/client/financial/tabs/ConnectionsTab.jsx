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
      const sync = completeRes.data?.sync;
      if (sync) {
        const parts = [];
        if (sync.customers > 0) parts.push(`${sync.customers} לקוחות`);
        if (sync.documents > 0) parts.push(`${sync.documents} מסמכים`);
        if (sync.expenses > 0) parts.push(`${sync.expenses} הוצאות`);
        const syncMsg = parts.length > 0 ? ` | סונכרנו: ${parts.join(', ')}` : '';
        toast.success(`חשבון ${provider.name} חובר בהצלחה! 🎉${syncMsg}`, { duration: 6000 });
      } else {
        toast.success(`חשבון ${provider.name} חובר בהצלחה! 🎉`);
      }
      setConnectProvider(null);
      // Invalidate all financial queries so data appears immediately
      queryClient.invalidateQueries({ queryKey: ['active-accounting-connection'] });
      queryClient.invalidateQueries({ queryKey: ['finbot-documents'] });
      queryClient.invalidateQueries({ queryKey: ['finbot-customers'] });
      queryClient.invalidateQueries({ queryKey: ['finbot-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finbot-documents-revenue'] });
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
    // Clear cached data immediately so it doesn't show stale results
    queryClient.setQueryData(['finbot-documents', providerId], []);
    queryClient.setQueryData(['finbot-customers', providerId], []);
    queryClient.setQueryData(['finbot-expenses', providerId], []);
    queryClient.setQueryData(['finbot-documents-revenue', providerId], []);
    queryClient.setQueryData(['active-accounting-connection'], null);
    // Then invalidate to refetch fresh state
    queryClient.invalidateQueries({ queryKey: ['active-accounting-connection'] });
    queryClient.invalidateQueries({ queryKey: ['finbot-documents'] });
    queryClient.invalidateQueries({ queryKey: ['finbot-customers'] });
    queryClient.invalidateQueries({ queryKey: ['finbot-expenses'] });
    queryClient.invalidateQueries({ queryKey: ['finbot-documents-revenue'] });
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

      {/* Step 1: Intro Dialog */}
      <ConnectAccountingSoftwareDialog
        open={showSoftwareDialog}
        onOpenChange={setShowSoftwareDialog}
        onContinue={() => {
          setShowSoftwareDialog(false);
          setShowProviderSelection(true);
        }}
      />

      {/* Step 2: Provider Selection Dialog */}
      <ProviderSelectionDialog
        open={showProviderSelection}
        onOpenChange={setShowProviderSelection}
        onSelectProvider={(provider) => {
          setConnectProvider(provider);
          setShowProviderSelection(false);
        }}
      />

      {/* Step 3: Provider-specific API Key Dialog */}
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