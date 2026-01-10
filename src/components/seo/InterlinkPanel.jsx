import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  OSEK_MORSHA_SILO, 
  findPageCategory, 
  getRecommendedLinks,
  selectAnchor
} from './OsekMorshaInterlinkConfig';
import { ArrowRight, BookOpen } from 'lucide-react';

/**
 * InterlinkPanel - מצג בעמוד של קישורים מומלצים בתוך הסילו
 * מציג "תוכן קשור" או "המשך קריאה" עם קישורים חכמים
 */
export default function InterlinkPanel({ pageName, title = 'קריאה משלימה' }) {
  const [recommendations, setRecommendations] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);

  useEffect(() => {
    const pageInfo = findPageCategory(pageName);
    setCategoryInfo(pageInfo);

    const links = getRecommendedLinks(pageName);
    
    // בנית המלצות עם Anchor Text טבעיים
    const withAnchors = links.slice(0, 4).map(link => ({
      ...link,
      anchor: selectAnchor(link.type, link.targetPage)
    }));

    setRecommendations(withAnchors);
  }, [pageName]);

  if (recommendations.length === 0) return null;

  return (
    <aside className="mt-12 pt-8 border-t border-gray-200">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
              <Link
                to={createPageUrl(rec.targetPage)}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
                title={`קישור אל ${rec.targetPage}`}
              >
                {rec.anchor}
              </Link>
            </div>
          ))}
        </div>

        {categoryInfo && categoryInfo.category && (
          <div className="mt-6 pt-6 border-t border-blue-200 text-xs text-gray-600">
            <p className="opacity-70">
              חלק מסילו: <span className="font-semibold">{categoryInfo.category.name}</span>
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

/**
 * InterlinkTree - תצוגת היררכיה מלאה של הסילו (למטרות admin)
 */
export function InterlinkTree() {
  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">מבנה סילו עוסק מורשה</h3>
      
      <div className="space-y-4 text-sm">
        {OSEK_MORSHA_SILO.categories.map((category) => (
          <div key={category.id}>
            <div className="font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              {category.name}
            </div>
            <div className="ml-6 mt-2 space-y-1 text-gray-600">
              {category.children.map((child) => (
                <div key={child.page} className="text-xs">
                  ↳ {child.page} ({child.intent})
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}