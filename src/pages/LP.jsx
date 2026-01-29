import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import DynamicLandingPage from '../components/landing-page/DynamicLandingPage';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LP() {
    // Extract ID from URL query parameter (?id=xxx)
    const urlParams = new URLSearchParams(window.location.search);
    const pageId = urlParams.get('id');
    const legacySlug = urlParams.get('s');

    const { data: page, isLoading, error } = useQuery({
            queryKey: ['publicLandingPage', pageId, legacySlug],
            queryFn: async () => {
                try {
                    if (pageId) {
                        console.log('[LP] Fetching by ID:', pageId);
                        const res = await base44.functions.invoke('getPublicLandingPageById', { pageId });
                        console.log('[LP] Response status:', res?.status, 'Data:', res?.data);

                        if (res?.status >= 400) {
                            console.error('[LP] Backend error:', res?.data);
                            throw new Error(res?.data?.error || 'Failed to fetch page');
                        }

                        if (!res?.data) {
                            throw new Error('Invalid response format');
                        }

                        console.log('[LP] ✓ Page loaded successfully:', { id: res.data.id, business_name: res.data.business_name, status: res.data.status, sections: res.data.sections_json?.length });
                        return res.data;
                    } else if (legacySlug) {
                        console.log('[LP] Fetching by slug:', legacySlug);
                        const res = await base44.functions.invoke('getPublicLandingPage', { slug: legacySlug });
                        if (!res?.data) {
                            throw new Error('Page not found');
                        }
                        return res.data;
                    } else {
                        throw new Error("No page identifier provided");
                    }
                } catch (err) {
                    console.error('[LP] Query error:', err.message, err);
                    throw err;
                }
            },
            enabled: !!(pageId || legacySlug),
            retry: 2,
            retryDelay: 500
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

    return (
        <div className="fixed inset-0 z-[9999] bg-white overflow-auto">
            <DynamicLandingPage data={page} />
        </div>
    );
}