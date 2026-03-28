import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function ImageOptimized({ 
  src, 
  alt, 
  className,
  width,
  height,
  priority = false,
  sizes,
  ...props 
}) {
  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    // Convert to WebP if browser supports it
    const supportsWebP = document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;
    
    if (supportsWebP && src && !src.includes('.svg') && !src.includes('data:')) {
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      setImageSrc(webpSrc);
    }

    if (priority) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => setLoaded(true);
    }
  }, [src, priority, imageSrc]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={() => setLoaded(true)}
      className={cn(
        'transition-opacity duration-300',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    />
  );
}