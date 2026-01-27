import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import DynamicLandingPage from '../components/landing-page/DynamicLandingPage';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LP() {
    const { slug } = useParams();

    // Note: Layout.js handles hiding the header/footer for this page based on the page name.


    const { data: page, isLoading, error } = useQuery({
        queryKey: ['publicLandingPage', slug],
        queryFn: async () => {
            if (!slug) throw new Error("No slug provided");
            console.log('[LP] Fetching slug:', slug);
            // Use backend function to safely check "published" status bypassing RLS for public
            const res = await base44.functions.invoke('getPublicLandingPage', { slug });
            console.log('[LP] Fetch result:', { slug, success: !!res.data, hasStatus: res.data?.status });
            return res.data;
        },
        enabled: !!slug,
        retry: false
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