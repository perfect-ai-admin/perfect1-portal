import React from 'react';
import { CheckCircle2, Clock, Link2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ConnectionsTab({ data }) {
  const connections = [
    {
      id: 'finbot',
      name: 'FinBot',
      description: 'ניהול מסמכים והוצאות עם AI',
      status: 'ready', // ready, connected, coming_soon
      icon: '🤖',
    },
    {
      id: 'bank',
      name: 'סנכרון בנק',
      description: 'עדכון עסקאות בנק בזמן אמת',
      status: 'coming_soon',
      icon: '🏦',
    },
    {
      id: 'processing',
      name: 'סליקה',
      description: 'קישור למעבדי סליקה וחיובים',
      status: 'coming_soon',
      icon: '💳',
    },
  ];

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'connected':
        return {
          label: 'מחובר',
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'ready':
        return {
          label: 'מוכן לחיבור',
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 'coming_soon':
        return {
          label: 'בקרוב',
          icon: Clock,
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
        };
      default:
        return {
          label: 'לא פעיל',
          icon: Clock,
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
        };
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">חיבורים</h2>
      <p className="text-sm text-gray-600">
        חבר שירותים חיצוניים כדי לשפר את זרימת העבודה הפיננסית
      </p>

      <div className="space-y-3">
        {connections.map((connection, idx) => {
          const statusDisplay = getStatusDisplay(connection.status);
          const StatusIcon = statusDisplay.icon;

          return (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`border border-gray-200 rounded-lg p-4 ${statusDisplay.bgColor} transition-all`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl mt-1">{connection.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{connection.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{connection.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`flex items-center gap-1 ${statusDisplay.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{statusDisplay.label}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex gap-2">
                {connection.status === 'ready' && (
                  <>
                    <Button
                      size="sm"
                      className="gap-2 h-8 text-xs"
                      onClick={() => console.log('Connect:', connection.id)}
                    >
                      <Link2 className="w-3 h-3" />
                      התחבר עכשיו
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 h-8 text-xs"
                      onClick={() => console.log('Learn more:', connection.id)}
                    >
                      <ExternalLink className="w-3 h-3" />
                      עוד
                    </Button>
                  </>
                )}

                {connection.status === 'connected' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 h-8 text-xs"
                      onClick={() => console.log('Settings:', connection.id)}
                    >
                      הגדרות
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2 h-8 text-xs text-red-600"
                      onClick={() => console.log('Disconnect:', connection.id)}
                    >
                      התנתק
                    </Button>
                  </>
                )}

                {connection.status === 'coming_soon' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="gap-2 h-8 text-xs"
                  >
                    בקרוב
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900">
          💡 <span className="font-medium">טיפ:</span> התחבר לרוב השירותים כדי לאוטומט את זרימת הנתונים
        </p>
      </div>
    </motion.div>
  );
}