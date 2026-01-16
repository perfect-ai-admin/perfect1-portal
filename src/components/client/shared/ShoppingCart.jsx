import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShoppingCartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [savedLogos, setSavedLogos] = useState([]);

  React.useEffect(() => {
    if (isOpen) {
      const allSaved = JSON.parse(localStorage.getItem('saved_logos') || '{}');
      const flat = Object.entries(allSaved).flatMap(([name, items]) =>
        items.map(item => ({ ...item, businessName: name }))
      );
      setSavedLogos(flat);
    }
  }, [isOpen]);

  const itemCount = savedLogos.length;

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="העגלה שלך"
      >
        <ShoppingCart className="w-5 h-5 text-gray-700" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
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
              className="fixed inset-0 bg-black/30 z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-lg flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">העגלה שלך</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {savedLogos.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-600 font-medium">העגלה ריקה</p>
                    <p className="text-gray-400 text-sm mt-1">
                      שמור לוגואים וחזור להם לאחר מכן
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedLogos.map((logo, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <img
                          src={logo.url}
                          alt={logo.businessName}
                          className="w-12 h-12 object-contain"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {logo.businessName}
                          </p>
                          <p className="text-xs text-gray-500">{logo.variant}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {savedLogos.length > 0 && (
                <div className="p-4 border-t border-gray-200 space-y-3">
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold h-11 rounded-lg"
                  >
                    המשך לרכישה
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}