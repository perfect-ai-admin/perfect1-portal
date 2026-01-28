import React from 'react';
import { Download, Lock, ChevronLeft, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LogoPreview({ 
  businessName, 
  logoUrl, 
  onSaveToCart, 
  onProceedToCheckout,
  onBack 
}) {
  return (
    <>
      {/* Desktop View - Full page centered layout */}
      <div className="hidden lg:flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <button 
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 font-medium text-sm flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            חזור לעריכה
          </button>
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">לוגו שלך מוכן!</h2>
            <p className="text-gray-600 text-sm">זו תצוגה מקדימה - נדרש אישור להורדה</p>
          </div>

          {/* Logo Preview with Badge and Watermark */}
          <div className="relative bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl p-8 flex flex-col items-center justify-center h-64">
            {/* Main Logo Image with Watermark */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={logoUrl} 
                alt={`${businessName} logo`}
                className="max-h-56 w-auto object-contain z-10 relative"
              />
              {/* Subtle Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-gray-300 text-sm font-semibold opacity-40 rotate-45 tracking-wider">
                    PREVIEW ONLY
                  </p>
                  <p className="text-gray-300 text-xs opacity-30 tracking-wide">
                    Unlock to download
                  </p>
                </div>
              </div>
            </div>
            {/* Badge */}
            <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-20">
              <Lock className="w-3 h-3" />
              תצוגה מקדימה
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">תצוגה מקדימה עם סימן מים</p>
              <p className="text-xs text-blue-800 opacity-90">אשר את הלוגו, השתמש בקרדיט הורדה אחד, והוריד PNG ללא סימן מים באיכות גבוהה</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={onProceedToCheckout}
              className="w-full h-13 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-purple-200 text-base font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-5 h-5" />
              אישור והורדה
            </Button>
            <Button 
              onClick={onSaveToCart}
              variant="outline"
              className="w-full h-12 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold"
            >
              שמור בסל לאחר
            </Button>
          </div>

          <div className="text-center text-xs text-gray-600 pt-3 space-y-1 bg-gray-50 rounded-lg p-3">
            <p className="font-semibold">✓ שימוש 1 קרדיט הורדה בלבד</p>
            <p className="opacity-75">✓ PNG באיכות גבוהה (2400x2400px)</p>
            <p className="opacity-75">✓ משלוח מיידי לאימייל</p>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex-none px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
          <button onClick={onBack} className="p-1 text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">לוגו מוכן!</h2>
            <p className="text-xs text-gray-500">תצוגה מקדימה</p>
          </div>
        </div>

        {/* Logo Preview with Badge */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto p-4 min-h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mx-4 my-4 relative">
          <img 
            src={logoUrl} 
            alt={`${businessName} logo`}
            className="max-w-xs h-auto object-contain"
          />
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Lock className="w-3 h-3" />
            תצוגה
          </div>
        </div>

        {/* Warning Box */}
        <div className="flex-none px-4 mb-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-0.5">סימן מים בתצוגה</p>
            <p className="text-xs opacity-85">אישור + קרדיט הורדה להורדה ללא סימן מים</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-none space-y-2 p-4">
          <Button 
            onClick={onProceedToCheckout}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-purple-100 font-bold"
          >
            <Zap className="w-4 h-4 ml-2" />
            אישור והורדה
          </Button>
          <Button 
            onClick={onSaveToCart}
            variant="outline"
            className="w-full h-11 border-2 border-gray-300 hover:border-gray-400 text-gray-700"
          >
            שמור בסל
          </Button>
          
          <p className="text-xs text-gray-500 text-center pt-1">1 קרדיט הורדה • PNG איכות גבוהה</p>
        </div>
      </div>
    </>
  );
}