import React, { useState } from 'react';
import { motion } from 'framer-motion';

function lighten(hex, amt = 50) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xFF) + amt);
  const b = Math.min(255, (n & 0xFF) + amt);
  return `rgb(${r},${g},${b})`;
}

export default function CardHero({ card, color }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const initials = (card.full_name || '').split(' ').map(w => w[0]).join('').slice(0, 2);
  const lighter = lighten(color, 60);

  return (
    <div className="relative">
      {/* Cover area */}
      <div className="h-[220px] relative overflow-hidden">
        {card.cover_image_url ? (
          <img src={card.cover_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(160deg, ${color} 0%, ${lighter} 50%, ${color} 100%)` }}
          />
        )}
        {/* Gradient fade to page bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-950" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Profile section - overlapping cover */}
      <div className="relative -mt-20 px-6 flex flex-col items-center text-center z-10">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
        >
          <div className="relative">
            {/* Glow ring */}
            <div
              className="absolute -inset-1 rounded-full opacity-40 blur-md"
              style={{ background: color }}
            />
            <div className="relative p-[3px] rounded-full bg-gray-950">
              {card.logo_url ? (
                <>
                  {!imgLoaded && (
                    <div className="w-28 h-28 rounded-full bg-gray-800 animate-pulse" />
                  )}
                  <img
                    src={card.logo_url}
                    alt={card.full_name}
                    className={`w-28 h-28 rounded-full object-cover ring-2 ring-white/10 ${imgLoaded ? '' : 'hidden'}`}
                    onLoad={() => setImgLoaded(true)}
                  />
                </>
              ) : (
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-black text-white ring-2 ring-white/10"
                  style={{ background: `linear-gradient(135deg, ${color}, ${lighter})` }}
                >
                  {initials}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Name & profession */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-5 space-y-1.5"
        >
          <h1 className="text-[28px] font-extrabold tracking-tight leading-none">
            {card.full_name}
          </h1>
          {card.profession && (
            <p className="text-base text-gray-400 font-medium">{card.profession}</p>
          )}
        </motion.div>

        {/* Services pills */}
        {card.services?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-2 mt-5 max-w-[360px]"
          >
            {card.services.map((s, i) => (
              <span
                key={i}
                className="text-xs font-medium px-3.5 py-1.5 rounded-full border backdrop-blur-sm"
                style={{
                  color: lighter,
                  borderColor: `${color}40`,
                  backgroundColor: `${color}15`
                }}
              >
                {s}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}