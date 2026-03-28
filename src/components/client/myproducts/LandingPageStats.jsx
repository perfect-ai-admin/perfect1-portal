import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MousePointer, TrendingUp, Eye } from 'lucide-react';
import { entities } from '@/api/supabaseClient';

export default function LandingPageStats({ pageId, pageName }) {
  const { data: leads = [] } = useQuery({
    queryKey: ['landing-leads', pageId],
    queryFn: async () => {
      try {
        const allLeads = await entities.Lead.filter({ source_page: pageName }, '-created_date', 100);
        return allLeads;
      } catch {
        return [];
      }
    },
    enabled: !!pageId,
  });

  const stats = [
    { label: 'לידים שנכנסו', value: leads.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'לידים חדשים', value: leads.filter(l => l.status === 'new').length, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: 'בטיפול', value: leads.filter(l => l.status === 'in_progress' || l.status === 'contacted').length, icon: MousePointer, color: 'text-amber-600 bg-amber-50' },
    { label: 'המרות', value: leads.filter(l => l.status === 'converted').length, icon: Eye, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {leads.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">לידים אחרונים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leads.slice(0, 10).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{lead.name || 'ללא שם'}</p>
                    <p className="text-xs text-gray-500">{lead.phone}</p>
                  </div>
                  <div className="text-left">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                      lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {lead.status === 'new' ? 'חדש' : lead.status === 'converted' ? 'הומר' : lead.status === 'contacted' ? 'נוצר קשר' : lead.status}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(lead.created_date).toLocaleDateString('he-IL')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-500">עדיין אין לידים</p>
            <p className="text-sm text-gray-400 mt-1">לידים שנכנסים מדף הנחיתה יופיעו כאן</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}