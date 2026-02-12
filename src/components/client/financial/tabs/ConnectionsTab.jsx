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
  const [savedProviders, setSavedProviders] = useState([]); // providers with saved creds
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [reconnectLoading, setReconnectLoading] = useState({});
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
      setSavedProviders(res.data?.saved_providers || []);
    } catch (err) {
      console.log('Status fetch error:', err);
    }

    setStatuses(newStatuses);
    setLoading(false);
  };

  useEffect(() => { fetchAllStatuses(); }, []);

  const handleConnect = async (providerId, credentials) => {
    if (connectLoading) return; // prevent double-click
    const provider = getProvider(providerId);
    console.log('📡 handleConnect called for', providerId, 'with keys:', Object.keys(credentials));
    setConnectLoading(true);

    try {
      console.log('📡 Invoking acctConnectProvider...');
      const res = await base44.functions.invoke('acctConnectProvider', { 
        provider: providerId, 
        credentials 
      });
      console.log('📡 Response:', res.data);

      if (res.data?.status === 'connected') {
        toast.success(res.data.message || `חשבון ${provider.name} חובר בהצלחה! 🎉`, { duration: 6000 });
        setConnectProvider(null);
        queryClient.invalidateQueries({ queryKey: ['active-accounting-connection'] });
        fetchAllStatuses();
      } else {
        toast.error(res.data?.error || 'שגיאה בהתחברות');
      }
    } catch (err) {
      console.error('📡 Connect error:', err);
      const errMsg = err?.response?.data?.error || err?.message || 'שגיאה בהתחברות';
      toast.error(errMsg);
    }
    setConnectLoading(false);
  };

  const handleReconnect = async (providerId) => {
    setReconnectLoading(p => ({ ...p, [providerId]: true }));
    try {
      const res = await base44.functions.invoke('acctConnectProvider', { 
        provider: providerId, 
        reconnect: true 
      });
      if (res.data?.status === 'connected') {
        toast.success(res.data.message || `חובר מחדש ל-${providerId}! 🎉`);
        queryClient.invalidateQueries({ queryKey: ['active-accounting-connection'] });
        fetchAllStatuses();
      } else {
        toast.error(res.data?.error || 'שגיאה בהתחברות מחדש');
        if (res.data?.needs_credentials) {
          // Saved creds are invalid, open regular connect dialog
          const provider = getProvider(providerId);
          if (provider) setConnectProvider(provider);
        }
      }
    } catch (err) {
      const errData = err?.response?.data;
      if (errData?.needs_credentials) {
        toast.info('הפרטים השמורים כבר לא תקינים. יש להזין מחדש.');
        const provider = getProvider(providerId);
        if (provider) setConnectProvider(provider);
      } else {
        toast.error(errData?.error || 'שגיאה בהתחברות מחדש');
      }
    }
    setReconnectLoading(p => ({ ...p, [providerId]: false }));
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
      {(() => {
        const connectedProviderId = Object.keys(statuses).find(k => statuses[k]?.connected);
        return (
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
                  isOtherProviderConnected={!!connectedProviderId && connectedProviderId !== provider.id}
                  onConnect={() => {
                    // Don't open connect dialog if already connected to this provider
                    if (statuses[provider.id]?.connected) return;
                    setConnectProvider(provider);
                  }}
                  onDisconnect={() => handleDisconnect(provider.id)}
                  onSync={(resource) => handleSync(provider.id, resource)}
                />
              </motion.div>
            ))}
          </div>
        );
      })()}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          💡 <span className="font-medium">טיפ:</span> אין לך עדיין מערכת חשבונות? {' '}
          <a href="https://www.finbot.co.il" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
            לחץ כאן לפתיחה מהירה של מערכת חשבונות ↗
          </a>
        </p>
      </div>

      {/* Provider-specific Credentials Dialog — opens directly */}
      <ConnectProviderDialog
        open={!!connectProvider}
        onClose={() => setConnectProvider(null)}
        provider={connectProvider}
        onConnect={() => {
          // Success callback — refresh statuses
          queryClient.invalidateQueries({ queryKey: ['active-accounting-connection'] });
          fetchAllStatuses();
          setConnectProvider(null);
        }}
      />
    </motion.div>
  );
}