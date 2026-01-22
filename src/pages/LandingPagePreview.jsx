import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import DynamicLandingPage from '../components/landing-page/DynamicLandingPage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Globe, Lock, CheckCircle, Copy, ExternalLink, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function LandingPagePreview() {
    const [searchParams] = useSearchParams();
    const slug = searchParams.get('slug');
    const [isPublishing, setIsPublishing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Note: Layout.js handles hiding the header/footer for this page based on the page name.


    // Fetch the draft page (Requires Auth)
    const { data: page, isLoading, error } = useQuery({
        queryKey: ['landingPage', slug],
        queryFn: async () => {
            if (!slug) throw new Error("No slug provided");
            const res = await base44.entities.LandingPage.filter({ slug });
            return res[0];
        },
        enabled: !!slug,
        retry: false
    });

    const handlePublishClick = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentAndPublish = async () => {
        try {
            setIsPublishing(true);
            // Simulate payment delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Call publish function
            await base44.functions.invoke('publishLandingPage', { slug });
            
            setShowPaymentModal(false);
            setShowSuccessModal(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        } catch (err) {
            toast.error("שגיאה בפרסום הדף. אנא נסה שנית.");
            console.error(err);
        } finally {
            setIsPublishing(false);
        }
    };

    const liveUrl = typeof window !== 'undefined' ? `${window.location.origin}/LP?slug=${slug}` : '';

    const copyLink = () => {
        navigator.clipboard.writeText(liveUrl);
        toast.success("הקישור הועתק!");
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">טוען תצוגה מקדימה...</p>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">גישה נדחתה</h1>
                <p className="text-gray-600">לא ניתן למצוא את דף הנחיתה או שאין לך הרשאה לצפות בו.</p>
            </div>
        );
    }

    // If page is already published, redirect/show link
    if (page.status === 'published' && !showSuccessModal) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">הדף הזה כבר פורסם!</h2>
                    <p className="text-gray-600 mb-8">
                        דף הנחיתה שלך כבר באוויר וזמין לצפייה.
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between mb-6 border border-gray-200" dir="ltr">
                        <code className="text-sm text-gray-600 truncate max-w-[200px]">{liveUrl}</code>
                        <Button variant="ghost" size="sm" onClick={copyLink}>
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button className="w-full gap-2" onClick={() => window.open(liveUrl, '_blank')}>
                        <ExternalLink className="w-4 h-4" />
                        פתח את הדף
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-24" dir="rtl">
            {/* Preview Banner */}
            <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                        Preview Mode
                    </div>
                    <span className="text-sm opacity-90 hidden sm:inline">
                        זוהי תצוגה מקדימה בלבד. הדף אינו זמין לציבור.
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium hidden sm:inline">אהבת?</span>
                    <Button 
                        onClick={handlePublishClick}
                        className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-sm"
                    >
                        פרסם את הדף שלי
                    </Button>
                </div>
            </div>

            {/* The Actual Landing Page Content - Mockup View */}
            <div className="mt-8 mx-auto max-w-[1200px] perspective-1000">
                <div className="relative bg-white rounded-xl shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25),0_30px_60px_-30px_rgba(0,0,0,0.3)] border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
                    {/* Browser Toolbar */}
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-4 select-none">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm"></div>
                        </div>
                        
                        {/* Address Bar */}
                        <div className="flex-1 max-w-2xl mx-auto bg-white border border-slate-200 rounded-md px-3 py-1.5 flex items-center justify-center gap-2 shadow-sm">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500 font-mono truncate dir-ltr">
                                {liveUrl || `https://perfectbiz.ai/${slug}`}
                            </span>
                        </div>

                        {/* Spacer to center address bar */}
                        <div className="w-[52px]"></div>
                    </div>

                    {/* Viewport - Scrollable */}
                    <div className="relative h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                        <div className="pointer-events-none origin-top">
                            <DynamicLandingPage data={page} />
                        </div>
                    </div>
                </div>
                
                {/* Reflection/Shadow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-t from-white via-transparent to-transparent z-[-1] opacity-50 blur-xl"></div>
            </div>

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="sm:max-w-md text-right" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">פרסום דף הנחיתה</DialogTitle>
                        <DialogDescription>
                            השלם את התהליך כדי להעלות את הדף שלך לאוויר באופן מיידי.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-6 space-y-4">
                        <div className="flex items-center gap-4 p-4 border rounded-xl bg-gray-50">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Globe className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">חבילת פרסום בסיסית</h4>
                                <p className="text-sm text-gray-500">אחסון ודומיין ללא הגבלת זמן</p>
                            </div>
                            <div className="mr-auto font-bold text-lg">₪0</div> {/* MVP Free for now */}
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-start gap-2">
                        <Button 
                            onClick={handlePaymentAndPublish} 
                            disabled={isPublishing}
                            className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                        >
                            {isPublishing ? (
                                <>
                                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                    מעבד תשלום...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5 ml-2" />
                                    שלם ופרסם עכשיו
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={() => {}}> {/* Prevent closing by clicking outside */}
                <DialogContent className="sm:max-w-md text-center" dir="rtl">
                    <div className="flex flex-col items-center py-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <DialogTitle className="text-2xl font-bold mb-2">דף הנחיתה פורסם בהצלחה! 🎉</DialogTitle>
                        <DialogDescription className="text-base mb-8">
                            הדף שלך באוויר ומוכן לקבל לקוחות.
                        </DialogDescription>

                        <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex items-center gap-2" dir="ltr">
                            <code className="flex-1 text-sm text-gray-700 truncate text-left">{liveUrl}</code>
                            <Button size="icon" variant="ghost" onClick={copyLink}>
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>

                        <Button 
                            className="w-full h-12 text-lg gap-2" 
                            onClick={() => window.open(liveUrl, '_blank')}
                        >
                            פתח את הדף שלי
                            <ExternalLink className="w-5 h-5" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}