import React, { useState } from 'react';
import { FileText, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function QuickActionsBar({ onActionComplete }) {
  const [showCreateModal, setShowCreateModal] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const documentTypes = [
    { id: 'invoice', label: 'חשבונית מס', icon: '🧾' },
    { id: 'receipt', label: 'קבלה', icon: '✓' },
    { id: 'tax-receipt', label: 'חשבונית מס-קבלה', icon: '📄' },
    { id: 'credit', label: 'זיכוי', icon: '↩' },
    { id: 'draft', label: 'טיוטה', icon: '📝' },
  ];

  return (
    <>
      {/* Desktop Bar */}
      <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 shadow-sm">
        {/* Create Document */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <FileText className="w-4 h-4" />
              הפקת מסמך
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {documentTypes.map(type => (
              <DropdownMenuItem
                key={type.id}
                onClick={() => setShowCreateModal({ type: 'document', subType: type.id })}
                className="cursor-pointer"
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add Expense */}
        <Button
          size="sm"
          onClick={() => setShowCreateModal({ type: 'expense' })}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4" />
          קליטת הוצאה
        </Button>

        {/* Add Customer */}
        <Button
          size="sm"
          onClick={() => setShowCreateModal({ type: 'customer' })}
          className="gap-2 hidden lg:flex border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          לקוח
        </Button>

        {/* Search */}
        <div className="flex-1 ml-auto relative">
          <input
            type="text"
            placeholder="חיפוש מסמך או לקוח..."
            className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Mobile Grid - Document Types */}
      <div className="md:hidden grid grid-cols-5 gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-3">
        {documentTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setShowCreateModal({ type: 'document', subType: type.id })}
            className="flex flex-col items-center gap-2 py-2 px-1 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-4xl">{type.icon}</span>
            <span className="text-xs font-bold text-gray-700 text-center leading-tight">{type.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Mobile Sticky Bar */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-300 flex flex-col items-stretch gap-3 p-4 z-40">
        <Button
          size="lg"
          onClick={() => setShowCreateModal({ type: 'expense' })}
          className="w-full gap-2 h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-lg shadow-md"
        >
          <Plus className="w-6 h-6" />
          הוצאה
        </Button>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <Dialog open={!!showCreateModal} onOpenChange={() => setShowCreateModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {showCreateModal.type === 'document' && 'הפק מסמך חדש'}
                {showCreateModal.type === 'expense' && 'קלוט הוצאה'}
                {showCreateModal.type === 'customer' && 'הוסף לקוח'}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 text-center text-gray-600">
              {/* Placeholder - will be replaced with actual forms */}
              פורם בבנייה...
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Mobile Search Modal */}
      {showSearch && (
        <Dialog open={showSearch} onOpenChange={setShowSearch}>
          <DialogContent className="max-w-md h-full max-h-screen">
            <DialogHeader>
              <DialogTitle>חיפוש</DialogTitle>
            </DialogHeader>
            <input
              type="text"
              autoFocus
              placeholder="חיפוש מסמך או לקוח..."
              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}