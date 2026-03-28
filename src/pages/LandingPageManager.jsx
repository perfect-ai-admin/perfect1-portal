import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import {
  ArrowRight, Loader2, Globe, ExternalLink, Copy, Eye,
  BarChart3, Users, Pencil, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import LandingPagePreviewPanel from '@/components/client/myproducts/LandingPagePreviewPanel';
import LandingPageLeadSettings from '@/components/client/myproducts/LandingPageLeadSettings';
import LandingPageContentEditor from '@/components/client/myproducts/LandingPageContentEditor';
import LandingPageStats from '@/components/client/myproducts/LandingPageStats';
import { entities, auth, invokeFunction } from '@/api/supabaseClient';

export default function LandingPageManager() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get('id');

  useEffect(() => {
    loadData();
  }, [pageId]);

  const loadData = async () => {
    setLoading(true);
    try {
     
      const isAuth = await auth.isAuthenticated();
      if (!isAuth) {
        auth.redirectToLogin('/LandingPageManager?id=' + pageId);
        return;
      }
      const currentUser = await auth.me();
      setUser(currentUser);

      if (!pageId) {
        toast.error('לא נמצא מזהה דף');
        navigate(createPageUrl('MyProducts'));
        return;
      }

      const response = await invokeFunction('getPublicLandingPageById', { pageId });
      if (response) {
        setPage(response);
      } else {
        toast.error('דף הנחיתה לא נמצא');
        navigate(createPageUrl('MyProducts'));
      }
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בטעינת הדף');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updates) => {
    setSaving(true);
    try {
      await entities.LandingPage.update(pageId, updates);
      setPage(prev => ({ ...prev, ...updates }));
      toast.success('השינויים נשמרו בהצלחה!');
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await invokeFunction('publishLandingPage', { landing_page_id: pageId });
      setPage(prev => ({ ...prev, status: 'published' }));
      toast.success('הדף פורסם בהצלחה!');
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בפרסום הדף');
    } finally {
      setPublishing(false);
    }
  };

  const publicUrl = page?.slug 
    ? `https://perfect-dashboard.com/LP?s=${page.slug}` 
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!page) return null;

  return (
    <>
      <Helmet>
        <title>ניהול דף נחיתה - {page.business_name} | Perfect One</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow sticky top-0 z-50">
          <div className="w-full px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button onClick={() => navigate(createPageUrl('MyProducts'))} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="min-w-0 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-300 flex-shrink-0" />
                  <p className="text-sm font-medium truncate">{page.business_name}</p>
                  <Badge className="bg-green-500/20 text-green-200 border-0 text-[10px]">
                    {page.status === 'published' ? 'פורסם' : page.status === 'paid' ? 'שולם' : 'טיוטה'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {publicUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      toast.success('הקישור הועתק!');
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    העתק קישור
                  </Button>
                )}
                {publicUrl && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 gap-1.5 text-xs"
                    onClick={() => window.open(publicUrl, '_blank')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    צפה בדף
                  </Button>
                )}
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-400 gap-1.5 text-xs"
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  {publishing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  פרסם
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border shadow-sm w-full justify-start overflow-x-auto">
              <TabsTrigger value="content" className="gap-1.5 text-xs sm:text-sm">
                <Pencil className="w-4 h-4" />
                עריכת תוכן
              </TabsTrigger>
              <TabsTrigger value="leads" className="gap-1.5 text-xs sm:text-sm">
                <Users className="w-4 h-4" />
                יעד לידים
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-1.5 text-xs sm:text-sm">
                <Eye className="w-4 h-4" />
                תצוגה מקדימה
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-1.5 text-xs sm:text-sm">
                <BarChart3 className="w-4 h-4" />
                סטטיסטיקות
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <LandingPageContentEditor page={page} onSave={handleSave} saving={saving} />
            </TabsContent>

            <TabsContent value="leads">
              <LandingPageLeadSettings page={page} onSave={handleSave} saving={saving} />
            </TabsContent>

            <TabsContent value="preview">
              <LandingPagePreviewPanel page={page} publicUrl={publicUrl} />
            </TabsContent>

            <TabsContent value="stats">
              <LandingPageStats pageId={pageId} pageName={page.business_name} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}