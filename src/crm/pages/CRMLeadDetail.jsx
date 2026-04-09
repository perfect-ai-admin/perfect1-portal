import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight, Phone, MessageCircle, StickyNote, ListTodo,
  User, Clock, Tag, MapPin, Briefcase, Calendar, Trash2, Send, X as XIcon,
  ExternalLink, Mail, Globe, Target, FileText
} from 'lucide-react';
import { format, parseISO, isToday, isBefore, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';

import StatusBadge from '../components/shared/StatusBadge';
import LostReasonDialog from '../components/shared/LostReasonDialog';
import CommTimeline from '../components/communications/CommTimeline';
import CommLogger from '../components/communications/CommLogger';
import WhatsAppConversation from '../components/communications/WhatsAppConversation';
import PaymentStatusPanel from '../components/communications/PaymentStatusPanel';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';

import DeleteLeadDialog from '../components/DeleteLeadDialog';
import {
  useLeadDetail, useUpdateLeadStage, useAgents, useServiceCatalog,
  useAddCommunication, useLeadNotes, useAddLeadNote, useUpdateFollowupDate,
  useWhatsAppMessages, useSendWhatsAppMessage,
} from '../hooks/useCRM';
import { PIPELINE_STAGES, LOST_REASON_CATEGORIES } from '../constants/pipeline';

function getFollowupColor(dateStr) {
  if (!dateStr) return null;
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  const today = startOfDay(new Date());
  if (isBefore(date, today)) return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'באיחור' };
  if (isToday(date)) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', label: 'היום' };
  return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', label: '' };
}

export default function CRMLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCommLogger, setShowCommLogger] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [pendingStage, setPendingStage] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [editingFollowup, setEditingFollowup] = useState(false);

  const { data, isLoading, error } = useLeadDetail(id);
  const updateStage = useUpdateLeadStage();
  const { data: agents = [] } = useAgents();
  const { data: services = [] } = useServiceCatalog();
  const addComm = useAddCommunication();
  const { data: notes = [], isLoading: notesLoading } = useLeadNotes(id);
  const addNote = useAddLeadNote();
  const updateFollowup = useUpdateFollowupDate();
  const { data: waMessages = [] } = useWhatsAppMessages(id);
  const sendWaDirect = useSendWhatsAppMessage();

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

  const { lead, agent, lost_reason, communications, tasks, status_history, payments = [], bot_events = [] } = data;

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
        onError: (err) => toast.error(`שגיאה בעדכון שלב: ${err.message}`),
      }
    );
  };

  const handleLostConfirm = (lostData) => {
    updateStage.mutate(
      { lead_id: id, new_stage: pendingStage, ...lostData },
      {
        onSuccess: () => {
          toast.success('הליד נסגר');
          setShowLostDialog(false);
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  const handleCall = () => window.open(`tel:${lead.phone}`, '_self');

  const handleWhatsApp = () => {
    const phone = (lead.phone || '').replace(/\D/g, '');
    const intlPhone = phone.startsWith('0') ? '972' + phone.slice(1) : phone;
    window.open(`https://wa.me/${intlPhone}`, '_blank');
  };

  const handleEmail = () => window.open(`mailto:${lead.email}`, '_self');

  const getIntlPhone = () => {
    const phone = (lead.phone || '').replace(/\D/g, '');
    return phone.startsWith('0') ? '972' + phone.slice(1) : phone;
  };

  const handleWaSend = () => {
    if (!waMessage.trim()) return;
    const encoded = encodeURIComponent(waMessage.trim());
    window.open(`https://wa.me/${getIntlPhone()}?text=${encoded}`, '_blank');
    setShowWhatsAppDialog(false);
    setWaMessage('');
  };

  const handleWaSendAndSave = () => {
    if (!waMessage.trim()) return;
    sendWaDirect.mutate(
      { lead_id: id, message: waMessage.trim() },
      {
        onSuccess: () => {
          toast.success('ההודעה נשלחה ונשמרה');
          setShowWhatsAppDialog(false);
          setWaMessage('');
        },
        onError: (err) => toast.error(`שגיאה בשליחה: ${err.message}`),
      }
    );
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote.mutate(
      { lead_id: id, note: newNote.trim() },
      {
        onSuccess: () => {
          toast.success('הערה נשמרה');
          setNewNote('');
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  const handleFollowupChange = (date) => {
    updateFollowup.mutate(
      { lead_id: id, next_followup_date: date || null },
      {
        onSuccess: () => {
          toast.success('תאריך חזרה עודכן');
          setEditingFollowup(false);
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  const followupColor = getFollowupColor(lead.next_followup_date);

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
          {followupColor && (
            <span className={`text-xs px-2 py-1 rounded border ${followupColor.bg} ${followupColor.text} ${followupColor.border}`}>
              {followupColor.label} {lead.next_followup_date && format(parseISO(lead.next_followup_date), 'dd/MM/yyyy')}
            </span>
          )}
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
          {lead.phone && (
            <Button size="sm" variant="outline" onClick={() => setShowWhatsAppDialog(true)} className="text-green-700 border-green-300 hover:bg-green-50">
              <Send size={14} className="ml-1" /> שלח הודעה
            </Button>
          )}
          {lead.email && (
            <Button size="sm" variant="outline" onClick={handleEmail} className="text-purple-600 border-purple-300 hover:bg-purple-50">
              <Mail size={14} className="ml-1" /> שלח מייל
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setShowCommLogger(!showCommLogger)}>
            <StickyNote size={14} className="ml-1" /> תקשורת
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

          {/* Follow-up date */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-medium text-slate-500 mb-2">תאריך חזרה ללקוח</h3>
            {editingFollowup ? (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  defaultValue={lead.next_followup_date || ''}
                  autoFocus
                  onChange={e => handleFollowupChange(e.target.value)}
                  className="flex-1"
                />
                {lead.next_followup_date && (
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleFollowupChange(null)}>
                    נקה
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setEditingFollowup(false)}>
                  <XIcon size={14} />
                </Button>
              </div>
            ) : (
              <div
                className="cursor-pointer p-2 rounded border border-dashed border-slate-200 hover:border-slate-400 transition-colors"
                onClick={() => setEditingFollowup(true)}
              >
                {lead.next_followup_date ? (
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className={followupColor?.text || 'text-slate-400'} />
                    <span className={`text-sm font-medium ${followupColor?.text || 'text-slate-600'}`}>
                      {followupColor?.label ? `${followupColor.label} — ` : ''}
                      {format(parseISO(lead.next_followup_date), 'dd/MM/yyyy')}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">+ הגדר תאריך חזרה</span>
                )}
              </div>
            )}
          </div>

          {/* Payment status */}
          <PaymentStatusPanel leadId={id} />

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
            {lead.email && <InfoRow icon={Mail} label="אימייל" value={lead.email} dir="ltr" />}
            {lead.city && <InfoRow icon={MapPin} label="עיר" value={lead.city} />}
            {lead.service_type && <InfoRow icon={Briefcase} label="שירות" value={lead.service_type} />}
            {agent && <InfoRow icon={User} label="נציג" value={agent.name} />}
            <InfoRow icon={Calendar} label="נוצר" value={lead.created_at ? format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: he }) : ''} />
            {lead.contact_attempts > 0 && (
              <InfoRow icon={Phone} label="ניסיונות קשר" value={lead.contact_attempts} />
            )}

            {/* Source / UTM / Landing */}
            <div className="border-t border-slate-100 pt-2 mt-2">
              <p className="text-xs font-medium text-slate-400 mb-2">מקור הגעה</p>

              {lead.lead_source && (
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-600">{lead.lead_source}</span>
                </div>
              )}

              {lead.landing_url && (
                <div className="flex items-center gap-2 mb-1">
                  <ExternalLink size={12} className="text-blue-400" />
                  <a
                    href={lead.landing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[200px]"
                    title={lead.landing_url}
                  >
                    {(() => {
                      try { return new URL(lead.landing_url).pathname || '/'; }
                      catch { return lead.landing_url; }
                    })()}
                  </a>
                </div>
              )}

              {lead.source_page && !lead.landing_url && (
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-500 truncate">{lead.source_page}</span>
                </div>
              )}

              {/* UTM data */}
              {(lead.utm_source || lead.utm_campaign || lead.utm_term) && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-slate-400">נתוני שיווק</p>
                  {lead.utm_source && (
                    <div className="flex items-center gap-2">
                      <Target size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-500">מקור: <span className="text-slate-700">{lead.utm_source}</span></span>
                    </div>
                  )}
                  {lead.utm_campaign && (
                    <div className="flex items-center gap-2">
                      <Target size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-500">קמפיין: <span className="text-slate-700">{lead.utm_campaign}</span></span>
                    </div>
                  )}
                  {lead.utm_term && (
                    <div className="flex items-center gap-2">
                      <Target size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-500">מילת מפתח: <span className="text-slate-700">{lead.utm_term}</span></span>
                    </div>
                  )}
                  {lead.gclid && (
                    <div className="flex items-center gap-2">
                      <Tag size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-500">Google Ads click</span>
                    </div>
                  )}
                  {lead.fbclid && (
                    <div className="flex items-center gap-2">
                      <Tag size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-500">Facebook Ad click</span>
                    </div>
                  )}
                </div>
              )}
            </div>

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

          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="notes">
                הערות ({notes.length})
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="text-green-700">
                שיחה {waMessages.length > 0 && `(${waMessages.length})`}
              </TabsTrigger>
              <TabsTrigger value="timeline">
                Timeline ({communications.length + status_history.length})
              </TabsTrigger>
              <TabsTrigger value="tasks">
                משימות ({tasks.length})
              </TabsTrigger>
            </TabsList>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-4 space-y-4">
              {/* Add note form */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <Textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="כתוב הערה חדשה..."
                  rows={3}
                  className="mb-3"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddNote();
                  }}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Ctrl+Enter לשמירה</span>
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addNote.isPending}
                    className="bg-[#1E3A5F] hover:bg-[#152d4a]"
                  >
                    {addNote.isPending ? 'שומר...' : 'שמור הערה'}
                  </Button>
                </div>
              </div>

              {/* Notes list */}
              {notesLoading ? (
                <div className="text-center py-4 text-slate-400">טוען הערות...</div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">אין הערות עדיין</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notes.map(note => (
                    <div key={note.id} className="bg-white border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">
                          {format(new Date(note.created_at), 'dd/MM/yyyy HH:mm', { locale: he })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="whatsapp" className="mt-4">
              <WhatsAppConversation leadId={id} />
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <CommTimeline
                communications={communications}
                statusHistory={status_history}
                whatsappMessages={waMessages}
                payments={payments}
                botEvents={bot_events}
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

      {/* WhatsApp Send Dialog */}
      {showWhatsAppDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWhatsAppDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">שלח הודעת WhatsApp</h3>
              <button onClick={() => setShowWhatsAppDialog(false)} className="p-1 rounded hover:bg-slate-100">
                <XIcon size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-3">ל: {lead.name} ({lead.phone})</p>
            <textarea
              value={waMessage}
              onChange={e => setWaMessage(e.target.value)}
              placeholder="כתוב הודעה..."
              rows={4}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2 mt-4 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWaSend}
                disabled={!waMessage.trim()}
              >
                <Send size={14} className="ml-1" /> שלח
              </Button>
              <Button
                size="sm"
                onClick={handleWaSendAndSave}
                disabled={!waMessage.trim() || sendWaDirect.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send size={14} className="ml-1" /> {sendWaDirect.isPending ? 'שולח...' : 'שלח ושמור'}
              </Button>
            </div>
          </div>
        </div>
      )}
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
