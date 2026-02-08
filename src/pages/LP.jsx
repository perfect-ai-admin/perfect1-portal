import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import DynamicLandingPage from '../components/landing-page/DynamicLandingPage';
import { Loader2, AlertCircle } from 'lucide-react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

export default function LP() {
    // Extract slug or ID from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('s');
    const pageId = urlParams.get('id'); // legacy support

    const { data: page, isLoading, error } = useQuery({
            queryKey: ['publicLandingPage', slug, pageId],
            queryFn: async () => {
                try {
                    if (slug) {
                        console.log('[LP] Fetching by slug:', slug);
                        const res = await base44.functions.invoke('getPublicLandingPage', { slug });
                        if (!res?.data) {
                            throw new Error('Page not found');
                        }
                        return res.data;
                    } else if (pageId) {
                        console.log('[LP] Fetching by ID (legacy):', pageId);
                        const res = await base44.functions.invoke('getPublicLandingPageById', { pageId });
                        if (!res?.data) {
                            throw new Error(res?.data?.error || 'Failed to fetch page');
                        }
                        return res.data;
                    } else {
                        throw new Error("No page identifier provided");
                    }
                } catch (err) {
                    console.error('[LP] Query error:', err);
                    throw err;
                }
            },
            enabled: !!(slug || pageId),
            retry: 1,
            retryDelay: 1000
        });

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-gray-900">הדף לא נמצא</h1>
                <p className="text-gray-600 max-w-sm">
                    ייתכן שהקישור שגוי, או שהדף טרם פורסם.
                </p>
            </div>
        );
    }

    // Extract SEO Data
    const businessName = page?.business_name || 'דף נחיתה';
    const sections = typeof page?.sections_json === 'string' 
        ? JSON.parse(page.sections_json) 
        : (page?.sections_json || []);
    
    const heroSection = sections.find(s => s.type === 'hero');
    const description = heroSection?.data?.subtitle || heroSection?.data?.description || 'ברוכים הבאים';
    const image = heroSection?.data?.image || '';

    return (
        <HelmetProvider>
            <Helmet>
                <title>{businessName}</title>
                <meta name="description" content={description} />
                
                <meta property="og:title" content={businessName} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="website" />
                {image && <meta property="og:image" content={image} />}
                
                {/* Reset default site name if exists */}
                <meta property="og:site_name" content={businessName} />
            </Helmet>
            <div className="w-full min-h-screen bg-white overflow-auto">
                <DynamicLandingPage data={page} />
            </div>
        </HelmetProvider>
    );
}