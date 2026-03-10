import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-right flex-1">
          <h3 className="font-bold text-gray-900 mb-1">אנחנו משתמשים בעוגיות 🍪</h3>
          <p className="text-sm text-gray-600">
            האתר שלנו משתמש בעוגיות כדי לשפר את חווית הגלישה שלך, לנתח את התנועה באתר ולהציג תוכן מותאם אישית. 
            בשימוש באתר הנך מסכים ל
            <Link to="/Privacy" className="text-blue-600 hover:underline mx-1">
              מדיניות הפרטיות
            </Link>
            ול
            <Link to="/Terms" className="text-blue-600 hover:underline mx-1">
              תנאי השימוש
            </Link>
            שלנו.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline"
            onClick={() => {
              localStorage.setItem('cookie_consent', 'essential_only');
              setIsVisible(false);
            }}
            className="flex-1 md:flex-none border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
          >
            רק הכרחי
          </Button>
          <Button 
            onClick={handleAccept}
            className="flex-1 md:flex-none bg-[#1E3A5F] hover:bg-[#2C5282] text-white font-bold"
          >
            אני מסכים/ה
          </Button>
        </div>
      </div>
    </div>
  );
}