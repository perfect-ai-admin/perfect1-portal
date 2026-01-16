import React, { useState } from 'react';
import { FileText, Plus, BarChart3, DollarSign, Search } from 'lucide-react';
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

      {/* Mobile Floating Action Bar - Bottom */}
       <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 pb-safe">
         <div className="flex gap-2 p-4 max-w-lg mx-auto">
           {/* Hacked Document Button */}
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-bold text-sm transition-all active:scale-95 shadow-lg">
                 <FileText className="w-5 h-5" />
                 הפקת מסמך
               </button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="start" side="top" className="mb-2">
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

           {/* Add Expense Button */}
           <button
             onClick={() => setShowCreateModal({ type: 'expense' })}
             className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg font-bold text-sm transition-all active:scale-95 shadow-lg"
           >
             <Plus className="w-5 h-5" />
             קליטת הוצאה
           </button>
         </div>
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