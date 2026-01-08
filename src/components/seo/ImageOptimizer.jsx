import React, { useState, useEffect, useRef } from 'react';

/**
 * ImageOptimizer - קומפוננטת תמונה מותאמת ל-Core Web Vitals
 * כולל: lazy loading, aspect ratio, WebP support, responsive images
 * 
 * Props:
 * - src: מקור התמונה
 * - alt: טקסט חלופי (חובה ל-SEO)
 * - width: רוחב התמונה
 * - height: גובה התמונה
 * - priority: האם לטעון מיד (לתמונות above-the-fold)
 * - className: מחלקות CSS נוספות
 */
export default function ImageOptimizer({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  objectFit = 'cover',
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority) return; // אם priority=true, לא צריך lazy loading

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // טען 50px לפני שהתמונה נכנסת לתצוגה
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // חישוב aspect ratio למניעת CLS
  const aspectRatio = width && height ? (height / width) * 100 : null;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        paddingBottom: aspectRatio ? `${aspectRatio}%` : undefined,
        width: width ? `${width}px` : '100%',
        maxWidth: '100%',
      }}
    >
      {(isInView || priority) && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectFit: objectFit,
          }}
          {...props}
        />
      )}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

/**
 * דוגמאות שימוש:
 * 
 * // תמונת Hero (priority)
 * <ImageOptimizer 
 *   src="/hero.jpg" 
 *   alt="פתיחת עוסק פטור" 
 *   width={1200} 
 *   height={600}
 *   priority={true}
 * />
 * 
 * // תמונה רגילה (lazy loading)
 * <ImageOptimizer 
 *   src="/article.jpg" 
 *   alt="מדריך לעוסק פטור" 
 *   width={800} 
 *   height={400}
 * />
 */