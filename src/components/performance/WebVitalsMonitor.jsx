import { useEffect } from 'react';

/**
 * WebVitalsMonitor - מוניטור Core Web Vitals
 * שולח דיווחים על ביצועים לניתוח
 */
export default function WebVitalsMonitor() {
  useEffect(() => {
    // Web Vitals measurement
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      
      // LCP - Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = lastEntry.renderTime || lastEntry.loadTime;
          
          // Log או שליחה לאנליטיקס
          if (lcp > 2500) {
            console.warn(`⚠️ LCP is slow: ${lcp}ms (target: <2500ms)`);
          } else {
            console.log(`✅ LCP is good: ${lcp}ms`);
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.log('LCP monitoring not supported');
      }

      // CLS - Cumulative Layout Shift
      try {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          }
          
          if (clsScore > 0.1) {
            console.warn(`⚠️ CLS is high: ${clsScore.toFixed(3)} (target: <0.1)`);
          } else {
            console.log(`✅ CLS is good: ${clsScore.toFixed(3)}`);
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.log('CLS monitoring not supported');
      }

      // FCP - First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries[0].startTime;
          
          if (fcp > 1800) {
            console.warn(`⚠️ FCP is slow: ${fcp}ms (target: <1800ms)`);
          } else {
            console.log(`✅ FCP is good: ${fcp}ms`);
          }
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
      } catch (e) {
        console.log('FCP monitoring not supported');
      }
    }
  }, []);

  return null; // קומפוננטה invisible
}

/**
 * שימוש:
 * הוסף ב-Layout או ב-App root:
 * 
 * import WebVitalsMonitor from '@/components/performance/WebVitalsMonitor';
 * 
 * function Layout() {
 *   return (
 *     <>
 *       <WebVitalsMonitor />
 *       ...rest of layout
 *     </>
 *   );
 * }
 */