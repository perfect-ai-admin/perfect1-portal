import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DynamicLandingPage from '@/components/landing-page/DynamicLandingPage';
import { Loader2, AlertCircle, ShoppingCart, ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { entities } from '@/api/supabaseClient';

export default function LandingPagePreview() {
    const { landing_id: paramsId } = useParams();
    const [searchParams] = useSearchParams();
    const landing_id = paramsId || searchParams.get('id');

    const { data: page, isLoading, error } = useQuery({
        queryKey: ['landingPagePreview', landing_id],
        queryFn: async () => {
            if (!landing_id) throw new Error("No landing page ID provided");
            return await entities.LandingPage.get(landing_id);
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
                    אופס, זו דף תצוגה בלבד. לא ניתן לגשת אליו ללא מזהה תקין.
                </p>
            </div>
        );
    }

    const handleAddToCart = async () => {
        try {
            const { addToCart } = await import('@/components/client/shared/cartUtils');
            
            // Extract hero image for preview
            const heroSection = page.sections_json?.find(s => s.type === 'hero');
            const heroImage = heroSection?.image_prompt 
                ? `https://image.pollinations.ai/prompt/${encodeURIComponent(heroSection.image_prompt)}?width=500&height=500&nologo=true`
                : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60';

            await addToCart({
                type: 'landing_page',
                data: {
                    landingPageId: page.id,
                    slug: page.slug,
                    businessName: page.business_name,
                    sections: page.sections_json
                },
                price: 299,
                title: `דף נחיתה: ${page.business_name}`,
                preview_image: heroImage,
                description: 'דף נחיתה ממותג כולל תוכן ועיצוב'
            });

            toast.success('דף הנחיתה הוסף לסל בהצלחה!');
        } catch (err) {
            console.error('Error adding to cart:', err);
            toast.error('שגיאה בהוספה לסל');
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-white overflow-auto pb-24">
            <DynamicLandingPage data={page} />

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-[10000] shadow-[0_-5px_30px_rgba(0,0,0,0.1)]" dir="rtl">
                <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Eye className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-sm">תצוגה מקדימה</div>
                            <div className="text-xs text-gray-500">זהו הדף כפי שיראה ללקוחות שלך</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button 
                            onClick={() => window.history.back()}
                            variant="outline" 
                            className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50 text-gray-700"
                        >
                            חזור לעריכה
                        </Button>
                        
                        <Button 
                            onClick={handleAddToCart} 
                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100"
                        >
                            <ShoppingCart className="w-4 h-4 ml-2" />
                            הוסף לסל (₪299)
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}