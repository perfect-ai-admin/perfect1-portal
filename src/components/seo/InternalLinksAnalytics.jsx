import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KEYWORD_MAPPING } from './internalLinkingConfig';
import { Link2, ExternalLink, TrendingUp } from 'lucide-react';

export default function InternalLinksAnalytics() {
  // ניתוח מיפוי הקישורים הפנימיים
  const linksByTargetPage = {};
  const anchorTexts = new Set();
  
  KEYWORD_MAPPING.forEach(mapping => {
    const targetKey = `${mapping.target.page}${mapping.target.params ? '?' + mapping.target.params : ''}`;
    
    if (!linksByTargetPage[targetKey]) {
      linksByTargetPage[targetKey] = {
        page: mapping.target.page,
        params: mapping.target.params,
        count: 0,
        anchors: [],
        priority: mapping.priority,
        context: mapping.context
      };
    }
    
    linksByTargetPage[targetKey].count += mapping.keywords.length;
    linksByTargetPage[targetKey].anchors.push(...mapping.keywords);
    mapping.keywords.forEach(kw => anchorTexts.add(kw));
  });
  
  const sortedPages = Object.values(linksByTargetPage).sort((a, b) => b.count - a.count);
  
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Link2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(linksByTargetPage).length}</p>
                <p className="text-sm text-gray-600">דפי יעד</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{anchorTexts.size}</p>
                <p className="text-sm text-gray-600">טקסטי אנקור ייחודיים</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{KEYWORD_MAPPING.length}</p>
                <p className="text-sm text-gray-600">מיפויי קישורים</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links by Target Page */}
      <Card>
        <CardHeader>
          <CardTitle>📊 קישורים פנימיים לפי דף יעד</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedPages.map((pageData, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{pageData.page}</h3>
                    {pageData.params && (
                      <p className="text-xs text-gray-500 font-mono">?{pageData.params}</p>
                    )}
                  </div>
                  <Badge className="bg-blue-600 text-white">
                    {pageData.count} קישורים
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={pageData.priority === 'primary' ? 'default' : 'outline'}>
                    {pageData.priority}
                  </Badge>
                  {pageData.context && (
                    <Badge variant="secondary" className="text-xs">
                      {pageData.context}
                    </Badge>
                  )}
                </div>
                
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">טקסטי אנכור ({pageData.anchors.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {pageData.anchors.slice(0, 10).map((anchor, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {anchor}
                      </Badge>
                    ))}
                    {pageData.anchors.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{pageData.anchors.length - 10} נוספים
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Anchor Texts */}
      <Card>
        <CardHeader>
          <CardTitle>🔤 כל טקסטי האנכור</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from(anchorTexts).sort().map((anchor, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {anchor}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}