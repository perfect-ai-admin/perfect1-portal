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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, X, User, Shield, Target, CreditCard, FileText, Activity, MousePointerClick } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
    const [extendedData, setExtendedData] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(true);

    useEffect(() => {
        loadPlans();
        loadFullDetails();
    }, []);

    const loadFullDetails = async () => {
        setLoadingDetails(true);
        try {
            const response = await base44.functions.invoke('adminGetUserFullDetails', { user_id: user.id });
            if (response.data) {
                setExtendedData(response.data);
            }
        } catch (error) {
            console.error("Failed to load user details", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const loadPlans = async () => {
        const allPlans = await base44.entities.Plan.list();
        setPlans(allPlans);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = { ...formData };
            if (updates.goals_limit_override === '') updates.goals_limit_override = null;
            if (updates.max_active_goals_override === '') updates.max_active_goals_override = null;

            const response = await base44.functions.invoke('adminUpdateUser', {
                user_id: user.id,
                updates: updates
            });
            
            if (response.data?.error) {
                throw new Error(response.data.error);
            }

            toast.success('המשתמש עודכן בהצלחה');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Update failed:', error);
            const errorMessage = error.response?.data?.error || error.message || 'שגיאה לא ידועה';
            toast.error(`שגיאה בעדכון המשתמש: ${errorMessage}`);
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
            loadFullDetails(); // Reload to reflect changes
        } catch (error) {
            toast.error('שגיאה בשיוך המסלול');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <User className="w-6 h-6" />
                        ניהול משתמש - {user.full_name}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="info" className="mt-4">
                    <TabsList className="grid grid-cols-6 w-full">
                        <TabsTrigger value="info">פרטים</TabsTrigger>
                        <TabsTrigger value="permissions">הרשאות</TabsTrigger>
                        <TabsTrigger value="plan">מסלול</TabsTrigger>
                        <TabsTrigger value="financial">פיננסי</TabsTrigger>
                        <TabsTrigger value="marketing">שיווק</TabsTrigger>
                        <TabsTrigger value="activity">פעילות</TabsTrigger>
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
                                    placeholder="0502277087"
                                    dir="ltr"
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
                                        <SelectItem value="active">🟢 פעיל</SelectItem>
                                        <SelectItem value="paused">🟡 מושהה</SelectItem>
                                        <SelectItem value="blocked">🔴 חסום</SelectItem>
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

                    <TabsContent value="financial" className="mt-4">
                        {loadingDetails ? <p>טוען נתונים...</p> : (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <h3 className="font-bold text-green-800">LTV: ₪{extendedData?.ltv?.toLocaleString()}</h3>
                                    <p className="text-sm text-green-600">סך הכנסות מצטברות מהלקוח</p>
                                </div>
                                <h3 className="font-semibold flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    היסטוריית תשלומים
                                </h3>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-right">תאריך</TableHead>
                                                <TableHead className="text-right">מוצר</TableHead>
                                                <TableHead className="text-right">סכום</TableHead>
                                                <TableHead className="text-right">סטטוס</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {extendedData?.payments?.length === 0 ? (
                                                <TableRow><TableCell colSpan={4} className="text-center">אין תשלומים</TableCell></TableRow>
                                            ) : (
                                                extendedData?.payments?.map(p => (
                                                    <TableRow key={p.id}>
                                                        <TableCell>{format(new Date(p.created_date), 'dd/MM/yyyy')}</TableCell>
                                                        <TableCell>{p.product_name}</TableCell>
                                                        <TableCell>₪{p.amount}</TableCell>
                                                        <TableCell><Badge>{p.status}</Badge></TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="marketing" className="mt-4">
                         {loadingDetails ? <p>טוען נתונים...</p> : (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4" />
                                        דפי נחיתה
                                    </h3>
                                    <div className="border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-right">שם העסק</TableHead>
                                                    <TableHead className="text-right">סטטוס</TableHead>
                                                    <TableHead className="text-right">תאריך</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {extendedData?.landingPages?.length === 0 ? (
                                                    <TableRow><TableCell colSpan={3} className="text-center">אין דפי נחיתה</TableCell></TableRow>
                                                ) : (
                                                    extendedData?.landingPages?.map(lp => (
                                                        <TableRow key={lp.id}>
                                                            <TableCell>{lp.business_name}</TableCell>
                                                            <TableCell><Badge>{lp.status}</Badge></TableCell>
                                                            <TableCell>{format(new Date(lp.created_date), 'dd/MM/yyyy')}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                                        <MousePointerClick className="w-4 h-4" />
                                        לידים אחרונים
                                    </h3>
                                    <div className="border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-right">שם</TableHead>
                                                    <TableHead className="text-right">טלפון</TableHead>
                                                    <TableHead className="text-right">תאריך</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {extendedData?.leads?.length === 0 ? (
                                                    <TableRow><TableCell colSpan={3} className="text-center">אין לידים</TableCell></TableRow>
                                                ) : (
                                                    extendedData?.leads?.map(lead => (
                                                        <TableRow key={lead.id}>
                                                            <TableCell>{lead.name}</TableCell>
                                                            <TableCell>{lead.phone}</TableCell>
                                                            <TableCell>{format(new Date(lead.created_date), 'dd/MM/yyyy')}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="activity" className="mt-4">
                         {loadingDetails ? <p>טוען נתונים...</p> : (
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    יומן פעילות
                                </h3>
                                <div className="border rounded-md max-h-60 overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-right">פעולה</TableHead>
                                                <TableHead className="text-right">פרטים</TableHead>
                                                <TableHead className="text-right">תאריך</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {extendedData?.activityLog?.length === 0 ? (
                                                <TableRow><TableCell colSpan={3} className="text-center">אין פעילות</TableCell></TableRow>
                                            ) : (
                                                extendedData?.activityLog?.map(log => (
                                                    <TableRow key={log.id}>
                                                        <TableCell>{log.action}</TableCell>
                                                        <TableCell>
                                                            {typeof log.details === 'object' && log.details !== null 
                                                                ? JSON.stringify(log.details) 
                                                                : log.details}
                                                        </TableCell>
                                                        <TableCell dir="ltr" className="text-left">{format(new Date(log.created_date), 'dd/MM/yyyy HH:mm')}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
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