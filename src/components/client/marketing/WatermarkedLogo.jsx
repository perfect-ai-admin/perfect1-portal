import React from 'react';

export default function WatermarkedLogo({ 
  src, 
  alt, 
  className = "max-h-56 w-auto object-contain"
}) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <img 
        src={src}
        alt={alt}
        className={className}
      />
      
      {/* Watermark Overlay */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <pattern 
            id="watermark-pattern" 
            patternUnits="userSpaceOnUse" 
            width="250" 
            height="250"
          >
            {/* Subtle Grid */}
            <rect 
              x="0" 
              y="0" 
              width="220" 
              height="220" 
              fill="none" 
              stroke="#BBBBBB" 
              strokeWidth="2"
              opacity="0.12"
            />
            
            {/* Diagonal Text */}
            <g transform="translate(125, 125) rotate(-45)">
              <text 
                x="0" 
                y="0" 
                fontSize="32"
                fontWeight="bold"
                textAnchor="middle"
                fill="#999999"
                opacity="0.16"
                fontFamily="Arial, sans-serif"
                letterSpacing="3"
              >
                PREVIEW
              </text>
            </g>
          </pattern>
        </defs>
        
        {/* Apply pattern across entire image */}
        <rect 
          width="1000" 
          height="1000" 
          fill="url(#watermark-pattern)"
        />
      </svg>
    </div>
  );
}