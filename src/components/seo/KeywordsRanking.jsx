import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Search, Target } from 'lucide-react';

// מילות מפתח יעד (כאן אפשר להוסיף אינטגרציה עם Google Search Console API)
const TRACKED_KEYWORDS = [
  { keyword: 'עוסק פטור', position: 3, change: 2, url: '/OsekPatur', searches: 8100, difficulty: 'high' },
  { keyword: 'פתיחת עוסק פטור', position: 1, change: 0, url: '/Services', searches: 2400, difficulty: 'medium' },
  { keyword: 'עוסק פטור אונליין', position: 2, change: 1, url: '/OsekPaturOnline', searches: 1900, difficulty: 'medium' },
  { keyword: 'עוסק פטור למעצב גרפי', position: 8, change: -1, url: '/ProfessionPage?slug=graphic-designer', searches: 590, difficulty: 'low' },
  { keyword: 'עוסק פטור לצלם', position: 5, change: 3, url: '/ProfessionPage?slug=photographer', searches: 720, difficulty: 'low' },
  { keyword: 'עוסק פטור למאפרת', position: 4, change: 1, url: '/ProfessionPage?slug=makeup-artist', searches: 880, difficulty: 'low' },
  { keyword: 'פתיחת עסק עצמאי', position: 12, change: -2, url: '/Blog', searches: 3600, difficulty: 'high' },
  { keyword: 'מחיר פתיחת עוסק פטור', position: 2, change: 0, url: '/Pricing', searches: 1300, difficulty: 'medium' },
  { keyword: 'עוסק פטור ייעוץ', position: 7, change: 4, url: '/Contact', searches: 480, difficulty: 'low' },
  { keyword: 'מדריך עוסק פטור', position: 6, change: 2, url: '/Blog', searches: 1100, difficulty: 'medium' }
];

export default function KeywordsRanking() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredKeywords = TRACKED_KEYWORDS.filter(kw =>
    kw.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const avgPosition = (filteredKeywords.reduce((sum, kw) => sum + kw.position, 0) / filteredKeywords.length).toFixed(1);
  const top3Count = filteredKeywords.filter(kw => kw.position <= 3).length;
  const top10Count = filteredKeywords.filter(kw => kw.position <= 10).length;
  
  const getPositionBadge = (position) => {
    if (position <= 3) return <Badge className="bg-green-600 text-white">#{position}</Badge>;
    if (position <= 10) return <Badge className="bg-blue-600 text-white">#{position}</Badge>;
    return <Badge variant="secondary">#{position}</Badge>;
  };
  
  const getChangeBadge = (change) => {
    if (change > 0) return (
      <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
        <TrendingUp className="w-3 h-3" /> +{change}
      </div>
    );
    if (change < 0) return (
      <div className="flex items-center gap-1 text-red-600 text-xs font-semibold">
        <TrendingDown className="w-3 h-3" /> {change}
      </div>
    );
    return (
      <div className="flex items-center gap-1 text-gray-500 text-xs">
        <Minus className="w-3 h-3" /> 0
      </div>
    );
  };
  
  const getDifficultyColor = (difficulty) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{avgPosition}</p>
              <p className="text-sm text-gray-600 mt-1">דירוג ממוצע</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{top3Count}</p>
              <p className="text-sm text-gray-600 mt-1">במקום 1-3</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{top10Count}</p>
              <p className="text-sm text-gray-600 mt-1">בעמוד הראשון</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{TRACKED_KEYWORDS.length}</p>
              <p className="text-sm text-gray-600 mt-1">מילות מפתח במעקב</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keywords Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            דירוג מילות מפתח
          </CardTitle>
          <CardDescription>
            מעקב אחר דירוג מילות המפתח בגוגל (נתוני דמו - חיבור ל-Google Search Console בעתיד)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="חפש מילת מפתח..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredKeywords.map((kw, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getPositionBadge(kw.position)}
                      <h3 className="font-bold text-gray-900">{kw.keyword}</h3>
                      {getChangeBadge(kw.change)}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>🔍 {kw.searches.toLocaleString('he-IL')} חיפושים/חודש</span>
                      <Badge variant="outline" className={getDifficultyColor(kw.difficulty)}>
                        {kw.difficulty === 'high' ? 'תחרותיות גבוהה' : kw.difficulty === 'medium' ? 'תחרותיות בינונית' : 'תחרותיות נמוכה'}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-blue-600 mt-2 font-mono">{kw.url}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Tips */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle>💡 המלצות SEO</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ <strong>מילות מפתח במקום 1-3:</strong> המשך לייצר תוכן איכותי ולעדכן עמודים אלה</li>
            <li>✓ <strong>מילות מפתח במקום 4-10:</strong> שפר תוכן, הוסף קישורים פנימיים וחצוניים</li>
            <li>⚠️ <strong>מילות מפתח מתחת למקום 10:</strong> בדוק תוכן, שפר SEO טכני, הוסף מדיה</li>
            <li>🔍 <strong>חבר Google Search Console:</strong> קבל נתונים מדויקים ובזמן אמת</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}