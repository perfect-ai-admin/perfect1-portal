import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Internal linking configuration
const linkingRules = {
  'פתיחת עוסק פטור': { page: 'OsekPaturLanding', anchor: 'פתיחת עוסק פטור' },
  'עוסק פטור אונליין': { page: 'OsekPaturOnlineLanding', anchor: 'עוסק פטור אונליין' },
  'פתיחת עוסק אונליין': { page: 'OsekPaturOnlineLanding', anchor: 'פתיחת עוסק אונליין' },
  'חשבונית דחופה': { page: 'UrgentInvoice', anchor: 'חשבונית דחופה' },
  'ליווי חודשי': { page: 'ServicePage', params: 'service=livui-chodshi', anchor: 'ליווי חודשי' },
  'דוח שנתי': { page: 'ServicePage', params: 'service=doch-shnati', anchor: 'דוח שנתי' },
  'מחיר פתיחת עוסק': { page: 'PricingLanding', anchor: 'מחיר פתיחת עוסק' },
  'כמה עולה לפתוח עוסק': { page: 'PricingLanding', anchor: 'כמה עולה לפתוח עוסק' },
  'צלם עוסק פטור': { page: 'ProfessionPage', params: 'slug=photographer', anchor: 'צלם עוסק פטור' },
  'מעצב גרפי עוסק פטור': { page: 'ProfessionPage', params: 'slug=graphic-designer', anchor: 'מעצב גרפי עוסק פטור' },
  'מאמן כושר עוסק פטור': { page: 'ProfessionPage', params: 'slug=fitness-coach', anchor: 'מאמן כושר עוסק פטור' }
};

export default function InternalLinker({ content }) {
  if (!content) return null;

  let processedContent = content;
  const usedPositions = [];

  // Process each linking rule
  Object.entries(linkingRules).forEach(([keyword, config]) => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    let match;
    let firstOccurrence = true;

    // Find all matches
    const matches = [];
    while ((match = regex.exec(content)) !== null) {
      matches.push({ index: match.index, length: match[0].length });
    }

    // Link only the first occurrence
    if (matches.length > 0 && firstOccurrence) {
      const match = matches[0];
      
      // Check if this position is already used
      const isOverlapping = usedPositions.some(
        pos => match.index < pos.end && match.index + match.length > pos.start
      );

      if (!isOverlapping) {
        const url = config.params 
          ? `${createPageUrl(config.page)}?${config.params}`
          : createPageUrl(config.page);
        
        const before = processedContent.substring(0, match.index);
        const keywordText = processedContent.substring(match.index, match.index + match.length);
        const after = processedContent.substring(match.index + match.length);
        
        processedContent = before + 
          `<a href="${url}" class="text-[#1E3A5F] font-bold underline hover:text-[#27AE60] transition-colors">${keywordText}</a>` + 
          after;
        
        usedPositions.push({ start: match.index, end: match.index + match.length });
        firstOccurrence = false;
      }
    }
  });

  return (
    <div 
      className="prose prose-lg max-w-none"
      style={{ direction: 'rtl', fontFamily: 'Heebo, sans-serif' }}
      dangerouslySetInnerHTML={{ __html: processedContent.replace(/\n/g, '<br />') }}
    />
  );
}