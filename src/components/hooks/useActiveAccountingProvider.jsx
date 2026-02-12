import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { getProvider, UNIFIED_FUNCTIONS } from '../client/financial/accountingProviders';

/**
 * Hook that detects the user's active accounting connection
 * and returns the correct provider config with UNIFIED function names.
 * All providers use the same backend functions — the backend determines which API to call.
 */
export default function useActiveAccountingProvider() {
  const { data: connection, isLoading } = useQuery({
    queryKey: ['active-accounting-connection'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      const connections = await base44.entities.AccountingConnection.filter({ 
        user_id: user.id, 
        status: 'connected' 
      });
      return connections?.[0] || null;
    },
    staleTime: 5000,
    retry: 1,
  });

  const providerId = connection?.provider || null;
  const providerConfig = providerId ? getProvider(providerId) : null;

  // Determine VAT status from connection config
  const config = connection?.config || {};
  const isVatExempt = !!(config.is_tax_exempt || config.is_vat_exempt);
  const businessType = isVatExempt ? 'patur' : 'morasha';

  return {
    isLoading,
    isConnected: !!connection,
    providerId,
    providerName: providerConfig?.name || null,
    connection,
    providerConfig,
    fn: UNIFIED_FUNCTIONS,
    ready: !isLoading && !!providerId,
    isVatExempt,
    businessType,
  };
}