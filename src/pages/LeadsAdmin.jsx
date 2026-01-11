import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, ExternalLink, Loader2, Phone, Mail, MessageCircle, Calendar, Search, Filter, Edit2, X, Trash2, Save, Plus, UserPlus, Users, CheckSquare, Square } from 'lucide-react';
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
  const [editingNotes, setEditingNotes] = useState({});
  const [editingFollowUp, setEditingFollowUp] = useState({});
  const [sortBy, setSortBy] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
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
    mutationFn: (id) => base44.entities.Lead.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
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

  const handleBulkAssignToAgent = async (agentName) => {
    for (const leadId of selectedLeads) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        await base44.entities.Lead.update(leadId, { ...lead, agent_name: agentName === 'none' ? null : agentName });
      }
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
    return matchStatus && matchPriority && matchCategory && matchSearch;
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
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 flex flex-col overflow-hidden" dir="rtl">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F] mb-1">ניהול לידים - CRM</h1>
            <p className="text-sm text-gray-600">כל הלידים שמגיעים מהאתר + מעקב אחר לחיצות</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('AgentsManager')}>
              <Button 
                variant="outline"
                className="border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white"
              >
                <Users className="w-5 h-5 ml-2" />
                ניהול נציגים
              </Button>
            </Link>
            <Button 
              onClick={() => setShowAddLeadDialog(true)}
              className="bg-[#27AE60] hover:bg-[#2ECC71]"
            >
              <UserPlus className="w-5 h-5 ml-2" />
              הוסף ליד ידנית
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3 flex-shrink-0">
          <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-lg p-2 shadow-lg shadow-[#1E3A5F]/30">
            <div className="text-2xl font-black text-white">{stats.total}</div>
            <div className="text-xs text-white/80 font-semibold">סך הכל</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 shadow-lg shadow-blue-500/40">
            <div className="text-2xl font-black text-white">{stats.new}</div>
            <div className="text-xs text-white/90 font-semibold">חדשים</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-2 shadow-lg shadow-yellow-500/40">
            <div className="text-2xl font-black text-white">{stats.contacted}</div>
            <div className="text-xs text-white/90 font-semibold">יצרנו קשר</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2 shadow-lg shadow-green-500/50 animate-pulse">
            <div className="text-2xl font-black text-white">{stats.converted}</div>
            <div className="text-xs text-white/90 font-semibold">נסגרו ✨</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-2 shadow-lg shadow-red-500/50">
            <div className="text-2xl font-black text-white">{stats.followUpToday}</div>
            <div className="text-xs text-white/90 font-semibold">היום</div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.length > 0 && (
          <div className="bg-indigo-100 border-2 border-indigo-300 rounded-lg shadow p-2 mb-2 flex-shrink-0">
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
        <div className="bg-white rounded-lg shadow p-2 mb-2 flex-shrink-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="חיפוש לפי שם, טלפון או מייל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
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
              <SelectTrigger className="w-full md:w-48">
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
              <SelectTrigger className="w-full md:w-48">
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
            <Button onClick={exportToCSV} className="bg-[#27AE60] hover:bg-[#2ECC71]">
              <Download className="w-5 h-5 ml-2" />
              ייצא
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="overflow-auto flex-1">
            <table className="w-full">
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
                  <th className="px-3 py-2 text-right sticky top-0 bg-[#1E3A5F]">תאריך</th>
                  <th className="px-3 py-2 text-right sticky top-0 bg-[#1E3A5F]">שם</th>
                  <th className="px-3 py-2 text-right sticky top-0 bg-[#1E3A5F]">טלפון</th>
                  <th className="px-3 py-2 text-right sticky top-0 bg-[#1E3A5F]">מקצוע</th>
                  <th className="px-3 py-2 text-right sticky top-0 bg-[#1E3A5F]">מקור</th>
                  <th className="px-3 py-2 text-right sticky top-0 bg-[#1E3A5F]">קטגוריה</th>
                  <th className="px-3 py-2 text-right sticky top-0 bg-[#1E3A5F]">סוג</th>
                  <th className="px-3 py-2 text-right sticky top-0 bg-[#1E3A5F]">נציג</th>
                  <th 
                    className="px-3 py-2 text-center cursor-pointer hover:bg-[#2C5282] transition-colors sticky top-0 bg-[#1E3A5F]"
                    onClick={() => setSortBy(sortBy === 'status' ? null : 'status')}
                    title="לחץ למיון לפי סטטוס"
                  >
                    <div className="flex items-center justify-center gap-2">
                      סטטוס
                      {sortBy === 'status' && <span className="text-yellow-300">▼</span>}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-2 text-center cursor-pointer hover:bg-[#2C5282] transition-colors sticky top-0 bg-[#1E3A5F]"
                    onClick={() => setSortBy(sortBy === 'priority' ? null : 'priority')}
                    title="לחץ למיון לפי עדיפות"
                  >
                    <div className="flex items-center justify-center gap-2">
                      עדיפות
                      {sortBy === 'priority' && <span className="text-yellow-300">▼</span>}
                    </div>
                  </th>
                  <th className="px-3 py-2 text-right sticky top-0 bg-[#1E3A5F]">חזרה</th>
                  <th className="px-3 py-2 text-right sticky top-0 bg-[#1E3A5F]">הערות</th>
                  <th className="px-3 py-2 text-center sticky top-0 bg-[#1E3A5F]">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeads.map((lead, index) => (
                  <tr key={lead.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => toggleSelectLead(lead.id)} className="hover:bg-gray-200 p-1 rounded">
                        {selectedLeads.includes(lead.id) ? (
                          <CheckSquare className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {format(new Date(lead.created_date), 'dd/MM/yy HH:mm')}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-sm">{lead.name}</div>
                      {lead.email && <div className="text-xs text-gray-500">{lead.email}</div>}
                    </td>
                    <td className="px-3 py-2">
                      <a href={`tel:${lead.phone}`} className="text-[#1E3A5F] hover:underline flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-xs">{lead.profession || '-'}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{lead.source_page || '-'}</td>
                    <td className="px-3 py-2 text-xs">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${categoryColors[lead.category || 'osek_patur']}`}>
                        {categoryLabels[lead.category || 'osek_patur']}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                     <span className={`inline-block px-2 py-1 rounded font-semibold shadow-md ${
                       lead.interaction_type === 'phone_click' ? 'bg-blue-500 text-white shadow-blue-500/40' :
                       lead.interaction_type === 'whatsapp_click' ? 'bg-green-500 text-white shadow-green-500/40' :
                       lead.interaction_type === 'manual' ? 'bg-purple-500 text-white shadow-purple-500/40' :
                       'bg-gray-500 text-white shadow-gray-500/40'
                     }`}>
                       {lead.interaction_type === 'phone_click' ? '📞 חייג' :
                        lead.interaction_type === 'whatsapp_click' ? '💬 וואטסאפ' :
                        lead.interaction_type === 'manual' ? '✋ ידני' :
                        '📝 טופס'}
                     </span>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <Select 
                        value={lead.agent_name || 'none'} 
                        onValueChange={(value) => {
                          updateLeadMutation.mutate({
                            id: lead.id,
                            data: { ...lead, agent_name: value === 'none' ? null : value }
                          });
                        }}
                      >
                        <SelectTrigger className="w-40 h-8 text-xs">
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
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Select 
                        value={lead.status || 'new'} 
                        onValueChange={(value) => handleQuickStatusUpdate(lead, value)}
                      >
                        <SelectTrigger className={`w-32 h-8 text-xs ${statusColors[lead.status || 'new']}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${priorityColors[lead.priority || 'medium']}`}>
                        {priorityLabels[lead.priority || 'medium']}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {editingFollowUp[lead.id] !== undefined ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="date"
                            value={editingFollowUp[lead.id]}
                            onChange={(e) => setEditingFollowUp({ ...editingFollowUp, [lead.id]: e.target.value })}
                            className="h-8 text-xs w-32"
                          />
                          <button
                            onClick={() => handleSaveFollowUp(lead)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const { [lead.id]: _, ...rest } = editingFollowUp;
                              setEditingFollowUp(rest);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingFollowUp({ ...editingFollowUp, [lead.id]: lead.follow_up_date || new Date().toISOString().split('T')[0] })}
                          className="text-right w-full hover:bg-gray-100 rounded px-2 py-1"
                        >
                          {lead.follow_up_date ? (
                            <div className={`flex items-center gap-1 ${lead.follow_up_date === new Date().toISOString().split('T')[0] ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                              <Calendar className="w-3 h-3" />
                              {format(new Date(lead.follow_up_date), 'dd/MM/yy')}
                            </div>
                          ) : (
                            <span className="text-gray-400">הוסף תאריך</span>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm max-w-xs">
                      {editingNotes[lead.id] !== undefined ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingNotes[lead.id]}
                            onChange={(e) => setEditingNotes({ ...editingNotes, [lead.id]: e.target.value })}
                            placeholder="הערות..."
                            className="h-8 text-xs"
                          />
                          <button
                            onClick={() => handleSaveNotes(lead)}
                            className="text-green-600 hover:text-green-700 flex-shrink-0"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const { [lead.id]: _, ...rest } = editingNotes;
                              setEditingNotes(rest);
                            }}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingNotes({ ...editingNotes, [lead.id]: lead.notes || '' })}
                          className="text-right w-full hover:bg-gray-100 rounded px-2 py-1 truncate"
                          title={lead.notes}
                        >
                          {lead.notes || <span className="text-gray-400">הוסף הערה</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`https://wa.me/972${(lead.phone || '').replace(/^0/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#25D366] hover:text-[#128C7E]"
                          title="פתח בוואטסאפ"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-[#1E3A5F] hover:text-[#2C5282]"
                          title="ערוך מלא"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead)}
                          className="text-red-500 hover:text-red-700"
                          title="מחק"
                        >
                          <Trash2 className="w-5 h-5" />
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
          <div className="text-center py-12 text-gray-500">
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
  );
}

function LeadEditForm({ lead, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    status: lead.status || 'new',
    priority: lead.priority || 'medium',
    follow_up_date: lead.follow_up_date || '',
    last_contact_date: lead.last_contact_date || '',
    notes: lead.notes || ''
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