import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * PreloadCriticalResources - טעינה מוקדמת של משאבים קריטיים
 * משפר FCP ו-LCP
 */
export default function PreloadCriticalResources({ pageName }) {
  // משאבים קריטיים לפי דף
  const criticalResources = {
    Home: {
      images: ['/hero-home.jpg'],
      styles: [],
      scripts: []
    },
    OsekPaturLanding: {
      images: [],
      styles: [],
      scripts: []
    },
    // ... ניתן להרחיב לכל דף
  };

  const resources = criticalResources[pageName] || { images: [], styles: [], scripts: [] };

  return (
    <Helmet>
      {/* Preload תמונות קריטיות */}
      {resources.images.map((img, i) => (
        <link 
          key={`img-${i}`}
          rel="preload" 
          as="image" 
          href={img}
          fetchPriority="high"
        />
      ))}

      {/* Preload סטיילים קריטיים */}
      {resources.styles.map((style, i) => (
        <link 
          key={`style-${i}`}
          rel="preload" 
          as="style" 
          href={style}
        />
      ))}

      {/* Preload סקריפטים קריטיים */}
      {resources.scripts.map((script, i) => (
        <link 
          key={`script-${i}`}
          rel="preload" 
          as="script" 
          href={script}
        />
      ))}
    </Helmet>
  );
}