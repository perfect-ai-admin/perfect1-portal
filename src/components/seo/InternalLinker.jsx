import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { KEYWORD_MAPPING, LINKING_CONFIG, PRIORITY_WEIGHTS } from './internalLinkingConfig';

/**
 * InternalLinker - מנגנון קישורים פנימיים חכם
 * 
 * חוקים:
 * 1. קישור אחד לכל ביטוי בעמוד (רק ההופעה הראשונה)
 * 2. לא לקשר בכותרות (H1/H2/H3)
 * 3. מקסימום 1-2 קישורים לאותו דף יעד
 * 4. Context awareness - בודק הקשר טקסטואלי
 * 5. מניעת cannibalization - דף לא מקשר לעצמו
 */

export default function InternalLinker({ 
  content, 
  currentPage, 
  excludeFromLinking = false 
}) {
  const processedContent = useMemo(() => {
    // בדיקות ראשוניות
    if (!content || !LINKING_CONFIG.enabled || excludeFromLinking) {
      return content;
    }

    // סינון מיפוי לפי עדיפות
    const sortedMapping = [...KEYWORD_MAPPING].sort((a, b) => {
      return (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0);
    });

    let text = content;
    const linkedKeywords = new Set();
    const targetPageCount = {};
    let totalLinksAdded = 0;

    // מעבר על כל מיפוי
    for (const mapping of sortedMapping) {
      if (totalLinksAdded >= LINKING_CONFIG.maxLinksPerPage) break;
      
      const targetKey = mapping.target.page + (mapping.target.params || '');
      
      // מניעת cannibalization
      if (currentPage === mapping.target.page) continue;
      
      // בדיקת מגבלת קישורים לאותו דף יעד
      if ((targetPageCount[targetKey] || 0) >= LINKING_CONFIG.maxLinksToSameTarget) continue;

      // מעבר על מילות המפתח
      for (const keyword of mapping.keywords) {
        if (linkedKeywords.has(keyword)) continue;

        // חיפוש הביטוי - רק אם הוא לא כבר בתוך תגית <a>
        const regex = new RegExp(`(?!<a[^>]*>)(${keyword})(?![^<]*<\/a>)`, 'i');
        const match = text.match(regex);
        
        if (match && match.index !== undefined) {
          const matchedText = match[1];
          
          // יצירת URL מלא
          const url = mapping.target.params 
            ? `${createPageUrl(mapping.target.page)}?${mapping.target.params}`
            : createPageUrl(mapping.target.page);

          // החלפת הביטוי הראשון בקישור HTML
          text = text.replace(
            regex,
            `<a href="${url}" class="text-[#1E3A5F] font-bold hover:text-[#27AE60] transition-colors underline decoration-2 underline-offset-2">${matchedText}</a>`
          );
          
          // עדכון מעקב
          linkedKeywords.add(keyword);
          targetPageCount[targetKey] = (targetPageCount[targetKey] || 0) + 1;
          totalLinksAdded++;
          
          break;
        }
      }
    }

    return text;
  }, [content, currentPage, excludeFromLinking]);

  if (!content) return null;

  return (
    <div 
      className="prose prose-lg prose-headings:text-[#1E3A5F] prose-headings:font-black prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-3 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-[#2C5282] prose-p:text-gray-700 prose-p:leading-loose prose-p:mb-6 prose-strong:text-[#1E3A5F] prose-strong:font-bold prose-em:text-[#D4AF37] prose-em:font-semibold prose-ul:my-6 prose-ul:space-y-3 prose-li:my-0 prose-li:pl-2 prose-a:text-[#1E3A5F] prose-a:font-bold prose-a:underline prose-a:decoration-2 prose-a:underline-offset-2 hover:prose-a:text-[#27AE60] prose-blockquote:border-r-4 prose-blockquote:border-[#D4AF37] prose-blockquote:bg-gray-50 prose-blockquote:pr-6 prose-blockquote:py-4 prose-blockquote:my-8 prose-blockquote:rounded-lg prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-[#1E3A5F] max-w-none"
      style={{
        direction: 'rtl',
        fontFamily: 'Heebo, sans-serif',
        fontSize: '1.125rem',
        lineHeight: '1.8'
      }}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

/**
 * SmartParagraph - קומפוננטת עזר לקישור חכם של פסקאות בודדות
 */
export function SmartParagraph({ children, currentPage }) {
  return (
    <InternalLinker 
      content={children} 
      currentPage={currentPage}
    />
  );
}