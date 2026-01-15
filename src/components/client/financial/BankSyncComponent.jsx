import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { finbotService } from './FINBOTService';
import { Badge } from '@/components/ui/badge';

export default function BankSyncComponent() {
  const [transactions, setTransactions] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await finbotService.getBankTransactions({
        limit: 10,
        sort: '-date'
      });
      setTransactions(data.transactions || []);
      setLastSync(new Date());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    
    try {
      await loadTransactions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">סנכרון עם הבנק</h3>
              <p className="text-sm text-gray-600">
                {lastSync ? `עודכן לאחרונה: ${lastSync.toLocaleString('he-IL')}` : 'טרם סונכרן'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'מסנכרן...' : 'רענן'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">שגיאה בסנכרון</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">תנועות אחרונות</h4>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            אין תנועות להצגה
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('he-IL')}
                    </span>
                    {transaction.category && (
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-left">
                  <p className={`text-lg font-bold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}₪{Math.abs(transaction.amount).toLocaleString('he-IL')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>הערה:</strong> הסנכרון מתבצע באמצעות Open Banking API בצורה מאובטחת. 
          הנתונים מקוטלגים אוטומטית לפי סוג ההוצאה.
        </p>
      </div>
    </div>
  );
}