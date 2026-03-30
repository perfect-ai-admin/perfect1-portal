import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight, Phone, MessageCircle, StickyNote, ListTodo,
  User, Clock, Tag, MapPin, Briefcase, Calendar, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';

import StatusBadge from '../components/shared/StatusBadge';
import LostReasonDialog from '../components/shared/LostReasonDialog';
import CommTimeline from '../components/communications/CommTimeline';
import CommLogger from '../components/communications/CommLogger';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';

import DeleteLeadDialog from '../components/DeleteLeadDialog';
import { useLeadDetail, useUpdateLeadStage, useAgents, useServiceCatalog } from '../hooks/useCRM';
import { PIPELINE_STAGES, LOST_REASON_CATEGORIES } from '../constants/pipeline';

export default function CRMLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCommLogger, setShowCommLogger] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingStage, setPendingStage] = useState(null);

  const { data, isLoading, error } = useLeadDetail(id);
  const updateStage = useUpdateLeadStage();
  const { data: agents = [] } = useAgents();
  const { data: services = [] } = useServiceCatalog();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data?.lead) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>הליד לא נמצא</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/CRM')}>
          חזרה ל-Pipeline
        </Button>
      </div>
    );
  }

  const { lead, agent, lost_reason, communications, tasks, status_history } = data;

  const handleStageChange = (newStage) => {
    if (newStage === lead.pipeline_stage) return;
    const closedLostStages = ['not_interested', 'disqualified'];
    if (closedLostStages.includes(newStage)) {
      setPendingStage(newStage);
      setShowLostDialog(true);
      return;
    }

    updateStage.mutate(
      { lead_id: id, new_stage: newStage },
      {
        onSuccess: () => toast.success('השלב עודכן'),
        onError: (err) => {
          console.error('Stage update failed:', err);
          toast.error(`שגיאה בעדכון שלב: ${err.message}`);
        },
      }
    );
  };

  const handleLostConfirm = (lostData) => {
    updateStage.mutate(
      {
        lead_id: id,
        new_stage: pendingStage,
        ...lostData,
      },
      {
        onSuccess: () => {
          toast.success('הליד נסגר');
          setShowLostDialog(false);
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  const handleCall = () => {
    window.open(`tel:${lead.phone}`, '_self');
  };

  const handleWhatsApp = () => {
    const phone = (lead.phone || '').replace(/\D/g, '');
    const intlPhone = phone.startsWith('0') ? '972' + phone.slice(1) : phone;
    window.open(`https://wa.me/${intlPhone}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/CRM')}
        className="mb-3 text-slate-500"
      >
        <ArrowRight size={16} className="ml-1" />
        חזרה
      </Button>

      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h1 className="text-xl font-bold text-slate-900">{lead.name || 'ללא שם'}</h1>
          <StatusBadge stage={lead.pipeline_stage} size="md" />
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-2">
          {lead.phone && (
            <Button size="sm" variant="outline" onClick={handleCall}>
              <Phone size={14} className="ml-1" /> התקשר
            </Button>
          )}
          {lead.phone && (
            <Button size="sm" variant="outline" onClick={handleWhatsApp} className="text-green-600 border-green-300 hover:bg-green-50">
              <MessageCircle size={14} className="ml-1" /> WhatsApp
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setShowCommLogger(!showCommLogger)}>
            <StickyNote size={14} className="ml-1" /> הוסף הערה
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowTaskForm(!showTaskForm)}>
            <ListTodo size={14} className="ml-1" /> משימה
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 size={14} className="ml-1" /> מחק
          </Button>
        </div>
      </div>

      {/* Main content: sidebar + tabs */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar - Lead Details */}
        <div className="lg:w-[30%] space-y-4">
          {/* Stage selector */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-medium text-slate-500 mb-2">שלב</h3>
            <Select key={lead.pipeline_stage || 'new_lead'} value={lead.pipeline_stage || 'new_lead'} onValueChange={handleStageChange}>
              <SelectTrigger><SelectValue placeholder="בחר שלב..." /></SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map(s => (
                  <SelectItem key={s.slug} value={s.slug}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agent selector */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-medium text-slate-500 mb-2">שיוך נציג</h3>
            <Select
              value={lead.agent_id || ''}
              onValueChange={(newAgentId) => {
                updateStage.mutate(
                  { lead_id: id, new_stage: lead.pipeline_stage, agent_id: newAgentId },
                  {
                    onSuccess: () => toast.success('הנציג עודכן'),
                    onError: (err) => toast.error(`שגיאה: ${err.message}`),
                  }
                );
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר נציג..." />
              </SelectTrigger>
              <SelectContent>
                {agents.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lead info */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
            <h3 className="text-sm font-medium text-slate-500 mb-2">פרטים</h3>

            <InfoRow icon={User} label="שם" value={lead.name} />
            <InfoRow icon={Phone} label="טלפון" value={lead.phone} dir="ltr" />
            {lead.email && <InfoRow icon={MessageCircle} label="אימייל" value={lead.email} dir="ltr" />}
            {lead.city && <InfoRow icon={MapPin} label="עיר" value={lead.city} />}
            {lead.service_type && <InfoRow icon={Briefcase} label="שירות" value={lead.service_type} />}
            {agent && <InfoRow icon={User} label="נציג" value={agent.name} />}
            <InfoRow icon={Calendar} label="נוצר" value={lead.created_at ? format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: he }) : ''} />
            {lead.contact_attempts > 0 && (
              <InfoRow icon={Phone} label="ניסיונות קשר" value={lead.contact_attempts} />
            )}

            {/* Source / UTM */}
            {(lead.utm_source || lead.page_url) && (
              <>
                <div className="border-t border-slate-100 pt-2 mt-2">
                  <p className="text-xs font-medium text-slate-400 mb-1">מקור</p>
                  {lead.utm_source && <p className="text-xs text-slate-600">UTM: {lead.utm_source}</p>}
                  {lead.utm_campaign && <p className="text-xs text-slate-600">קמפיין: {lead.utm_campaign}</p>}
                  {lead.page_url && <p className="text-xs text-slate-500 truncate">{lead.page_url}</p>}
                </div>
              </>
            )}

            {/* Tags */}
            {lead.tags?.length > 0 && (
              <div className="border-t border-slate-100 pt-2 mt-2">
                <p className="text-xs font-medium text-slate-400 mb-1">תגיות</p>
                <div className="flex flex-wrap gap-1">
                  {lead.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Lost reason */}
            {(lost_reason || lead.lost_reason_id || lead.lost_reason_note) && (
              <div className="border-t border-red-100 pt-2 mt-2">
                <p className="text-xs font-medium text-red-400 mb-1">סיבת סגירה</p>
                <p className="text-sm text-red-600">
                  {lost_reason?.reason_text
                    || LOST_REASON_CATEGORIES.find(r => r.value === lead.lost_reason_id)?.label
                    || lead.lost_reason_note
                    || lead.lost_reason_id}
                </p>
                {lead.lost_reason_note && !lost_reason?.reason_text && lead.lost_reason_note !== lead.lost_reason_id && (
                  <p className="text-xs text-slate-500 mt-1">{lead.lost_reason_note}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main content - Tabs */}
        <div className="lg:w-[70%]">
          {/* Inline forms */}
          {showCommLogger && (
            <div className="mb-4">
              <CommLogger leadId={id} onSuccess={() => setShowCommLogger(false)} />
            </div>
          )}
          {showTaskForm && (
            <div className="mb-4">
              <TaskForm leadId={id} onSuccess={() => setShowTaskForm(false)} />
            </div>
          )}

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="timeline">
                Timeline ({communications.length + status_history.length})
              </TabsTrigger>
              <TabsTrigger value="tasks">
                משימות ({tasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4">
              <CommTimeline
                communications={communications}
                statusHistory={status_history}
              />
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <TaskList tasks={tasks} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Lost Reason Dialog */}
      <LostReasonDialog
        open={showLostDialog}
        onOpenChange={setShowLostDialog}
        onConfirm={handleLostConfirm}
        isLoading={updateStage.isPending}
      />

      {/* Delete Dialog */}
      <DeleteLeadDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        lead={lead}
        onDeleted={() => navigate('/CRM')}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, dir }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-slate-400 flex-shrink-0" />
      <span className="text-xs text-slate-400 w-16 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-700 truncate" dir={dir}>{value}</span>
    </div>
  );
}
