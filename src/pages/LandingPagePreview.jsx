import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import DynamicLandingPage from '@/components/landing-page/DynamicLandingPage';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LandingPagePreview() {
    const { landing_id } = useParams();

    const { data: page, isLoading, error } = useQuery({
        queryKey: ['landingPagePreview', landing_id],
        queryFn: async () => {
            if (!landing_id) throw new Error("No landing page ID provided");
            return await base44.entities.LandingPage.get(landing_id);
        },
        enabled: !!landing_id,
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
                    אופס, זו דף עדכון בלבד. לא ניתן לגשת אליו ישירות.
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