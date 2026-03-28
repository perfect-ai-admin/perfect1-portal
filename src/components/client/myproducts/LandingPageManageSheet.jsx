import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Loader2, Globe, ExternalLink, Eye,
  Pencil, Users, BarChart3
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

import LandingPagePreviewPanel from './LandingPagePreviewPanel';
import LandingPageLeadSettings from './LandingPageLeadSettings';
import LandingPageContentEditor from './LandingPageContentEditor';
import LandingPageStats from './LandingPageStats';
import { entities, invokeFunction } from '@/api/supabaseClient';

export default function LandingPageManageSheet({ pageId, open, onOpenChange }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    if (open && pageId) {
      loadData();
    } else {
      setTimeout(() => {
        setPage(null);
        setActiveTab('content');
      }, 300); // clear after animation
    }
  }, [open, pageId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await invokeFunction('getPublicLandingPageById', { pageId });
      if (response) {
        setPage(response);
      } else {
        toast.error('דף הנחיתה לא נמצא');
        onOpenChange(false);
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

  const publicUrl = page?.slug ? `https://perfect-dashboard.com/LP?s=${page.slug}` : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-2xl overflow-y-auto p-0 shadow-2xl border-l-0" dir="rtl">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">טוען נתוני דף...</p>
            </div>
          </div>
        ) : page ? (
          <div className="flex flex-col min-h-full bg-slate-50/50">
            <div className="p-6 bg-white border-b sticky top-0 z-20 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-2xl shadow-inner">
                    <Globe className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <SheetTitle className="text-2xl font-bold text-gray-900 mb-1">{page.business_name}</SheetTitle>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs font-medium px-2 py-0.5">
                        {page.status === 'published' ? 'פורסם באוויר' : page.status === 'paid' ? 'שולם' : 'טיוטה'}
                      </Badge>
                      {publicUrl && (
                        <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded-full transition-colors">
                          צפה בדף באוויר <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto bg-slate-100/80 p-1.5 rounded-xl gap-1">
                  <TabsTrigger value="content" className="gap-2 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 transition-all px-4 py-2">
                    <Pencil className="w-4 h-4" /> עריכת תוכן
                  </TabsTrigger>
                  <TabsTrigger value="leads" className="gap-2 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 transition-all px-4 py-2">
                    <Users className="w-4 h-4" /> חיבור לידים
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 transition-all px-4 py-2">
                    <Eye className="w-4 h-4" /> תצוגה מקדימה
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="gap-2 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 transition-all px-4 py-2">
                    <BarChart3 className="w-4 h-4" /> סטטיסטיקות
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="p-6 flex-1">
              <div className="max-w-3xl mx-auto">
                {activeTab === 'content' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <LandingPageContentEditor page={page} onSave={handleSave} saving={saving} />
                  </div>
                )}
                {activeTab === 'leads' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <LandingPageLeadSettings page={page} onSave={handleSave} saving={saving} />
                  </div>
                )}
                {activeTab === 'preview' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[600px]">
                    <LandingPagePreviewPanel page={page} publicUrl={publicUrl} />
                  </div>
                )}
                {activeTab === 'stats' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <LandingPageStats pageId={pageId} pageName={page.business_name} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}