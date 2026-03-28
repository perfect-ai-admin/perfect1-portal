import React from 'react';
import UnifiedLeadForm from '../forms/UnifiedLeadForm';

export default function SafeLeadInline({ 
  title, 
  subtitle, 
  description,
  sourcePage = 'SafeLeadInline',
  variant = 'highlight'
}) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 md:p-10 border-2 border-blue-100">
      {title && <h3 className="text-2xl md:text-3xl font-black text-[#1E3A5F] text-center mb-2">{title}</h3>}
      {subtitle && <p className="text-lg text-gray-600 text-center mb-2">{subtitle}</p>}
      {description && <p className="text-sm text-gray-500 text-center mb-6">{description}</p>}
      <div className="max-w-md mx-auto">
        <UnifiedLeadForm
          fields={["name", "phone"]}
          ctaText="בדיקה ללא התחייבות"
          sourcePage={sourcePage}
        />
      </div>
    </div>
  );
}