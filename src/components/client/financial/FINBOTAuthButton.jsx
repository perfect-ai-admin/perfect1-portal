import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { finbotService } from './FINBOTService';

export default function FINBOTAuthButton({ onAuthSuccess }) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsConnected(finbotService.isAuthenticated());
  }, []);

  const handleConnect = () => {
    setLoading(true);
    finbotService.initiateOAuth();
  };

  const handleDisconnect = async () => {
    if (confirm('האם אתה בטוח שברצונך לנתק את החיבור ל-FINBOT?')) {
      setLoading(true);
      try {
        await finbotService.revokeAccess();
        setIsConnected(false);
      } catch (error) {
        alert('שגיאה בניתוק: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (isConnected) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">מחובר ל-FINBOT ✓</h3>
            <p className="text-sm text-gray-600">כל התכונות הפיננסיות פעילות</p>
          </div>
          <Button 
            variant="outline"
            onClick={handleDisconnect}
            disabled={loading}
          >
            נתק
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-12 h-12 text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">התחבר ל-FINBOT</h3>
          <p className="text-gray-700 mb-4">
            חבר את החשבון שלך כדי להפעיל את כל התכונות הפיננסיות:
          </p>
          <ul className="space-y-2 text-sm text-gray-600 mb-4">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              יצירת חשבוניות מקצועיות
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              סריקת מסמכים אוטומטית (OCR) עם דיוק 97%
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              סנכרון עם הבנק
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              דיווחי מע"ם אוטומטיים
            </li>
          </ul>
          <Button 
            size="lg"
            onClick={handleConnect}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ExternalLink className="w-5 h-5 ml-2" />
            {loading ? 'מתחבר...' : 'התחבר עכשיו'}
          </Button>
        </div>
      </div>
    </div>
  );
}