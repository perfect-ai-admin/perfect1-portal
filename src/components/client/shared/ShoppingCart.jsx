import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Trash2, Maximize2, Check, ExternalLink, ArrowRight, ShieldCheck, Eye, Loader2, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import DynamicLandingPage from '@/components/landing-page/DynamicLandingPage';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ShoppingCartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isBouncing, setIsBouncing] = useState(false);
  const [selectedIds, setSelectedItems] = useState(new Set());
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const [previewPage, setPreviewPage] = useState(null);
  const [previewPresentation, setPreviewPresentation] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const ITEM_PRICE = 99;

  const handlePreview = async (landingPageId) => {
    setIsPreviewLoading(true);
    try {
        const response = await base44.functions.invoke('getPublicLandingPageById', { pageId: landingPageId });
        if (response.data) {
            setPreviewPage(response.data);
            setIsPreviewLoading(false);
        } else {
            toast.error('לא ניתן לטעון את התצוגה המקדימה');
            setIsPreviewLoading(false);
        }
    } catch (error) {
        console.error('Preview fetch error:', error);
        toast.error('שגיאה בטעינת התצוגה המקדימה');
        setIsPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewPage(null);
    setPreviewPresentation(null);
    setIsPreviewLoading(false);
  };

  const handlePresentationPreview = (url) => {
    if (!url) return;
    const embedUrl = url.replace('gamma.app/docs/', 'gamma.app/embed/');
    setPreviewPresentation(embedUrl);
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateCart = async () => {
    try {
      const items = await base44.entities.CartItem.filter({ status: 'active' }, '-created_date');
      setCartItems(items);
      
      // Select all by default if new items added or on first load
      if (selectedIds.size === 0 && items.length > 0) {
        setSelectedItems(new Set(items.map(item => item.id)));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
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

  // Update selection when items change (e.g. removed)
  useEffect(() => {
    const newSelection = new Set();
    cartItems.forEach((item) => {
        if (selectedIds.has(item.id)) newSelection.add(item.id);
    });
    setSelectedItems(newSelection);
  }, [cartItems]);

  const toggleSelection = (id) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const removeItem = async (idToRemove) => {
    try {
      await base44.entities.CartItem.delete(idToRemove);
      updateCart();
      toast.success('פריט הוסר מהעגלה');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('שגיאה בהסרת הפריט');
    }
  };

  const handleCheckout = () => {
    const itemsToCheckout = cartItems.filter((item) => selectedIds.has(item.id));
    if (itemsToCheckout.length === 0) return;
    
    setIsOpen(false);
    navigate(createPageUrl('ClientDashboard') + '?tab=checkout', { 
      state: { 
        items: itemsToCheckout,
        totalPrice: itemsToCheckout.reduce((sum, item) => sum + (item.price || ITEM_PRICE), 0)
      } 
    });
  };

  const itemCount = cartItems.length;
  const selectedCount = selectedIds.size;
  const totalPrice = cartItems
    .filter(item => selectedIds.has(item.id))
    .reduce((sum, item) => sum + (item.price || ITEM_PRICE), 0);

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
              className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-white"
            >
              {itemCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Cart Drawer/Sheet */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]"
              />

              {/* Responsive Container */}
              <motion.div
                initial={isMobile ? { y: '100%' } : { x: '-100%' }}
                animate={isMobile ? { y: 0 } : { x: 0 }}
                exit={isMobile ? { y: '100%' } : { x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`fixed z-[100] bg-white shadow-2xl flex flex-col overflow-hidden
                  ${isMobile 
                    ? 'bottom-0 left-0 right-0 h-[92vh] rounded-t-[1.5rem]' 
                    : 'left-0 top-0 h-full w-full max-w-md border-r border-gray-100'
                  }`}
              >
              {/* Mobile Handle */}
              {isMobile && (
                <div 
                    className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center z-20 cursor-grab active:cursor-grabbing"
                    onClick={() => setIsOpen(false)} // Quick close on tap
                >
                    <div className="w-16 h-1.5 bg-gray-300 rounded-full" />
                </div>
              )}

              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10 ${isMobile ? 'pt-8' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-xl">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">העגלה שלך</h2>
                    <p className="text-xs text-gray-500 font-medium">{itemCount} פריטים ממתינים לרכישה</p>
                  </div>
                </div>
                {!isMobile && (
                    <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                    <X className="w-5 h-5" />
                    </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gray-50/50 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                            <ShoppingCart className="w-10 h-10 text-blue-200" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ShoppingCart className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-900 font-bold text-xl">העגלה שלך ריקה</p>
                      <p className="text-gray-500 text-sm max-w-[200px] mx-auto leading-relaxed">
                        עדיין לא שמרת מוצרים. זה הזמן להתחיל ליצור משהו מדהים!
                      </p>
                    </div>
                    <Button 
                        onClick={() => setIsOpen(false)} 
                        className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-8"
                    >
                        חזור לעצב
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    {cartItems.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      return (
                        <motion.div
                          layout
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                            isSelected 
                              ? 'border-blue-500 shadow-lg shadow-blue-500/10' 
                              : 'border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex p-3 gap-3 sm:gap-4 relative">
                            <button
                                onClick={() => removeItem(item.id)}
                                className="absolute top-2 left-2 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all z-10 bg-white/80 backdrop-blur-sm shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                title="הסר מהעגלה"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {/* Checkbox Area */}
                            <div className="flex items-center pl-1">
                                <Checkbox 
                                    checked={isSelected}
                                    onCheckedChange={() => toggleSelection(item.id)}
                                    className="w-5 h-5 border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-lg transition-all"
                                />
                            </div>

                            {/* Image Area */}
                            {(item.preview_image || item.type === 'presentation') && (
                                <div 
                                    className="relative w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 rounded-xl flex-shrink-0 cursor-zoom-in overflow-hidden border border-gray-100"
                                    onClick={() => setEnlargedImage(item.preview_image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop')}
                                >
                                    <img
                                      src={item.preview_image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop'}
                                      alt={item.title}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* Watermark Overlay for List View */}
                                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
                                        <div className="text-red-500/30 font-black text-2xl rotate-[-45deg] whitespace-nowrap select-none border-2 border-red-500/20 px-2 py-1 rounded">
                                            טיוטה
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 z-20">
                                        <Maximize2 className="w-5 h-5 text-gray-700 drop-shadow-sm" />
                                    </div>
                                </div>
                            )}

                            {/* Details Area */}
                            <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base leading-tight">
                                        {item.title}
                                    </h3>

                                </div>
                                <p className="text-sm text-gray-500 font-medium mt-1 hidden sm:block">{item.description}</p>
                                
                                {item.type === 'landing_page' && item.data?.landingPageId && (
                                    <div className="mt-2">
                                        <button 
                                            onClick={() => handlePreview(item.data.landingPageId)}
                                            className="text-xs flex items-center gap-1 text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded inline-block cursor-pointer border-none transition-colors hover:bg-blue-100"
                                        >
                                            <Eye className="w-3 h-3" />
                                            צפה בטיוטה
                                        </button>
                                    </div>
                                )}
                                {item.type === 'presentation' && item.data?.presentationUrl && (
                                    <div className="mt-2">
                                        <button 
                                            onClick={() => handlePresentationPreview(item.data.presentationUrl)}
                                            className="text-xs flex items-center gap-1 text-purple-600 hover:underline bg-purple-50 px-2 py-1 rounded inline-block cursor-pointer border-none transition-colors hover:bg-purple-100"
                                        >
                                            <Eye className="w-3 h-3" />
                                            צפה במצגת
                                        </button>
                                    </div>
                                )}
                              </div>
                              
                              <div className="flex items-end justify-between mt-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-medium line-through">₪{(item.price || ITEM_PRICE) * 2}</span>
                                    <div className="text-lg font-bold text-gray-900 flex items-center gap-1">
                                        ₪{item.price || ITEM_PRICE}
                                    </div>
                                </div>
                                {isSelected ? (
                                    <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        נבחר
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400 px-2 py-1">לא נבחר</span>
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
              <div className="p-3 sm:p-4 border-t border-gray-100 bg-white space-y-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 pb-safe">
                <div className="flex justify-between items-end px-1">
                    <div>
                        <div className="text-xs text-gray-500 mb-0.5">סה״כ לתשלום ({selectedCount} פריטים):</div>
                        <div className="text-xl sm:text-2xl font-black text-blue-600 leading-none">₪{totalPrice}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1 bg-gray-50 px-2 py-1 rounded-full">
                         <ShieldCheck className="w-3 h-3 text-green-500" />
                         <span>רכישה מאובטחת</span>
                    </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={selectedCount === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold h-11 sm:h-12 rounded-xl text-base sm:text-lg shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-between px-4 sm:px-6 group"
                >
                  <span>{selectedCount > 0 ? 'המשך לתשלום' : 'בחר פריטים'}</span>
                  <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
      )}

      {/* Landing Page Preview Modal */}
      <Dialog open={!!previewPage || isPreviewLoading} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent overlayClassName="z-[150]" className="z-[151] max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-slate-50 flex flex-col border-none">
            <div className="flex items-center justify-between p-4 border-b bg-white z-50 shadow-sm shrink-0" dir="rtl">
                <h3 className="font-bold text-lg text-gray-800">
                    {isPreviewLoading ? 'טוען תצוגה מקדימה...' : `תצוגה מקדימה: ${previewPage?.business_name || ''}`}
                </h3>
                <button 
                    onClick={closePreview}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto relative bg-slate-100">
                {isPreviewLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                ) : (
                    previewPage && (
                        <div className="w-full h-full">
                            <DynamicLandingPage data={previewPage} isThumbnail={false} />
                        </div>
                    )
                )}
            </div>
        </DialogContent>
      </Dialog>

      {/* Presentation Preview Modal */}
      <Dialog open={!!previewPresentation} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent overlayClassName="z-[150]" className="z-[151] max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-slate-50 flex flex-col border-none">
            <div className="flex items-center justify-between p-4 border-b bg-white z-50 shadow-sm shrink-0" dir="rtl">
                <h3 className="font-bold text-lg text-gray-800">
                    תצוגה מקדימה: מצגת עסקית
                </h3>
                <button 
                    onClick={closePreview}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>
            
            <div className="flex-1 overflow-hidden relative bg-slate-100">
                {previewPresentation && (
                    <div className="relative w-full h-full">
                        <iframe
                            src={previewPresentation}
                            className="w-full h-full border-0"
                            title="Presentation Preview"
                            allow="fullscreen"
                        />
                        {/* Watermark Overlay for Presentation */}
                        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                            {[15, 35, 55, 75, 95].map((top) => (
                                <div
                                    key={top}
                                    className="absolute text-red-500/10 font-black text-[8rem] whitespace-nowrap select-none"
                                    style={{ top: `${top}%`, left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)' }}
                                >
                                    טיוטה
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Modal */}
      <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
        <DialogContent overlayClassName="z-[150]" className="z-[151] max-w-3xl w-full p-0 bg-transparent border-0 shadow-none overflow-hidden flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-white rounded-3xl p-2 shadow-2xl max-h-[80vh] w-auto mx-4"
            >
                <button 
                    onClick={() => setEnlargedImage(null)}
                    className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-2 transition-colors"
                >
                    <X className="w-6 h-6 text-white" />
                </button>
                {enlargedImage && (
                    <div 
                        className="relative"
                        onContextMenu={(e) => { e.preventDefault(); return false; }}
                    >
                        {/* Transparent overlay to capture clicks/drags */}
                        <div className="absolute inset-0 z-40 bg-transparent" />
                        
                        <img 
                            src={enlargedImage} 
                            alt="Zoomed Logo" 
                            className="max-w-full max-h-[70vh] object-contain rounded-2xl bg-gray-50 pointer-events-none select-none"
                            draggable="false"
                        />
                        {/* Watermark Overlay for Enlarged View */}
                        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-2xl">
                            {[20, 50, 80].map((top) => (
                                <div
                                    key={top}
                                    className="absolute text-red-500/20 font-black text-6xl md:text-8xl whitespace-nowrap select-none"
                                    style={{ top: `${top}%`, left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)' }}
                                >
                                    טיוטה
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}