import React, { useEffect, useRef, useState } from 'react';

export default function WatermarkedLogo({ 
  src, 
  alt, 
  className = "max-h-56 w-auto object-contain"
}) {
  const canvasRef = useRef(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw grid pattern
      const gridSize = 35;
      ctx.strokeStyle = 'rgba(160, 160, 160, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw diagonal PREVIEW text
      ctx.font = 'bold 52px Arial';
      ctx.fillStyle = 'rgba(120, 120, 120, 0.25)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < 9; i++) {
        const x = (i % 3) * canvas.width / 3;
        const y = Math.floor(i / 3) * canvas.height / 3;
        
        ctx.save();
        ctx.translate(x + canvas.width / 6, y + canvas.height / 6);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText('PREVIEW', 0, 0);
        ctx.restore();
      }

      // Convert to image
      const watermarkedImage = canvas.toDataURL('image/png');
      setWatermarkedUrl(watermarkedImage);
    };
    img.src = src;
  }, [src]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {watermarkedUrl && (
        <img 
          src={watermarkedUrl}
          alt={alt}
          className={className}
          style={{ display: 'block' }}
          draggable={false}
        />
      )}
    </>
  );
}