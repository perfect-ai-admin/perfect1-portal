import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw, Settings, List, BarChart3, Link2, Target, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import InternalLinksAnalytics from '../components/seo/InternalLinksAnalytics';
import KeywordsRanking from '../components/seo/KeywordsRanking';
import TrafficAnalytics from '../components/seo/TrafficAnalytics';

export default function SEOAdmin() {
  const [excludeUrl, setExcludeUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
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

  // Fetch page snapshots
  const { data: snapshots = [], isLoading: snapshotsLoading } = useQuery({
    queryKey: ['page-snapshots'],
    queryFn: () => base44.entities.PageSnapshot.filter({ status: 'changed' })
  });

  // Scan all pages mutation
  const [scanResults, setScanResults] = useState(null);
  const scanPagesMutation = useMutation({
    mutationFn: async () => {
      // קריאה ל-backend function
      const response = await fetch('/api/scanAllPages', { method: 'POST' });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setScanResults(data);
      queryClient.invalidateQueries(['seo-logs']);
      queryClient.invalidateQueries(['page-snapshots']);
    }
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

  // Filter and search logs
  const filteredLogs = logs.filter(log => {
    // Search filter
    if (searchQuery && !log.url?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !log.entity_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Action filter
    if (filterAction !== 'all' && log.action !== filterAction) {
      return false;
    }
    
    // Status filter
    if (filterStatus !== 'all' && log.ping_status !== filterStatus) {
      return false;
    }
    
    // Date filter
    if (filterDate !== 'all') {
      const logDate = new Date(log.created_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filterDate === 'today') {
        const logDay = new Date(logDate);
        logDay.setHours(0, 0, 0, 0);
        if (logDay.getTime() !== today.getTime()) return false;
      } else if (filterDate === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (logDate < weekAgo) return false;
      } else if (filterDate === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (logDate < monthAgo) return false;
      }
    }
    
    return true;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['תאריך', 'Entity', 'פעולה', 'URL', 'שדות שהשתנו', 'שינוי מהותי', 'Ping נשלח', 'סטטוס', 'שגיאה'];
    const rows = filteredLogs.map(log => [
      new Date(log.created_date).toLocaleString('he-IL'),
      log.entity_name,
      log.action,
      log.url || '',
      log.fields_changed?.join(', ') || '',
      log.is_substantial_change ? 'כן' : 'לא',
      log.ping_sent ? 'כן' : 'לא',
      log.ping_status,
      log.error_message || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `seo-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
          <h1 className="text-4xl font-black text-[#1E3A5F] mb-2">📊 SEO Command Center</h1>
          <p className="text-gray-600">ניהול מקיף של SEO, תנועה, קישורים ודירוגים</p>
        </div>

        {/* Scan Results Alert */}
        {scanResults && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 mb-2">סריקה הושלמה בהצלחה!</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>✓ נסרקו {scanResults.scanned} עמודים</p>
                      <p>✓ זוהו {scanResults.changed} שינויים מהותיים</p>
                      <p>✓ {scanResults.new} עמודים חדשים</p>
                    </div>
                    {scanResults.changes && scanResults.changes.length > 0 && (
                      <div className="mt-3 bg-white rounded-lg p-3 max-h-40 overflow-y-auto">
                        <p className="font-semibold text-xs text-blue-900 mb-2">שינויים שזוהו:</p>
                        {scanResults.changes.map((change, idx) => (
                          <div key={idx} className="text-xs text-blue-800 py-1 border-b border-blue-100 last:border-0">
                            <Badge variant={change.type === 'new' ? 'default' : 'outline'} className="mr-2">
                              {change.type === 'new' ? 'חדש' : 'שונה'}
                            </Badge>
                            {change.title} - {change.entity}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setScanResults(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Changed Pages Alert */}
        {snapshots.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-orange-900 mb-2">
                    ⚠️ זוהו {snapshots.length} עמודים עם שינויים שטרם טופלו
                  </h3>
                  <p className="text-sm text-orange-800 mb-3">
                    עמודים אלה עברו שינוי מהותי ומחכים לטיפול (ping לגוגל)
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {snapshots.slice(0, 5).map((snapshot) => (
                      <div key={snapshot.id} className="text-xs bg-white rounded p-2">
                        <span className="font-semibold text-orange-900">{snapshot.title}</span>
                        <span className="text-orange-700 block truncate">{snapshot.url}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs Navigation */}
        <Tabs defaultValue="automation" className="mb-8">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              אוטומציה
            </TabsTrigger>
            <TabsTrigger value="traffic" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              תנועה
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              מילות מפתח
            </TabsTrigger>
            <TabsTrigger value="internal-links" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              קישורים פנימיים
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              לוגים
            </TabsTrigger>
          </TabsList>

          {/* Automation Tab */}
          <TabsContent value="automation">
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

              <div className="mt-6 space-y-2">
                <Button
                  onClick={sendManualPing}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  שלח Ping ידני לגוגל
                </Button>
                
                <Button
                  onClick={() => scanPagesMutation.mutate()}
                  disabled={scanPagesMutation.isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {scanPagesMutation.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      סורק...
                    </>
                  ) : (
                    <>
                      🔍 סרוק את כל העמודים
                    </>
                  )}
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

          </TabsContent>

          {/* Traffic Analytics Tab */}
          <TabsContent value="traffic">
            <TrafficAnalytics />
          </TabsContent>

          {/* Keywords Ranking Tab */}
          <TabsContent value="keywords">
            <KeywordsRanking />
          </TabsContent>

          {/* Internal Links Tab */}
          <TabsContent value="internal-links">
            <InternalLinksAnalytics />
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>לוג פעילות</CardTitle>
                <CardDescription>מעקב אחר כל השינויים והפעולות ({filteredLogs.length} תוצאות)</CardDescription>
              </div>
              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                disabled={filteredLogs.length === 0}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ייצא ל-CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">חיפוש</label>
                  <Input
                    placeholder="חפש לפי URL או Entity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Date Filter */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">תקופה</label>
                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm"
                  >
                    <option value="all">כל התקופה</option>
                    <option value="today">היום</option>
                    <option value="week">שבוע אחרון</option>
                    <option value="month">חודש אחרון</option>
                  </select>
                </div>

                {/* Action Filter */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">פעולה</label>
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm"
                  >
                    <option value="all">הכל</option>
                    <option value="created">נוצר</option>
                    <option value="updated_content">עודכן (תוכן)</option>
                    <option value="updated_minor">עודכן (קל)</option>
                    <option value="deleted">נמחק</option>
                    <option value="manual_ping">Ping ידני</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">סטטוס</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm"
                  >
                    <option value="all">הכל</option>
                    <option value="success">הצלחה</option>
                    <option value="failed">נכשל</option>
                    <option value="skipped">דולג</option>
                    <option value="error">שגיאה</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(searchQuery || filterDate !== 'all' || filterAction !== 'all' || filterStatus !== 'all') && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-gray-700">מסננים פעילים:</span>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        חיפוש: {searchQuery}
                        <button onClick={() => setSearchQuery('')} className="hover:text-red-600">×</button>
                      </Badge>
                    )}
                    {filterDate !== 'all' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        {filterDate === 'today' ? 'היום' : filterDate === 'week' ? 'שבוע' : 'חודש'}
                        <button onClick={() => setFilterDate('all')} className="hover:text-red-600">×</button>
                      </Badge>
                    )}
                    {filterAction !== 'all' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        {filterAction}
                        <button onClick={() => setFilterAction('all')} className="hover:text-red-600">×</button>
                      </Badge>
                    )}
                    {filterStatus !== 'all' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        {filterStatus}
                        <button onClick={() => setFilterStatus('all')} className="hover:text-red-600">×</button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardContent>
            {logsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">לא נמצאו תוצאות</p>
                <p className="text-sm text-gray-400 mt-1">נסה לשנות את הסינון או החיפוש</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredLogs.map((log) => (
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

          </TabsContent>
        </Tabs>

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