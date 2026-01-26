import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Search, Clock } from 'lucide-react';

export default function DLQMonitor() {
    const [filters, setFilters] = useState({
        status: 'all',
        severity: 'all',
        event_type: 'all',
        search: ''
    });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const queryClient = useQueryClient();

    const { data: events, isLoading } = useQuery({
        queryKey: ['dlq-events', filters],
        queryFn: async () => {
            let query = {};
            
            if (filters.status !== 'all') query.status = filters.status;
            if (filters.severity !== 'all') query.severity = filters.severity;
            if (filters.event_type !== 'all') query.event_type = filters.event_type;
            
            const results = await base44.entities.DLQEvent.filter(query, '-created_date', 100);
            
            if (filters.search) {
                return results.filter(e => 
                    e.source?.includes(filters.search) ||
                    e.phone_normalized?.includes(filters.search) ||
                    e.last_error_message?.includes(filters.search)
                );
            }
            
            return results;
        },
        initialData: []
    });

    const retryMutation = useMutation({
        mutationFn: (eventId) => base44.entities.DLQEvent.update(eventId, {
            next_retry_at: new Date().toISOString(),
            status: 'retrying'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['dlq-events']);
        }
    });

    const resolveMutation = useMutation({
        mutationFn: (eventId) => base44.entities.DLQEvent.update(eventId, {
            status: 'resolved',
            updated_at: new Date().toISOString()
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['dlq-events']);
        }
    });

    const failMutation = useMutation({
        mutationFn: (eventId) => base44.entities.DLQEvent.update(eventId, {
            status: 'failed_permanent',
            severity: 'critical',
            updated_at: new Date().toISOString()
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['dlq-events']);
        }
    });

    // KPI Calculations
    const openCount = events.filter(e => ['new', 'retrying'].includes(e.status)).length;
    const criticalCount = events.filter(e => e.severity === 'critical' && e.status !== 'resolved').length;
    const resolvedCount = events.filter(e => e.status === 'resolved').length;
    const successRate = events.length > 0 ? ((resolvedCount / events.length) * 100).toFixed(1) : 0;

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return colors[severity] || colors.medium;
    };

    const getStatusColor = (status) => {
        const colors = {
            new: 'bg-gray-100 text-gray-800',
            retrying: 'bg-blue-100 text-blue-800',
            resolved: 'bg-green-100 text-green-800',
            failed_permanent: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-600'
        };
        return colors[status] || colors.new;
    };

    return (
        <div className="p-6 space-y-6" dir="rtl">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">אירועים פתוחים</p>
                                <p className="text-2xl font-bold">{openCount}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">קריטיים</p>
                                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">נפתרו</p>
                                <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">שיעור הצלחה</p>
                                <p className="text-2xl font-bold">{successRate}%</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>מעקב DLQ - Dead Letter Queue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 mb-6">
                        <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="סטטוס" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">כל הסטטוסים</SelectItem>
                                <SelectItem value="new">חדש</SelectItem>
                                <SelectItem value="retrying">מנסה שוב</SelectItem>
                                <SelectItem value="resolved">נפתר</SelectItem>
                                <SelectItem value="failed_permanent">נכשל לצמיתות</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.severity} onValueChange={(v) => setFilters({...filters, severity: v})}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="חומרה" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">כל הרמות</SelectItem>
                                <SelectItem value="low">נמוך</SelectItem>
                                <SelectItem value="medium">בינוני</SelectItem>
                                <SelectItem value="high">גבוה</SelectItem>
                                <SelectItem value="critical">קריטי</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.event_type} onValueChange={(v) => setFilters({...filters, event_type: v})}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="סוג אירוע" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">כל הסוגים</SelectItem>
                                <SelectItem value="inbound_whatsapp">נכנס WhatsApp</SelectItem>
                                <SelectItem value="outbound_whatsapp">יוצא WhatsApp</SelectItem>
                                <SelectItem value="invoke_llm">קריאת LLM</SelectItem>
                                <SelectItem value="db_write">כתיבה למסד</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="חיפוש..."
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                                className="pr-10"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-medium">זמן</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">חומרה</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">סוג</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">מקור</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">סטטוס</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">ניסיונות</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">שגיאה</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">
                                            {new Date(event.created_date).toLocaleString('he-IL')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge className={getSeverityColor(event.severity)}>
                                                {event.severity}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{event.event_type}</td>
                                        <td className="px-4 py-3 text-sm">{event.source}</td>
                                        <td className="px-4 py-3">
                                            <Badge className={getStatusColor(event.status)}>
                                                {event.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {event.attempt_count}/{event.max_attempts}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-red-600 max-w-xs truncate">
                                            {event.last_error_code}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => retryMutation.mutate(event.id)}
                                                    disabled={event.status === 'resolved'}
                                                >
                                                    <RefreshCw className="h-3 w-3" />
                                                </Button>
                                                
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedEvent(event)}
                                                        >
                                                            פרטים
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>פרטי אירוע DLQ</DialogTitle>
                                                        </DialogHeader>
                                                        
                                                        {selectedEvent && (
                                                            <div className="space-y-4" dir="rtl">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="font-semibold">Event ID:</p>
                                                                        <p className="text-sm">{selectedEvent.event_id}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold">סטטוס:</p>
                                                                        <Badge className={getStatusColor(selectedEvent.status)}>
                                                                            {selectedEvent.status}
                                                                        </Badge>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold">חומרה:</p>
                                                                        <Badge className={getSeverityColor(selectedEvent.severity)}>
                                                                            {selectedEvent.severity}
                                                                        </Badge>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold">retry הבא:</p>
                                                                        <p className="text-sm">
                                                                            {selectedEvent.next_retry_at ? 
                                                                                new Date(selectedEvent.next_retry_at).toLocaleString('he-IL') 
                                                                                : '-'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <p className="font-semibold mb-2">שגיאה:</p>
                                                                    <div className="bg-red-50 p-3 rounded text-sm">
                                                                        <p className="font-mono">{selectedEvent.last_error_code}</p>
                                                                        <p className="text-gray-700 mt-1">{selectedEvent.last_error_message}</p>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <p className="font-semibold mb-2">Payload:</p>
                                                                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                                                                        {JSON.stringify(selectedEvent.payload_json, null, 2)}
                                                                    </pre>
                                                                </div>

                                                                <div>
                                                                    <p className="font-semibold mb-2">Context:</p>
                                                                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                                                                        {JSON.stringify(selectedEvent.context_json, null, 2)}
                                                                    </pre>
                                                                </div>

                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        onClick={() => retryMutation.mutate(selectedEvent.id)}
                                                                        className="flex-1"
                                                                    >
                                                                        <RefreshCw className="h-4 w-4 ml-2" />
                                                                        נסה שוב עכשיו
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => resolveMutation.mutate(selectedEvent.id)}
                                                                        className="flex-1"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 ml-2" />
                                                                        סמן כנפתר
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        onClick={() => failMutation.mutate(selectedEvent.id)}
                                                                        className="flex-1"
                                                                    >
                                                                        <XCircle className="h-4 w-4 ml-2" />
                                                                        כשל קבוע
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {events.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            אין אירועי DLQ
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}