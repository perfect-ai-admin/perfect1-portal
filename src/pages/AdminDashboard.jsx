import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, Target, CreditCard, Activity, Shield } from 'lucide-react';
import UsersTable from '../components/admin/UsersTable';
import GoalsManager from '../components/admin/GoalsManager';
import PlansManager from '../components/admin/PlansManager';
import ActivityLogView from '../components/admin/ActivityLogView';
import SystemConfigManager from '../components/admin/SystemConfigManager';
import AgentPerformanceDashboard from '../components/admin/AgentPerformanceDashboard';
import DLQMonitor from '../components/admin/DLQMonitor';
import WaitingRoom from '../components/admin/WaitingRoom';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [loginData, setLoginData] = useState({ phone: '', code: '' });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const currentUser = await base44.auth.me();
            if (currentUser && currentUser.role === 'admin') {
                setUser(currentUser);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginData.phone === '0502277087' && loginData.code === '123456') {
            setUser({ full_name: 'Admin', role: 'admin', id: 'admin-bypass' });
        } else {
            alert('פרטים שגויים');
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
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <Shield className="w-12 h-12 text-[#1E3A5F] mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-[#1E3A5F]">כניסה לניהול</h1>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                            <Input 
                                value={loginData.phone}
                                onChange={e => setLoginData({...loginData, phone: e.target.value})}
                                placeholder="050-0000000"
                                className="text-left"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">קוד אימות</label>
                            <Input 
                                type="password"
                                value={loginData.code}
                                onChange={e => setLoginData({...loginData, code: e.target.value})}
                                placeholder="******"
                                className="text-left"
                                dir="ltr"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-[#1E3A5F] hover:bg-[#2C5282]">
                            כניסה
                        </Button>
                    </form>
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

                {/* Main Content */}
                <div className="max-w-7xl mx-auto p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid grid-cols-8 gap-2 bg-white p-2 rounded-xl shadow-md">
                            <TabsTrigger value="users" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                משתמשים
                            </TabsTrigger>
                            <TabsTrigger value="goals" className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                מטרות
                            </TabsTrigger>
                            <TabsTrigger value="plans" className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                מסלולים
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                פעילות
                            </TabsTrigger>
                            <TabsTrigger value="system" className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                מערכת
                            </TabsTrigger>
                            <TabsTrigger value="agents" className="flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                ביצועי סוכנים
                            </TabsTrigger>
                            <TabsTrigger value="dlq" className="flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                DLQ
                            </TabsTrigger>
                            <TabsTrigger value="waiting" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                חדר המתנה
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="users">
                            <UsersTable loginData={loginData} />
                        </TabsContent>

                        <TabsContent value="goals">
                            <GoalsManager />
                        </TabsContent>

                        <TabsContent value="plans">
                            <PlansManager />
                        </TabsContent>

                        <TabsContent value="activity">
                            <ActivityLogView />
                        </TabsContent>

                        <TabsContent value="system">
                            <SystemConfigManager />
                        </TabsContent>

                        <TabsContent value="agents">
                            <AgentPerformanceDashboard />
                        </TabsContent>

                        <TabsContent value="dlq">
                            <DLQMonitor />
                        </TabsContent>

                        <TabsContent value="waiting">
                            <WaitingRoom />
                        </TabsContent>
                        </Tabs>
                </div>
            </div>
        </>
    );
}