import React, { useState } from 'react';
import { Download, ShoppingCart, ChevronLeft, Copy, FileJson, Image, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function LogoPreview({ 
  businessName, 
  logoUrl, 
  onSaveToCart, 
  onProceedToCheckout,
  onBack 
}) {
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const handleDownload = (format) => {
    if (format === 'png') {
      const link = document.createElement('a');
      link.href = logoUrl;
      link.download = `${businessName}-logo.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'json') {
      const data = {
        businessName,
        logoUrl,
        format: 'png',
        downloadDate: new Date().toISOString()
      };
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `${businessName}-logo-metadata.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setShowDownloadOptions(false);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(logoUrl);
    alert('קישור הלוגו הועתק! 📋');
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block space-y-6">
        <Button variant="ghost" onClick={onBack}>← חזור</Button>
        
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">לוגו שלך מוכן! 🎉</h2>
            <p className="text-gray-600">בחר מה שתרצה לעשות עכשיו</p>
          </div>

          {/* Logo Preview */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
            <img 
              src={logoUrl} 
              alt={`${businessName} logo`}
              className="max-w-sm h-auto object-contain"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onProceedToCheckout}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-100"
            >
              <Download className="w-5 h-5 ml-2" />
              המשך לרכישה
            </Button>
            <Button 
              onClick={onSaveToCart}
              variant="outline"
              className="w-full h-12 border-2 border-blue-200 hover:border-blue-300 text-blue-600"
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              שמור בסל
            </Button>
          </div>

          {/* Download Options */}
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">הורדה ישירה:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => handleDownload('png')}
                variant="outline"
                className="h-10 text-sm"
              >
                <Image className="w-4 h-4 ml-2" />
                PNG
              </Button>
              <Button 
                onClick={() => handleDownload('json')}
                variant="outline"
                className="h-10 text-sm"
              >
                <FileJson className="w-4 h-4 ml-2" />
                Metadata
              </Button>
              <Button 
                onClick={handleCopyUrl}
                variant="outline"
                className="h-10 text-sm col-span-2"
              >
                <Copy className="w-4 h-4 ml-2" />
                העתק קישור
              </Button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>את הלוגו שלך תוכל להוריד בכל עת מחשבונך</p>
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

          {/* Download Options */}
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-semibold text-gray-700">הורדה:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => handleDownload('png')}
                variant="outline"
                size="sm"
                className="h-9 text-xs"
              >
                <Image className="w-3 h-3 ml-1" />
                PNG
              </Button>
              <Button 
                onClick={handleCopyUrl}
                variant="outline"
                size="sm"
                className="h-9 text-xs"
              >
                <Copy className="w-3 h-3 ml-1" />
                העתק
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}