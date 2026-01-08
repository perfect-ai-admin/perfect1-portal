import React, { useState, useEffect, useRef } from 'react';

/**
 * LazySection - טעינה עצלה של קטעי תוכן
 * משפר ביצועים על ידי טעינת תוכן רק כשהוא נכנס לתצוגה
 * מועיל במיוחד לדפים ארוכים עם הרבה תוכן
 */
export default function LazySection({ 
  children, 
  fallback = null,
  rootMargin = '100px',
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: rootMargin,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={sectionRef} className={className}>
      {isVisible ? children : (fallback || <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />)}
    </div>
  );
}

/**
 * דוגמת שימוש:
 * 
 * <LazySection>
 *   <HeavyComponent />
 * </LazySection>
 * 
 * // עם fallback מותאם
 * <LazySection fallback={<Spinner />}>
 *   <ExpensiveChart />
 * </LazySection>
 */