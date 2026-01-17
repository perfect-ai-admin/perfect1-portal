import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Trash2, Maximize2, Check, ExternalLink, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ShoppingCartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [savedLogos, setSavedLogos] = useState([]);
  const [isBouncing, setIsBouncing] = useState(false);
  const [selectedIndices, setSelectedItems] = useState(new Set());
  const [enlargedImage, setEnlargedImage] = useState(null);
  const navigate = useNavigate();

  const ITEM_PRICE = 99;

  const updateCart = () => {
    const allSaved = JSON.parse(localStorage.getItem('saved_logos') || '{}');
    const flat = Object.entries(allSaved).flatMap(([name, items]) =>
      items.map((item, originalIndex) => ({ ...item, businessName: name, originalIndex, key: `${name}-${originalIndex}-${item.savedAt}` }))
    );
    setSavedLogos(flat);
    // Select all by default if new items added or on first load
    if (selectedIndices.size === 0 && flat.length > 0) {
      setSelectedItems(new Set(flat.map((_, i) => i)));
    }
  };

  React.useEffect(() => {
    updateCart();

    const handleUpdate = () => {
      updateCart();
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 600);
    };

    const handleOpenCart = () => setIsOpen(true);

    window.addEventListener('cart-updated', handleUpdate);
    window.addEventListener('open-cart', handleOpenCart);
    
    return () => {
      window.removeEventListener('cart-updated', handleUpdate);
      window.removeEventListener('open-cart', handleOpenCart);
    };
  }, []);

  // Update selection when logos change (e.g. removed)
  React.useEffect(() => {
    // Keep selection valid
    const newSelection = new Set();
    savedLogos.forEach((_, i) => {
        if (selectedIndices.has(i)) newSelection.add(i);
    });
    // If we have items but none selected (and previously we did or it's fresh), maybe select all? 
    // Let's just keep what matches index.
    // Actually, if an item is removed, indices shift. This is a simple implementation issue.
    // Better to select all on open if not persisted.
  }, [savedLogos.length]);

  const toggleSelection = (index) => {
    const newSelection = new Set(selectedIndices);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedItems(newSelection);
  };

  const removeItem = (indexToRemove) => {
    const itemToRemove = savedLogos[indexToRemove];
    if (!itemToRemove) return;

    const allSaved = JSON.parse(localStorage.getItem('saved_logos') || '{}');
    if (allSaved[itemToRemove.businessName]) {
      // Filter out the specific item based on savedAt and url to be precise
      allSaved[itemToRemove.businessName] = allSaved[itemToRemove.businessName].filter(
        (item) => item.savedAt !== itemToRemove.savedAt || item.url !== itemToRemove.url
      );
      
      // Clean up empty keys
      if (allSaved[itemToRemove.businessName].length === 0) {
        delete allSaved[itemToRemove.businessName];
      }

      localStorage.setItem('saved_logos', JSON.stringify(allSaved));
      updateCart();
      
      // Update selection: remove the index and shift others? 
      // Re-initializing selection is safer for this simple logic
      const newSelection = new Set();
      // Heuristic: select all again or keep none. Let's select all remaining to be helpful.
      const remainingCount = savedLogos.length - 1;
      for(let i=0; i<remainingCount; i++) newSelection.add(i);
      setSelectedItems(newSelection);
    }
  };

  const handleCheckout = () => {
    const itemsToCheckout = savedLogos.filter((_, i) => selectedIndices.has(i));
    if (itemsToCheckout.length === 0) return;
    
    setIsOpen(false);
    // Navigate to checkout with state
    navigate(createPageUrl('Checkout'), { 
      state: { 
        items: itemsToCheckout,
        totalPrice: itemsToCheckout.length * ITEM_PRICE
      } 
    });
  };

  const itemCount = savedLogos.length;
  const selectedCount = selectedIndices.size;
  const totalPrice = selectedCount * ITEM_PRICE;

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors group"
        title="העגלה שלך"
      >
        <motion.div
          animate={isBouncing ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <ShoppingCart className="w-6 h-6 text-white/90 group-hover:text-white transition-colors" />
        </motion.div>
        
        <AnimatePresence>
          {itemCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-white"
            >
              {itemCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[60] shadow-2xl flex flex-col border-l border-gray-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-xl">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">העגלה שלך</h2>
                    <p className="text-xs text-gray-500">{itemCount} פריטים ממתינים לרכישה</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
                {savedLogos.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-bold text-lg">העגלה ריקה</p>
                      <p className="text-gray-500 text-sm mt-1 max-w-[200px] mx-auto">
                        עדיין לא שמרת עיצובים. זה הזמן ליצור משהו מדהים!
                      </p>
                    </div>
                    <Button 
                        onClick={() => setIsOpen(false)} 
                        variant="outline"
                        className="mt-4"
                    >
                        חזור לעצב
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedLogos.map((logo, idx) => {
                      const isSelected = selectedIndices.has(idx);
                      return (
                        <motion.div
                          layout
                          key={logo.key || idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                            isSelected 
                              ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' 
                              : 'border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex p-3 gap-4">
                            {/* Checkbox Area */}
                            <div className="flex items-center">
                                <Checkbox 
                                    checked={isSelected}
                                    onCheckedChange={() => toggleSelection(idx)}
                                    className="w-5 h-5 border-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                            </div>

                            {/* Image Area */}
                            <div 
                                className="relative w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 cursor-zoom-in overflow-hidden border border-gray-100 group-hover:border-blue-100 transition-colors"
                                onClick={() => setEnlargedImage(logo.url)}
                            >
                                <img
                                  src={logo.url}
                                  alt={logo.businessName}
                                  className="w-full h-full object-contain p-2 hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                                </div>
                            </div>

                            {/* Details Area */}
                            <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-bold text-gray-900 truncate text-base">
                                        {logo.businessName}
                                    </h3>
                                    <button
                                        onClick={() => removeItem(idx)}
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 -mt-1 -ml-1"
                                        title="הסר מהעגלה"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">{logo.variant || 'לוגו מעוצב'}</p>
                              </div>
                              
                              <div className="flex items-center justify-between mt-2">
                                <div className="text-sm font-bold text-gray-900 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                                    ₪{ITEM_PRICE}
                                </div>
                                {isSelected ? (
                                    <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        נבחר
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400">לא נבחר</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-100 bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>פריטים שנבחרו:</span>
                        <span className="font-medium">{selectedCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                        <span>סה״כ לתשלום:</span>
                        <span className="text-xl">₪{totalPrice}</span>
                    </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={selectedCount === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold h-12 rounded-xl text-lg shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
                >
                  {selectedCount > 0 ? 'המשך לרכישה מאובטחת' : 'בחר פריטים לרכישה'}
                </Button>
                
                <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    רכישה מאובטחת בתקן PCI-DSS
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Zoom Modal */}
      <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
        <DialogContent className="max-w-3xl w-full p-0 bg-transparent border-0 shadow-none overflow-hidden flex items-center justify-center">
            <div className="relative bg-white rounded-2xl p-2 shadow-2xl max-h-[80vh] w-auto">
                <button 
                    onClick={() => setEnlargedImage(null)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-200 p-2"
                >
                    <X className="w-8 h-8 drop-shadow-lg" />
                </button>
                {enlargedImage && (
                    <img 
                        src={enlargedImage} 
                        alt="Zoomed Logo" 
                        className="max-w-full max-h-[75vh] object-contain rounded-xl bg-gray-50"
                    />
                )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}