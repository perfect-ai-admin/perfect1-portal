import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * CriticalCSS - טעינה מוקדמת של CSS קריטי
 * משפר LCP על ידי inline של סגנונות חיוניים
 */
export default function CriticalCSS() {
  const criticalStyles = `
    /* Critical Above-the-Fold Styles */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Heebo', sans-serif;
      direction: rtl;
      background-color: #F8F9FA;
      color: #2C3E50;
    }
    
    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%);
    }
    
    h1, h2, h3 {
      font-weight: 900;
      color: #1E3A5F;
      line-height: 1.2;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #27AE60 0%, #2ECC71 100%);
      color: white;
      padding: 1rem 2rem;
      border-radius: 1rem;
      font-weight: 700;
      transition: transform 0.2s;
    }
    
    .btn-primary:hover {
      transform: scale(1.05);
    }
    
    /* Prevent CLS */
    img {
      max-width: 100%;
      height: auto;
    }
    
    /* Loading state */
    .loading-skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  return (
    <Helmet>
      <style>{criticalStyles}</style>
      
      {/* Preconnect למשאבים חיצוניים */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    </Helmet>
  );
}