import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Phone, MessageCircle, Calendar, Search, LogOut, Save, X, Edit2, Columns3, Filter } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

export default function AgentCRM() {
  const [agent, setAgent] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingNotes, setEditingNotes] = useState({});
  const [editingFollowUp, setEditingFollowUp] = useState({});
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [showNotInterestedDialog, setShowNotInterestedDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    name: true,
    phone: true,
    profession: true,
    status: true,
    followUp: true,
    notes: true
  });
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

  // Hide footer for this page
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'none';
    return () => {
      if (footer) footer.style.display = '';
    };
  }, []);

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
    if (newStatus === 'not_interested') {
      setPendingStatusChange({ lead, status: newStatus });
      setShowNotInterestedDialog(true);
    } else {
      updateLeadMutation.mutate({
        id: lead.id,
        data: { ...lead, status: newStatus, not_interested_reason: null, last_contact_date: new Date().toISOString().split('T')[0] }
      });
    }
  };

  const handleNotInterestedWithReason = (reason) => {
    if (!pendingStatusChange) return;
    
    updateLeadMutation.mutate({
      id: pendingStatusChange.lead.id,
      data: { 
        ...pendingStatusChange.lead, 
        status: 'not_interested',
        not_interested_reason: reason,
        last_contact_date: new Date().toISOString().split('T')[0] 
      }
    });
    
    setShowNotInterestedDialog(false);
    setPendingStatusChange(null);
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
    const matchCategory = filterCategory === 'all' || lead.category === filterCategory;
    const matchSearch = !searchTerm || 
      (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       lead.phone?.includes(searchTerm));
    const matchSelectedStatuses = selectedStatuses.length === 0 || selectedStatuses.includes(lead.status || 'new');
    return matchStatus && matchCategory && matchSearch && matchSelectedStatuses;
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
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 p-3 md:p-6 md:pt-24 pb-8" dir="rtl">
      <div className="max-w-7xl mx-auto w-full">
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Columns3 className="w-4 h-4 ml-2" />
                  עמודות
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  <div className="font-semibold text-sm mb-3">בחר עמודות להצגה</div>
                  {[
                    { key: 'date', label: 'תאריך כניסה' },
                    { key: 'name', label: 'שם' },
                    { key: 'phone', label: 'טלפון' },
                    { key: 'profession', label: 'מקצוע' },
                    { key: 'status', label: 'סטטוס' },
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
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-3">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-xl shadow-lg p-4 border-r-4" style={{
              borderColor: lead.status === 'converted' ? '#16a34a' : 
                          lead.status === 'new' ? '#3b82f6' : 
                          lead.status === 'not_interested' ? '#dc2626' : '#6b7280'
            }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[#1E3A5F] mb-2">{lead.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusColors[lead.status || 'new']}`}>
                      {statusLabels[lead.status || 'new']}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-[#1E3A5F] font-semibold">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                </div>
                {lead.email && (
                  <div className="text-sm text-gray-600 truncate">{lead.email}</div>
                )}
                {lead.profession && (
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">מקצוע:</span> {lead.profession}
                  </div>
                )}
              </div>

              {/* Notes */}
              {lead.notes && (
                <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">
                  {lead.notes}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={`tel:${lead.phone}`}
                  className="flex-1 bg-[#1E3A5F] text-white rounded-lg py-3 flex items-center justify-center gap-2 font-bold shadow-md active:scale-95 transition-transform"
                >
                  <Phone className="w-5 h-5" />
                  התקשר
                </a>
                <a
                  href={`https://wa.me/972${(lead.phone || '').replace(/^0/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] text-white rounded-lg py-3 flex items-center justify-center gap-2 font-bold shadow-md active:scale-95 transition-transform"
                >
                  <MessageCircle className="w-5 h-5" />
                  וואטסאפ
                </a>
                <button
                  onClick={() => setSelectedLead(lead)}
                  className="bg-gray-100 text-gray-700 rounded-lg px-4 py-3 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-gray-400 text-center mt-3 pt-3 border-t">
                {format(new Date(lead.created_date), 'dd/MM/yy HH:mm')}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E3A5F] text-white">
                <tr>
                  {visibleColumns.date && <th className="px-4 py-3 text-right">תאריך כניסה</th>}
                  {visibleColumns.name && <th className="px-4 py-3 text-right">שם</th>}
                  {visibleColumns.phone && <th className="px-4 py-3 text-right">טלפון</th>}
                  {visibleColumns.profession && <th className="px-4 py-3 text-right">מקצוע</th>}
                  {visibleColumns.status && <th className="px-4 py-3 text-center">
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
                  {visibleColumns.followUp && <th className="px-4 py-3 text-right">חזרה</th>}
                  {visibleColumns.notes && <th className="px-4 py-3 text-right">הערות</th>}
                  <th className="px-4 py-3 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, index) => (
                  <tr key={lead.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    {visibleColumns.date && <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(lead.created_date), 'dd/MM/yy HH:mm')}
                    </td>}
                    {visibleColumns.name && <td className="px-4 py-3">
                      <div className="font-medium">{lead.name}</div>
                      {lead.email && <div className="text-xs text-gray-500">{lead.email}</div>}
                    </td>}
                    {visibleColumns.phone && <td className="px-4 py-3">
                      <a href={`tel:${lead.phone}`} className="text-[#1E3A5F] hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </a>
                    </td>}
                    {visibleColumns.profession && <td className="px-4 py-3 text-sm">{lead.profession || '-'}</td>}
                    {visibleColumns.status && <td className="px-4 py-3 text-center">
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
                    </td>}
                    {visibleColumns.followUp && <td className="px-4 py-3 text-sm">
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
                    </td>}
                    {visibleColumns.notes && <td className="px-4 py-3 text-sm max-w-xs">
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
                          </td>}
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

      {/* Lead Edit Dialog */}
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
              onStatusChange={(newStatus) => {
                if (newStatus === 'not_interested') {
                  setPendingStatusChange({ lead: selectedLead, status: newStatus });
                  setShowNotInterestedDialog(true);
                  setSelectedLead(null);
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Not Interested Reason Dialog */}
      <Dialog open={showNotInterestedDialog} onOpenChange={(open) => {
        if (!open) {
          setShowNotInterestedDialog(false);
          setPendingStatusChange(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>למה הליד לא רלוונטי?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3" dir="rtl">
            <p className="text-sm text-gray-600 mb-4">בחר סיבה מהרשימה:</p>
            
            <Button
              onClick={() => handleNotInterestedWithReason('already_has_osek')}
              variant="outline"
              className="w-full justify-start text-right h-auto py-3 hover:bg-red-50 hover:border-red-300"
            >
              <div>
                <div className="font-semibold">כבר פתח עוסק פטור</div>
                <div className="text-xs text-gray-500">הלקוח כבר בעל עוסק פטור פעיל</div>
              </div>
            </Button>

            <Button
              onClick={() => handleNotInterestedWithReason('not_now')}
              variant="outline"
              className="w-full justify-start text-right h-auto py-3 hover:bg-red-50 hover:border-red-300"
            >
              <div>
                <div className="font-semibold">לא מעוניין כרגע</div>
                <div className="text-xs text-gray-500">רוצה לפתוח בעתיד אבל לא עכשיו</div>
              </div>
            </Button>

            <Button
              onClick={() => handleNotInterestedWithReason('looking_for_different_service')}
              variant="outline"
              className="w-full justify-start text-right h-auto py-3 hover:bg-red-50 hover:border-red-300"
            >
              <div>
                <div className="font-semibold">מחפש שירות אחר</div>
                <div className="text-xs text-gray-500">לא פתיחת עוסק - מעוניין בשירות אחר</div>
              </div>
            </Button>

            <Button
              onClick={() => handleNotInterestedWithReason('price_too_high')}
              variant="outline"
              className="w-full justify-start text-right h-auto py-3 hover:bg-red-50 hover:border-red-300"
            >
              <div>
                <div className="font-semibold">מחיר גבוה מדי</div>
                <div className="text-xs text-gray-500">המחיר לא מתאים ללקוח</div>
              </div>
            </Button>

            <Button
              onClick={() => handleNotInterestedWithReason('prefers_other_accountant')}
              variant="outline"
              className="w-full justify-start text-right h-auto py-3 hover:bg-red-50 hover:border-red-300"
            >
              <div>
                <div className="font-semibold">מעדיף רואה חשבון אחר</div>
                <div className="text-xs text-gray-500">יש לו רו"ח אחר או מעדיף לעבוד עם מישהו אחר</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => {
                setShowNotInterestedDialog(false);
                setPendingStatusChange(null);
              }}
              className="w-full mt-4"
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

function LeadEditForm({ lead, onSave, onCancel, isLoading, onStatusChange }) {
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

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'not_interested') {
      onStatusChange('not_interested');
    } else {
      setFormData({ ...formData, status: newStatus });
    }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">סטטוס</label>
          <Select value={formData.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
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