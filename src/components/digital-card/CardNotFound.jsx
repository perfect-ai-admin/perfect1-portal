import React from 'react';

export default function CardNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4" dir="rtl">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-gray-500" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="11" x2="23" y2="11"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white">הכרטיס לא נמצא</h1>
        <p className="text-sm text-gray-500">יכול להיות שהקישור שגוי או שהכרטיס לא פורסם עדיין.</p>
      </div>
    </div>
  );
}