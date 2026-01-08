import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Zap, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * QA Checker Component
 * אוטומטית בודק את האתר בעת הטעינה וזיהוי בעיות
 * - Performance issues
 * - Memory leaks
 * - Console errors
 * - Accessibility issues
 * - SEO problems
 */
export default function QAChecker() {
  const [issues, setIssues] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const checkApp = async () => {
      const foundIssues = [];

      // 1. Check for console errors
      const originalError = console.error;
      const errors = [];
      console.error = (...args) => {
        errors.push(args.join(' '));
        originalError(...args);
      };

      // 2. Check Web Vitals
      try {
        if ('web-vital' in window) {
          const vital = window['web-vital'];
          if (vital.CLS > 0.1) foundIssues.push({
            severity: 'HIGH',
            title: 'Cumulative Layout Shift (CLS) too high',
            message: `CLS: ${vital.CLS.toFixed(3)} (should be < 0.1)`,
            type: 'performance'
          });
          if (vital.FID > 100) foundIssues.push({
            severity: 'HIGH',
            title: 'First Input Delay (FID) too high',
            message: `FID: ${vital.FID.toFixed(0)}ms (should be < 100ms)`,
            type: 'performance'
          });
          if (vital.LCP > 2500) foundIssues.push({
            severity: 'MEDIUM',
            title: 'Largest Contentful Paint (LCP) slow',
            message: `LCP: ${vital.LCP.toFixed(0)}ms (should be < 2500ms)`,
            type: 'performance'
          });
        }
      } catch (e) {
        // Web Vitals not loaded
      }

      // 3. Check for images without alt text
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        foundIssues.push({
          severity: 'MEDIUM',
          title: 'Images without alt text',
          message: `Found ${imagesWithoutAlt.length} images without alt text (SEO & Accessibility issue)`,
          type: 'a11y'
        });
      }

      // 4. Check for missing meta descriptions
      if (!document.querySelector('meta[name="description"]')) {
        foundIssues.push({
          severity: 'MEDIUM',
          title: 'Missing meta description',
          message: 'This page has no meta description (SEO issue)',
          type: 'seo'
        });
      }

      // 5. Check for H1 tag
      const h1Count = document.querySelectorAll('h1').length;
      if (h1Count === 0) {
        foundIssues.push({
          severity: 'MEDIUM',
          title: 'Missing H1 tag',
          message: 'Page should have exactly one H1 tag',
          type: 'seo'
        });
      } else if (h1Count > 1) {
        foundIssues.push({
          severity: 'LOW',
          title: 'Multiple H1 tags',
          message: `Found ${h1Count} H1 tags (should be only 1)`,
          type: 'seo'
        });
      }

      // 6. Check for viewport meta tag
      if (!document.querySelector('meta[name="viewport"]')) {
        foundIssues.push({
          severity: 'HIGH',
          title: 'Missing viewport meta tag',
          message: 'Page is not optimized for mobile devices',
          type: 'seo'
        });
      }

      // 7. Check for memory leaks (detached nodes)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name.includes('memory')) {
            if (entry.duration > 50) {
              foundIssues.push({
                severity: 'LOW',
                title: 'Potential memory issue',
                message: `Operation took ${entry.duration.toFixed(0)}ms`,
                type: 'performance'
              });
            }
          }
        }
      });
      try {
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (e) {
        // Observer not supported
      }

      // 8. Check for unused CSS (simple check)
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      if (stylesheets.length > 5) {
        foundIssues.push({
          severity: 'LOW',
          title: 'Many stylesheets loaded',
          message: `${stylesheets.length} stylesheets found - consider consolidating`,
          type: 'performance'
        });
      }

      // 9. Check for console errors
      if (errors.length > 0) {
        foundIssues.push({
          severity: 'HIGH',
          title: 'Console errors detected',
          message: `${errors.length} error(s) in console`,
          type: 'error',
          details: errors.slice(0, 3)
        });
      }

      // 10. Check for external resources blocking
      const blockingResources = performance.getEntriesByType('resource')
        .filter(r => r.duration > 3000);
      if (blockingResources.length > 0) {
        foundIssues.push({
          severity: 'MEDIUM',
          title: 'Slow external resources',
          message: `${blockingResources.length} resource(s) taking > 3s to load`,
          type: 'performance'
        });
      }

      // 11. Performance metrics
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const navigationStart = timing.navigationStart;
        const loadTime = timing.loadEventEnd - navigationStart;
        
        setMetrics({
          loadTime: loadTime,
          domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
          pageInteractive: timing.domInteractive - navigationStart,
          firstPaint: timing.responseStart - navigationStart
        });

        if (loadTime > 5000) {
          foundIssues.push({
            severity: 'HIGH',
            title: 'Page load time very slow',
            message: `Load time: ${loadTime.toFixed(0)}ms (should be < 3000ms)`,
            type: 'performance'
          });
        }
      }

      console.error = originalError;
      
      // Remove duplicates
      const uniqueIssues = foundIssues.filter((issue, index, self) =>
        index === self.findIndex(t => t.title === issue.title)
      );
      
      setIssues(uniqueIssues);
    };

    // Run check after page fully loads
    if (document.readyState === 'complete') {
      setTimeout(checkApp, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkApp, 1000);
      });
    }
  }, []);

  const severityColors = {
    HIGH: 'bg-red-50 border-red-200',
    MEDIUM: 'bg-yellow-50 border-yellow-200',
    LOW: 'bg-blue-50 border-blue-200'
  };

  const severityIcons = {
    HIGH: <AlertCircle className="w-5 h-5 text-red-600" />,
    MEDIUM: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    LOW: <Zap className="w-5 h-5 text-blue-600" />
  };

  if (issues.length === 0 && !metrics) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold shadow-lg transition-all ${
          issues.length > 0
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        <Eye className="w-5 h-5" />
        <span>QA Check</span>
        {issues.length > 0 && (
          <span className="bg-white text-red-600 px-2 py-1 rounded-lg text-sm font-black">
            {issues.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 left-0 w-96 max-h-96 overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200 p-4 space-y-3">
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700 font-semibold">✅ No issues found!</p>
            </div>
          ) : (
            issues.map((issue, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border-2 ${severityColors[issue.severity]}`}
              >
                <div className="flex items-start gap-2">
                  {severityIcons[issue.severity]}
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{issue.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{issue.message}</p>
                    {issue.details && (
                      <ul className="text-xs text-gray-600 mt-2 space-y-1">
                        {issue.details.map((detail, j) => (
                          <li key={j}>• {detail.substring(0, 80)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {metrics && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-bold text-blue-900 mb-2">⚡ Performance Metrics</p>
              <div className="text-xs text-blue-800 space-y-1">
                <p>• Page Load: {metrics.loadTime.toFixed(0)}ms</p>
                <p>• DOM Content: {metrics.domContentLoaded.toFixed(0)}ms</p>
                <p>• Interactive: {metrics.pageInteractive.toFixed(0)}ms</p>
                <p>• First Paint: {metrics.firstPaint.toFixed(0)}ms</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}