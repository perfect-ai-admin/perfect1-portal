import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Globe, Palette, Presentation, Image, MoreVertical, 
  ExternalLink, Download, Eye, Archive, Copy, Calendar,
  CheckCircle2, FileText, CreditCard, Target, Crown, X,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const typeConfig = {
  landing_page: { icon: Globe, label: 'דף נחיתה', color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700' },
  logo: { icon: Palette, label: 'לוגו', color: 'bg-purple-500', lightColor: 'bg-purple-50 text-purple-700' },
  sticker: { icon: Image, label: 'סטיקר', color: 'bg-pink-500', lightColor: 'bg-pink-50 text-pink-700' },
  presentation: { icon: Presentation, label: 'מצגת', color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-700' },
  plan: { icon: Crown, label: 'מנוי', color: 'bg-indigo-500', lightColor: 'bg-indigo-50 text-indigo-700' },
  goal: { icon: Target, label: 'מטרה', color: 'bg-teal-500', lightColor: 'bg-teal-50 text-teal-700' },
  service: { icon: FileText, label: 'שירות', color: 'bg-green-500', lightColor: 'bg-green-50 text-green-700' },
  other: { icon: FileText, label: 'מוצר', color: 'bg-gray-500', lightColor: 'bg-gray-50 text-gray-700' },
};

const statusConfig = {
  active: { label: 'שולם ✓', className: 'bg-green-50 text-green-700 border-green-200' },
  draft: { label: 'ממתין לתשלום', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  archived: { label: 'בארכיון', className: 'bg-gray-50 text-gray-500 border-gray-200' },
};

const planStatusConfig = {
  active: { label: 'מנוי פעיל ✓', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  archived: { label: 'מנוי מבוטל', className: 'bg-gray-50 text-gray-500 border-gray-200' },
};

export default function ProductCard({ product, onPreview, onArchive, onCancelSubscription, onManage }) {
  const [failedImg, setFailedImg] = useState(false);
  const navigate = useNavigate();
  const config = typeConfig[product.product_type] || typeConfig.other;
  const isPlan = product.product_type === 'plan';
  const status = isPlan 
    ? (planStatusConfig[product.status] || planStatusConfig.active) 
    : (statusConfig[product.status] || statusConfig.active);
  const Icon = config.icon;

  const handleCopyLink = () => {
    if (product.published_url) {
      navigator.clipboard.writeText(product.published_url);
      toast.success('הקישור הועתק!');
    }
  };

  const handleDownload = async () => {
    const url = product.download_url || product.preview_image;
    if (!url) return;
    
    try {
      // For data URLs or blob URLs, create a direct download
      const link = document.createElement('a');
      const ext = product.product_type === 'logo' ? 'png' : 'png';
      const safeName = (product.product_name || 'download').replace(/[^א-תa-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
      
      if (url.startsWith('data:')) {
        link.href = url;
        link.download = `${safeName}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('ההורדה החלה!');
      } else {
        // For external URLs, fetch and download as blob
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        link.href = blobUrl;
        link.download = `${safeName}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        toast.success('ההורדה החלה!');
      }
    } catch (err) {
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image / Icon Area */}
        <div className="w-full sm:w-40 h-32 sm:h-auto bg-gray-50 flex-shrink-0 relative flex items-center justify-center overflow-hidden">
          {(product.preview_image || ((product.product_type === 'sticker' || product.product_type === 'logo') && product.download_url)) && !failedImg ? (
            <img 
              src={product.preview_image || product.download_url} 
              alt={product.product_name}
              className={`w-full h-full ${
                product.product_type === 'sticker' || product.product_type === 'logo' 
                  ? 'object-contain p-2 bg-white' 
                  : 'object-cover'
              }`}
              onError={() => setFailedImg(true)}
            />
          ) : (
            <div className={`w-16 h-16 rounded-2xl ${config.color} flex items-center justify-center`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 ${config.lightColor} border-0`}>
                    {config.label}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] px-2 py-0 ${status.className}`}>
                    {status.label}
                  </Badge>
                </div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{product.product_name}</h3>
              </div>
              
              {/* More Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {product.published_url && (
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Copy className="w-4 h-4 ml-2" />
                      העתק קישור
                    </DropdownMenuItem>
                  )}
                  {product.product_type === 'plan' && product.status === 'active' && onCancelSubscription && (
                    <DropdownMenuItem onClick={() => onCancelSubscription(product)} className="text-red-600">
                      <X className="w-4 h-4 ml-2" />
                      ביטול מנוי
                    </DropdownMenuItem>
                  )}
                  {product.status !== 'archived' && product.product_type !== 'plan' && onArchive && (
                    <DropdownMenuItem onClick={() => onArchive(product.id)}>
                      <Archive className="w-4 h-4 ml-2" />
                      העבר לארכיון
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(product.created_date).toLocaleDateString('he-IL')}
              </span>
              {product.purchase_price > 0 && (
                <span>₪{product.purchase_price}{isPlan ? '/חודש' : ''}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.product_type === 'landing_page' && (product.linked_entity_id || product.metadata?.landingPageId) && (
              <Button 
                size="sm" 
                className="gap-1.5 text-xs h-8 rounded-lg bg-blue-600 hover:bg-blue-700"
                onClick={() => onManage ? onManage(product.linked_entity_id || product.metadata?.landingPageId) : navigate(createPageUrl('LandingPageManager') + '?id=' + (product.linked_entity_id || product.metadata?.landingPageId))}
              >
                <Settings className="w-3.5 h-3.5" />
                נהל דף
              </Button>
            )}

            {product.product_type === 'landing_page' && product.published_url && (
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-1.5 text-xs h-8 rounded-lg"
                onClick={() => window.open(product.published_url, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                צפה בדף
              </Button>
            )}

            {(product.product_type === 'logo' || product.product_type === 'sticker') && (product.download_url || product.preview_image) && (
              <Button 
                size="sm" 
                className="gap-1.5 text-xs h-8 rounded-lg bg-green-600 hover:bg-green-700"
                onClick={handleDownload}
              >
                <Download className="w-3.5 h-3.5" />
                הורד {product.product_type === 'logo' ? 'לוגו' : 'סטיקר'}
              </Button>
            )}

            {product.product_type === 'presentation' && product.download_url && (
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-1.5 text-xs h-8 rounded-lg"
                onClick={() => window.open(product.download_url, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                צפה במצגת
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}