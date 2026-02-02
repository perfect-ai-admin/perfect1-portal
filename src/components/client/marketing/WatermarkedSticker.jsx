import React, { useEffect, useRef, useState } from 'react';

export default function WatermarkedSticker({ 
  src, 
  alt, 
  className = "w-full h-full object-contain",
  text,
  secondaryText,
  onImageReady
}) {
  const canvasRef = useRef(null);
  const [finalUrl, setFinalUrl] = useState(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set high resolution
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw Text if provided
      if (text || secondaryText) {
        ctx.save();
        ctx.textAlign = 'center';
        
        // Main Text (Sentence)
        if (text) {
            ctx.textBaseline = 'bottom';
            const baseFontSize = Math.floor(img.width * 0.12); 
            const fontSize = text.length > 15 ? Math.floor(baseFontSize * 0.7) : baseFontSize;
            
            ctx.font = `900 ${fontSize}px Heebo, Arial, sans-serif`;
            
            // If secondary text exists, move main text up a bit
            const bottomPadding = secondaryText ? (img.height * 0.15) : (img.height * 0.05);
            const x = canvas.width / 2;
            const y = canvas.height - bottomPadding;

            // 1. Stroke
            ctx.strokeStyle = 'white';
            ctx.lineWidth = fontSize * 0.25;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeText(text, x, y);

            ctx.strokeStyle = 'black';
            ctx.lineWidth = fontSize * 0.02;
            ctx.strokeText(text, x, y);

            // 2. Fill
            const isHebrew = /[\u0590-\u05FF]/.test(text);
            ctx.fillStyle = isHebrew ? '#1E3A5F' : '#333333';
            ctx.fillText(text, x, y);
        }

        // Secondary Text (Business Name)
        if (secondaryText) {
            ctx.textBaseline = 'bottom';
            const secFontSize = Math.floor(img.width * 0.06); // Smaller
            ctx.font = `bold ${secFontSize}px Heebo, Arial, sans-serif`;
            
            const x = canvas.width / 2;
            const y = canvas.height - (img.height * 0.02); // Very bottom

            // Stroke
            ctx.strokeStyle = 'white';
            ctx.lineWidth = secFontSize * 0.25;
            ctx.strokeText(secondaryText, x, y);

            // Fill
            ctx.fillStyle = '#666666';
            ctx.fillText(secondaryText, x, y);
        }

        ctx.restore();
      }

      // Convert to image
      const dataUrl = canvas.toDataURL('image/png');
      setFinalUrl(dataUrl);
      if (onImageReady) {
        onImageReady(dataUrl);
      }
    };
    img.src = src;
  }, [src, text]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {finalUrl ? (
        <img 
          src={finalUrl}
          alt={alt}
          className={className}
          style={{ display: 'block' }}
          draggable={false}
        />
      ) : (
        // Show original while processing
        <img 
          src={src}
          alt={alt}
          className={className}
          style={{ opacity: 0.5 }} 
        />
      )}
    </>
  );
}