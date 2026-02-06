import React, { useState } from 'react';

function lightenColor(hex, amount = 30) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
  const b = Math.min(255, (num & 0x0000FF) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function CardHeader({ card, primaryColor }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const initials = (card.full_name || 'א').split(' ').map(w => w[0]).join('').slice(0, 2);
  const lighterColor = lightenColor(primaryColor, 40);

  return (
    <div 
      className="relative rounded-b-[28px] overflow-hidden"
      style={{ background: `linear-gradient(145deg, ${primaryColor}, ${lighterColor})` }}
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative px-6 pt-10 pb-12 flex flex-col items-center text-center">
        {/* Avatar / Logo */}
        <div className="relative mb-4">
          {card.logo_url ? (
            <div className="relative">
              {!imgLoaded && (
                <div className="w-[88px] h-[88px] rounded-full bg-white/20 animate-pulse" />
              )}
              <img 
                src={card.logo_url} 
                alt={card.full_name} 
                className={`w-[88px] h-[88px] rounded-full object-cover border-[3px] border-white/30 shadow-lg ${imgLoaded ? 'block' : 'hidden'}`}
                onLoad={() => setImgLoaded(true)}
              />
            </div>
          ) : (
            <div 
              className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-2xl font-black text-white border-[3px] border-white/30 shadow-lg"
              style={{ background: `rgba(255,255,255,0.15)`, backdropFilter: 'blur(10px)' }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Name & Role */}
        <h1 className="text-[22px] font-extrabold text-white leading-tight tracking-tight">
          {card.full_name}
        </h1>
        {card.profession && (
          <p className="text-sm font-medium text-white/75 mt-1.5">
            {card.profession}
          </p>
        )}

        {/* Services tags */}
        {card.services?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {card.services.map((s, i) => (
              <span 
                key={i} 
                className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/15 text-white/90 backdrop-blur-sm border border-white/10"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}