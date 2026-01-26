import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MessageCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function WaitingRoom() {
    const queryClient = useQueryClient();

    const { data: waitingLeads, isLoading } = useQuery({
        queryKey: ['waiting-leads'],
        queryFn: async () => {
            return await base44.entities.CRMLead.filter({
                waiting_for_response: true
            }, '-waiting_since', 100);
        },
        initialData: []
    });

    const escalateMutation = useMutation({
        mutationFn: async (leadId) => {
            await base44.entities.CRMLead.update(leadId, {
                status: 'human_required',
                active_handler: 'human_agent',
                human_required_reason: 'Escalated from waiting room'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['waiting-leads']);
            toast.success('הועבר לטיפול אנושי');
        }
    });

    const nudgeMutation = useMutation({
        mutationFn: async (lead) => {
            // שליחת הודעת תזכורת
            await base44.functions.invoke('whatsappWrapper', {
                action: 'send',
                phoneNormalized: lead.phone_normalized,
                messageText: `היי ${lead.full_name}, רק רציתי לוודא שהכל בסדר 😊\n\nאני כאן אם יש לך שאלות או אם אתה רוצה להמשיך.`,
                leadId: lead.id,
                userId: lead.user_id
            });
        },
        onSuccess: () => {
            toast.success('הודעת תזכורת נשלחה');
        }
    });

    const getTimeSince = (timestamp) => {
        if (!timestamp) return 'לא ידוע';
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} ימים`;
        if (hours > 0) return `${hours} שעות`;
        return `${minutes} דקות`;
    };

    return (
        <div className="p-6 space-y-6" dir="rtl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        חדר המתנה - {waitingLeads.length} ממתינים
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {waitingLeads.map((lead) => {
                            const timeSince = getTimeSince(lead.waiting_since || lead.last_contact_at);
                            const isUrgent = lead.waiting_since && 
                                (Date.now() - new Date(lead.waiting_since).getTime()) > 3600000; // >1h
                            
                            return (
                                <div
                                    key={lead.id}
                                    className={`p-4 rounded-lg border-2 ${
                                        isUrgent ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <User className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <p className="font-semibold">{lead.full_name}</p>
                                                    <p className="text-sm text-gray-600">{lead.phone_normalized}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <Badge variant="outline">
                                                    Handler: {lead.active_handler || 'unknown'}
                                                </Badge>
                                                {lead.current_goal_id && (
                                                    <Badge variant="outline">
                                                        Goal: {lead.current_goal_id.substring(0, 8)}
                                                    </Badge>
                                                )}
                                                <Badge className={isUrgent ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                                                    <Clock className="h-3 w-3 ml-1" />
                                                    {timeSince}
                                                </Badge>
                                            </div>

                                            {lead.chat_history && lead.chat_history.length > 0 && (
                                                <div className="bg-gray-100 p-2 rounded text-sm">
                                                    <MessageCircle className="h-4 w-4 inline ml-1" />
                                                    <span className="font-medium">הודעה אחרונה:</span>
                                                    <p className="mt-1 text-gray-700">
                                                        {lead.chat_history[lead.chat_history.length - 1]?.content?.substring(0, 100)}...
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => nudgeMutation.mutate(lead)}
                                            >
                                                שלח תזכורת
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => escalateMutation.mutate(lead.id)}
                                            >
                                                <AlertTriangle className="h-4 w-4 ml-1" />
                                                העבר לאנושי
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {waitingLeads.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>אין משתמשים ממתינים כרגע</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}