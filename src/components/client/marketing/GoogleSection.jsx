import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Check, AlertCircle, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoogleSection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const businessInfo = {
    name: 'העסק שלי',
    phone: '05X-XXXXXXX',
    address: 'תל אביב, ישראל',
    website: 'example.com',
    category: 'שירותים'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Connection Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">סטטוס חיבור</h3>
          {isConnected && <Check className="w-5 h-5 text-green-600" />}
        </div>

        {!isConnected ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              חבר את פרופיל ה-Google Business שלך כדי לנהל את הנוכחות שלך בחיפוש
            </p>
            <Button 
              onClick={() => setIsConnected(true)}
              className="gap-2"
            >
              <Link2 className="w-4 h-4" />
              התחבר ל-Google
            </Button>
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-800">
              ✓ חיבור פעיל ל-Google Business Profile
            </p>
          </div>
        )}
      </div>

      {/* Business Info */}
      {isConnected && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">פרטי העסק</h3>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { label: 'שם', value: businessInfo.name },
              { label: 'טלפון', value: businessInfo.phone },
              { label: 'כתובת', value: businessInfo.address },
              { label: 'אתר', value: businessInfo.website },
              { label: 'קטגוריה', value: businessInfo.category }
            ].map((field, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">{field.label}</span>
                <span className="text-sm text-gray-600">{field.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {isConnected && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">פעולות בסיסיות</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              הוסף פוסט
            </Button>
            <Button variant="outline" className="w-full justify-start">
              ראה ביקורות
            </Button>
            <Button variant="outline" className="w-full justify-start">
              עדכן תמונות
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}