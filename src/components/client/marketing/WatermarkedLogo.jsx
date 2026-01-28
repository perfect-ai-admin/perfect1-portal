import React, { useState } from 'react';

export default function WatermarkedLogo({ 
  src, 
  alt, 
  className = "max-h-56 w-auto object-contain",
  businessName 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative inline-block">
      <img 
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setImageLoaded(true)}
      />
      
      {/* Watermark Overlay */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        {/* Pattern of diagonal lines with text */}
        <defs>
          <pattern 
            id="watermark-pattern" 
            patternUnits="userSpaceOnUse" 
            width="200" 
            height="200"
            patternTransform="rotate(-45)"
          >
            {/* Grid of subtle squares */}
            <rect 
              x="0" 
              y="0" 
              width="180" 
              height="180" 
              fill="none" 
              stroke="#999999" 
              strokeWidth="1.5"
              opacity="0.15"
            />
            
            {/* Watermark Text */}
            <text 
              x="90" 
              y="100" 
              fontSize="28"
              fontWeight="bold"
              textAnchor="middle"
              fill="#666666"
              opacity="0.18"
              fontFamily="Arial, sans-serif"
              letterSpacing="2"
            >
              PREVIEW
            </text>
          </pattern>
        </defs>
        
        {/* Apply pattern */}
        <rect 
          width="1000" 
          height="1000" 
          fill="url(#watermark-pattern)"
        />
      </svg>
    </div>
  );
}