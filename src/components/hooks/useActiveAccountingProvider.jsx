import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { getProvider } from '../client/financial/accountingProviders';

/**
 * Hook that detects the user's active accounting connection (icount/finbot)
 * and returns the correct provider config with all function names.
 */
export default function useActiveAccountingProvider() {
  const { data: connection, isLoading } = useQuery({
    queryKey: ['active-accounting-connection'],
    queryFn: async () => {
      const connections = await base44.entities.AccountingConnection.filter({ status: 'connected' });
      // Return the first connected provider
      return connections?.[0] || null;
    },
    staleTime: 60000, // cache for 1 minute
  });

  const providerId = connection?.provider || null;
  const providerConfig = providerId ? getProvider(providerId) : null;

  // Map of function names per operation, based on the active provider
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

  const functions = providerId ? (FUNCTION_MAP[providerId] || FUNCTION_MAP.finbot) : FUNCTION_MAP.finbot;

  return {
    isLoading,
    isConnected: !!connection,
    providerId,
    providerName: providerConfig?.name || null,
    connection,
    providerConfig,
    fn: functions,
  };
}