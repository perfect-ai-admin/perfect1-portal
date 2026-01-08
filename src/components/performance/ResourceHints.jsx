import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * ResourceHints - רמזים לדפדפן לטעינה מוקדמת
 * משפר ביצועים על ידי prefetch ו-preload של משאבים
 */
export default function ResourceHints({ priorityImages = [], prefetchPages = [] }) {
  return (
    <Helmet>
      {/* Preload תמונות קריטיות */}
      {priorityImages.map((img, index) => (
        <link 
          key={index}
          rel="preload" 
          as="image" 
          href={img}
          fetchpriority="high"
        />
      ))}
      
      {/* Prefetch דפים עתידיים */}
      {prefetchPages.map((page, index) => (
        <link 
          key={index}
          rel="prefetch" 
          href={page}
        />
      ))}
      
      {/* Preload פונטים */}
      <link 
        rel="preload" 
        href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap" 
        as="style"
      />
    </Helmet>
  );
}

/**
 * דוגמת שימוש:
 * 
 * <ResourceHints 
 *   priorityImages={['/hero.jpg', '/logo.png']}
 *   prefetchPages={['/Services', '/Pricing']}
 * />
 */