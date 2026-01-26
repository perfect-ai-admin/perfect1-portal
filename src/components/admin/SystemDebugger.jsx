import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Wrench, Search, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function SystemDebugger() {
    const [phoneSearch, setPhoneSearch] = useState('');
    const [debugResult, setDebugResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fixing, setFixing] = useState(false);

    const searchUser = async () => {
        if (!phoneSearch) {
            toast.error('הזן מספר טלפון');
            return;
        }

        setLoading(true);
        setDebugResult(null);

        try {
            const normalizedPhone = normalizePhone(phoneSearch);
            
            // חיפוש CRMLead
            const leads = await base44.entities.CRMLead.filter({ 
                phone_normalized: normalizedPhone 
            });

            let userObj = null;
            let goals = [];
            let issues = [];

            const lead = leads?.[0];

            if (!lead) {
                issues.push('❌ CRMLead לא נמצא');
            } else {
                // בדיקות על ה-Lead
                if (!lead.phone_normalized) issues.push('⚠️ phone_normalized חסר ב-CRMLead');
                if (!lead.user_id) issues.push('⚠️ user_id חסר ב-CRMLead');
                if (!lead.current_goal_id) issues.push('⚠️ current_goal_id חסר ב-CRMLead');

                // חיפוש User
                if (lead.user_id) {
                    try {
                        const allUsers = await base44.entities.User.list();
                        userObj = allUsers.find(u => u.id === lead.user_id);
                        if (!userObj) issues.push('⚠️ User לא נמצא למרות user_id ב-CRMLead');
                    } catch (err) {
                        issues.push('❌ שגיאה בשליפת User: ' + err.message);
                    }
                }

                // חיפוש מטרות
                if (lead.user_id) {
                    try {
                        goals = await base44.entities.UserGoal.filter({ 
                            user_id: lead.user_id 
                        });
                        if (goals.length === 0) issues.push('⚠️ אין מטרות ל-User');
                    } catch (err) {
                        issues.push('❌ שגיאה בשליפת מטרות: ' + err.message);
                    }
                }

                // בדיקת התאמה current_goal_id
                if (lead.current_goal_id && goals.length > 0) {
                    const goalExists = goals.find(g => g.id === lead.current_goal_id);
                    if (!goalExists) {
                        issues.push('❌ current_goal_id מצביע על מטרה לא קיימת!');
                    }
                }
            }

            setDebugResult({
                phone: phoneSearch,
                normalizedPhone,
                lead,
                user: userObj,
                goals,
                issues,
                healthy: issues.length === 0
            });

        } catch (error) {
            toast.error('שגיאה: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fixAllLeads = async () => {
        setFixing(true);
        try {
            const response = await base44.functions.invoke('fixMissingPhoneNormalized', {});
            toast.success(`תוקנו ${response.data.fixed} לידים`);
        } catch (err) {
            toast.error('שגיאה: ' + err.message);
        } finally {
            setFixing(false);
        }
    };

    const syncSpecificLead = async () => {
        if (!debugResult?.lead?.id) {
            toast.error('לא נמצא ליד לסנכרון');
            return;
        }

        setLoading(true);
        try {
            const response = await base44.functions.invoke('stateSynchronizer', {
                lead_id: debugResult.lead.id
            });

            toast.success('סנכרון הושלם');
            
            // רענן את הנתונים
            await searchUser();
        } catch (err) {
            toast.error('שגיאה בסנכרון: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const autoFixLead = async () => {
        if (!debugResult?.lead?.id) {
            toast.error('לא נמצא ליד לתיקון');
            return;
        }

        setLoading(true);
        try {
            const response = await base44.functions.invoke('autoFixLeadLinks', {
                lead_id: debugResult.lead.id,
                phone: debugResult.phone
            });

            toast.success(response.data.message || 'תיקון הושלם');
            
            // רענן את הנתונים
            await searchUser();
        } catch (err) {
            toast.error('שגיאה בתיקון: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-red-600" />
                        מערכת דיבאג - איתור בעיות
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="הזן מספר טלפון (050-1234567)"
                            value={phoneSearch}
                            onChange={(e) => setPhoneSearch(e.target.value)}
                            dir="ltr"
                            className="text-left"
                        />
                        <Button onClick={searchUser} disabled={loading}>
                            <Search className="w-4 h-4 mr-2" />
                            חפש
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={fixAllLeads} 
                            disabled={fixing}
                            className="bg-orange-50 border-orange-200"
                        >
                            <Wrench className="w-4 h-4 mr-2" />
                            {fixing ? 'מתקן...' : 'תקן כל ה-CRMLeads (phone_normalized)'}
                        </Button>

                        {debugResult?.lead && (
                            <>
                                <Button 
                                    variant="outline" 
                                    onClick={syncSpecificLead}
                                    className="bg-blue-50 border-blue-200"
                                >
                                    <Zap className="w-4 h-4 mr-2" />
                                    סנכרן ליד זה
                                </Button>
                                
                                {debugResult.issues.length > 0 && (
                                    <Button 
                                        variant="outline" 
                                        onClick={autoFixLead}
                                        className="bg-green-50 border-green-200"
                                    >
                                        <Wrench className="w-4 h-4 mr-2" />
                                        תקן אוטומטית
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    {debugResult && (
                        <div className="mt-6 space-y-4">
                            {/* סטטוס כללי */}
                            <div className={`p-4 rounded-lg ${debugResult.healthy ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                {debugResult.healthy ? (
                                    <div className="flex items-center gap-2 text-green-800">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-semibold">הכל תקין ✅</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-red-800">
                                            <AlertCircle className="w-5 h-5" />
                                            <span className="font-semibold">נמצאו {debugResult.issues.length} בעיות:</span>
                                        </div>
                                        <ul className="mr-6 space-y-1 text-sm text-red-700">
                                            {debugResult.issues.map((issue, idx) => (
                                                <li key={idx}>{issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* CRMLead */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">CRMLead</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {debugResult.lead ? (
                                        <div className="space-y-2 text-sm font-mono">
                                            <div><strong>ID:</strong> {debugResult.lead.id}</div>
                                            <div><strong>user_id:</strong> {debugResult.lead.user_id || '❌ חסר'}</div>
                                            <div><strong>current_goal_id:</strong> {debugResult.lead.current_goal_id || '❌ חסר'}</div>
                                            <div><strong>phone_normalized:</strong> {debugResult.lead.phone_normalized || '❌ חסר'}</div>
                                            <div><strong>active_handler:</strong> {debugResult.lead.active_handler}</div>
                                            <div><strong>waiting_for_response:</strong> {debugResult.lead.waiting_for_response ? 'כן' : 'לא'}</div>
                                        </div>
                                    ) : (
                                        <div className="text-red-600">לא נמצא</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* User */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">User</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {debugResult.user ? (
                                        <div className="space-y-2 text-sm font-mono">
                                            <div><strong>ID:</strong> {debugResult.user.id}</div>
                                            <div><strong>Email:</strong> {debugResult.user.email}</div>
                                            <div><strong>Phone:</strong> {debugResult.user.phone || 'חסר'}</div>
                                        </div>
                                    ) : (
                                        <div className="text-orange-600">לא נמצא / לא מקושר</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Goals */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">מטרות ({debugResult.goals.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {debugResult.goals.length > 0 ? (
                                        <div className="space-y-3">
                                            {debugResult.goals.map(goal => (
                                                <div key={goal.id} className="p-3 bg-gray-50 rounded border text-sm">
                                                    <div><strong>ID:</strong> {goal.id}</div>
                                                    <div><strong>כותרת:</strong> {goal.title}</div>
                                                    <div><strong>סטטוס:</strong> {goal.status}</div>
                                                    <div><strong>is_first_goal:</strong> {goal.is_first_goal ? 'כן ✅' : 'לא'}</div>
                                                    <div><strong>user_id:</strong> {goal.user_id || '❌ חסר'}</div>
                                                    <div><strong>lead_id:</strong> {goal.lead_id || '❌ חסר'}</div>
                                                    <div><strong>mentor_stage:</strong> {goal.flow_data?.mentor_stage || 'לא מוגדר'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-red-600">אין מטרות</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function normalizePhone(phone) {
    if (!phone) return null;
    let cleaned = phone.toString().replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '972' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('972')) {
        cleaned = '972' + cleaned;
    }
    return cleaned;
}