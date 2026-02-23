import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, ExternalLink, Loader2, Phone, Mail, MessageCircle, Calendar, Search, Filter, Edit2, X, Trash2, Save, Plus, UserPlus, Users, CheckSquare, Square, Columns3 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function LeadsAdmin() {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [editingNotes, setEditingNotes] = useState({});
  const [editingFollowUp, setEditingFollowUp] = useState({});
  const [sortBy, setSortBy] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    name: true,
    phone: true,
    profession: true,
    source: true,
    utm: true,
    category: true,
    type: true,
    agent: true,
    status: true,
    priority: true,
    followUp: true,
    notes: true
  });
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 1000),
    initialData: []
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.filter({ active: true }),
    initialData: []
  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
          toast.error('שים לב: אינך מחובר כמנהל, חלק מהפעולות (כגון מחיקה) יהיו חסומות');
        }
      } catch (e) {
        console.error('Auth check failed', e);
      }
    };
    checkAdmin();
  }, []);

  const createLeadMutation = useMutation({
    mutationFn: (data) => base44.entities.Lead.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowAddLeadDialog(false);
    }
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedLead(null);
      setEditingNotes({});
      setEditingFollowUp({});
    }
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id) => base44.functions.invoke('adminDeleteLead', { leadId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('הליד נמחק בהצלחה');
    },
    onError: (error) => {
      console.error('Failed to delete lead:', error);
      toast.error('שגיאה במחיקת הליד.');
    }
  });

  const handleDeleteLead = (lead) => {
    if (window.confirm(`למחוק את ${lead.name}?`)) {
      deleteLeadMutation.mutate(lead.id);
    }
  };

  const handleSaveNotes = (lead) => {
    updateLeadMutation.mutate({
      id: lead.id,
      data: { ...lead, notes: editingNotes[lead.id] }
    });
  };

  const handleSaveFollowUp = (lead) => {
    updateLeadMutation.mutate({
      id: lead.id,
      data: { ...lead, follow_up_date: editingFollowUp[lead.id] }
    });
  };

  const handleQuickStatusUpdate = (lead, newStatus) => {
    updateLeadMutation.mutate({
      id: lead.id,
      data: { ...lead, status: newStatus, last_contact_date: new Date().toISOString().split('T')[0] }
    });
  };

  const toggleSelectLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === sortedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(sortedLeads.map(lead => lead.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק ${selectedLeads.length} לידים? פעולה זו אינה הפיכה.`)) {
      return;
    }

    let deletedCount = 0;
    let failedCount = 0;

    for (const leadId of selectedLeads) {
      try {
        await base44.functions.invoke('adminDeleteLead', { leadId });
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete lead ${leadId}:`, error);
        failedCount++;
      }
    }

    if (deletedCount > 0) {
      toast.success(`${deletedCount} לידים נמחקו בהצלחה`);
    }
    if (failedCount > 0) {
      toast.error(`${failedCount} לידים נכשלו במחיקה`);
    }

    queryClient.invalidateQueries({ queryKey: ['leads'] });
    setSelectedLeads([]);
  };

  const handleBulkAssignToAgent = async (agentName) => {
    console.log('🔵 Bulk assign התחיל, נציג:', agentName);
    const selectedAgent = agents.find(a => a.full_name === agentName);
    console.log('🔵 נמצא נציג:', selectedAgent);
    
    let emailsSent = 0;
    let emailsFailed = 0;
    
    for (const leadId of selectedLeads) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        console.log('🔵 מעדכן ליד:', lead.name);
        await base44.entities.Lead.update(leadId, { ...lead, agent_name: agentName === 'none' ? null : agentName });
        
        // שליחת הודעה לסוכן
        if (selectedAgent && (selectedAgent.phone || selectedAgent.email)) {
          console.log('📱 שולח הודעה עבור:', lead.name);
          try {
            const response = await base44.functions.invoke('sendAgentNotification', {
              agentPhone: selectedAgent.phone,
              agentEmail: selectedAgent.email,
              agentName: selectedAgent.full_name,
              leadName: lead.name,
              leadPhone: lead.phone,
              leadProfession: lead.profession || 'לא צוין',
              notificationPreferences: selectedAgent.notification_preferences || ['whatsapp']
            });
            console.log('📱 תגובה:', response);
            if (response.data?.results?.whatsapp?.url) {
              window.open(response.data.results.whatsapp.url, '_blank');
            }
            emailsSent++;
          } catch (error) {
            console.error('❌ שגיאה:', error);
            emailsFailed++;
          }
        }
      }
    }
    
    if (emailsSent > 0) {
      toast.success(`נשלחו ${emailsSent} התראות לנציג`);
    }
    if (emailsFailed > 0) {
      toast.error(`${emailsFailed} הודעות נכשלו`);
    }
    if (selectedAgent && !selectedAgent.phone && !selectedAgent.email) {
      toast.warning(`לנציג ${selectedAgent.full_name} אין פרטי התקשרות`);
    }
    
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    setSelectedLeads([]);
    setShowBulkAssignDialog(false);
  };

  const exportToCSV = () => {
    const headers = ['שם מלא', 'טלפון', 'מייל', 'מקצוע', 'מקור הגעה', 'סטטוס', 'עדיפות', 'תאריך חזרה', 'קישור לווצאפ'];
    const rows = filteredLeads.map(lead => [
      lead.name || '',
      lead.phone || '',
      lead.email || '',
      lead.profession || '',
      lead.source_page || '',
      lead.status || 'new',
      lead.priority || 'medium',
      lead.follow_up_date || '',
      `https://wa.me/972${(lead.phone || '').replace(/^0/, '')}`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredLeads = leads.filter(lead => {
    const matchStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchPriority = filterPriority === 'all' || lead.priority === filterPriority;
    const matchCategory = filterCategory === 'all' || lead.category === filterCategory;
    const matchSearch = !searchTerm || 
      (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       lead.phone?.includes(searchTerm) ||
       lead.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchSelectedStatuses = selectedStatuses.length === 0 || selectedStatuses.includes(lead.status || 'new');
    const matchSelectedAgents = selectedAgents.length === 0 || selectedAgents.includes(lead.agent_name || 'ללא נציג');
    return matchStatus && matchPriority && matchCategory && matchSearch && matchSelectedStatuses && matchSelectedAgents;
  });

  // Sort leads if sortBy is active
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === 'status') {
      const statusOrder = { new: 1, contacted: 2, no_answer: 3, in_progress: 4, qualified: 5, not_interested: 6, converted: 7, closed: 8 };
      return (statusOrder[a.status || 'new'] || 99) - (statusOrder[b.status || 'new'] || 99);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority || 'medium'] || 99) - (priorityOrder[b.priority || 'medium'] || 99);
    }
    return 0; // No sorting
  });

  const statusColors = {
    new: 'bg-blue-500 text-white shadow-lg shadow-blue-500/50',
    contacted: 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50',
    no_answer: 'bg-orange-500 text-white shadow-lg shadow-orange-500/50',
    in_progress: 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50',
    qualified: 'bg-purple-500 text-white shadow-lg shadow-purple-500/50',
    not_interested: 'bg-red-600 text-white shadow-lg shadow-red-600/50 animate-pulse',
    converted: 'bg-green-600 text-white shadow-lg shadow-green-600/50 animate-pulse',
    closed: 'bg-gray-600 text-white shadow-lg shadow-gray-600/50'
  };

  const statusLabels = {
    new: 'חדש',
    contacted: 'יצרנו קשר',
    no_answer: 'אין מענה',
    in_progress: 'בתהליך',
    qualified: 'מתאים',
    not_interested: 'לא מעוניין',
    converted: 'נסגר',
    closed: 'סגור'
  };

  const priorityColors = {
    low: 'bg-gray-400 text-white shadow-md shadow-gray-400/40',
    medium: 'bg-blue-500 text-white shadow-md shadow-blue-500/40',
    high: 'bg-red-600 text-white shadow-lg shadow-red-600/50 font-bold'
  };

  const priorityLabels = {
    low: 'נמוך',
    medium: 'בינוני',
    high: 'גבוה'
  };

  const categoryColors = {
    osek_patur: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/40',
    monthly_support: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/40',
    invoice: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/40',
    consultation: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md shadow-pink-500/40',
    other: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-md shadow-slate-400/40'
  };

  const categoryLabels = {
    osek_patur: 'פתיחת עוסק',
    monthly_support: 'ליווי חודשי',
    invoice: 'חשבונית',
    consultation: 'ייעוץ',
    other: 'אחר'
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    followUpToday: leads.filter(l => l.follow_up_date === new Date().toISOString().split('T')[0]).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-1.5 pt-14 md:p-3 md:pt-24 pb-8" dir="rtl">
      <Toaster position="top-center" richColors />
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-1.5 flex-shrink-0">
          <div>
            <h1 className="text-base md:text-2xl font-bold text-[#1E3A5F] mb-0.5">ניהול לידים - CRM</h1>
            <p className="text-[10px] md:text-sm text-gray-600">כל הלידים שמגיעים מהאתר</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant="outline"
              size="sm"
              onClick={async () => {
                const testData = prompt('בחר סוג בדיקה:\n1 = WhatsApp\n2 = Email\n3 = SMS\n4 = הכל', '1');
                if (!testData) return;

                const testPhone = '0501234567';
                const testEmail = 'test@example.com';
                let prefs = ['whatsapp'];

                if (testData === '2') prefs = ['email'];
                else if (testData === '3') prefs = ['sms'];
                else if (testData === '4') prefs = ['whatsapp', 'email', 'sms'];

                try {
                  const res = await base44.functions.invoke('sendAgentNotification', {
                    agentPhone: testPhone,
                    agentEmail: testEmail,
                    agentName: 'בדיקה',
                    leadName: 'ליד בדיקה',
                    leadPhone: '0501234567',
                    leadProfession: 'בדיקה',
                    notificationPreferences: prefs
                  });
                  console.log('תגובה:', res);
                  if (res.data?.results?.whatsapp?.url) {
                    window.open(res.data.results.whatsapp.url, '_blank');
                  }
                  toast.success('בדיקה הושלמה - בדוק קונסול');
                } catch (e) {
                  console.error(e);
                  toast.error(e.message);
                }
              }}
              className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
            >
              <MessageCircle className="w-4 h-4 ml-1" />
              בדיקת התראות
            </Button>
            <Link to={createPageUrl('AgentsManager')} className="flex-1 md:flex-none">
              <Button 
                variant="outline"
                size="sm"
                className="border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white w-full md:w-auto"
              >
                <Users className="w-4 h-4 md:w-5 md:h-5 ml-1" />
                <span className="text-xs md:text-sm">נציגים</span>
              </Button>
            </Link>
            <Button 
              onClick={() => setShowAddLeadDialog(true)}
              size="sm"
              className="bg-[#27AE60] hover:bg-[#2ECC71] flex-1 md:flex-none"
            >
              <UserPlus className="w-4 h-4 md:w-5 md:h-5 ml-1" />
              <span className="text-xs md:text-sm">הוסף ליד</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-1 md:gap-2 mb-1 flex-shrink-0">
          <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-lg p-1.5 md:p-2 shadow-lg shadow-[#1E3A5F]/30">
            <div className="text-xl md:text-2xl font-black text-white">{stats.total}</div>
            <div className="text-[10px] md:text-xs text-white/80 font-semibold">סך הכל</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-1.5 md:p-2 shadow-lg shadow-blue-500/40">
            <div className="text-xl md:text-2xl font-black text-white">{stats.new}</div>
            <div className="text-[10px] md:text-xs text-white/90 font-semibold">חדשים</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-1.5 md:p-2 shadow-lg shadow-yellow-500/40">
            <div className="text-xl md:text-2xl font-black text-white">{stats.contacted}</div>
            <div className="text-[10px] md:text-xs text-white/90 font-semibold">קשר</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-1.5 md:p-2 shadow-lg shadow-green-500/50 animate-pulse">
            <div className="text-xl md:text-2xl font-black text-white">{stats.converted}</div>
            <div className="text-[10px] md:text-xs text-white/90 font-semibold">נסגרו ✨</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-1.5 md:p-2 shadow-lg shadow-red-500/50 col-span-3 md:col-span-1">
            <div className="text-xl md:text-2xl font-black text-white">{stats.followUpToday}</div>
            <div className="text-[10px] md:text-xs text-white/90 font-semibold">חזרה היום</div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.length > 0 && (
          <div className="bg-indigo-100 border-2 border-indigo-300 rounded-lg shadow p-1.5 mb-1 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-indigo-900">{selectedLeads.length} לידים נבחרו</span>
                <Button 
                  onClick={() => setShowBulkAssignDialog(true)}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Users className="w-4 h-4 ml-2" />
                  העבר לנציג
                </Button>
                <Button 
                  onClick={handleBulkDelete}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  מחק נבחרים
                </Button>
              </div>
              <Button 
                onClick={() => setSelectedLeads([])}
                variant="outline"
                size="sm"
              >
                בטל סימון
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-1.5 mb-1 flex-shrink-0">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="חיפוש..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8 h-9 text-sm"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Columns3 className="w-4 h-4 ml-1" />
                  עמודות
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  <div className="font-semibold text-sm mb-3">בחר עמודות להצגה</div>
                  {[
                    { key: 'date', label: 'תאריך' },
                    { key: 'name', label: 'שם' },
                    { key: 'phone', label: 'טלפון' },
                    { key: 'profession', label: 'מקצוע' },
                    { key: 'source', label: 'מקור' },
                    { key: 'category', label: 'קטגוריה' },
                    { key: 'type', label: 'סוג' },
                    { key: 'agent', label: 'נציג' },
                    { key: 'status', label: 'סטטוס' },
                    { key: 'priority', label: 'עדיפות' },
                    { key: 'followUp', label: 'חזרה' },
                    { key: 'notes', label: 'הערות' }
                  ].map(col => (
                    <label key={col.key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={visibleColumns[col.key]}
                        onChange={(e) => setVisibleColumns({ ...visibleColumns, [col.key]: e.target.checked })}
                        className="rounded"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-32 h-9 text-sm">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="new">חדש</SelectItem>
                <SelectItem value="contacted">יצרנו קשר</SelectItem>
                <SelectItem value="no_answer">אין מענה</SelectItem>
                <SelectItem value="in_progress">בתהליך</SelectItem>
                <SelectItem value="qualified">מתאים</SelectItem>
                <SelectItem value="not_interested">לא מעוניין</SelectItem>
                <SelectItem value="converted">נסגר</SelectItem>
                <SelectItem value="closed">סגור</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-32 h-9 text-sm">
                <SelectValue placeholder="עדיפות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל העדיפויות</SelectItem>
                <SelectItem value="high">גבוה</SelectItem>
                <SelectItem value="medium">בינוני</SelectItem>
                <SelectItem value="low">נמוך</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-32 h-9 text-sm">
                <SelectValue placeholder="קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                <SelectItem value="osek_patur">פתיחת עוסק</SelectItem>
                <SelectItem value="monthly_support">ליווי חודשי</SelectItem>
                <SelectItem value="invoice">חשבונית</SelectItem>
                <SelectItem value="consultation">ייעוץ</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} size="sm" className="bg-[#27AE60] hover:bg-[#2ECC71] h-9">
              <Download className="w-4 h-4 ml-1" />
              <span className="hidden md:inline">ייצא</span>
            </Button>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-2">
          {sortedLeads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow-md p-3 border-r-4" style={{
              borderColor: lead.status === 'converted' ? '#16a34a' : 
                          lead.status === 'new' ? '#3b82f6' : 
                          lead.status === 'not_interested' ? '#dc2626' : '#6b7280'
            }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-base text-[#1E3A5F]">{lead.name}</h3>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${statusColors[lead.status || 'new']}`}>
                      {statusLabels[lead.status || 'new']}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${priorityColors[lead.priority || 'medium']}`}>
                      {priorityLabels[lead.priority || 'medium']}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleSelectLead(lead.id)} 
                  className="p-1"
                >
                  {selectedLeads.includes(lead.id) ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 mb-3">
                <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-[#1E3A5F] font-semibold text-sm">
                  <Phone className="w-4 h-4" />
                  {lead.phone}
                </a>
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600 truncate">{lead.email}</span>
                  </div>
                )}
                {lead.profession && (
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">מקצוע:</span> {lead.profession}
                  </div>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${categoryColors[lead.category || 'osek_patur']}`}>
                  {categoryLabels[lead.category || 'osek_patur']}
                </span>
                {lead.agent_name && (
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-medium">
                    {lead.agent_name}
                  </span>
                )}
                {lead.follow_up_date && (
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${
                    lead.follow_up_date === new Date().toISOString().split('T')[0] 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    {format(new Date(lead.follow_up_date), 'dd/MM')}
                  </span>
                )}
              </div>

              {/* Notes */}
              {lead.notes && (
                <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 mb-2">
                  {lead.notes}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={`tel:${lead.phone}`}
                  className="flex-1 bg-[#1E3A5F] text-white rounded-lg py-2.5 flex items-center justify-center gap-2 font-bold text-sm shadow-md active:scale-95 transition-transform"
                >
                  <Phone className="w-4 h-4" />
                  התקשר
                </a>
                <a
                  href={`https://wa.me/972${(lead.phone || '').replace(/^0/, '')}?text=${encodeURIComponent(`היי ${lead.name}, אני מפרפקט one. ${lead.profession ? `ראיתי שאת/ה ${lead.profession}` : 'נעים להכיר'} - איך אפשר לעזור לך?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] text-white rounded-lg py-2.5 flex items-center justify-center gap-2 font-bold text-sm shadow-md active:scale-95 transition-transform"
                >
                  <MessageCircle className="w-4 h-4" />
                  וואטסאפ
                </a>
                <button
                  onClick={() => setSelectedLead(lead)}
                  className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2.5 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Timestamp */}
              <div className="text-[10px] text-gray-400 text-center mt-2 border-t pt-2">
                {format(new Date(lead.created_date), 'dd/MM/yy HH:mm')} | {lead.source_page || 'לא ידוע'}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-[#1E3A5F] text-white">
                <tr>
                  <th className="px-3 py-2 text-center sticky top-0 bg-[#1E3A5F]">
                    <button onClick={toggleSelectAll} className="hover:bg-[#2C5282] p-1 rounded">
                      {selectedLeads.length === sortedLeads.length && sortedLeads.length > 0 ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  {visibleColumns.date && <th className="px-2 py-2 text-right text-xs sticky top-0 bg-[#1E3A5F]">תאריך</th>}
                  {visibleColumns.name && <th className="px-2 py-2 text-right text-xs sticky top-0 bg-[#1E3A5F]">שם</th>}
                  {visibleColumns.phone && <th className="px-2 py-2 text-right text-xs sticky top-0 bg-[#1E3A5F]">טלפון</th>}
                  {visibleColumns.profession && <th className="px-2 py-2 text-right text-xs sticky top-0 bg-[#1E3A5F]">מקצוע</th>}
                  {visibleColumns.source && <th className="px-2 py-2 text-right text-xs sticky top-0 bg-[#1E3A5F]">מקור</th>}
                  {visibleColumns.utm && <th className="px-2 py-2 text-right text-xs sticky top-0 bg-[#1E3A5F]">UTM</th>}
                  {visibleColumns.category && <th className="px-2 py-2 text-right text-xs sticky top-0 bg-[#1E3A5F]">קטגוריה</th>}
                  {visibleColumns.type && <th className="px-2 py-2 text-right text-xs sticky top-0 bg-[#1E3A5F]">סוג</th>}
                  {visibleColumns.agent && <th className="px-2 py-2 text-right text-xs sticky top-0 bg-[#1E3A5F]">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1 hover:bg-[#2C5282] px-2 py-1 rounded transition-colors">
                          נציג
                          {selectedAgents.length > 0 && <span className="bg-yellow-400 text-[#1E3A5F] rounded-full px-1.5 text-[10px] font-bold">{selectedAgents.length}</span>}
                          <Filter className="w-3 h-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56" align="start">
                        <div className="space-y-2">
                          <div className="font-semibold text-sm mb-2">בחר נציגים להצגה</div>
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={selectedAgents.includes('ללא נציג')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAgents([...selectedAgents, 'ללא נציג']);
                                } else {
                                  setSelectedAgents(selectedAgents.filter(s => s !== 'ללא נציג'));
                                }
                              }}
                              className="rounded"
                            />
                            ללא נציג
                          </label>
                          {agents.map(agent => (
                            <label key={agent.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={selectedAgents.includes(agent.full_name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAgents([...selectedAgents, agent.full_name]);
                                  } else {
                                    setSelectedAgents(selectedAgents.filter(s => s !== agent.full_name));
                                  }
                                }}
                                className="rounded"
                              />
                              {agent.full_name}
                            </label>
                          ))}
                          {selectedAgents.length > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedAgents([])}
                              className="w-full mt-2"
                            >
                              נקה הכל
                            </Button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </th>}
                  {visibleColumns.status && <th className="px-2 py-2 text-center text-xs sticky top-0 bg-[#1E3A5F]">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1 hover:bg-[#2C5282] px-2 py-1 rounded transition-colors mx-auto">
                          סטטוס
                          {selectedStatuses.length > 0 && <span className="bg-yellow-400 text-[#1E3A5F] rounded-full px-1.5 text-[10px] font-bold">{selectedStatuses.length}</span>}
                          <Filter className="w-3 h-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56" align="center">
                        <div className="space-y-2">
                          <div className="font-semibold text-sm mb-2">בחר סטטוסים להצגה</div>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={selectedStatuses.includes(key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStatuses([...selectedStatuses, key]);
                                  } else {
                                    setSelectedStatuses(selectedStatuses.filter(s => s !== key));
                                  }
                                }}
                                className="rounded"
                              />
                              {label}
                            </label>
                          ))}
                          {selectedStatuses.length > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedStatuses([])}
                              className="w-full mt-2"
                            >
                              נקה הכל
                            </Button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </th>}
                  {visibleColumns.priority && <th 
                    className="px-2 py-2 text-center text-xs cursor-pointer hover:bg-[#2C5282] transition-colors sticky top-0 bg-[#1E3A5F]"
                    onClick={() => setSortBy(sortBy === 'priority' ? null : 'priority')}
                    title="למיון"
                  >
                    <div className="flex items-center justify-center gap-1">
                      עדיפות
                      {sortBy === 'priority' && <span className="text-yellow-300">▼</span>}
                    </div>
                  </th>}
                  {visibleColumns.followUp && <th className="px-2 py-2 text-right text-xs sticky top-0 bg-[#1E3A5F]">חזרה</th>}
                  {visibleColumns.notes && <th className="px-2 py-2 text-right text-xs sticky top-0 bg-[#1E3A5F]">הערות</th>}
                  <th className="px-2 py-2 text-center text-xs sticky top-0 bg-[#1E3A5F]">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeads.map((lead, index) => (
                  <tr key={lead.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-2 py-1.5 text-center">
                      <button onClick={() => toggleSelectLead(lead.id)} className="hover:bg-gray-200 p-1 rounded">
                        {selectedLeads.includes(lead.id) ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    {visibleColumns.date && <td className="px-2 py-1.5 text-xs text-gray-600 whitespace-nowrap">
                      {format(new Date(lead.created_date), 'dd/MM/yy HH:mm')}
                    </td>}
                    {visibleColumns.name && <td className="px-2 py-1.5">
                      <div className="font-medium text-xs">{lead.name}</div>
                      {lead.email && <div className="text-[10px] text-gray-500 truncate max-w-[120px]">{lead.email}</div>}
                    </td>}
                    {visibleColumns.phone && <td className="px-2 py-1.5">
                      <a href={`tel:${lead.phone}`} className="text-[#1E3A5F] hover:underline flex items-center gap-1 text-xs whitespace-nowrap">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </a>
                    </td>}
                    {visibleColumns.profession && <td className="px-2 py-1.5 text-xs">{lead.profession || '-'}</td>}
                    {visibleColumns.source && <td className="px-2 py-1.5 text-[10px] text-gray-500 max-w-[100px] truncate">{lead.source_page || '-'}</td>}
                    {visibleColumns.category && <td className="px-2 py-1.5 text-xs">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryColors[lead.category || 'osek_patur']}`}>
                        {categoryLabels[lead.category || 'osek_patur']}
                      </span>
                    </td>}
                    {visibleColumns.type && <td className="px-2 py-1.5 text-xs">
                     <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold shadow-sm ${
                       lead.interaction_type === 'phone_click' ? 'bg-blue-500 text-white' :
                       lead.interaction_type === 'whatsapp_click' ? 'bg-green-500 text-white' :
                       lead.interaction_type === 'manual' ? 'bg-purple-500 text-white' :
                       'bg-gray-500 text-white'
                     }`}>
                       {lead.interaction_type === 'phone_click' ? '📞' :
                        lead.interaction_type === 'whatsapp_click' ? '💬' :
                        lead.interaction_type === 'manual' ? '✋' :
                        '📝'}
                     </span>
                     </td>}
                     {visibleColumns.agent && <td className="px-2 py-1.5 text-sm">
                     <Select 
                       value={lead.agent_name || 'none'} 
                       onValueChange={async (value) => {
                         console.log('🔵 נבחר נציג:', value);
                         const selectedAgent = agents.find(a => a.full_name === value);
                         console.log('🔵 נמצא נציג:', selectedAgent);
                         
                         if (value === 'none' || !selectedAgent) {
                           updateLeadMutation.mutate({
                             id: lead.id,
                             data: { ...lead, agent_name: null }
                           });
                           return;
                         }
                         
                         if (!selectedAgent.phone) {
                           toast.warning(`לנציג ${selectedAgent.full_name} אין מספר טלפון`);
                           console.warn('⚠️ אין טלפון לנציג:', selectedAgent);
                         }

                         console.log('🔵 מעדכן ליד ושולח הודעה...');

                         // עדכון הליד
                         await base44.entities.Lead.update(lead.id, { 
                           ...lead, 
                           agent_name: selectedAgent.full_name 
                         });

                         // רענון הלידים
                         queryClient.invalidateQueries({ queryKey: ['leads'] });

                         // שליחת הודעה
                         if (selectedAgent.phone || selectedAgent.email) {
                           console.log('📱 שולח הודעה ל:', selectedAgent.full_name);
                           try {
                             const response = await base44.functions.invoke('sendAgentNotification', {
                               agentPhone: selectedAgent.phone,
                               agentEmail: selectedAgent.email,
                               agentName: selectedAgent.full_name,
                               leadName: lead.name,
                               leadPhone: lead.phone,
                               leadProfession: lead.profession || 'לא צוין',
                               notificationPreferences: selectedAgent.notification_preferences || ['whatsapp']
                             });
                             console.log('📱 תגובה מלאה:', response);
                             console.log('📱 URL של ווטסאפ:', response.data?.results?.whatsapp?.url);
                             if (response.data?.results?.whatsapp?.url) {
                               const whatsappUrl = response.data.results.whatsapp.url;
                               window.open(whatsappUrl, '_blank');
                             }
                             toast.success(`התראה נשלחה ל-${selectedAgent.full_name}`);
                           } catch (error) {
                             console.error('❌ שגיאה:', error);
                             toast.error(`שגיאה: ${error.message}`);
                           }
                         }
                       }}
                     >
                       <SelectTrigger className="w-28 h-7 text-[10px]">
                         <SelectValue />
                       </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">ללא נציג</SelectItem>
                          {agents.map(agent => (
                            <SelectItem key={agent.id} value={agent.full_name}>
                              {agent.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </td>}
                      {visibleColumns.status && <td className="px-2 py-1.5 text-center">
                      <Select 
                        value={lead.status || 'new'} 
                        onValueChange={(value) => handleQuickStatusUpdate(lead, value)}
                      >
                        <SelectTrigger className={`w-24 h-7 text-[10px] ${statusColors[lead.status || 'new']}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </td>}
                      {visibleColumns.priority && <td className="px-2 py-1.5 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${priorityColors[lead.priority || 'medium']}`}>
                        {priorityLabels[lead.priority || 'medium']}
                      </span>
                      </td>}
                      {visibleColumns.followUp && <td className="px-2 py-1.5 text-sm">
                      {editingFollowUp[lead.id] !== undefined ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="date"
                            value={editingFollowUp[lead.id]}
                            onChange={(e) => setEditingFollowUp({ ...editingFollowUp, [lead.id]: e.target.value })}
                            className="h-6 text-[10px] w-24"
                          />
                          <button
                            onClick={() => handleSaveFollowUp(lead)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              const { [lead.id]: _, ...rest } = editingFollowUp;
                              setEditingFollowUp(rest);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingFollowUp({ ...editingFollowUp, [lead.id]: lead.follow_up_date || new Date().toISOString().split('T')[0] })}
                          className="text-right w-full hover:bg-gray-100 rounded px-1 py-0.5"
                        >
                          {lead.follow_up_date ? (
                            <div className={`flex items-center gap-1 text-[10px] ${lead.follow_up_date === new Date().toISOString().split('T')[0] ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                              <Calendar className="w-3 h-3" />
                              {format(new Date(lead.follow_up_date), 'dd/MM')}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[10px]">+</span>
                          )}
                        </button>
                        )}
                        </td>}
                        {visibleColumns.notes && <td className="px-2 py-1.5 text-sm max-w-[150px]">
                      {editingNotes[lead.id] !== undefined ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingNotes[lead.id]}
                            onChange={(e) => setEditingNotes({ ...editingNotes, [lead.id]: e.target.value })}
                            placeholder="הערות..."
                            className="h-6 text-[10px]"
                          />
                          <button
                            onClick={() => handleSaveNotes(lead)}
                            className="text-green-600 hover:text-green-700 flex-shrink-0"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              const { [lead.id]: _, ...rest } = editingNotes;
                              setEditingNotes(rest);
                            }}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingNotes({ ...editingNotes, [lead.id]: lead.notes || '' })}
                          className="text-right w-full hover:bg-gray-100 rounded px-1 py-0.5 truncate text-[10px]"
                          title={lead.notes}
                        >
                          {lead.notes || <span className="text-gray-400">+</span>}
                          </button>
                          )}
                          </td>}
                          <td className="px-2 py-1.5">
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={`https://wa.me/972${(lead.phone || '').replace(/^0/, '')}?text=${encodeURIComponent(`היי ${lead.name}, אני מפרפקט one. ${lead.profession ? `ראיתי שאת/ה ${lead.profession}` : 'נעים להכיר'} - איך אפשר לעזור לך?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#25D366] hover:text-[#128C7E]"
                          title="וואטסאפ"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-[#1E3A5F] hover:text-[#2C5282]"
                          title="ערוך"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead)}
                          className="text-red-500 hover:text-red-700"
                          title="מחק"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sortedLeads.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            אין לידים להצגה
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">עריכת ליד - {selectedLead?.name}</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <LeadEditForm
              lead={selectedLead}
              onSave={(data) => {
                updateLeadMutation.mutate({ id: selectedLead.id, data });
              }}
              onCancel={() => setSelectedLead(null)}
              isLoading={updateLeadMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={showAddLeadDialog} onOpenChange={setShowAddLeadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">הוספת ליד ידנית</DialogTitle>
          </DialogHeader>
          <AddLeadForm
            onSave={(data) => {
              createLeadMutation.mutate({ ...data, interaction_type: 'manual' });
            }}
            onCancel={() => setShowAddLeadDialog(false)}
            isLoading={createLeadMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Dialog */}
      <Dialog open={showBulkAssignDialog} onOpenChange={setShowBulkAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>העברת {selectedLeads.length} לידים לנציג</DialogTitle>
          </DialogHeader>
          <div className="space-y-4" dir="rtl">
            <p className="text-gray-600">בחר נציג להעברה:</p>
            <div className="space-y-2">
              <Button
                onClick={() => handleBulkAssignToAgent('none')}
                variant="outline"
                className="w-full justify-start"
              >
                ללא נציג
              </Button>
              {agents.map(agent => (
                <Button
                  key={agent.id}
                  onClick={() => handleBulkAssignToAgent(agent.full_name)}
                  variant="outline"
                  className="w-full justify-start hover:bg-indigo-50"
                >
                  {agent.full_name}
                </Button>
              ))}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowBulkAssignDialog(false)}
              className="w-full"
            >
              ביטול
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}

function LeadEditForm({ lead, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    status: lead.status || 'new',
    priority: lead.priority || 'medium',
    follow_up_date: lead.follow_up_date || '',
    last_contact_date: lead.last_contact_date || '',
    notes: lead.notes || '',
    not_interested_reason: lead.not_interested_reason || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...lead, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">סטטוס</label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">חדש</SelectItem>
              <SelectItem value="contacted">יצרנו קשר</SelectItem>
              <SelectItem value="no_answer">אין מענה</SelectItem>
              <SelectItem value="in_progress">בתהליך</SelectItem>
              <SelectItem value="qualified">מתאים</SelectItem>
              <SelectItem value="not_interested">לא מעוניין</SelectItem>
              <SelectItem value="converted">נסגר</SelectItem>
              <SelectItem value="closed">סגור</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">עדיפות</label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">נמוך</SelectItem>
              <SelectItem value="medium">בינוני</SelectItem>
              <SelectItem value="high">גבוה</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.status === 'not_interested' && (
        <div>
          <label className="block text-sm font-medium mb-2">סיבה לאי התאמה</label>
          <Select 
            value={formData.not_interested_reason} 
            onValueChange={(value) => setFormData({ ...formData, not_interested_reason: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר סיבה..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="already_has_osek">כבר יש עוסק פטור</SelectItem>
              <SelectItem value="not_now">לא כרגע</SelectItem>
              <SelectItem value="looking_for_different_service">מחפש שירות אחר</SelectItem>
              <SelectItem value="price_too_high">המחיר יקר מדי</SelectItem>
              <SelectItem value="prefers_other_accountant">מעדיף רואה חשבון אחר</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">תאריך חזרה ללקוח</label>
          <Input
            type="date"
            value={formData.follow_up_date}
            onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">תאריך יצירת קשר אחרון</label>
          <Input
            type="date"
            value={formData.last_contact_date}
            onChange={(e) => setFormData({ ...formData, last_contact_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">הערות</label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          placeholder="הערות נוספות על הליד..."
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-bold mb-2">פרטי הליד:</h4>
        <div className="space-y-1 text-sm">
          <div><strong>טלפון:</strong> {lead.phone}</div>
          {lead.email && <div><strong>מייל:</strong> {lead.email}</div>}
          {lead.profession && <div><strong>מקצוע:</strong> {lead.profession}</div>}
          {lead.source_page && <div><strong>מקור:</strong> {lead.source_page}</div>}
          <div><strong>נוצר:</strong> {format(new Date(lead.created_date), 'dd/MM/yyyy HH:mm')}</div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1 bg-[#27AE60] hover:bg-[#2ECC71]">
          {isLoading ? 'שומר...' : 'שמור שינויים'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          ביטול
        </Button>
      </div>
    </form>
  );
}

function AddLeadForm({ onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    profession: '',
    notes: '',
    source_page: 'הוספה ידנית',
    status: 'new',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('נא למלא שם וטלפון');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">שם מלא *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="שם מלא"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">טלפון *</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="05X-XXXXXXX"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">אימייל</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">מקצוע</label>
          <Input
            value={formData.profession}
            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            placeholder="מקצוע"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">סטטוס</label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">חדש</SelectItem>
              <SelectItem value="contacted">יצרנו קשר</SelectItem>
              <SelectItem value="no_answer">אין מענה</SelectItem>
              <SelectItem value="in_progress">בתהליך</SelectItem>
              <SelectItem value="qualified">מתאים</SelectItem>
              <SelectItem value="not_interested">לא מעוניין</SelectItem>
              <SelectItem value="converted">נסגר</SelectItem>
              <SelectItem value="closed">סגור</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">עדיפות</label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">נמוך</SelectItem>
              <SelectItem value="medium">בינוני</SelectItem>
              <SelectItem value="high">גבוה</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">הערות</label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="הערות נוספות..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1 bg-[#27AE60] hover:bg-[#2ECC71]">
          {isLoading ? 'שומר...' : 'הוסף ליד'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          ביטול
        </Button>
      </div>
    </form>
  );
}