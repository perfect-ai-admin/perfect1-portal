import React, { useState } from 'react';
import { useOutreachContacts, useCreateContact } from '../../hooks/useOutreach';
import OutreachStatusBadge from '../../components/outreach/OutreachStatusBadge';
import { CONTACT_SOURCES, EMAIL_STATUSES } from '../../constants/outreach';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OutreachContacts() {
  const [filters, setFilters] = useState({ search: '', contact_source: 'all' });
  const { data: contacts = [], isLoading } = useOutreachContacts(filters);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#1E3A5F]">אנשי קשר</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="חפש שם או מייל..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="pr-9"
          />
        </div>
        <Select value={filters.contact_source} onValueChange={v => setFilters(f => ({ ...f, contact_source: v }))}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="מקור" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל המקורות</SelectItem>
            {CONTACT_SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Users2 size={40} className="mx-auto mb-2 text-slate-300" />
          <p>אין אנשי קשר עדיין</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-lg overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3 text-right font-medium text-slate-600">שם</th>
                  <th className="p-3 text-right font-medium text-slate-600">מייל</th>
                  <th className="p-3 text-right font-medium text-slate-600">תפקיד</th>
                  <th className="p-3 text-right font-medium text-slate-600">אתר</th>
                  <th className="p-3 text-right font-medium text-slate-600">מקור</th>
                  <th className="p-3 text-right font-medium text-slate-600">סטטוס מייל</th>
                  <th className="p-3 text-right font-medium text-slate-600">ראשי</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(c => (
                  <tr key={c.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-medium">{c.full_name || '—'}</td>
                    <td className="p-3 font-mono text-xs">{c.email}</td>
                    <td className="p-3 text-slate-500">{c.role || '—'}</td>
                    <td className="p-3">
                      {c.outreach_websites ? (
                        <button
                          className="text-blue-600 hover:underline text-sm"
                          onClick={() => navigate(`/CRM/outreach/websites/${c.outreach_websites.id}`)}
                        >
                          {c.outreach_websites.domain}
                        </button>
                      ) : '—'}
                    </td>
                    <td className="p-3 text-xs">
                      {CONTACT_SOURCES.find(s => s.value === c.contact_source)?.label || c.contact_source}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.verified_email_status === 'likely_valid' ? 'bg-green-50 text-green-600' :
                        c.verified_email_status === 'bounced' ? 'bg-red-50 text-red-600' :
                        'bg-slate-50 text-slate-500'
                      }`}>
                        {EMAIL_STATUSES.find(s => s.value === c.verified_email_status)?.label || 'לא ידוע'}
                      </span>
                    </td>
                    <td className="p-3">{c.is_primary ? '✓' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {contacts.map(c => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{c.full_name || c.email}</span>
                  {c.is_primary && <span className="text-xs text-blue-500">ראשי</span>}
                </div>
                <p className="text-xs font-mono text-slate-500">{c.email}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  {c.outreach_websites && <span>{c.outreach_websites.domain}</span>}
                  <span>{CONTACT_SOURCES.find(s => s.value === c.contact_source)?.label}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
