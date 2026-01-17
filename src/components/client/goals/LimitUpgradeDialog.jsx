import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function LimitUpgradeDialog({ isOpen, onClose, limit }) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    // Pass limit=true to show the specific message on pricing page if needed
    navigate(createPageUrl('PricingPerfectBizAI') + '?limit=true');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl p-6 text-center" dir="rtl">
        <DialogHeader>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 text-center">
            הגעת למכסת המטרות במסלול שלך
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed">
            במסלול הנוכחי אפשר להקים עד <strong>{limit}</strong> מטרות.
            <br />
            כדי להקים מטרה נוספת צריך לשדרג מסלול.
          </p>

          <div className="space-y-3">
            <Button 
              onClick={handleUpgrade}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-base"
            >
              שדרג מסלול
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full h-11 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl font-normal"
            >
              לא עכשיו
            </Button>
          </div>

          <p className="text-xs text-green-600 font-medium bg-green-50 py-1.5 px-3 rounded-full inline-block">
            ✨ השדרוג נכנס לתוקף מיידית
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}