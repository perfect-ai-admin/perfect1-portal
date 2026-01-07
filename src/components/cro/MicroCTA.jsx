import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function MicroCTA({ 
  text = "רוצה לדעת אם זה מתאים לך?", 
  cta = "בדיקה מהירה ללא עלות",
  variant = "default" // default, subtle, inline
}) {
  const scrollToForm = () => {
    const form = document.querySelector('form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = form.querySelector('input');
      setTimeout(() => firstInput?.focus(), 500);
    }
  };

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-1 text-[#1E3A5F] hover:text-[#2C5282] cursor-pointer font-medium transition-colors" onClick={scrollToForm}>
        {cta}
        <ArrowLeft className="w-4 h-4" />
      </span>
    );
  }

  if (variant === "subtle") {
    return (
      <div className="my-6 p-4 bg-[#E8F4FD] rounded-xl border border-[#1E3A5F]/10">
        <p className="text-sm text-gray-700 mb-2">{text}</p>
        <button
          onClick={scrollToForm}
          className="text-[#1E3A5F] hover:text-[#2C5282] font-medium text-sm flex items-center gap-1 transition-colors"
        >
          {cta}
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="my-8 text-center">
      <div className="inline-block bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-4 hover:shadow-xl transition-shadow">
        <p className="text-gray-700 mb-2">{text}</p>
        <button
          onClick={scrollToForm}
          className="text-[#1E3A5F] hover:text-[#2C5282] font-bold flex items-center gap-2 mx-auto transition-colors"
        >
          {cta}
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}