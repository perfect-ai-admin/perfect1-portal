import React from 'react';

export default function WatermarkedLogo({ 
  src, 
  alt, 
  className = "max-h-56 w-auto object-contain"
}) {
  return (
    <div 
      className="relative inline-flex items-center justify-center"
      style={{
        background: `
          repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(180, 180, 180, 0.2) 35px, rgba(180, 180, 180, 0.2) 36px),
          repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(180, 180, 180, 0.2) 35px, rgba(180, 180, 180, 0.2) 36px),
          linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)
        `,
        padding: '40px',
        borderRadius: '12px'
      }}
    >
      {/* Logo */}
      <img 
        src={src}
        alt={alt}
        className={className}
        style={{ position: 'relative', zIndex: 2 }}
      />
      
      {/* Diagonal PREVIEW Watermark - Full Coverage */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden rounded-lg">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute font-black whitespace-nowrap"
            style={{
              transform: 'rotate(-45deg)',
              fontSize: '64px',
              color: 'rgba(140, 140, 140, 0.28)',
              letterSpacing: '4px',
              fontWeight: '900',
              left: `${(i % 4) * 40 - 20}%`,
              top: `${Math.floor(i / 4) * 50 - 25}%`,
              width: '200%'
            }}
          >
            PREVIEW
          </div>
        ))}
      </div>
    </div>
  );
}