import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, MousePointerClick, FileText, Activity, Image, Presentation, Smile } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function DashboardOverview({ loginData }) {
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Pass bypass details if available
                const payload = loginData ? { 
                    bypassCode: loginData.code, 
                    phone: loginData.phone 
                } : {};

                const response = await base44.functions.invoke('adminGetDashboardStats', payload);
                if (response.data) {
                    setStats(response.data.stats);
                    setRecentActivity(response.data.recentActivity || []);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
            <Skeleton className="h-64 w-full" />
        </div>;
    }

    if (!stats) return null;

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">משתמשים</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users.total}</div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.users.new_this_month} החודש
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.users.active} פעילים
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">הכנסות (החודש)</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₪{stats.revenue.this_month.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            סה״כ בכל הזמנים: ₪{stats.revenue.total.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">דפי נחיתה</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.landingPages.published}</div>
                        <p className="text-xs text-muted-foreground">
                            מתוך {stats.landingPages.total} סה״כ
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">לוגואים</CardTitle>
                        <Image className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.products?.logos || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            נרכשו בהצלחה
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">מצגות</CardTitle>
                        <Presentation className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.products?.presentations || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            נרכשו בהצלחה
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">סטיקרים</CardTitle>
                        <Smile className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.products?.stickers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            נרכשו בהצלחה
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        פעילות אחרונה במערכת
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">אין פעילות אחרונה להצגה</p>
                        ) : (
                            recentActivity.map((log) => (
                                <div key={log.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-medium">{log.action}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {log.entity_name} • {typeof log.details === 'object' && log.details !== null 
                                                ? JSON.stringify(log.details) 
                                                : log.details}
                                        </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-left" dir="ltr">
                                        {format(new Date(log.created_date), 'dd/MM/yyyy HH:mm')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}