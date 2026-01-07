import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw, Settings, List } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SEOAdmin() {
  const [excludeUrl, setExcludeUrl] = useState('');
  const queryClient = useQueryClient();

  // Fetch config
  const { data: configs = [], isLoading: configLoading } = useQuery({
    queryKey: ['seo-config'],
    queryFn: () => base44.entities.SEOConfig.filter({ key: 'global_settings' })
  });

  const config = configs[0] || { 
    enabled: true, 
    excluded_pages: [],
    excluded_entities: []
  };

  // Fetch logs
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['seo-logs'],
    queryFn: () => base44.entities.SEOLog.list('-created_date', 50)
  });

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (updates) => {
      if (config.id) {
        return base44.entities.SEOConfig.update(config.id, updates);
      } else {
        return base44.entities.SEOConfig.create({
          key: 'global_settings',
          ...updates
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['seo-config']);
    }
  });

  // Toggle automation
  const toggleAutomation = async () => {
    await updateConfigMutation.mutateAsync({ enabled: !config.enabled });
  };

  // Add excluded URL
  const addExcludedUrl = async () => {
    if (!excludeUrl.trim()) return;
    
    const currentExcluded = config.excluded_pages || [];
    await updateConfigMutation.mutateAsync({
      excluded_pages: [...currentExcluded, excludeUrl.trim()]
    });
    setExcludeUrl('');
  };

  // Remove excluded URL
  const removeExcludedUrl = async (url) => {
    const currentExcluded = config.excluded_pages || [];
    await updateConfigMutation.mutateAsync({
      excluded_pages: currentExcluded.filter(u => u !== url)
    });
  };

  // Manual ping to Google
  const sendManualPing = async () => {
    try {
      const sitemapUrl = 'https://perfect1.co.il/sitemap.xml';
      const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      
      await fetch(pingUrl);
      
      await base44.entities.SEOLog.create({
        entity_name: 'Manual',
        entity_id: 'manual_ping',
        url: sitemapUrl,
        action: 'manual_ping',
        is_substantial_change: true,
        lastmod_updated: false,
        ping_sent: true,
        ping_status: 'success'
      });
      
      queryClient.invalidateQueries(['seo-logs']);
      alert('✅ Ping נשלח בהצלחה לגוגל!');
    } catch (error) {
      alert('❌ שגיאה בשליחת ping: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      success: <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" /> Success</Badge>,
      failed: <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>,
      skipped: <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" /> Skipped</Badge>,
      error: <Badge className="bg-red-600 text-white"><XCircle className="w-3 h-3 mr-1" /> Error</Badge>
    };
    return badges[status] || <Badge variant="outline">{status}</Badge>;
  };

  if (configLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#1E3A5F] mb-2">⚙️ SEO Automation Control</h1>
          <p className="text-gray-600">ניהול אוטומציית אינדקס חכמה לגוגל</p>
        </div>

        {/* Main Controls */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Automation Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                סטטוס אוטומציה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">
                    {config.enabled ? '✅ פעיל' : '❌ כבוי'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {config.enabled 
                      ? 'האוטומציה פועלת על כל שינוי מהותי'
                      : 'האוטומציה מושבתת - אין פעולות אוטומטיות'}
                  </p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={toggleAutomation}
                  disabled={updateConfigMutation.isLoading}
                />
              </div>

              <div className="mt-6">
                <Button
                  onClick={sendManualPing}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  שלח Ping ידני לגוגל
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                סטטיסטיקות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">סה"כ פעולות:</span>
                  <span className="font-bold">{logs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">שינויים מהותיים:</span>
                  <span className="font-bold text-green-600">
                    {logs.filter(l => l.is_substantial_change).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pings שנשלחו:</span>
                  <span className="font-bold text-blue-600">
                    {logs.filter(l => l.ping_sent).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">שגיאות:</span>
                  <span className="font-bold text-red-600">
                    {logs.filter(l => l.ping_status === 'failed' || l.ping_status === 'error').length}
                  </span>
                </div>
                {config.last_ping_sent && (
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-gray-600">Ping אחרון:</span>
                    <span className="font-medium">
                      {new Date(config.last_ping_sent).toLocaleString('he-IL')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Excluded Pages */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>החרגת עמודים</CardTitle>
            <CardDescription>עמודים שלא יופעל עליהם tracking אוטומטי</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="הכנס URL להחרגה..."
                value={excludeUrl}
                onChange={(e) => setExcludeUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addExcludedUrl()}
              />
              <Button onClick={addExcludedUrl} disabled={!excludeUrl.trim()}>
                הוסף
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {config.excluded_pages?.map((url, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-2">
                  {url}
                  <button
                    onClick={() => removeExcludedUrl(url)}
                    className="hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {(!config.excluded_pages || config.excluded_pages.length === 0) && (
                <p className="text-sm text-gray-500">אין עמודים מוחרגים</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle>לוג פעילות (50 אחרונים)</CardTitle>
            <CardDescription>מעקב אחר כל השינויים והפעולות</CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">אין פעילות עדיין</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-800">
                          {log.entity_name} • {log.action}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.created_date).toLocaleString('he-IL')}
                        </p>
                      </div>
                      {getStatusBadge(log.ping_status)}
                    </div>

                    {log.url && (
                      <p className="text-xs text-blue-600 mb-2 truncate">{log.url}</p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs">
                      {log.is_substantial_change && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          שינוי מהותי
                        </Badge>
                      )}
                      {log.ping_sent && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Ping נשלח
                        </Badge>
                      )}
                      {log.fields_changed && log.fields_changed.length > 0 && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {log.fields_changed.join(', ')}
                        </Badge>
                      )}
                    </div>

                    {log.error_message && (
                      <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">
                        ⚠️ {log.error_message}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sitemap Link */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Sitemap זמין בכתובת:</p>
              <a 
                href="https://perfect1.co.il/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-mono text-sm underline"
              >
                https://perfect1.co.il/sitemap.xml
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}