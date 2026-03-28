import { supabase } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { getProvider, UNIFIED_FUNCTIONS } from '../client/financial/accountingProviders';

/**
 * Hook that detects the user's active accounting connection
 * and returns the correct provider config with UNIFIED function names.
 */
export default function useActiveAccountingProvider() {
  const { data: connection, isLoading } = useQuery({
    queryKey: ['active-accounting-connection'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      // Find customer by email, then get their accounting connection
      const { data: customer } = await supabase.from('customers').select('id').eq('email', user.email).single();
      if (!customer) return null;
      const { data: connections } = await supabase
        .from('accounting_connections')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('status', 'connected')
        .limit(1);
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