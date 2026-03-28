import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import GoalUpgradeModal from './GoalUpgradeModal';
import { entities, invokeFunction } from '@/api/supabaseClient';

export default function GoalsCatalog({ user, userGoals, onUpdate }) {
    const [allGoals, setAllGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeData, setUpgradeData] = useState(null);

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        const goals = await entities.Goal.filter({ is_active: true });
        setAllGoals(goals.sort((a, b) => a.display_order - b.display_order));
        setLoading(false);
    };

    const isGoalSelected = (goalId) => {
        return userGoals.some(ug => ug.goal_id === goalId);
    };

    const isGoalActive = (goalId) => {
        const ug = userGoals.find(ug => ug.goal_id === goalId);
        return ug?.status === 'active';
    };

    const handleSelectGoal = async (goal, activate = false) => {
        try {
            const response = await invokeFunction('selectGoal', {
                goal_id: goal.id,
                activate: activate
            });

            if (response.success) {
                toast.success(response.message);
                onUpdate();
            }
        } catch (error) {
            if (error.message?.includes('goals_limit_reached')) {
                setUpgradeData({ error: 'goals_limit_reached' });
                setShowUpgrade(true);
            } else {
                toast.error(error.message || 'שגיאה');
            }
        }
    };

    const handleActivateGoal = async (userGoalId) => {
        try {
            const response = await invokeFunction('activateGoal', {
                user_goal_id: userGoalId
            });

            if (response.success) {
                toast.success(response.message);
                onUpdate();
            }
        } catch (error) {
            toast.error('שגיאה בהפעלת המטרה');
        }
    };

    const goalsLimit = user.goals_limit_override ?? user.goals_limit;
    const selectedGoalsCount = userGoals.filter(ug => 
        ug.status === 'selected' || ug.status === 'active'
    ).length;
    const canSelectMore = goalsLimit === null || selectedGoalsCount < goalsLimit;

    const getCategoryColor = (category) => {
        const colors = {
            marketing: 'bg-purple-100 text-purple-800',
            sales: 'bg-blue-100 text-blue-800',
            finance: 'bg-green-100 text-green-800',
            operations: 'bg-orange-100 text-orange-800',
            growth: 'bg-red-100 text-red-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="text-center py-8">טוען מטרות...</div>;
    }

    return (
        <>
            <div className="space-y-4">
                {/* Counter */}
                <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">מטרות נבחרות</p>
                            <p className="text-3xl font-bold">
                                {selectedGoalsCount}/{goalsLimit === null ? '∞' : goalsLimit}
                            </p>
                        </div>
                        <TrendingUp className="w-10 h-10 opacity-50" />
                    </div>
                </div>

                {/* Available Goals Grid */}
                <div>
                    <h3 className="font-semibold text-lg mb-3">קטלוג מטרות</h3>
                    <div className="grid gap-3">
                        {allGoals.map(goal => {
                            const isSelected = isGoalSelected(goal.id);
                            const isActive = isGoalActive(goal.id);
                            const userGoal = userGoals.find(ug => ug.goal_id === goal.id);

                            return (
                                <div
                                    key={goal.id}
                                    className={`border-2 rounded-lg p-4 transition-all ${
                                        isSelected ? 'border-[#27AE60] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold">{goal.name}</h4>
                                                <Badge className={getCategoryColor(goal.category)}>
                                                    {goal.category}
                                                </Badge>
                                                {isActive && (
                                                    <Badge className="bg-yellow-100 text-yellow-800">פעיל</Badge>
                                                )}
                                                {isSelected && !isActive && (
                                                    <Badge className="bg-gray-100 text-gray-800">נבחר</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                                            <div className="flex gap-2 text-xs text-gray-500">
                                                <span>⏱️ {goal.estimated_duration_days} ימים</span>
                                                <span>📋 {goal.tasks?.length || 0} משימות</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">
                                            {!isSelected ? (
                                                <Button
                                                    size="sm"
                                                    className="bg-[#27AE60] hover:bg-[#2ECC71]"
                                                    onClick={() => handleSelectGoal(goal, false)}
                                                    disabled={!canSelectMore}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            ) : isActive ? (
                                                <Badge className="bg-[#27AE60] text-white">פעיל ✓</Badge>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleActivateGoal(userGoal.id)}
                                                >
                                                    הפעל
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Upgrade Modal */}
            {showUpgrade && (
                <GoalUpgradeModal
                    upgradeData={upgradeData}
                    user={user}
                    onClose={() => setShowUpgrade(false)}
                />
            )}
        </>
    );
}