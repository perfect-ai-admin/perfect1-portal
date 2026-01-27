import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const productType = searchParams.get('type'); // 'plan' or 'goal'
    const productId = searchParams.get('id');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
      // Auto-checkout for landing page on mount
      if (productType === 'landing-page') {
        handleCheckout();
      }
    }, [productType]);

    const loadData = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);

            if (productType === 'plan') {
                const plans = await base44.entities.Plan.filter({ id: productId });
                if (plans.length > 0) setProduct(plans[0]);
            } else if (productType === 'goal') {
                const goals = await base44.entities.Goal.filter({ id: productId });
                if (goals.length > 0) setProduct(goals[0]);
            }
        } catch (error) {
            toast.error('שגיאה בטעינת הנתונים');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            // For landing pages, map to correct format
            const product_type = productType === 'landing-page' ? 'landing-page' : productType;
            const product_id = productType === 'landing-page' ? searchParams.get('slug') : productId;

            const response = await base44.functions.invoke('createCheckoutSession', {
                product_type: product_type,
                product_id: product_id
            });

            if (response.data.success && response.data.url) {
                // Set landing page to "paid" status if checkout is for landing page
                if (productType === 'landing-page' && productId) {
                    try {
                        await base44.functions.invoke('publishLandingPage', {
                            landingPageId: productId,
                            action: 'markPaid'
                        });
                    } catch (err) {
                        console.error('Failed to mark as paid:', err);
                    }
                }
                window.location.href = response.data.url;
            } else {
                toast.error('שגיאה ביצירת ההזמנה');
            }
        } catch (error) {
            toast.error('שגיאה בעיבוד התשלום');
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">המוצר לא נמצא</h1>
                    <Button onClick={() => navigate('/ClientDashboard')}>
                        חזור לדשבורד
                    </Button>
                </div>
            </div>
        );
    }

    const amount = productType === 'plan' ? product.price : 99;

    return (
        <>
            <Helmet>
                <title>תשלום - BizPilot</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4" dir="rtl">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">השלם את ההזמנה</h1>
                        <p className="text-gray-600">אתה על סף לשדרג את העסק שלך</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Order Summary */}
                        <div className="md:col-span-2">
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle>סיכום ההזמנה</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Product Info */}
                                    <div className="border-b pb-4">
                                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                                        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                                        
                                        {productType === 'plan' && (
                                            <div className="space-y-2">
                                                {product.marketing_enabled && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span>✅</span> מודול שיווק
                                                    </div>
                                                )}
                                                {product.mentor_enabled && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span>✅</span> מודול מנטור
                                                    </div>
                                                )}
                                                {product.finance_enabled && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span>✅</span> מודול פיננסים
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span>🎯</span> {product.goals_limit === null ? 'מטרות ללא הגבלה' : `עד ${product.goals_limit} מטרות`}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pricing */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">סכום</span>
                                            <span className="font-semibold">₪{amount}</span>
                                        </div>
                                        {productType === 'plan' && (
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>תוקף</span>
                                                <span>
                                                    {product.billing_type === 'monthly' ? 'חודש' :
                                                     product.billing_type === 'yearly' ? 'שנה' : 'חד פעמי'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Total */}
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-bold">סה"כ לתשלום</span>
                                            <span className="text-2xl font-bold text-[#27AE60]">₪{amount}</span>
                                        </div>
                                    </div>

                                    {/* Checkout Button */}
                                    <Button
                                        onClick={handleCheckout}
                                        disabled={processing}
                                        className="w-full bg-[#27AE60] hover:bg-[#2ECC71] h-12 text-lg mt-4"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                                                מעבד...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5 ml-2" />
                                                המשך לתשלום
                                            </>
                                        )}
                                    </Button>

                                    {/* Security Notice */}
                                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-4">
                                        <ShieldCheck className="w-4 h-4" />
                                        התשלום מאובטח ומוצפן ב-Stripe
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* User Info */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">פרטי החשבון</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">שם</p>
                                        <p className="font-semibold">{user?.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">אימייל</p>
                                        <p className="text-sm">{user?.email}</p>
                                    </div>

                                    {/* Info Box */}
                                    <div className="bg-blue-50 p-3 rounded-lg mt-4">
                                        <p className="text-xs text-blue-900">
                                            ✨ לאחר התשלום, ההרשאות שלך יעודכנו מיד.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="mt-6 text-center">
                        <Button 
                            variant="outline" 
                            onClick={() => navigate('/ClientDashboard')}
                            disabled={processing}
                        >
                            <ArrowRight className="w-4 h-4 ml-2" />
                            חזור לדשבורד
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}