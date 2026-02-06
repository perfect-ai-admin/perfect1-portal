import React from 'react';

export default function CardLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center" dir="rtl">
      <div className="max-w-[440px] w-full px-5 space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="rounded-b-[24px] bg-gray-200 h-52 w-full" />
        
        {/* Action buttons skeleton */}
        <div className="grid grid-cols-2 gap-3 -mt-6">
          <div className="h-14 bg-gray-100 rounded-2xl" />
          <div className="h-14 bg-gray-100 rounded-2xl" />
          <div className="h-14 bg-gray-100 rounded-2xl" />
          <div className="h-14 bg-gray-100 rounded-2xl" />
        </div>
        
        {/* Info skeleton */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-12 bg-gray-50 rounded-xl" />
          <div className="h-12 bg-gray-50 rounded-xl" />
        </div>
      </div>
    </div>
  );
}