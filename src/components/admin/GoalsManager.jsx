import React, { useState, useEffect } from 'react';
import { invokeFunction } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Target, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GoalsManager() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        setLoading(true);
       
        const allGoals = [];
        setGoals(allGoals.sort((a, b) => a.display_order - b.display_order));
        setLoading(false);
    };

    const toggleActive = async (goalId, currentStatus) => {
        try {
           
            toast.success('סטטוס המטרה עודכן');
            loadGoals();
        } catch (error) {
            toast.error('שגיאה בעדכון המטרה');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    ניהול קטלוג מטרות
                </h2>
                <Button className="bg-[#27AE60] hover:bg-[#2ECC71]">
                    <Plus className="w-4 h-4 ml-2" />
                    מטרה חדשה
                </Button>
            </div>

            <div className="grid gap-4">
                {goals.map(goal => (
                    <div key={goal.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold">{goal.name}</h3>
                                    <Badge 
                                        className={
                                            goal.category === 'marketing' ? 'bg-purple-100 text-purple-800' :
                                            goal.category === 'sales' ? 'bg-blue-100 text-blue-800' :
                                            goal.category === 'finance' ? 'bg-green-100 text-green-800' :
                                            goal.category === 'operations' ? 'bg-orange-100 text-orange-800' :
                                            'bg-red-100 text-red-800'
                                        }
                                    >
                                        {goal.category}
                                    </Badge>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{goal.description}</p>
                                <div className="flex gap-2 text-xs text-gray-500">
                                    <span>⏱️ {goal.estimated_duration_days} ימים</span>
                                    <span>📋 {goal.tasks?.length || 0} משימות</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={goal.is_active}
                                    onCheckedChange={() => toggleActive(goal.id, goal.is_active)}
                                />
                                <Button size="sm" variant="outline">
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}