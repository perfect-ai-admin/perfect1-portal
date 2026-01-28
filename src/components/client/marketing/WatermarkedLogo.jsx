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
          repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(180, 180, 180, 0.25) 35px, rgba(180, 180, 180, 0.25) 36px),
          repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(180, 180, 180, 0.25) 35px, rgba(180, 180, 180, 0.25) 36px)
        `,
        padding: '40px'
      }}
    >
      {/* Logo blended with watermark */}
      <div className="relative" style={{ mixBlendMode: 'multiply' }}>
        <img 
          src={src}
          alt={alt}
          className={className}
          style={{ position: 'relative', zIndex: 2, display: 'block' }}
        />
        
        {/* Diagonal PREVIEW Watermark - Integrated */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute font-black whitespace-nowrap"
              style={{
                transform: 'rotate(-45deg)',
                fontSize: '64px',
                color: 'rgba(120, 120, 120, 0.35)',
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
    </div>
  );
}