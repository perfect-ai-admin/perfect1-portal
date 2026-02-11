import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { getProvider } from '../client/financial/accountingProviders';

const FUNCTION_MAP = {
  icount: {
    createCustomer: 'icountCreateCustomer',
    createDocument: 'icountCreateDocument',
    syncPull: 'icountSyncPull',
    fetchReports: 'icountFetchReports',
    getStatus: 'icountGetConnectionStatus',
    disconnect: 'icountDisconnect',
    downloadDocument: 'icountDownloadDocument',
  },
  finbot: {
    createCustomer: 'finbotCreateCustomer',
    createDocument: 'finbotCreateDocument',
    syncPull: 'finbotSyncPull',
    fetchReports: 'finbotFetchReports',
    getStatus: 'finbotGetConnectionStatus',
    disconnect: 'finbotDisconnect',
    downloadDocument: 'finbotDownloadDocument',
  },
};

/**
 * Hook that detects the user's active accounting connection (icount/finbot)
 * and returns the correct provider config with all function names.
 */
export default function useActiveAccountingProvider() {
  const { data: connection, isLoading } = useQuery({
    queryKey: ['active-accounting-connection'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      // Filter by user_id AND status connected
      const connections = await base44.entities.AccountingConnection.filter({ 
        user_id: user.id, 
        status: 'connected' 
      });
      return connections?.[0] || null;
    },
    staleTime: 60000,
    retry: 1,
  });

  const providerId = connection?.provider || null;
  const providerConfig = providerId ? getProvider(providerId) : null;
  const functions = providerId ? (FUNCTION_MAP[providerId] || FUNCTION_MAP.finbot) : null;

  return {
    isLoading,
    isConnected: !!connection,
    providerId,
    providerName: providerConfig?.name || null,
    connection,
    providerConfig,
    fn: functions,
    ready: !isLoading && !!functions,
  };
}