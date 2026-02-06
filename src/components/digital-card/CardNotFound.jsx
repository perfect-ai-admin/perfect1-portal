import React from 'react';
import { UserX } from 'lucide-react';

export default function CardNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4" dir="rtl">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <UserX className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">הכרטיס לא נמצא</h1>
        <p className="text-sm text-gray-500">יכול להיות שהקישור שגוי או שהכרטיס לא פורסם עדיין.</p>
      </div>
    </div>
  );
}