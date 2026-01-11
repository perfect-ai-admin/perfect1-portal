import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Phone, MessageCircle, Calendar, Search, LogOut, Save, X, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AgentCRM() {
  const [agent, setAgent] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingNotes, setEditingNotes] = useState({});
  const [editingFollowUp, setEditingFollowUp] = useState({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedAgent = localStorage.getItem('agent');
    if (!storedAgent) {
      navigate('/AgentLogin');
      return;
    }
    setAgent(JSON.parse(storedAgent));
  }, [navigate]);

  const { data: allLeads, isLoading } = useQuery({
    queryKey: ['agent-leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 1000),
    initialData: [],
    enabled: !!agent
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-leads'] });
      setSelectedLead(null);
      setEditingNotes({});
      setEditingFollowUp({});
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('agent');
    navigate('/AgentLogin');
  };

  const handleQuickStatusUpdate = (lead, newStatus) => {
    updateLeadMutation.mutate({
      id: lead.id,
      data: { ...lead, status: newStatus, last_contact_date: new Date().toISOString().split('T')[0] }
    });
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

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // סינון לידים של הנציג הספציפי
  const myLeads = allLeads.filter(lead => lead.agent_name === agent.full_name);

  const filteredLeads = myLeads.filter(lead => {
    const matchStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchSearch = !searchTerm || 
      (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       lead.phone?.includes(searchTerm));
    return matchStatus && matchSearch;
  });

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    no_answer: 'bg-orange-100 text-orange-800',
    in_progress: 'bg-cyan-100 text-cyan-800',
    qualified: 'bg-purple-100 text-purple-800',
    not_interested: 'bg-red-100 text-red-800',
    converted: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
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

  const stats = {
    total: myLeads.length,
    new: myLeads.filter(l => l.status === 'new').length,
    contacted: myLeads.filter(l => l.status === 'contacted').length,
    converted: myLeads.filter(l => l.status === 'converted').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">הלידים שלי</h1>
            <p className="text-gray-600">שלום {agent.full_name}</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 ml-2" />
            התנתק
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-[#1E3A5F]">{stats.total}</div>
            <div className="text-sm text-gray-600">סך הכל לידים</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <div className="text-sm text-gray-600">חדשים</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
            <div className="text-sm text-gray-600">יצרנו קשר</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
            <div className="text-sm text-gray-600">נסגרו</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="חיפוש לפי שם או טלפון..."
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
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E3A5F] text-white">
                <tr>
                  <th className="px-4 py-3 text-right">תאריך כניסה</th>
                  <th className="px-4 py-3 text-right">שם</th>
                  <th className="px-4 py-3 text-right">טלפון</th>
                  <th className="px-4 py-3 text-right">מקצוע</th>
                  <th className="px-4 py-3 text-center">סטטוס</th>
                  <th className="px-4 py-3 text-right">חזרה</th>
                  <th className="px-4 py-3 text-right">הערות</th>
                  <th className="px-4 py-3 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, index) => (
                  <tr key={lead.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(lead.created_date), 'dd/MM/yy HH:mm')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{lead.name}</div>
                      {lead.email && <div className="text-xs text-gray-500">{lead.email}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`tel:${lead.phone}`} className="text-[#1E3A5F] hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">{lead.profession || '-'}</td>
                    <td className="px-4 py-3 text-center">
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
                    <td className="px-4 py-3 text-sm">
                      {editingFollowUp[lead.id] !== undefined ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="date"
                            value={editingFollowUp[lead.id]}
                            onChange={(e) => setEditingFollowUp({ ...editingFollowUp, [lead.id]: e.target.value })}
                            className="h-8 text-xs w-32"
                          />
                          <button onClick={() => handleSaveFollowUp(lead)} className="text-green-600">
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const { [lead.id]: _, ...rest } = editingFollowUp;
                              setEditingFollowUp(rest);
                            }}
                            className="text-gray-400"
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
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(lead.follow_up_date), 'dd/MM/yy')}
                            </div>
                          ) : (
                            <span className="text-gray-400">הוסף</span>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs">
                      {editingNotes[lead.id] !== undefined ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingNotes[lead.id]}
                            onChange={(e) => setEditingNotes({ ...editingNotes, [lead.id]: e.target.value })}
                            placeholder="הערות..."
                            className="h-8 text-xs"
                          />
                          <button onClick={() => handleSaveNotes(lead)} className="text-green-600">
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const { [lead.id]: _, ...rest } = editingNotes;
                              setEditingNotes(rest);
                            }}
                            className="text-gray-400"
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
                          {lead.notes || <span className="text-gray-400">הוסף</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`https://wa.me/972${(lead.phone || '').replace(/^0/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#25D366] hover:text-[#128C7E]"
                          title="וואטסאפ"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-[#1E3A5F] hover:text-[#2C5282]"
                          title="פרטים"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            אין לידים להצגה
          </div>
        )}
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>פרטי ליד - {selectedLead?.name}</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4" dir="rtl">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div><strong>טלפון:</strong> {selectedLead.phone}</div>
                  {selectedLead.email && <div><strong>מייל:</strong> {selectedLead.email}</div>}
                  {selectedLead.profession && <div><strong>מקצוע:</strong> {selectedLead.profession}</div>}
                  {selectedLead.source_page && <div><strong>מקור:</strong> {selectedLead.source_page}</div>}
                  <div><strong>תאריך כניסה:</strong> {format(new Date(selectedLead.created_date), 'dd/MM/yyyy HH:mm')}</div>
                  {selectedLead.notes && <div><strong>הערות:</strong> {selectedLead.notes}</div>}
                </div>
              </div>
              <Button onClick={() => setSelectedLead(null)} className="w-full">
                סגור
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}