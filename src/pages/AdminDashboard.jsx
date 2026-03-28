import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, LayoutDashboard, CreditCard, FileText, Activity, Receipt } from 'lucide-react';
import UsersTable from '../components/admin/UsersTable';
import SystemConfigManager from '../components/admin/SystemConfigManager';
import InviteUserDialog from '../components/admin/InviteUserDialog';
import DashboardOverview from '../components/admin/DashboardOverview';
import PaymentsManager from '../components/admin/PaymentsManager';
import LandingPagesManager from '../components/admin/LandingPagesManager';
import ActivityLogView from '../components/admin/ActivityLogView';
import BillingDocumentsManager from '../components/admin/BillingDocumentsManager';
import { auth } from '@/api/supabaseClient';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const currentUser = await auth.me();
            if (currentUser && currentUser.role === 'admin') {
                setUser(currentUser);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center">
                <div className="text-white text-xl">טוען...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center p-4" dir="rtl">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
                    <Shield className="w-12 h-12 text-[#1E3A5F] mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">אין הרשאת מנהל</h1>
                    <p className="text-gray-500 mb-6">אתה מחובר אבל אין לך הרשאת אדמין לעמוד הזה.</p>
                    <div className="space-y-3">
                        <Button 
                            className="w-full bg-[#1E3A5F] hover:bg-[#2C5282]"
                            onClick={() => window.location.href = '/APP'}
                        >
                            חזרה לדשבורד
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                auth.logout('/AdminDashboard');
                            }}
                        >
                            התחבר עם חשבון אחר
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>ניהול מערכת - BizPilot Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-gray-50" dir="rtl">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white p-6 shadow-lg">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Shield className="w-10 h-10" />
                                <div>
                                    <h1 className="text-3xl font-bold">ניהול מערכת</h1>
                                    <p className="text-white/80">שלום, {user?.full_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <InviteUserDialog />
                                <Button 
                                    variant="outline" 
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    onClick={() => window.location.href = '/'}
                                >
                                    חזרה לאתר
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid grid-cols-7 gap-2 bg-white p-2 rounded-xl shadow-md overflow-x-auto">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="hidden sm:inline">ראשי</span>
                            </TabsTrigger>
                            <TabsTrigger value="users" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span className="hidden sm:inline">משתמשים</span>
                            </TabsTrigger>
                            <TabsTrigger value="payments" className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                <span className="hidden sm:inline">תשלומים ומסלולים</span>
                            </TabsTrigger>
                            <TabsTrigger value="landing_pages" className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="hidden sm:inline">דפי נחיתה</span>
                            </TabsTrigger>
                            <TabsTrigger value="billing" className="flex items-center gap-2">
                                <Receipt className="w-4 h-4" />
                                <span className="hidden sm:inline">חשבוניות</span>
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                <span className="hidden sm:inline">פעילות</span>
                            </TabsTrigger>
                            <TabsTrigger value="system" className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span className="hidden sm:inline">מערכת</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            <DashboardOverview />
                        </TabsContent>

                        <TabsContent value="users">
                            <UsersTable />
                        </TabsContent>

                        <TabsContent value="payments">
                            <PaymentsManager />
                        </TabsContent>

                        <TabsContent value="landing_pages">
                            <LandingPagesManager />
                        </TabsContent>

                        <TabsContent value="billing">
                            <BillingDocumentsManager />
                        </TabsContent>

                        <TabsContent value="activity">
                            <ActivityLogView />
                        </TabsContent>

                        <TabsContent value="system">
                            <SystemConfigManager />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}