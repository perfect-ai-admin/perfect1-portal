import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';

/**
 * ContextualLinks - קישורים הקשריים חכמים
 * מוסיף אוטומטית קישורים רלוונטיים בהתבסס על הקשר הדף
 * 
 * Props:
 * - currentPageType: סוג הדף הנוכחי
 * - category: קטגוריה
 * - inline: האם להציג בתוך טקסט (true) או כסקציה (false)
 */
export default function ContextualLinks({ 
  currentPageType = 'guide',
  category = null,
  inline = false 
}) {
  
  // מיפוי אוטומטי של קישורים לפי סוג דף
  const getLinksByType = () => {
    const linkMap = {
      guide: [
        { 
          text: 'מוכן להתחיל?',
          cta: 'פתיחת עוסק פטור',
          url: createPageUrl('Home')
        }
      ],
      comparison: [
        { 
          text: 'מצאת את השירות המתאים?',
          cta: 'פתיחת עוסק פטור',
          url: createPageUrl('Home')
        }
      ],
      landing: [
        { 
          text: 'רוצה לדעת יותר על התהליך?',
          cta: 'פתיחת עוסק פטור',
          url: createPageUrl('Home')
        }
      ],
      support: [
        { 
          text: 'רוצה להתחיל?',
          cta: 'פתיחת עוסק פטור',
          url: createPageUrl('Home')
        }
      ]
    };

    return linkMap[currentPageType] || linkMap.guide;
  };

  const links = getLinksByType();

  if (inline) {
    return (
      <div className="inline-flex items-center gap-2 my-4">
        {links.map((link, index) => (
          <React.Fragment key={index}>
            <Link 
              to={link.url}
              className="text-[#1E3A5F] hover:text-[#27AE60] font-bold underline decoration-2 underline-offset-2 transition-colors inline-flex items-center gap-1"
            >
              {link.cta}
              <ArrowLeft className="w-4 h-4" />
            </Link>
            {index < links.length - 1 && <span className="text-gray-400">•</span>}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="my-8 space-y-3">
      {links.map((link, index) => (
        <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-r-4 border-[#1E3A5F]">
          <p className="text-gray-700 mb-2 text-sm">{link.text}</p>
          <Link 
            to={link.url}
            className="text-[#1E3A5F] hover:text-[#27AE60] font-bold inline-flex items-center gap-2 transition-colors"
          >
            {link.cta}
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      ))}
    </div>
  );
}

/**
 * דוגמאות שימוש:
 * 
 * // בסוף מאמר/מדריך
 * <ContextualLinks currentPageType="guide" />
 * 
 * // בתוך טקסט
 * <ContextualLinks currentPageType="comparison" inline={true} />
 */