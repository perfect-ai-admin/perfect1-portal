import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  OSEK_MORSHA_SILO, 
  findPageCategory, 
  getRecommendedLinks, 
  selectAnchor,
  VALIDATION_RULES 
} from './OsekMorshaInterlinkConfig';
import { AlertCircle } from 'lucide-react';

/**
 * InterlinkInjector - מוסיף קישורים חכמים בתוך תוכן עמוד
 * לא מציג UI, רק מסיר את הקישורים בתוכן
 */
export function useInterlinkInjector(pageName, contentRef) {
  const [injectedLinks, setInjectedLinks] = useState([]);

  useEffect(() => {
    if (!contentRef?.current) return;

    const pageInfo = findPageCategory(pageName);
    if (!pageInfo) return; // דף לא חלק מהסילו

    const recommendations = getRecommendedLinks(pageName);
    const injected = [];

    recommendations.forEach((rec, idx) => {
      if (rec.priority === 'required' || !rec.optional) {
        const anchor = selectAnchor(rec.type, rec.targetPage);
        const href = createPageUrl(rec.targetPage);
        
        // אחזור פיסת טקסט כדי להוסיף קישור
        injectLinkIntoContent(
          contentRef.current,
          anchor,
          href,
          rec.targetPage
        );

        injected.push({
          source: pageName,
          target: rec.targetPage,
          anchor,
          type: rec.type
        });
      }
    });

    setInjectedLinks(injected);
  }, [pageName, contentRef]);

  return injectedLinks;
}

/**
 * מזריק קישור לתוך תוכן בצורה חכמה
 */
function injectLinkIntoContent(element, anchorText, href, targetPage) {
  if (!element) return;

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  let injected = false;

  while ((node = walker.nextNode()) && !injected) {
    if (node.textContent.includes('עוסק מורשה') || node.textContent.includes('לעוד')) {
      const span = document.createElement('span');
      const link = document.createElement('a');
      
      link.href = href;
      link.textContent = anchorText;
      link.className = 'text-blue-600 hover:text-blue-800 underline transition-colors';
      link.setAttribute('data-interlink-target', targetPage);
      
      span.appendChild(link);
      node.parentNode.insertBefore(span, node.nextSibling);
      injected = true;
    }
  }
}

/**
 * קומפוננט QA עבור בקרת קישורים
 */
export function InterlinkQAChecker({ pageName }) {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const pageInfo = findPageCategory(pageName);
    if (!pageInfo) return;

    const newIssues = [];

    // בדיקה: עמוד אב חייב להיות מקושר מתת-עמודים שלו
    if (pageInfo.isParent) {
      const children = pageInfo.category.children;
      if (children.length === 0) {
        newIssues.push({
          severity: 'warning',
          message: `עמוד אב "${pageName}" אין לו תת-עמודים שמוגדרים`
        });
      }
    } else {
      // בדיקה: תת-עמוד חייב להיות מקושר לעמוד אב שלו
      const requiredParent = pageInfo.category.parentPage;
      newIssues.push({
        severity: 'info',
        message: `תת-עמוד "${pageName}" חייב להיות מקושר ל-"${requiredParent}"`
      });
    }

    setIssues(newIssues);
  }, [pageName]);

  if (issues.length === 0) return null;

  return (
    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex gap-2 items-start">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-blue-900">בדיקת קישורים פנימיים</p>
          <ul className="mt-2 space-y-1">
            {issues.map((issue, idx) => (
              <li key={idx} className="text-sm text-blue-800">
                • {issue.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default InterlinkQAChecker;