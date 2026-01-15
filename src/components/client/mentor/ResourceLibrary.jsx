import React, { useState } from 'react';
import { FileText, Video, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Categorized Resource Library (section 4.6)
const RESOURCES = {
  getting_started: {
    label: 'התחלה',
    icon: '🚀',
    items: [
      {
        id: 1,
        title: 'מדריך פתיחת עוסק פטור',
        type: 'article',
        duration: '5 דקות',
        description: 'כל מה שצריך לדעת על פתיחת עוסק פטור',
        url: '/blog/how-to-open-osek-patur'
      },
      {
        id: 2,
        title: 'איך לבחור בנק לעסק',
        type: 'article',
        duration: '4 דקות',
        description: 'השוואה בין הבנקים והמלצות',
        url: '/blog/choosing-business-bank'
      }
    ]
  },
  invoicing: {
    label: 'חשבוניות',
    icon: '📄',
    items: [
      {
        id: 3,
        title: 'איך ליצור חשבונית מקצועית',
        type: 'video',
        duration: '8 דקות',
        description: 'מדריך וידאו מלא על יצירת חשבוניות',
        url: '#'
      },
      {
        id: 4,
        title: 'מה חובה לכתוב בחשבונית?',
        type: 'article',
        duration: '3 דקות',
        description: 'הדרישות החוקיות לחשבונית תקינה',
        url: '/blog/invoice-requirements'
      }
    ]
  },
  taxes: {
    label: 'מיסים',
    icon: '💰',
    items: [
      {
        id: 5,
        title: 'מדריך למע"מ לעוסק פטור',
        type: 'article',
        duration: '6 דקות',
        description: 'מתי צריך לשלם מע"מ וכמה',
        url: '/blog/vat-guide'
      },
      {
        id: 6,
        title: 'הדוח השנתי - מה צריך לדעת',
        type: 'article',
        duration: '7 דקות',
        description: 'מדריך מלא להגשת דוח שנתי',
        url: '/blog/annual-report'
      },
      {
        id: 7,
        title: 'מקדמות מס - איך זה עובד?',
        type: 'video',
        duration: '10 דקות',
        description: 'הסבר על מקדמות והיטל ביטוח לאומי',
        url: '#'
      }
    ]
  },
  marketing: {
    label: 'שיווק',
    icon: '📢',
    items: [
      {
        id: 8,
        title: 'שיווק ראשוני לעסק חדש',
        type: 'article',
        duration: '8 דקות',
        description: 'איך להשיג את הלקוחות הראשונים',
        url: '/blog/first-marketing'
      },
      {
        id: 9,
        title: 'פייסבוק vs גוגל - מה יותר כדאי?',
        type: 'article',
        duration: '5 דקות',
        description: 'השוואה בין ערוצי השיווק העיקריים',
        url: '/blog/facebook-vs-google'
      }
    ]
  },
  growth: {
    label: 'צמיחה',
    icon: '📈',
    items: [
      {
        id: 10,
        title: 'מתי לעבור לעוסק מורשה?',
        type: 'article',
        duration: '6 דקות',
        description: 'הסימנים שהגיע הזמן להתרחב',
        url: '/blog/when-to-upgrade'
      },
      {
        id: 11,
        title: 'איך להעלות מחירים נכון',
        type: 'video',
        duration: '12 דקות',
        description: 'אסטרטגיות להעלאת מחירים בלי לאבד לקוחות',
        url: '#'
      }
    ]
  }
};

export default function ResourceLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const allResources = Object.values(RESOURCES).flatMap(cat => cat.items);
  
  const filteredResources = searchQuery
    ? allResources.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCategory === 'all'
    ? allResources
    : RESOURCES[selectedCategory]?.items || [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">ספריית משאבים</h3>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        <Input
          placeholder="חפש מדריכים..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="all">הכל</TabsTrigger>
          {Object.entries(RESOURCES).map(([key, cat]) => (
            <TabsTrigger key={key} value={key} className="text-xs">
              {cat.icon} {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Resources List */}
        <div className="space-y-4">
          {filteredResources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              לא נמצאו תוצאות
            </div>
          ) : (
            filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => window.open(resource.url, '_blank')}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {resource.type === 'video' ? (
                      <Video className="w-5 h-5 text-blue-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {resource.duration}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                  </div>
                  {/* External link icon */}
                </div>
              </div>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}