import React from 'react';

export default function WatermarkedLogo({ 
  src, 
  alt, 
  className = "max-h-56 w-auto object-contain"
}) {
  return (
    <div className="relative inline-block w-full h-full">
      <img 
        src={src}
        alt={alt}
        className={className}
        style={{ display: 'block' }}
      />
      
      {/* Grid Watermark Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(160, 160, 160, 0.18) 30px, rgba(160, 160, 160, 0.18) 31px),
            repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(160, 160, 160, 0.18) 30px, rgba(160, 160, 160, 0.18) 31px)
          `
        }}
      />
      
      {/* Diagonal PREVIEW Text - Multiple instances for full coverage */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="absolute text-gray-500 font-bold whitespace-nowrap"
            style={{
              transform: 'rotate(-45deg)',
              fontSize: '52px',
              color: 'rgba(120, 120, 120, 0.25)',
              letterSpacing: '3px',
              fontWeight: 'bold',
              left: `${(i % 3) * 50 - 25}%`,
              top: `${Math.floor(i / 3) * 50 - 25}%`,
            }}
          >
            PREVIEW
          </div>
        ))}
      </div>
    </div>
  );
}