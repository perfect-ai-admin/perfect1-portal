import React, { useState } from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function CollectionsTab({ data }) {
  const [expanding, setExpanding] = useState(null);

  // Mock collection data
  // Empty initial data
  const collections = [];

  if (collections.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 text-sm">אין יתרות פתוחות כרגע</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">גבייה</h2>

      <div className="space-y-2">
        {collections.map((collection, idx) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() => setExpanding(expanding === collection.id ? null : collection.id)}
              className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{collection.customerName}</p>
                <p className="text-xs text-gray-600 mt-1">פתוח {collection.daysOpen} ימים</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{collection.openAmount}</p>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expanding === collection.id ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </button>

            {/* Expanded Content */}
            {expanding === collection.id && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="border-t border-gray-200 bg-gray-50 p-3 space-y-2"
              >
                <div className="space-y-2">
                  {collection.documents.map(doc => (
                    <div
                      key={doc.number}
                      className="bg-white rounded p-2 flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-900">מסמך #{doc.number}</p>
                        <p className="text-xs text-gray-600">{doc.amount}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => console.log('Send reminder')}
                        className="gap-2 h-8 text-xs"
                      >
                        <Bell className="w-3 h-3" />
                        תזכורת
                      </Button>
                    </div>
                  ))}
                </div>

                <Button className="w-full gap-2 h-8 text-xs">
                  <Bell className="w-3 h-3" />
                  שלח תזכורת ללקוח
                </Button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <p className="text-sm text-orange-900">
          <span className="font-bold">{collections.length} לקוחות</span> חייבים לך
          <span className="font-bold"> ₪{collections.reduce((sum, c) => {
            const amount = parseInt(c.openAmount.replace('₪', '').replace(',', ''));
            return sum + amount;
          }, 0).toLocaleString('he-IL')}</span>
        </p>
      </div>
    </motion.div>
  );
}