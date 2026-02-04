import React, { useState } from 'react';
import { FileText, Plus, BarChart3, DollarSign, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
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
import ConnectAccountingSoftwareDialog from './ConnectAccountingSoftwareDialog';

export default function QuickActionsBar({ onActionComplete, user }) {
  const [showCreateModal, setShowCreateModal] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  const checkConnection = () => {
    // Check if user has an active accounting software connection
    if (!user?.accounting_software?.is_active) {
      setShowConnectDialog(true);
      return false;
    }
    return true;
  };

  const handleDisconnect = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך להתנתק ממערכת הנהלת החשבונות?')) return;
    
    try {
      await base44.auth.updateMe({
        accounting_software: null
      });
      toast.success('התנתקת בהצלחה');
      window.location.reload();
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('שגיאה בהתנתקות');
    }
  };

  const softwareLogos = {
    morning: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d476070d43f37f05394ca/c4ed41c81_image.png',
    finbot: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d476070d43f37f05394ca/bad1e678a_Logo-Finbot-2048x470.png',
    icount: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d476070d43f37f05394ca/14f110f3a_image.png',
    sumit: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d476070d43f37f05394ca/ee666d319_image.png',
  };

  const handleAction = (actionType, subType = null) => {
    if (checkConnection()) {
        setShowCreateModal({ type: actionType, subType });
    }
  };

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
        {user?.accounting_software?.is_active && (
          <div className="flex items-center gap-2 pl-4 ml-2 border-l border-blue-200">
            <div className="relative group">
              <div className="h-8 w-auto px-2 bg-white rounded-md border border-blue-100 flex items-center justify-center shadow-sm">
                 <img 
                   src={softwareLogos[user.accounting_software.provider]} 
                   alt={user.accounting_software.provider}
                   className="h-5 w-auto object-contain"
                 />
              </div>
              <button 
                onClick={handleDisconnect}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="התנתק"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 leading-tight">מחובר ל-</span>
              <span className="text-xs font-bold text-gray-700 leading-tight capitalize">{user.accounting_software.provider}</span>
            </div>
          </div>
        )}

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
                onClick={() => handleAction('document', type.id)}
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
          onClick={() => handleAction('expense')}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4" />
          קליטת הוצאה
        </Button>

        {/* Add Customer */}
        <Button
          size="sm"
          onClick={() => handleAction('customer')}
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

      {/* Mobile Floating Action Bar - Fixed Bottom */}
       <div className="fixed bottom-20 md:hidden left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 animate-fade-in-up">
         <div className="flex gap-2 p-4 max-w-lg mx-auto">
           {/* Hacked Document Button */}
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-bold text-sm transition-all active:scale-95 shadow-lg hover:shadow-xl">
                 <FileText className="w-5 h-5" />
                 הפקת מסמך
               </button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="start" side="top" className="mb-2">
               {documentTypes.map(type => (
                 <DropdownMenuItem
                   key={type.id}
                   onClick={() => handleAction('document', type.id)}
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
             onClick={() => handleAction('expense')}
             className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg font-bold text-sm transition-all active:scale-95 shadow-lg hover:shadow-xl"
             >
             <Plus className="w-5 h-5" />
             קליטת הוצאה
             </button>
         </div>
       </div>

      {/* Connection Dialog */}
      <ConnectAccountingSoftwareDialog 
        open={showConnectDialog} 
        onOpenChange={setShowConnectDialog}
        user={user}
        onConnect={() => {
            // Optional: Reload data or just let the UI update via standard methods
            window.location.reload(); // Simple refresh to ensure all state is synced
        }}
      />

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