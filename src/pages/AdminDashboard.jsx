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

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const currentUser = await base44.auth.me();
            if (!currentUser || currentUser.role !== 'admin') {
                window.location.href = '/';
                return;
            }
            setUser(currentUser);
        } catch (error) {
            window.location.href = '/';
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
                        <TabsList className="grid grid-cols-4 gap-4 bg-white p-2 rounded-xl shadow-md">
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
                        </TabsList>

                        <TabsContent value="users">
                            <UsersTable />
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
                    </Tabs>
                </div>
            </div>
        </>
    );
}