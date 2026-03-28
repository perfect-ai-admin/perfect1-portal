import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, DollarSign, Send } from 'lucide-react';
import { finbotService } from './FINBOTService';
import { Badge } from '@/components/ui/badge';

export default function InvoiceStatusTracker({ invoiceId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [invoiceId]);

  const loadStatus = async () => {
    try {
      const data = await finbotService.getInvoiceStatus(invoiceId);
      setStatus(data);
    } catch (error) {
      console.error('Failed to load invoice status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">טוען סטטוס...</div>;
  }

  if (!status) {
    return <div className="text-center py-4 text-red-500">לא ניתן לטעון סטטוס</div>;
  }

  const steps = [
    {
      id: 'sent',
      label: 'נשלח',
      icon: Send,
      completed: !!status.sent_date,
      date: status.sent_date
    },
    {
      id: 'viewed',
      label: 'נצפה',
      icon: Eye,
      completed: !!status.viewed_date,
      date: status.viewed_date
    },
    {
      id: 'paid',
      label: 'שולם',
      icon: DollarSign,
      completed: !!status.paid_date,
      date: status.paid_date
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-6">מעקב אחר החשבונית</h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 right-5 left-5 h-0.5 bg-gray-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` 
            }}
            className="h-full bg-green-500"
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${
                  step.completed ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
                {step.date && (
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(step.date).toLocaleDateString('he-IL')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">סטטוס נוכחי:</span>
          <Badge variant={status.paid_date ? 'default' : 'secondary'}>
            {status.paid_date ? 'שולם ✓' : status.viewed_date ? 'ממתין לתשלום' : 'ממתין לצפייה'}
          </Badge>
        </div>
        
        {status.payment_method && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">אמצעי תשלום:</span>
            <span className="text-sm font-medium text-gray-900">{status.payment_method}</span>
          </div>
        )}
      </div>
    </div>
  );
}