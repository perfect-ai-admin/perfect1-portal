import React, { useState } from 'react';
import { motion } from 'framer-motion';

function lightenColor(hex, amount = 30) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
  const b = Math.min(255, (num & 0x0000FF) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function CardHeader({ card, primaryColor, themeStyles }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const initials = (card.full_name || 'א').split(' ').map(w => w[0]).join('').slice(0, 2);
  
  // Default fallbacks if themeStyles is missing
  const bgStyle = themeStyles?.bgColor || '#1A1A1A';
  const textColor = themeStyles?.textColor || '#FFFFFF';
  const subTextColor = themeStyles?.textColor === '#1F2937' ? '#4B5563' : '#D1D5DB'; // Gray-600 vs Gray-300
  const lighterColor = lightenColor(primaryColor || '#1E3A5F', 40);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-b-[32px] overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: bgStyle }}
    >
      {/* Cover Image or Gradient */}
      <div className="h-[200px] w-full relative">
        {card.cover_image_url ? (
          <img 
            src={card.cover_image_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${lighterColor})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-80" />
      </div>

      {/* Avatar - Overlapping */}
      <div className="relative -mt-16 px-6 pb-8 flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mb-5"
        >
          {card.logo_url ? (
            <div className="relative">
              {!imgLoaded && (
                <div className="w-[110px] h-[110px] rounded-full bg-white/10 animate-pulse absolute inset-0" />
              )}
              <div className="p-1 rounded-full bg-[#1A1A1A]">
                <img 
                  src={card.logo_url} 
                  alt={card.full_name} 
                  className={`w-[102px] h-[102px] rounded-full object-cover border-2 border-white/10 ${imgLoaded ? 'block' : 'hidden'}`}
                  onLoad={() => setImgLoaded(true)}
                />
              </div>
            </div>
          ) : (
            <div className="p-1 rounded-full bg-[#1A1A1A]">
              <div 
                className="w-[102px] h-[102px] rounded-full flex items-center justify-center text-3xl font-black text-white border-2 border-white/10"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${lighterColor})` }}
              >
                {initials}
              </div>
            </div>
          )}
        </motion.div>

        {/* Name & Role */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2 mt-2"
        >
          <h1 
            className="text-[26px] font-bold tracking-normal leading-tight transition-colors duration-300"
            style={{ color: textColor }}
          >
            {card.full_name}
          </h1>
          {card.profession && (
            <div className="flex flex-col items-center">
                <span 
                    className="h-0.5 w-10 mb-2 rounded-full opacity-70 transition-colors duration-300"
                    style={{ backgroundColor: primaryColor }}
                ></span>
                <p 
                    className="text-[15px] font-medium tracking-wide transition-colors duration-300"
                    style={{ color: subTextColor }}
                >
                {card.profession}
                </p>
            </div>
          )}
        </motion.div>

        {/* Services tags */}
        {card.services?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4 px-2 w-full">
            {card.services.map((s, i) => (
              <span 
                key={i} 
                className="text-[13px] font-medium px-4 py-1.5 rounded-full border shadow-sm transition-all duration-300"
                style={{ 
                    backgroundColor: themeStyles?.textColor === '#1F2937' ? '#FFFFFF' : '#2A2A2A',
                    color: primaryColor,
                    borderColor: `${primaryColor}40` // 25% opacity
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}