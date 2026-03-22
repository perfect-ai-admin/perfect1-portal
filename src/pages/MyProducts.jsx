import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, ArrowRight, Loader2, Globe, Palette, 
  Presentation, Image, ShoppingCart, X, LogOut,
  User, HelpCircle, CreditCard, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

import ProductCard from '@/components/client/myproducts/ProductCard';
import ProductFilters from '@/components/client/myproducts/ProductFilters';
import EmptyProducts from '@/components/client/myproducts/EmptyProducts';
import DynamicLandingPage from '@/components/landing-page/DynamicLandingPage';
import ShoppingCartButton from '@/components/client/shared/ShoppingCart';
import NotificationCenter from '@/components/client/NotificationCenter';
import LandingPageManageSheet from '@/components/client/myproducts/LandingPageManageSheet';

export default function MyProducts() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewPage, setPreviewPage] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [managePageId, setManagePageId] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin('/MyProducts');
          return;
        }
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin('/MyProducts');
      }
    };
    checkAuth();
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['purchased-products', user?.id],
    queryFn: async () => {
      // Get PurchasedProduct records
      const purchased = await base44.entities.PurchasedProduct.list('-created_date', 200);
      
      // Also get completed payments for this user to catch anything missing
      const allPayments = await base44.entities.Payment.filter(
        { user_id: user.id, status: 'completed' }, '-created_date', 200
      );
      
      // Find payments that have no matching PurchasedProduct
      const purchasedPaymentIds = new Set(purchased.map(p => p.payment_id).filter(Boolean));
      
      const missingProducts = [];
      
      for (const p of allPayments) {
        if (purchasedPaymentIds.has(p.id)) continue;
        
        const mapType = (t) => t === 'landing-page' ? 'landing_page' :
                               t === 'one-time' ? 'service' :
                               t === 'plan' ? 'plan' :
                               t || 'service';
        
        if (p.product_type === 'cart' && p.items?.length > 0) {
          for (const item of p.items) {
            missingProducts.push({
              id: 'payment_' + p.id + '_' + (item.id || Math.random()),
              user_id: p.user_id,
              product_type: item.type || 'other',
              product_name: item.title || 'מוצר',
              status: 'active',
              payment_id: p.id,
              purchase_price: item.price || 0,
              preview_image: item.preview_image || item.data?.logoUrl || item.data?.preview_image || '',
              download_url: item.data?.logoUrl || item.data?.stickerUrl || item.data?.presentationUrl || '',
              created_date: p.completed_at || p.created_date,
              metadata: { from_payment: true, ...(item.data || {}) }
            });
          }
        } else {
          // Detect actual product type from metadata
          const metaType = p.metadata?.type;
          let resolvedType = mapType(p.product_type);
          if (metaType === 'sticker') resolvedType = 'sticker';
          if (metaType === 'logo') resolvedType = 'logo';
          if (metaType === 'presentation') resolvedType = 'presentation';
          if (metaType === 'digital_card') resolvedType = 'service';
          
          // Get the image/download URL from metadata based on type
          const imageUrl = p.metadata?.stickerUrl || p.metadata?.logoUrl || p.metadata?.preview_image || '';
          const downloadUrl = p.metadata?.presentationUrl || p.metadata?.public_url || imageUrl;
          
          missingProducts.push({
            id: 'payment_' + p.id,
            user_id: p.user_id,
            product_type: resolvedType,
            product_name: p.product_name || (metaType === 'sticker' ? `סטיקר: ${p.metadata?.businessName || 'ממותג'}` : metaType === 'logo' ? `לוגו: ${p.metadata?.businessName || 'ממותג'}` : metaType === 'presentation' ? `מצגת: ${p.metadata?.businessName || 'עסקית'}` : metaType === 'digital_card' ? `כרטיס ביקור: ${p.metadata?.fullName || 'דיגיטלי'}` : 'רכישה'),
            status: 'active',
            payment_id: p.id,
            purchase_price: p.amount || 0,
            preview_image: imageUrl,
            download_url: downloadUrl,
            linked_entity_id: p.product_id || p.metadata?.landingPageId || '',
            published_url: (p.product_type === 'landing-page' && p.metadata?.slug) ? `/LP?s=${p.metadata.slug}` : (metaType === 'presentation' && p.metadata?.presentationUrl) ? p.metadata.presentationUrl : '',
            created_date: p.completed_at || p.created_date,
            metadata: { from_payment: true, ...p.metadata }
          });
        }
      }
      
      let allProducts = [...purchased, ...missingProducts];
      
      // Add current subscription from User entity if not already in list
      if (user.current_plan_id) {
        const hasPlanProduct = allProducts.some(p => p.product_type === 'plan');
        if (!hasPlanProduct) {
          const plans = await base44.entities.Plan.list();
          const currentPlan = plans.find(p => p.id === user.current_plan_id);
          if (currentPlan) {
            allProducts.unshift({
              id: 'subscription_' + currentPlan.id,
              user_id: user.id,
              product_type: 'plan',
              product_name: `מנוי ${currentPlan.name}`,
              status: 'active',
              purchase_price: currentPlan.price || 0,
              created_date: user.plan_start_date || user.created_date,
              metadata: { plan_id: currentPlan.id, type: 'subscription', from_user: true }
            });
          }
        }
      }
      
      return allProducts;
    },
    enabled: !!user,
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => base44.entities.PurchasedProduct.update(id, { status: 'archived' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchased-products'] });
      toast.success('המוצר הועבר לארכיון');
    },
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (typeFilter !== 'all' && p.product_type !== typeFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (search && !p.product_name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, typeFilter, statusFilter, search]);

  const handlePreview = async (product) => {
    if (product.product_type !== 'landing_page' || !product.linked_entity_id) return;
    setIsPreviewLoading(true);
    try {
      const response = await base44.functions.invoke('getPublicLandingPageById', { pageId: product.linked_entity_id });
      if (response.data) {
        setPreviewPage(response.data);
      }
    } catch (err) {
      toast.error('שגיאה בטעינת התצוגה המקדימה');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      // Reset user plan to free
      await base44.auth.updateMe({
        current_plan_id: null,
        plan_renewal_date: null,
      });
      // Archive the PurchasedProduct if it's a real record
      if (cancelDialog?.id && !cancelDialog.id.startsWith('subscription_') && !cancelDialog.id.startsWith('payment_')) {
        await base44.entities.PurchasedProduct.update(cancelDialog.id, { status: 'archived' });
      }
      queryClient.invalidateQueries({ queryKey: ['purchased-products'] });
      toast.success('המנוי בוטל בהצלחה. חזרת למסלול החינמי.');
      setCancelDialog(null);
      setUser(prev => ({ ...prev, current_plan_id: null }));
    } catch (err) {
      toast.error('שגיאה בביטול המנוי');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleLogout = () => base44.auth.logout();

  const stats = useMemo(() => {
    const active = products.filter(p => p.status === 'active').length;
    const types = new Set(products.map(p => p.product_type));
    return { total: products.length, active, types: types.size };
  }, [products]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>המוצרים שלי | Perfect One</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow sticky top-0 z-50">
          <div className="w-full px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button 
                  onClick={() => navigate(createPageUrl('ClientDashboard'))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user?.full_name || 'משתמש'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {typeof ShoppingCartButton === 'function' && <ShoppingCartButton />}
                <button
                  onClick={() => navigate(createPageUrl('PricingPerfectBizAI'))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/90 hover:text-white"
                >
                  <CreditCard className="w-6 h-6" />
                </button>
                {typeof NotificationCenter === 'function' && <NotificationCenter />}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-white/10 rounded transition-colors">
                      <User className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => navigate(createPageUrl('ClientDashboard'))}>
                      <ArrowRight className="w-4 h-4 ml-2" />
                      חזרה לדשבורד
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-sm text-red-600">
                      <LogOut className="w-4 h-4 ml-2" />
                      יציאה
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
          {/* Page Title & Stats */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              המוצרים שלי
            </h1>
            <p className="text-gray-500 text-sm">
              כאן נמצאים כל הנכסים שיצרת ורכשת – אפשר לערוך, לחבר ולהתקדם.
            </p>
          </div>

          {/* Quick Stats */}
          {products.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-500">סה״כ מוצרים</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-xs text-gray-500">פעילים</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.types}</div>
                <div className="text-xs text-gray-500">סוגי מוצרים</div>
              </div>
            </div>
          )}

          {/* Filters */}
          {products.length > 0 && (
            <ProductFilters
              search={search}
              onSearchChange={setSearch}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
            />
          )}

          {/* Products List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-32 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 && products.length > 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="font-medium">לא נמצאו מוצרים תואמים</p>
              <p className="text-sm mt-1">נסה לשנות את הסינון או את החיפוש</p>
            </div>
          ) : products.length === 0 ? (
            <EmptyProducts 
              onGoToStore={() => navigate(createPageUrl('ClientDashboard') + '?tab=marketing')} 
            />
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPreview={handlePreview}
                    onArchive={(id) => archiveMutation.mutate(id)}
                    onCancelSubscription={(p) => setCancelDialog(p)}
                    onManage={(id) => setManagePageId(id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Subscription Dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={(open) => { if (!open) setCancelDialog(null); }}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-center">ביטול מנוי</DialogTitle>
            <DialogDescription className="text-center">
              האם אתה בטוח שברצונך לבטל את המנוי <strong>{cancelDialog?.product_name}</strong>?
              <br />
              תחזור למסלול החינמי עם מטרה אחת בלבד.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-center mt-4">
            <Button variant="outline" onClick={() => setCancelDialog(null)} disabled={isCancelling}>
              חזרה
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              כן, בטל מנוי
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Landing Page Sheet */}
      <LandingPageManageSheet 
        pageId={managePageId} 
        open={!!managePageId} 
        onOpenChange={(open) => { if(!open) setManagePageId(null); }} 
      />

      {/* Landing Page Preview Modal */}
      <Dialog open={!!previewPage || isPreviewLoading} onOpenChange={(open) => { if (!open) { setPreviewPage(null); setIsPreviewLoading(false); } }}>
        <DialogContent overlayClassName="z-[150]" className="z-[151] w-full h-full sm:max-w-6xl sm:w-[95vw] sm:h-[90vh] p-0 overflow-hidden bg-slate-50 flex flex-col border-none sm:rounded-xl">
          <div className="flex items-center justify-between p-4 border-b bg-white z-50 shadow-sm shrink-0" dir="rtl">
            <h3 className="font-bold text-lg text-gray-800">
              {isPreviewLoading ? 'טוען...' : `תצוגה מקדימה: ${previewPage?.business_name || ''}`}
            </h3>
            <button onClick={() => { setPreviewPage(null); setIsPreviewLoading(false); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto relative bg-slate-100">
            {isPreviewLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              </div>
            ) : previewPage && (
              <div className="w-full h-full">
                <DynamicLandingPage data={previewPage} isThumbnail={false} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}