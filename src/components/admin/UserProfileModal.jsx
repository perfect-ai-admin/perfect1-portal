import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, User, Shield, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfileModal({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        status: user.status || 'active',
        is_admin: user.is_admin || false,
        marketing_enabled: user.marketing_enabled || false,
        mentor_enabled: user.mentor_enabled || false,
        finance_enabled: user.finance_enabled || false,
        goals_limit_override: user.goals_limit_override || null,
        max_active_goals_override: user.max_active_goals_override || null
    });
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(user.current_plan_id || '');
    const [saving, setSaving] = useState(false);
    const [journeyData, setJourneyData] = useState(null);

    useEffect(() => {
        loadPlans();
        loadJourneyStatus();
    }, []);

    const loadJourneyStatus = async () => {
        try {
            // 1. Check UserGoals (הגדרה: קיבל מטרות ותוכנית)
            // נבדוק אם יש לפחות מטרה אחת למשתמש
            const goals = await base44.entities.UserGoal.filter({ user_id: user.id }, 1);
            if (goals.data && goals.data.length > 0) {
                setJourneyData({ started: true, type: 'goals', details: 'קיבל מטרות ותוכנית עבודה' });
                return;
            }

            // 2. Check BusinessJourney entity (תהליך רשמי)
            const journeys = await base44.entities.BusinessJourney.filter({ user_id: user.id });
            if (journeys.data && journeys.data.length > 0) {
                setJourneyData({ started: true, type: 'business_journey', details: 'תהליך מסע עסקי פעיל' });
                return;
            }

            // 3. Check CRMLead by email as fallback
            if (user.email) {
                const leads = await base44.entities.CRMLead.filter({ email: user.email });
                if (leads.data && leads.data.length > 0) {
                    const lead = leads.data[0];
                    // אם הסטטוס מתקדם או שיש תשובות לשאלון
                    if (lead.journey_stage && lead.journey_stage !== 'lead_new') {
                        setJourneyData({ started: true, type: 'crm_lead', details: `סטטוס ליד: ${lead.journey_stage}` });
                        return;
                    }
                    if (lead.business_journey_answers && Object.keys(lead.business_journey_answers).length > 0) {
                        setJourneyData({ started: true, type: 'crm_lead_answers', details: 'מילא שאלון מסע (טרם קיבל מטרות)' });
                        return;
                    }
                }
            }

            // אם לא נמצא שום אינדיקציה
            setJourneyData(null);
        } catch (error) {
            console.error("Error checking journey status:", error);
        }
    };

    const loadPlans = async () => {
        const allPlans = await base44.entities.Plan.list();
        setPlans(allPlans);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await base44.functions.invoke('adminUpdateUser', {
                user_id: user.id,
                updates: formData
            });
            toast.success('המשתמש עודכן בהצלחה');
            onUpdate();
            onClose();
        } catch (error) {
            toast.error('שגיאה בעדכון המשתמש');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleAssignPlan = async () => {
        if (!selectedPlan) return;
        setSaving(true);
        try {
            await base44.functions.invoke('assignPlanToUser', {
                user_id: user.id,
                plan_id: selectedPlan
            });
            toast.success('המסלול שויך בהצלחה');
            onUpdate();
            onClose();
        } catch (error) {
            toast.error('שגיאה בשיוך המסלול');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <User className="w-6 h-6" />
                        ניהול משתמש - {user.full_name}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="info" className="mt-4">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="info">מידע בסיסי</TabsTrigger>
                        <TabsTrigger value="permissions">הרשאות</TabsTrigger>
                        <TabsTrigger value="plan">מסלול</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>שם מלא</Label>
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>אימייל</Label>
                                <Input
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>טלפון</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>סטטוס</Label>
                                <Select 
                                    value={formData.status} 
                                    onValueChange={(val) => setFormData({...formData, status: val})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">פעיל</SelectItem>
                                        <SelectItem value="paused">מושהה</SelectItem>
                                        <SelectItem value="blocked">חסום</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-orange-600" />
                                <Label>הרשאות מנהל</Label>
                            </div>
                            <Switch
                                checked={formData.is_admin}
                                onCheckedChange={(checked) => setFormData({...formData, is_admin: checked})}
                            />
                        </div>

                        {/* Journey Status Indicator */}
                        <div className={`p-4 rounded-lg flex items-center justify-between ${journeyData ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                                <Target className={`w-5 h-5 ${journeyData ? 'text-blue-600' : 'text-gray-400'}`} />
                                <div>
                                    <div className="font-medium text-gray-900">סטטוס מסע לקוח</div>
                                    <div className="text-sm text-gray-500">
                                        {journeyData ? journeyData.details : 'טרם התחיל מסע'}
                                    </div>
                                </div>
                            </div>
                            {journeyData && (
                                <Badge className="bg-blue-600 hover:bg-blue-700">פעיל</Badge>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="permissions" className="space-y-4 mt-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                                <Label>מודול שיווק</Label>
                                <Switch
                                    checked={formData.marketing_enabled}
                                    onCheckedChange={(checked) => setFormData({...formData, marketing_enabled: checked})}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <Label>מודול מנטור</Label>
                                <Switch
                                    checked={formData.mentor_enabled}
                                    onCheckedChange={(checked) => setFormData({...formData, mentor_enabled: checked})}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <Label>מודול פיננסים</Label>
                                <Switch
                                    checked={formData.finance_enabled}
                                    onCheckedChange={(checked) => setFormData({...formData, finance_enabled: checked})}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                עקיפת מכסות מטרות
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>מכסת מטרות (Override)</Label>
                                    <Input
                                        type="number"
                                        placeholder={`ברירת מחדל: ${user.goals_limit || 1}`}
                                        value={formData.goals_limit_override || ''}
                                        onChange={(e) => setFormData({...formData, goals_limit_override: e.target.value ? parseInt(e.target.value) : null})}
                                    />
                                </div>
                                <div>
                                    <Label>מקסימום מטרות פעילות (Override)</Label>
                                    <Input
                                        type="number"
                                        placeholder={`ברירת מחדל: ${user.max_active_goals || 1}`}
                                        value={formData.max_active_goals_override || ''}
                                        onChange={(e) => setFormData({...formData, max_active_goals_override: e.target.value ? parseInt(e.target.value) : null})}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="plan" className="space-y-4 mt-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">מסלול נוכחי</h3>
                            {user.current_plan_id ? (
                                <Badge className="bg-[#27AE60] text-white">מסלול פעיל</Badge>
                            ) : (
                                <p className="text-gray-500">אין מסלול פעיל</p>
                            )}
                        </div>

                        <div>
                            <Label>שיוך מסלול חדש</Label>
                            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                                <SelectTrigger>
                                    <SelectValue placeholder="בחר מסלול..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.map(plan => (
                                        <SelectItem key={plan.id} value={plan.id}>
                                            {plan.name} - ₪{plan.price}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                className="mt-2 w-full bg-[#27AE60] hover:bg-[#2ECC71]"
                                onClick={handleAssignPlan}
                                disabled={!selectedPlan || saving}
                            >
                                שייך מסלול
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex gap-2 mt-6">
                    <Button 
                        className="flex-1 bg-[#1E3A5F] hover:bg-[#2C5282]"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save className="w-4 h-4 ml-2" />
                        שמור שינויים
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        <X className="w-4 h-4 ml-2" />
                        ביטול
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}