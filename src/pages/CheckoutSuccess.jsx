import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Home, Target, Copy } from 'lucide-react';
import { toast } from 'sonner';
import canvas from 'canvas-confetti';

export default function CheckoutSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [details, setDetails] = useState(null);
    const [landingPageData, setLandingPageData] = useState(null);

    const sessionId = searchParams.get('session_id');
    const paymentId = searchParams.get('payment_id');

    useEffect(() => {
        verifyPayment();
        // Celebration animation
        setTimeout(() => {
            canvas({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }, 500);
    }, []);

    const verifyPayment = async () => {
         try {
             if (!paymentId) {
                 setLoading(false);
                 toast.error('שגיאה - לא נמצא מזהה תשלום');
                 return;
             }

             const payments = await base44.entities.Payment.filter({ id: paymentId });
             if (payments.length > 0) {
                 const payment = payments[0];
                 setDetails(payment);

                 if (payment.status === 'completed') {
                     setSuccess(true);
                     toast.success('התשלום בוצע בהצלחה!');

                     // Auto-publish landing page if landing-page product
                      if (payment.product_type === 'landing-page') {
                          try {
                              // Step 1: Mark as paid
                              await base44.functions.invoke('publishLandingPage', {
                                  landingPageId: payment.product_id,
                                  action: 'markPaid'
                              });

                              // Step 2: Publish to air
                              const publishResult = await base44.functions.invoke('publishLandingPage', {
                                  landingPageId: payment.product_id,
                                  action: 'publish'
                              });

                              if (publishResult.data.success) {
                                  console.log('Landing page published:', publishResult.data.url);
                                  // Fetch landing page details
                                  const pages = await base44.entities.LandingPage.filter({ id: payment.product_id });
                                  if (pages.length > 0) {
                                      setLandingPageData(pages[0]);
                                  }
                              }
                          } catch (err) {
                              console.error('Failed to publish landing page:', err);
                              toast.error('שגיאה בפרסום הדף: ' + err.message);
                          }
                      }
                 } else {
                     toast.error('סטטוס התשלום לא ברור');
                 }
             }
         } catch (error) {
             toast.error('שגיאה בבדיקת התשלום');
             console.error(error);
         } finally {
             setLoading(false);
         }
     };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#27AE60]" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>תשלום הצליח! - BizPilot</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
                <div className="max-w-2xl w-full">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
                        {/* Success Icon */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#27AE60] rounded-full opacity-10 scale-125 animate-ping" />
                                <CheckCircle className="w-20 h-20 text-[#27AE60] relative" />
                            </div>
                        </div>

                        {/* Headline */}
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">🎉 הצלחה!</h1>
                            <p className="text-xl text-gray-600">התשלום בוצע בהצלחה</p>
                        </div>

                        {/* Details */}
                        {details && (
                            <div className="bg-gray-50 rounded-lg p-6 text-right space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">מוצר</span>
                                    <span className="font-semibold">{details.product_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">סכום</span>
                                    <span className="font-semibold">₪{details.amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">תאריך</span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(details.completed_at).toLocaleDateString('he-IL')}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Step 9: Domain Display */}
                        {details?.product_type === 'landing-page' && landingPageData && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 space-y-4">
                                <div className="text-center">
                                    <p className="text-sm text-purple-600 font-semibold mb-2">שלב 9 - הדומיין שלך</p>
                                    <h2 className="text-3xl font-black text-purple-900 mb-4">🎉 מזל טוב!</h2>
                                    <p className="text-purple-800 mb-4">זה הדומיין שלך:</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                                    <span className="text-xl font-bold text-gray-900">{landingPageData.domain}</span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                            navigator.clipboard.writeText(landingPageData.domain);
                                            toast.success('הדומיין הועתק!');
                                        }}
                                        className="hover:bg-purple-100"
                                    >
                                        <Copy className="w-5 h-5 text-purple-600" />
                                    </Button>
                                </div>
                                <a 
                                    href={`https://${landingPageData.domain}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <Button className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-bold">
                                        לדומיין שלך 🔗
                                    </Button>
                                </a>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="space-y-3">
                            {details?.product_type === 'plan' && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-blue-900">
                                        ✨ המסלול שלך עודכן! כל המודולים החדשים זמינים לך כעת.
                                    </p>
                                </div>
                            )}
                            {details?.product_type === 'goal' && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-blue-900">
                                        🎯 אתה יכול לבחור במטרות נוספות כעת!
                                    </p>
                                </div>
                            )}
                            {details?.product_type === 'landing-page' && (
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-green-900">
                                        🚀 הדף שלך פורסם לאוויר!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Next Steps */}
                        <div className="border-t pt-6">
                            <p className="text-sm text-gray-600 mb-4">הצעדים הבאים:</p>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                    <span>1.</span>
                                    <span>כל ההרשאות שלך עודכנו בדשבורד</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>2.</span>
                                    <span>תוכל להתחיל להשתמש בתכונות החדשות מיד</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>3.</span>
                                    <span>אם יש לך שאלות, אנחנו כאן לעזור</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-3">
                            <Button 
                                onClick={() => navigate('/ClientDashboard')}
                                className="bg-[#27AE60] hover:bg-[#2ECC71] h-12 text-lg w-full"
                            >
                                <Home className="w-5 h-5 ml-2" />
                                חזור לדשבורד
                            </Button>
                            {details?.product_type === 'goal' && (
                                <Button 
                                    onClick={() => navigate('/ClientDashboard?tab=goals')}
                                    variant="outline"
                                    className="h-12"
                                >
                                    <Target className="w-5 h-5 ml-2" />
                                    בחר מטרות
                                </Button>
                            )}
                        </div>

                        {/* Footer */}
                        <p className="text-xs text-gray-500">
                            מזהה הזמנה: {paymentId}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}