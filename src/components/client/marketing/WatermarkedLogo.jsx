import React from 'react';

export default function WatermarkedLogo({ 
  src, 
  alt, 
  className = "max-h-56 w-auto object-contain"
}) {
  return (
    <div className="relative inline-block">
      <img 
        src={src}
        alt={alt}
        className={className}
      />
      
      {/* Watermark Overlay - Canvas-based diagonal pattern */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(-45deg, transparent 48%, rgba(170, 170, 170, 0.15) 48%, rgba(170, 170, 170, 0.15) 52%, transparent 52%),
            linear-gradient(45deg, transparent 48%, rgba(170, 170, 170, 0.15) 48%, rgba(170, 170, 170, 0.15) 52%, transparent 52%)
          `,
          backgroundSize: '60px 60px, 60px 60px',
          backgroundPosition: '0 0, 30px 30px'
        }}
      />
      
      {/* PREVIEW Text - Diagonal */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transform: 'rotate(-45deg)',
          fontSize: '48px',
          fontWeight: 'bold',
          color: 'rgba(100, 100, 100, 0.22)',
          letterSpacing: '4px',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          whiteSpace: 'nowrap'
        }}
      >
        PREVIEW
      </div>
    </div>
  );
}