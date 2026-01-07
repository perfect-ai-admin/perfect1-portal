import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, ExternalLink, Loader2, Phone, Mail, MessageCircle, Calendar, Search, Filter, Edit2, X } from 'lucide-react';
import { format } from 'date-fns';

export default function LeadsAdmin() {
  const [selectedLead, setSelectedLead] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 1000),
    initialData: []
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedLead(null);
    }
  });

  const handleQuickStatusUpdate = (lead, newStatus) => {
    updateLeadMutation.mutate({
      id: lead.id,
      data: { ...lead, status: newStatus, last_contact_date: new Date().toISOString().split('T')[0] }
    });
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
    const matchSearch = !searchTerm || 
      (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       lead.phone?.includes(searchTerm) ||
       lead.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchPriority && matchSearch;
  });

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-purple-100 text-purple-800',
    converted: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  const statusLabels = {
    new: 'חדש',
    contacted: 'יצרנו קשר',
    qualified: 'מתאים',
    converted: 'נסגר',
    closed: 'סגור'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-red-100 text-red-700'
  };

  const priorityLabels = {
    low: 'נמוך',
    medium: 'בינוני',
    high: 'גבוה'
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">ניהול לידים - CRM</h1>
          <p className="text-gray-600">כל הלידים שמגיעים מהאתר</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-[#1E3A5F]">{stats.total}</div>
            <div className="text-sm text-gray-600">סך הכל לידים</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <div className="text-sm text-gray-600">לידים חדשים</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
            <div className="text-sm text-gray-600">יצרנו קשר</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
            <div className="text-sm text-gray-600">נסגרו</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 shadow">
            <div className="text-2xl font-bold text-red-600">{stats.followUpToday}</div>
            <div className="text-sm text-gray-600">חזרה היום</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
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
                <SelectItem value="qualified">מתאים</SelectItem>
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
            <Button onClick={exportToCSV} className="bg-[#27AE60] hover:bg-[#2ECC71]">
              <Download className="w-5 h-5 ml-2" />
              ייצא
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E3A5F] text-white">
                <tr>
                  <th className="px-4 py-3 text-right">שם</th>
                  <th className="px-4 py-3 text-right">טלפון</th>
                  <th className="px-4 py-3 text-right">מקצוע</th>
                  <th className="px-4 py-3 text-right">מקור</th>
                  <th className="px-4 py-3 text-center">סטטוס</th>
                  <th className="px-4 py-3 text-center">עדיפות</th>
                  <th className="px-4 py-3 text-right">חזרה</th>
                  <th className="px-4 py-3 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, index) => (
                  <tr key={lead.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
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
                    <td className="px-4 py-3 text-xs text-gray-500">{lead.source_page || '-'}</td>
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
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${priorityColors[lead.priority || 'medium']}`}>
                        {priorityLabels[lead.priority || 'medium']}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {lead.follow_up_date ? (
                        <div className={`flex items-center gap-1 ${lead.follow_up_date === new Date().toISOString().split('T')[0] ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                          <Calendar className="w-3 h-3" />
                          {format(new Date(lead.follow_up_date), 'dd/MM/yy')}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
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
                          title="ערוך"
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
              <SelectItem value="qualified">מתאים</SelectItem>
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