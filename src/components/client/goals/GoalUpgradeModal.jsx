import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, TrendingUp } from 'lucide-react';
import { entities } from '@/api/supabaseClient';

export default function GoalUpgradeModal({ upgradeData, user, onClose }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        const allPlans = await entities.Plan.filter({ is_active: true });
        // Sort by goals_limit descending
        setPlans(allPlans.sort((a, b) => (b.goals_limit ?? 999) - (a.goals_limit ?? 999)));
        setLoading(false);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Lock className="w-6 h-6 text-orange-600" />
                        הגעת למכסת המטרות
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-orange-900 mb-2">
                            😊 אתה משתמש בהצלחה במטרות!
                        </p>
                        <p className="text-orange-800">
                            בחרת ב-{upgradeData.current_count} מטרות והגעת למכסה של {upgradeData.limit}.
                            <br />
                            שדרג את המסלול שלך כדי לבחור בעוד מטרות.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-3">מסלולים זמינים</h3>
                        <div className="grid gap-3">
                            {plans.map(plan => (
                                <div 
                                    key={plan.id} 
                                    className="border-2 rounded-lg p-4 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-bold text-lg">{plan.name}</h4>
                                            <p className="text-2xl font-bold text-[#27AE60] mt-1">
                                                ₪{plan.price}
                                                <span className="text-sm text-gray-600 ml-2">
                                                    {plan.billing_type === 'monthly' ? '/חודש' : 
                                                     plan.billing_type === 'yearly' ? '/שנה' : 'חד פעמי'}
                                                </span>
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    🎯 {plan.goals_limit === null ? 'ללא הגבלה' : `${plan.goals_limit} מטרות`}
                                                </Badge>
                                                {plan.marketing_enabled && (
                                                    <Badge className="bg-purple-100 text-purple-800">שיווק</Badge>
                                                )}
                                                {plan.finance_enabled && (
                                                    <Badge className="bg-green-100 text-green-800">פיננסים</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button 
                                            className="bg-[#27AE60] hover:bg-[#2ECC71]"
                                            onClick={() => {
                                                // TODO: Navigate to checkout
                                                console.log('Upgrade to:', plan.id);
                                            }}
                                        >
                                            <TrendingUp className="w-4 h-4 ml-2" />
                                            שדרג
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-900">
                            💡 <strong>טיפ:</strong> אתה יכול גם להפעיל מטרה אחת בכל פעם במקום לבחור הרבה בבת אחת.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}