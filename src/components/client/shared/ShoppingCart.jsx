import React, { useState, useEffect } from 'react';
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
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            {/* Responsive Container */}
            <motion.div
              initial={isMobile ? { y: '100%' } : { x: '100%' }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: '100%' } : { x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed z-[70] bg-white shadow-2xl flex flex-col overflow-hidden
                ${isMobile 
                  ? 'bottom-0 left-0 right-0 h-[85vh] rounded-t-[2rem]' 
                  : 'right-0 top-0 h-full w-full max-w-md border-l border-gray-100'
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
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fade-in-up">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl shadow-blue-100 border-4 border-white relative z-10">
                            <ShoppingCart className="w-12 h-12 text-blue-500 opacity-80" />
                        </div>
                    </div>
                    <div className="space-y-3 max-w-[280px]">
                      <h3 className="text-gray-900 font-black text-2xl">העגלה שלך ריקה</h3>
                      <p className="text-gray-500 font-medium leading-relaxed">
                        זה הזמן להתחיל ליצור משהו מדהים לעסק שלך!
                      </p>
                    </div>
                    <Button 
                        onClick={() => setIsOpen(false)} 
                        className="h-12 px-8 bg-gray-900 text-white hover:bg-gray-800 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                        חזור לעצב
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 pb-24 md:pb-6"> {/* Added padding bottom for mobile footer */}
                    {cartItems.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      return (
                        <motion.div
                          layout
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => toggleSelection(item.id)}
                          className={`group relative bg-white rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                            isSelected 
                              ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/10 scale-[1.01]' 
                              : 'ring-1 ring-gray-100 shadow-sm hover:shadow-md hover:ring-blue-200'
                          }`}
                        >
                          <div className="flex p-4 gap-4">
                            {/* Selection Indicator */}
                            <div className="flex items-center self-center">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                    isSelected 
                                        ? 'bg-blue-500 border-blue-500' 
                                        : 'bg-transparent border-gray-200 group-hover:border-blue-300'
                                }`}>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                </div>
                            </div>

                            {/* Image Area */}
                            {(item.preview_image || item.type === 'presentation') && (
                                <div 
                                    className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100 group-hover:border-blue-100 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEnlargedImage(item.preview_image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop');
                                    }}
                                >
                                    <img
                                      src={item.preview_image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop'}
                                      alt={item.title}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Watermark Overlay */}
                                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
                                        <div className="text-red-500/40 font-black text-xl rotate-[-45deg] whitespace-nowrap select-none border-2 border-red-500/30 px-2 py-0.5 rounded backdrop-blur-[1px]">
                                            טיוטה
                                        </div>
                                    </div>
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 z-20 cursor-zoom-in">
                                        <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                                    </div>
                                </div>
                            )}

                            {/* Details Area */}
                            <div className="flex-1 flex flex-col min-w-0 py-0.5">
                              <div className="flex justify-between items-start gap-3">
                                  <div className="space-y-1">
                                    <h3 className={`font-bold text-gray-900 truncate text-lg leading-tight transition-colors ${isSelected ? 'text-blue-700' : ''}`}>
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium leading-tight line-clamp-2 pl-2">
                                        {item.description}
                                    </p>
                                  </div>
                                  <button
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          removeItem(item.id);
                                      }}
                                      className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all flex-shrink-0"
                                      title="הסר מהעגלה"
                                  >
                                      <Trash2 className="w-4.5 h-4.5" />
                                  </button>
                              </div>

                              <div className="mt-auto pt-3 flex items-end justify-between">
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        {item.type === 'landing_page' && item.data?.landingPageId && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePreview(item.data.landingPageId);
                                                }}
                                                className="text-xs font-bold flex items-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                צפה בטיוטה
                                            </button>
                                        )}
                                        {item.type === 'presentation' && item.data?.presentationUrl && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePresentationPreview(item.data.presentationUrl);
                                                }}
                                                className="text-xs font-bold flex items-center gap-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                צפה במצגת
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="text-left">
                                    <span className="block text-xs text-gray-400 font-medium line-through mb-0.5">₪{(item.price || ITEM_PRICE) * 2}</span>
                                    <div className="text-xl font-black text-gray-900 flex items-center gap-1">
                                        ₪{item.price || ITEM_PRICE}
                                    </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Selection Overlay Effect */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-50/30 pointer-events-none" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-100 bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 pb-safe">
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>פריטים שנבחרו:</span>
                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-900">{selectedCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">סה״כ לתשלום:</span>
                        <div className="text-right">
                            <span className="text-2xl font-black text-blue-600">₪{totalPrice}</span>
                        </div>
                    </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={selectedCount === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold h-14 rounded-2xl text-lg shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-between px-6 group"
                >
                  <span>{selectedCount > 0 ? 'המשך לתשלום' : 'בחר פריטים'}</span>
                  <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    <span>רכישה מאובטחת בתקן PCI-DSS</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Landing Page Preview Modal */}
      <Dialog open={!!previewPage || isPreviewLoading} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-slate-50 flex flex-col border-none">
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
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-slate-50 flex flex-col border-none">
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
        <DialogContent className="max-w-3xl w-full p-0 bg-transparent border-0 shadow-none overflow-hidden flex items-center justify-center">
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