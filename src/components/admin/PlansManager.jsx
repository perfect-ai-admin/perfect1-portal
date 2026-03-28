import React, { useState, useEffect } from 'react';
import { invokeFunction } from '@/api/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';

export default function PlansManager() {
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
       
        const allPlans = [];
        setPlans(allPlans.sort((a, b) => a.display_order - b.display_order));
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <CreditCard className="w-6 h-6" />
                ניהול מסלולים
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
                {plans.map(plan => (
                    <div key={plan.id} className="border-2 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <p className="text-3xl font-bold text-[#27AE60] mt-2">
                                    ₪{plan.price}
                                    <span className="text-sm text-gray-500">/{plan.billing_type === 'monthly' ? 'חודש' : plan.billing_type === 'yearly' ? 'שנה' : 'חד פעמי'}</span>
                                </p>
                            </div>
                            <Badge className={plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {plan.is_active ? 'פעיל' : 'לא פעיל'}
                            </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                {plan.marketing_enabled ? '✅' : '❌'} מודול שיווק
                            </div>
                            <div className="flex items-center gap-2">
                                {plan.mentor_enabled ? '✅' : '❌'} מודול מנטור
                            </div>
                            <div className="flex items-center gap-2">
                                {plan.finance_enabled ? '✅' : '❌'} מודול פיננסים
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                🎯 {plan.goals_limit === null ? 'ללא הגבלה' : `עד ${plan.goals_limit} מטרות`}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                ⚡ {plan.max_active_goals} מטרות פעילות במקביל
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}