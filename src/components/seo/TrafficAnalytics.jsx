import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MousePointer, Clock, Globe, TrendingUp } from 'lucide-react';

// נתוני דמו - ניתן לחבר ל-Google Analytics API
const TRAFFIC_DATA = {
  overview: {
    totalVisitors: 12450,
    pageViews: 34820,
    avgSessionDuration: '3:24',
    bounceRate: 42.3
  },
  topPages: [
    { url: '/OsekPatur', visits: 3240, avgTime: '4:12', bounceRate: 35.2 },
    { url: '/Services', visits: 2890, avgTime: '3:45', bounceRate: 38.7 },
    { url: '/Blog', visits: 2340, avgTime: '5:20', bounceRate: 28.4 },
    { url: '/Pricing', visits: 1980, avgTime: '2:55', bounceRate: 45.1 },
    { url: '/ProfessionPage?slug=makeup-artist', visits: 1560, avgTime: '3:30', bounceRate: 40.2 }
  ],
  sources: [
    { source: 'Google Organic', visits: 7890, percentage: 63.4 },
    { source: 'Direct', visits: 2340, percentage: 18.8 },
    { source: 'Social Media', visits: 1450, percentage: 11.6 },
    { source: 'Referral', visits: 770, percentage: 6.2 }
  ],
  devices: [
    { device: 'Mobile', visits: 6850, percentage: 55.0 },
    { device: 'Desktop', visits: 4590, percentage: 36.9 },
    { device: 'Tablet', visits: 1010, percentage: 8.1 }
  ]
};

export default function TrafficAnalytics() {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {TRAFFIC_DATA.overview.totalVisitors.toLocaleString('he-IL')}
                </p>
                <p className="text-sm text-gray-600">מבקרים (30 יום)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {TRAFFIC_DATA.overview.pageViews.toLocaleString('he-IL')}
                </p>
                <p className="text-sm text-gray-600">צפיות בדף</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {TRAFFIC_DATA.overview.avgSessionDuration}
                </p>
                <p className="text-sm text-gray-600">זמן ממוצע</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {TRAFFIC_DATA.overview.bounceRate}%
                </p>
                <p className="text-sm text-gray-600">Bounce Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>📄 עמודים פופולריים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TRAFFIC_DATA.topPages.map((page, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">{page.url}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>👁️ {page.visits.toLocaleString('he-IL')} ביקורים</span>
                    <span>⏱️ {page.avgTime} ממוצע</span>
                    <span className={page.bounceRate < 40 ? 'text-green-600' : 'text-orange-600'}>
                      📊 {page.bounceRate}% bounce
                    </span>
                  </div>
                </div>
                <Badge className="bg-blue-600 text-white">#{idx + 1}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>🌐 מקורות תנועה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TRAFFIC_DATA.sources.map((source, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{source.source}</span>
                    <span className="text-gray-900 font-semibold">
                      {source.visits.toLocaleString('he-IL')} ({source.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle>📱 התקנים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TRAFFIC_DATA.devices.map((device, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{device.device}</span>
                    <span className="text-gray-900 font-semibold">
                      {device.visits.toLocaleString('he-IL')} ({device.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-800">
            💡 <strong>הערה:</strong> אלו נתוני דמו. לנתונים אמיתיים, חבר את Google Analytics API ב-Backend Functions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}