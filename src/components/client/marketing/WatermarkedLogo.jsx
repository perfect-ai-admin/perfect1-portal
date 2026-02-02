import React, { useEffect, useRef, useState } from 'react';

export default function WatermarkedLogo({ 
  src, 
  alt, 
  className = "max-h-56 w-auto object-contain",
  businessName,
  slogan,
  watermark = true,
  onImageReady
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

      // Make canvas slightly taller to accommodate text if needed
      // But usually user wants to see the logo as is. 
      // Let's add padding at bottom for the text.
      const textHeight = businessName ? (img.height * 0.25) : 0; // 25% of height for text
      
      canvas.width = img.width;
      canvas.height = img.height + textHeight;
      const ctx = canvas.getContext('2d');

      // Fill background white (since we are extending canvas)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw Text (Business Name)
      if (businessName) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Dynamic font size based on image width
        const fontSize = Math.floor(img.width * 0.1); 
        ctx.font = `bold ${fontSize}px Heebo, Arial, sans-serif`;
        ctx.fillStyle = '#1E3A5F'; // Dark Blue standard
        
        // Draw Business Name
        ctx.fillText(businessName, canvas.width / 2, img.height);
        
        // Draw Slogan
        if (slogan) {
          const sloganSize = Math.floor(fontSize * 0.5);
          ctx.font = `${sloganSize}px Heebo, Arial, sans-serif`;
          ctx.fillStyle = '#64748B'; // Slate 500
          ctx.fillText(slogan, canvas.width / 2, img.height + fontSize + (fontSize * 0.2));
        }
        ctx.restore();
      }

      if (watermark) {
        // Draw grid pattern (Watermark)
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
      }

      // Convert to image
      const dataUrl = canvas.toDataURL('image/png');
      setWatermarkedUrl(dataUrl);
      if (onImageReady) {
        onImageReady(dataUrl);
      }
    };
    img.src = src;
  }, [src, businessName, slogan, watermark]);

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