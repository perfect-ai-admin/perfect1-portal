import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { KEYWORD_MAPPING } from './internalLinkingConfig';

/**
 * AutoInternalLinks - הוספה אוטומטית של קישורים פנימיים
 * מזהה ביטויים בטקסט ומוסיף להם קישורים חכמים
 * 
 * Props:
 * - content: טקסט התוכן
 * - currentPage: שם הדף הנוכחי (למניעת self-linking)
 * - maxLinks: מספר מקסימלי של קישורים (ברירת מחדל: 3)
 */
export default function AutoInternalLinks({ 
  content, 
  currentPage,
  maxLinks = 3 
}) {
  const processedContent = useMemo(() => {
    if (!content || typeof content !== 'string') return content;

    let processedText = content;
    const addedLinks = new Set();
    let linksCount = 0;

    // סינון לפי עדיפות
    const sortedKeywords = [...KEYWORD_MAPPING]
      .filter(mapping => mapping.target.page !== currentPage) // מניעת self-linking
      .sort((a, b) => {
        const priorityOrder = { primary: 3, secondary: 2, 'long-tail': 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });

    for (const mapping of sortedKeywords) {
      if (linksCount >= maxLinks) break;

      for (const keyword of mapping.keywords) {
        if (addedLinks.has(keyword)) continue;
        if (linksCount >= maxLinks) break;

        // חיפוש הביטוי (רק אם לא כבר בתוך קישור)
        const regex = new RegExp(`(?!<a[^>]*>)(${keyword})(?![^<]*<\/a>)`, 'i');
        
        if (regex.test(processedText)) {
          // יצירת URL
          const url = mapping.target.params 
            ? `${createPageUrl(mapping.target.page)}?${mapping.target.params}`
            : createPageUrl(mapping.target.page);

          // החלפה ראשונה בלבד
          processedText = processedText.replace(
            regex,
            `<a href="${url}" class="text-[#1E3A5F] font-bold hover:text-[#27AE60] underline decoration-2 underline-offset-2 transition-colors">${keyword}</a>`
          );

          addedLinks.add(keyword);
          linksCount++;
          break;
        }
      }
    }

    return processedText;
  }, [content, currentPage, maxLinks]);

  if (!content) return null;

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: processedContent }}
      className="prose prose-lg max-w-none"
    />
  );
}

/**
 * דוגמת שימוש:
 * 
 * <AutoInternalLinks 
 *   content="רוצה לפתוח עוסק פטור? קרא את המדריך המלא שלנו"
 *   currentPage="Home"
 * />
 */