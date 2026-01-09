import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function ImageOptimized({ 
  src, 
  alt, 
  className,
  width,
  height,
  priority = false,
  ...props 
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (priority) {
      const img = new Image();
      img.src = src;
      img.onload = () => setLoaded(true);
    }
  }, [src, priority]);

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
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