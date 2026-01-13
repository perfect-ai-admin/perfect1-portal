import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, UserPlus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AgentsManager() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const queryClient = useQueryClient();

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list('-created_date', 100),
    initialData: []
  });

  const createAgentMutation = useMutation({
    mutationFn: (data) => base44.entities.Agent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setShowAddDialog(false);
    }
  });

  const updateAgentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Agent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setEditingAgent(null);
    }
  });

  const deleteAgentMutation = useMutation({
    mutationFn: (id) => base44.entities.Agent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });

  const handleDelete = (agent) => {
    if (window.confirm(`למחוק את ${agent.full_name}?`)) {
      deleteAgentMutation.mutate(agent.id);
    }
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
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">ניהול נציגים</h1>
            <p className="text-gray-600">הוספה, עריכה ומחיקה של נציגי מכירות</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('LeadsAdmin')}>
              <Button variant="outline">
                חזור ל-CRM
              </Button>
            </Link>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-[#27AE60] hover:bg-[#2ECC71] shadow-lg"
            >
              <UserPlus className="w-5 h-5 ml-2" />
              נציג מכירות חדש
            </Button>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#1E3A5F]">{agent.full_name}</h3>
                  <p className="text-sm text-gray-600">שם משתמש: {agent.username}</p>
                  {agent.email && (
                    <p className="text-sm text-gray-600">אימייל: {agent.email}</p>
                  )}
                  {agent.phone && (
                    <p className="text-sm text-gray-600">טלפון: {agent.phone}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {agent.active ? (
                      <span className="text-green-600">✓ פעיל</span>
                    ) : (
                      <span className="text-red-600">✗ לא פעיל</span>
                    )}
                  </p>
                  {agent.notification_preferences && agent.notification_preferences.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      התראות: {agent.notification_preferences.map(p => 
                        p === 'whatsapp' ? '📱' : p === 'email' ? '📧' : '💬'
                      ).join(' ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingAgent(agent)}
                    className="text-[#1E3A5F] hover:text-[#2C5282]"
                    title="ערוך"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(agent)}
                    className="text-red-500 hover:text-red-700"
                    title="מחק"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-700">
                  <strong>סיסמה:</strong> {agent.password}
                </p>
              </div>
            </div>
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            אין נציגים במערכת
          </div>
        )}
      </div>

      {/* Add Agent Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>הוספת נציג חדש</DialogTitle>
          </DialogHeader>
          <AgentForm
            onSave={(data) => createAgentMutation.mutate(data)}
            onCancel={() => setShowAddDialog(false)}
            isLoading={createAgentMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>עריכת נציג</DialogTitle>
          </DialogHeader>
          {editingAgent && (
            <AgentForm
              agent={editingAgent}
              onSave={(data) => {
                updateAgentMutation.mutate({ id: editingAgent.id, data: { ...editingAgent, ...data } });
              }}
              onCancel={() => setEditingAgent(null)}
              isLoading={updateAgentMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}

function AgentForm({ agent, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    full_name: agent?.full_name || '',
    email: agent?.email || '',
    phone: agent?.phone || '',
    username: agent?.username || '',
    password: agent?.password || '',
    active: agent?.active !== false,
    notification_preferences: agent?.notification_preferences || ['whatsapp']
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.phone || !formData.username || !formData.password) {
      alert('נא למלא את כל השדות');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div>
        <label className="block text-sm font-medium mb-2">שם מלא *</label>
        <Input
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="שם מלא"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">אימייל *</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">טלפון *</label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="05X-XXXXXXX"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">שם משתמש *</label>
        <Input
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="username"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">סיסמה *</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="סיסמה"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="active" className="text-sm">נציג פעיל</label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">העדפות התראה</label>
        <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.notification_preferences.includes('whatsapp')}
              onChange={(e) => {
                const prefs = e.target.checked 
                  ? [...formData.notification_preferences, 'whatsapp']
                  : formData.notification_preferences.filter(p => p !== 'whatsapp');
                setFormData({ ...formData, notification_preferences: prefs });
              }}
              className="w-4 h-4 rounded"
            />
            📱 WhatsApp
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.notification_preferences.includes('email')}
              onChange={(e) => {
                const prefs = e.target.checked 
                  ? [...formData.notification_preferences, 'email']
                  : formData.notification_preferences.filter(p => p !== 'email');
                setFormData({ ...formData, notification_preferences: prefs });
              }}
              className="w-4 h-4 rounded"
            />
            📧 אימייל
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.notification_preferences.includes('sms')}
              onChange={(e) => {
                const prefs = e.target.checked 
                  ? [...formData.notification_preferences, 'sms']
                  : formData.notification_preferences.filter(p => p !== 'sms');
                setFormData({ ...formData, notification_preferences: prefs });
              }}
              className="w-4 h-4 rounded"
            />
            💬 SMS (דרך Twilio)
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">בחר כיצד הנציג יקבל התראות על לידים חדשים</p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1 bg-[#27AE60] hover:bg-[#2ECC71]">
          {isLoading ? 'שומר...' : agent ? 'שמור שינויים' : 'הוסף נציג'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          ביטול
        </Button>
      </div>
    </form>
  );
}