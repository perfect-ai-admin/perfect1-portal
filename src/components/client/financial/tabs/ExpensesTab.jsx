import React from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import useActiveAccountingProvider from '../../../hooks/useActiveAccountingProvider';

export default function ExpensesTab({ data }) {
  const queryClient = useQueryClient();
  const { fn } = useActiveAccountingProvider();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['finbot-expenses'],
    queryFn: () => base44.entities.FinbotExpense.list('-created_date', 200),
  });

  const syncMutation = useMutation({
    mutationFn: () => base44.functions.invoke(fn.syncPull, { resource: 'expenses' }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['finbot-expenses'] });
      toast.success(`סונכרנו ${res.data?.synced_count || 0} הוצאות`);
    },
    onError: (err) => toast.error(err.message || 'שגיאה בסנכרון'),
  });

  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">הוצאות</h2>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
          {syncMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span className="hidden md:inline">סנכרן ממערכת חשבונות</span>
          <span className="md:hidden">סנכרן</span>
        </Button>
      </div>

      {/* Summary */}
      {expenses.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-gray-700">סה״כ הוצאות</span>
          <span className="text-lg font-bold text-red-700">₪{totalAmount.toLocaleString('he-IL')}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          אין הוצאות עדיין. חבר מערכת חשבונות וסנכרן הוצאות.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-right px-4 py-2 font-semibold">תאריך</th>
                  <th className="text-right px-4 py-2 font-semibold">ספק</th>
                  <th className="text-right px-4 py-2 font-semibold">קטגוריה</th>
                  <th className="text-right px-4 py-2 font-semibold">סכום</th>
                  <th className="text-right px-4 py-2 font-semibold">מע״מ</th>
                  <th className="text-right px-4 py-2 font-semibold">אמצעי תשלום</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{expense.date ? new Date(expense.date).toLocaleDateString('he-IL') : '-'}</td>
                    <td className="px-4 py-3">{expense.vendor || '-'}</td>
                    <td className="px-4 py-3">
                      {expense.category && <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 font-medium">{expense.category}</span>}
                    </td>
                    <td className="px-4 py-3 font-medium">₪{(expense.amount || 0).toLocaleString('he-IL')}</td>
                    <td className="px-4 py-3 text-gray-500">{expense.vat != null ? `₪${expense.vat.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{expense.payment_method || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {expenses.map((expense, idx) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white border border-gray-200 rounded-lg p-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{expense.vendor || 'ללא ספק'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{expense.date ? new Date(expense.date).toLocaleDateString('he-IL') : ''}</span>
                      {expense.category && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{expense.category}</span>}
                    </div>
                  </div>
                  <p className="font-bold text-sm text-red-700">₪{(expense.amount || 0).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}