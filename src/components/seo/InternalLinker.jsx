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

    let processedText = content;
    const linkedPositions = []; // מעקב אחר מיקומים שכבר קושרו
    const targetPageCount = {}; // ספירת קישורים לכל דף יעד
    const usedKeywords = new Set(); // ביטויים שכבר קושרו
    let totalLinksAdded = 0;

    // מעבר על כל מיפוי
    for (const mapping of sortedMapping) {
      // בדיקת מגבלת קישורים כוללת
      if (totalLinksAdded >= LINKING_CONFIG.maxLinksPerPage) {
        break;
      }

      const targetKey = mapping.target.page + (mapping.target.params || '');
      
      // מניעת cannibalization - אם הדף הנוכחי הוא דף היעד, דלג
      if (currentPage === mapping.target.page) {
        continue;
      }

      // בדיקת מגבלת קישורים לאותו דף יעד
      if ((targetPageCount[targetKey] || 0) >= LINKING_CONFIG.maxLinksToSameTarget) {
        continue;
      }

      // מעבר על מילות המפתח
      for (const keyword of mapping.keywords) {
        if (usedKeywords.has(keyword)) {
          continue;
        }

        // חיפוש ההופעה הראשונה של הביטוי
        const regex = new RegExp(`(?<!<[^>]*)\\b(${keyword})\\b(?![^<]*>)`, 'gi');
        const matches = [];
        let match;

        while ((match = regex.exec(processedText)) !== null) {
          const position = match.index;
          const length = match[0].length;

          // בדיקה שהמיקום לא חופף למיקום קיים
          const isOverlapping = linkedPositions.some(
            pos => position < pos.end && position + length > pos.start
          );

          // בדיקת context - האם הטקסט מסביב רלוונטי
          const contextStart = Math.max(0, position - 100);
          const contextEnd = Math.min(processedText.length, position + length + 100);
          const contextText = processedText.substring(contextStart, contextEnd).toLowerCase();
          
          const hasRelevantContext = mapping.context.some(ctx => 
            contextText.includes(ctx.toLowerCase())
          );

          // בדיקה שלא בתוך כותרת או תגית HTML
          const beforeMatch = processedText.substring(Math.max(0, position - 10), position);
          const afterMatch = processedText.substring(position + length, Math.min(processedText.length, position + length + 10));
          const isInHeading = /<h[1-6][^>]*>/.test(beforeMatch) && /<\/h[1-6]>/.test(afterMatch);
          
          if (!isOverlapping && !isInHeading) {
            matches.push({ 
              position, 
              length, 
              text: match[0],
              hasContext: hasRelevantContext 
            });
          }
        }

        // קישור ההופעה הראשונה (עם העדפה למי שיש context)
        const bestMatch = matches.find(m => m.hasContext) || matches[0];
        
        if (bestMatch) {
          const url = mapping.target.params 
            ? `${createPageUrl(mapping.target.page)}?${mapping.target.params}`
            : createPageUrl(mapping.target.page);

          const before = processedText.substring(0, bestMatch.position);
          const keywordText = bestMatch.text;
          const after = processedText.substring(bestMatch.position + bestMatch.length);
          
          processedText = before + 
            `<a href="${url}" class="text-[#1E3A5F] font-semibold hover:text-[#27AE60] transition-colors underline decoration-2 underline-offset-2" title="${keywordText}">${keywordText}</a>` + 
            after;

          // עדכון מעקב
          linkedPositions.push({ 
            start: bestMatch.position, 
            end: bestMatch.position + bestMatch.length 
          });
          usedKeywords.add(keyword);
          targetPageCount[targetKey] = (targetPageCount[targetKey] || 0) + 1;
          totalLinksAdded++;

          break; // עבור לביטוי הבא
        }
      }
    }

    return processedText;
  }, [content, currentPage, excludeFromLinking]);

  if (!content) return null;

  return (
    <div 
      className="internal-linked-content"
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