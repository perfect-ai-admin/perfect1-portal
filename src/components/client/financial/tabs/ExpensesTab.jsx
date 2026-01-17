import React, { useState } from 'react';
import { Plus, Tag, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function ExpensesTab({ data }) {
  const [activeSubTab, setActiveSubTab] = useState('pending');
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Empty initial data
  const expenses = {
    pending: [],
    classified: [],
    all: [],
  };

  const categories = [
    '📢 פרסום',
    '💻 תוכנות',
    '🛠️ ציוד',
    '⛽ דלק/רכב',
    '🏢 משרד',
    '👔 שירותים מקצועיים',
    '📌 אחרות',
  ];

  const currentExpenses = expenses[activeSubTab] || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">הוצאות</h2>
        <Button onClick={() => setShowAddExpense(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">קליטת הוצאה</span>
          <span className="md:hidden">הוצאה</span>
        </Button>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent p-0 h-auto">
          <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
            לטיפול ({expenses.pending.length})
          </TabsTrigger>
          <TabsTrigger value="classified" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
            מסווגות ({expenses.classified.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
            הכל ({expenses.all.length})
          </TabsTrigger>
        </TabsList>

        {/* Content */}
        <TabsContent value={activeSubTab} className="mt-4 space-y-2">
          {currentExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm">אין הוצאות להצגה</p>
            </div>
          ) : (
            currentExpenses.map((expense, idx) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:shadow-sm transition-shadow group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{expense.supplier}</p>
                  <p className="text-xs text-gray-600 truncate">{expense.date}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{expense.amount}</p>
                    <p className="text-xs text-gray-500">{expense.category}</p>
                  </div>

                  {activeSubTab === 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => console.log('Classify', expense.id)}
                      className="h-8 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      סווג
                    </Button>
                  )}

                  <button className="p-1 hover:bg-red-50 rounded transition-colors text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>קליטת הוצאה חדשה</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">סכום</label>
                <input
                  type="number"
                  placeholder="₪"
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">תאריך</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">ספק</label>
                <input
                  type="text"
                  placeholder="שם הספק"
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">קטגוריה</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className="px-3 py-2 text-sm border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowAddExpense(false)}>
                ביטול
              </Button>
              <Button onClick={() => {
                setShowAddExpense(false);
                // Show toast
              }}>
                <Check className="w-4 h-4 ml-2" />
                שמור
              </Button>
              <Button variant="outline">
                שמור ועוד אחת
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}