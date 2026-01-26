import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, TrendingUp, Clock, AlertTriangle, Users, CheckCircle2 } from 'lucide-react';

export default function AgentPerformanceDashboard() {
    const [selectedRun, setSelectedRun] = useState(null);
    const [timeRange, setTimeRange] = useState('today');

    const { data: runs, isLoading } = useQuery({
        queryKey: ['agent-runs', timeRange],
        queryFn: async () => {
            const startDate = getStartDate(timeRange);
            return await base44.entities.AgentRun.filter({
                started_at: { $gte: startDate }
            }, '-started_at', 200);
        },
        initialData: []
    });

    const { data: events } = useQuery({
        queryKey: ['agent-events', selectedRun?.id],
        queryFn: () => base44.entities.AgentEvent.filter({
            agent_run_id: selectedRun.id
        }, 'created_date', 100),
        enabled: !!selectedRun,
        initialData: []
    });

    // KPIs
    const totalRuns = runs.length;
    const completedRuns = runs.filter(r => r.status === 'completed').length;
    const failedRuns = runs.filter(r => r.status === 'failed').length;
    const successRate = totalRuns > 0 ? ((completedRuns / totalRuns) * 100).toFixed(1) : 0;
    const avgDuration = runs.length > 0 
        ? (runs.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / runs.length / 1000).toFixed(2)
        : 0;
    const avgRetries = runs.length > 0
        ? (runs.reduce((sum, r) => sum + (r.retries_count || 0), 0) / runs.length).toFixed(1)
        : 0;
    const waitingUsers = runs.filter(r => r.status === 'waiting_user').length;

    // Chart data - runs per agent
    const agentStats = {};
    runs.forEach(r => {
        if (!agentStats[r.agent_name]) {
            agentStats[r.agent_name] = { total: 0, completed: 0, failed: 0 };
        }
        agentStats[r.agent_name].total++;
        if (r.status === 'completed') agentStats[r.agent_name].completed++;
        if (r.status === 'failed') agentStats[r.agent_name].failed++;
    });

    const chartData = Object.entries(agentStats).map(([name, stats]) => ({
        name,
        completed: stats.completed,
        failed: stats.failed,
        successRate: ((stats.completed / stats.total) * 100).toFixed(0)
    }));

    // Timeline data
    const timelineData = runs.slice(0, 50).map(r => ({
        time: new Date(r.started_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        duration: (r.duration_ms || 0) / 1000
    })).reverse();

    return (
        <div className="p-6 space-y-6" dir="rtl">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <Activity className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                            <p className="text-sm text-gray-600">ריצות היום</p>
                            <p className="text-2xl font-bold">{totalRuns}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                            <p className="text-sm text-gray-600">שיעור הצלחה</p>
                            <p className="text-2xl font-bold text-green-600">{successRate}%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                            <p className="text-sm text-gray-600">כשלונות</p>
                            <p className="text-2xl font-bold text-red-600">{failedRuns}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <Clock className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                            <p className="text-sm text-gray-600">זמן ממוצע</p>
                            <p className="text-2xl font-bold">{avgDuration}s</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                            <p className="text-sm text-gray-600">ממוצע ניסיונות</p>
                            <p className="text-2xl font-bold">{avgRetries}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <Users className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
                            <p className="text-sm text-gray-600">ממתינים</p>
                            <p className="text-2xl font-bold">{waitingUsers}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>ביצועים לפי סוכן</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="completed" fill="#22c55e" name="הושלם" />
                                <Bar dataKey="failed" fill="#ef4444" name="נכשל" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>זמני תגובה</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={timelineData}>
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="duration" stroke="#3b82f6" name="שניות" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Runs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>ריצות אחרונות</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-medium">התחלה</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">סוכן</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">שלב</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">סטטוס</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">משך</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">ניסיונות</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {runs.slice(0, 50).map((run) => (
                                    <tr key={run.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">
                                            {new Date(run.started_at).toLocaleString('he-IL')}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium">{run.agent_name}</td>
                                        <td className="px-4 py-3 text-sm">{run.stage}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={
                                                run.status === 'completed' ? 'default' :
                                                run.status === 'failed' ? 'destructive' :
                                                'secondary'
                                            }>
                                                {run.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {run.duration_ms ? (run.duration_ms / 1000).toFixed(2) + 's' : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{run.retries_count || 0}</td>
                                        <td className="px-4 py-3">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedRun(run)}
                                                    >
                                                        אירועים
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>אירועי AgentRun - {run.agent_name}</DialogTitle>
                                                    </DialogHeader>
                                                    
                                                    <div className="space-y-3" dir="rtl">
                                                        <div className="bg-blue-50 p-3 rounded">
                                                            <p><strong>Run ID:</strong> {run.run_id}</p>
                                                            <p><strong>Input:</strong> {run.input_summary}</p>
                                                            <p><strong>Output:</strong> {run.output_summary}</p>
                                                            {run.error_message && (
                                                                <p className="text-red-600"><strong>שגיאה:</strong> {run.error_message}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <h4 className="font-semibold">Timeline:</h4>
                                                            {events.map((evt, idx) => (
                                                                <div key={evt.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                                                                    <div className="bg-white p-2 rounded-full">
                                                                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between">
                                                                            <Badge variant="outline">{evt.event_type}</Badge>
                                                                            <span className="text-xs text-gray-500">
                                                                                {evt.duration_ms ? `${evt.duration_ms}ms` : ''}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm mt-1">{evt.summary}</p>
                                                                        {evt.data_json && (
                                                                            <pre className="text-xs bg-white p-2 mt-2 rounded overflow-auto max-h-32">
                                                                                {JSON.stringify(evt.data_json, null, 2)}
                                                                            </pre>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function getStartDate(range) {
    const now = new Date();
    if (range === 'today') {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (range === 'week') {
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (range === 'month') {
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    return new Date(0).toISOString();
}