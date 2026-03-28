import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { invokeFunction } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Home, Target, Copy, Download, Palette } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function CheckoutSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [details, setDetails] = useState(null);
    const [landingPageData, setLandingPageData] = useState(null);
    const [publishedUrl, setPublishedUrl] = useState(null);

    const sessionId = searchParams.get('session_id');
    const paymentId = searchParams.get('payment_id');

    useEffect(() => {
        verifyPayment();
        // Celebration animation
        setTimeout(() => {
            confetti({
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

             // Use function to get payment details (RLS might block direct access)
             let payment = null;
             try {
                 const res = await invokeFunction('getPaymentStatus', { payment_id: paymentId });
                 const payments = res?.payments || [];
                 if (payments.length > 0) payment = payments[0];
             } catch (_) {}

             if (payment) {
                 // If still pending, wait a bit and re-check (confirm may be in progress)
                 if (payment.status === 'pending') {
                     console.log('[CheckoutSuccess] Payment still pending, waiting 3s...');
                     await new Promise(r => setTimeout(r, 3000));
                     try {
                         const recheckRes = await invokeFunction('getPaymentStatus', { payment_id: paymentId });
                         const recheckPayments = recheckRes?.payments || [];
                         if (recheckPayments.length > 0) payment = recheckPayments[0];
                     } catch (_) {}
                 }

                 setDetails(payment);

                 if (payment.status === 'completed') {
                     setSuccess(true);
                     toast.success('התשלום בוצע בהצלחה!');

                     // Auto-publish landing page if landing-page product
                      if (payment.product_type === 'landing-page') {
                          try {
                              // Step 1: Mark as paid
                              await invokeFunction('publishLandingPage', {
                                  landingPageId: payment.product_id,
                                  action: 'markPaid'
                              });

                              // Step 2: Publish to air
                              const publishResult = await invokeFunction('publishLandingPage', {
                                  landingPageId: payment.product_id,
                                  action: 'publish'
                              });

                              if (publishResult.success) {
                                  // Defensive fallback: try url first, then public_url
                                  const url = publishResult?.url || publishResult?.public_url;
                                  if (!url) {
                                      throw new Error('publishLandingPage returned no public URL in response');
                                  }
                                  console.log('[CHECKOUT_SUCCESS] Landing page published:', {
                                      landingPageId: payment.product_id,
                                      publishedUrl: url,
                                      slug: publishResult.slug,
                                      status: publishResult.status,
                                      isIdempotent: publishResult.isIdempotent
                                  });
                                  setPublishedUrl(url);
                                  // Fetch landing page details for DB verification
                                 
                                  const pages = [];
                                  if (pages.length > 0) {
                                      console.log('[DB_VERIFY] Page status:', {
                                          id: pages[0].id,
                                          status: pages[0].status,
                                          slug: pages[0].slug,
                                          published_at: pages[0].published_at,
                                          paid_at: pages[0].paid_at
                                      });
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
                        {publishedUrl && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 space-y-4">
                                <div className="text-center">
                                    <p className="text-sm text-purple-600 font-semibold mb-2">שלב 9 - הדומיין שלך</p>
                                    <h2 className="text-3xl font-black text-purple-900 mb-4">🎉 מזל טוב!</h2>
                                    <p className="text-purple-800 mb-4">זה הדומיין שלך:</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                                    <span className="text-xl font-bold text-gray-900">{publishedUrl}</span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                            navigator.clipboard.writeText(publishedUrl);
                                            toast.success('הדומיין הועתק!');
                                        }}
                                        className="hover:bg-purple-100"
                                    >
                                        <Copy className="w-5 h-5 text-purple-600" />
                                    </Button>
                                </div>
                                <a 
                                    href={publishedUrl} 
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

                        {/* Deliverable Download Links for logos/stickers */}
                        {details?.deliverables && details.deliverables.length > 0 && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 space-y-4">
                                <div className="text-center">
                                    <h2 className="text-2xl font-black text-green-900 mb-2">🎨 הקבצים שלך מוכנים!</h2>
                                    <p className="text-green-700 text-sm">ללא סימן מים, באיכות מלאה</p>
                                </div>
                                <div className="space-y-3">
                                    {details.deliverables.map((d, i) => (
                                        <div key={i} className="bg-white rounded-lg p-4 flex items-center justify-between gap-3 border border-green-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    {d.type === 'logo' ? <Palette className="w-5 h-5 text-green-600" /> : <Download className="w-5 h-5 text-green-600" />}
                                                </div>
                                                <span className="font-bold text-gray-900">{d.title}</span>
                                            </div>
                                            <a 
                                                href={d.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                download
                                            >
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1">
                                                    <Download className="w-4 h-4" />
                                                    הורד
                                                </Button>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-green-600 text-center">גם שלחנו לך את הקבצים במייל 📧</p>
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