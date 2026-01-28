import React from 'react';
import { Download, ShoppingCart, ChevronLeft } from 'lucide-react';
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
            className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-2"
          >
            ← חזור
          </button>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">לוגו שלך מוכן! 🎉</h2>
            <p className="text-gray-600 text-sm">בחר מה שתרצה לעשות</p>
          </div>

          {/* Logo Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl p-6 flex items-center justify-center h-48">
            <img 
              src={logoUrl} 
              alt={`${businessName} logo`}
              className="max-h-40 w-auto object-contain"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={onProceedToCheckout}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-100 text-base font-bold"
            >
              <Download className="w-5 h-5 ml-2" />
              המשך לרכישה
            </Button>
            <Button 
              onClick={onSaveToCart}
              variant="outline"
              className="w-full h-12 border-2 border-blue-200 hover:border-blue-300 text-blue-600 font-semibold"
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              שמור בסל
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 pt-2">
            <p>הלוגו בפורמט PNG יישלח לאימייל שלך אחרי הרכישה</p>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex-none px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
          <button onClick={onBack} className="p-1 -mr-2 text-gray-500 hover:text-gray-900">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-right flex-1">
            <h2 className="text-lg font-bold text-gray-900">לוגו מוכן!</h2>
            <p className="text-xs text-gray-500 mt-1">בחר מה עכשיו</p>
          </div>
        </div>

        {/* Logo Preview */}
        <div className="flex-1 flex items-center justify-center overflow-y-auto p-4 min-h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mx-4 my-4">
          <img 
            src={logoUrl} 
            alt={`${businessName} logo`}
            className="max-w-xs h-auto object-contain"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex-none space-y-2 p-4">
          <Button 
            onClick={onProceedToCheckout}
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-100"
          >
            <Download className="w-4 h-4 ml-2" />
            המשך לרכישה
          </Button>
          <Button 
            onClick={onSaveToCart}
            variant="outline"
            className="w-full h-11 border-2 border-blue-200 hover:border-blue-300 text-blue-600"
          >
            <ShoppingCart className="w-4 h-4 ml-2" />
            שמור בסל
          </Button>
          
          <p className="text-xs text-gray-500 text-center pt-2">הלוגו PNG יישלח לאימייל</p>
        </div>
      </div>
    </>
  );
}