import React from 'react';

export default function CardLoading() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center" dir="rtl">
      <div className="max-w-[460px] w-full px-5 space-y-5 animate-pulse">
        <div className="h-[220px] bg-gray-800/50 rounded-b-3xl w-full" />
        <div className="flex flex-col items-center -mt-16 relative z-10">
          <div className="w-28 h-28 rounded-full bg-gray-800" />
          <div className="h-6 bg-gray-800 rounded-lg w-32 mt-4" />
          <div className="h-4 bg-gray-800/60 rounded-lg w-24 mt-2" />
        </div>
        <div className="bg-gray-800/30 rounded-3xl p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-800/40 rounded-2xl" />
            <div className="h-16 bg-gray-800/40 rounded-2xl" />
            <div className="h-16 bg-gray-800/40 rounded-2xl" />
          </div>
        </div>
        <div className="bg-gray-800/30 rounded-3xl p-5 space-y-3">
          <div className="h-14 bg-gray-800/40 rounded-2xl" />
          <div className="h-14 bg-gray-800/40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}