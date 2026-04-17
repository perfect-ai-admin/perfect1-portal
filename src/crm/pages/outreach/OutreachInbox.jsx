import React, { useState } from 'react';
import { useOutreachReplies, useUpdateReply, useSuggestReply } from '../../hooks/useOutreach';
import OutreachStatusBadge from '../../components/outreach/OutreachStatusBadge';
import { REPLY_INTENTS, REPLY_SENTIMENTS } from '../../constants/outreach';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Inbox, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function OutreachInbox() {
  const [filters, setFilters] = useState({ intent: 'all', sentiment: 'all' });
  const { data: replies = [], isLoading } = useOutreachReplies(filters);
  const updateReply = useUpdateReply();
  const suggestReply = useSuggestReply();

  const [selectedId, setSelectedId] = useState(null);
  const [aiReply, setAiReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const selected = replies.find(r => r.id === selectedId);

  const handleClassify = (replyId, field, value) => {
    updateReply.mutate({ id: replyId, [field]: value }, {
      onSuccess: () => toast.success('עודכן'),
    });
  };

  const handleSuggest = async () => {
    if (!selected) return;
    setAiLoading(true);
    try {
      const result = await suggestReply.mutateAsync({
        reply_body: selected.body,
        original_subject: selected.outreach_messages?.subject || '',
        website_domain: selected.outreach_websites?.domain || '',
      });
      setAiReply(result?.suggested_reply || 'לא הצלחתי לייצר הצעה');
    } catch {
      toast.error('שגיאה ביצירת הצעה');
    }
    setAiLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#1E3A5F]">תיבת דואר נכנס</h1>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={filters.intent} onValueChange={v => setFilters(f => ({ ...f, intent: v }))}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="כוונה" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הכוונות</SelectItem>
            {REPLY_INTENTS.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.sentiment} onValueChange={v => setFilters(f => ({ ...f, sentiment: v }))}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="סנטימנט" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסנטימנטים</SelectItem>
            {REPLY_SENTIMENTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {replies.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Inbox size={40} className="mx-auto mb-2 text-slate-300" />
          <p>אין תשובות</p>
        </div>
      ) : (
        <div className="flex gap-4 h-[calc(100vh-280px)]">
          {/* Reply List */}
          <div className="w-full md:w-2/5 overflow-auto space-y-1">
            {replies.map(r => (
              <div
                key={r.id}
                onClick={() => { setSelectedId(r.id); setAiReply(''); }}
                className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                  selectedId === r.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-800 truncate">{r.outreach_websites?.domain || '—'}</span>
                  <OutreachStatusBadge value={r.intent} type="intent" />
                </div>
                <p className="text-xs text-slate-600 truncate">{r.subject || 'ללא נושא'}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-400">{new Date(r.received_at).toLocaleDateString('he-IL')}</span>
                  <OutreachStatusBadge value={r.sentiment} type="sentiment" />
                </div>
              </div>
            ))}
          </div>

          {/* Thread View */}
          <div className="hidden md:flex flex-1 flex-col bg-white border border-slate-200 rounded-lg overflow-hidden">
            {!selected ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>בחרו תשובה מהרשימה</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800">{selected.outreach_websites?.domain}</h3>
                    <div className="flex gap-2">
                      <Select value={selected.intent} onValueChange={v => handleClassify(selected.id, 'intent', v)}>
                        <SelectTrigger className="h-7 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {REPLY_INTENTS.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={selected.sentiment} onValueChange={v => handleClassify(selected.id, 'sentiment', v)}>
                        <SelectTrigger className="h-7 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {REPLY_SENTIMENTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{selected.subject || 'ללא נושא'}</p>
                  <p className="text-xs text-slate-400">{selected.outreach_contacts?.full_name} &lt;{selected.outreach_contacts?.email}&gt;</p>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  {selected.outreach_messages && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4 mr-8">
                      <p className="text-xs text-blue-500 mb-1">הודעה מקורית</p>
                      <p className="text-sm font-medium text-blue-800">{selected.outreach_messages.subject}</p>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-lg p-3 ml-8">
                    <p className="text-xs text-slate-400 mb-1">תשובה נכנסת — {new Date(selected.received_at).toLocaleString('he-IL')}</p>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">{selected.body}</div>
                  </div>

                  {selected.ai_summary && (
                    <div className="bg-purple-50 rounded-lg p-3 mt-4">
                      <p className="text-xs text-purple-500 mb-1">סיכום AI</p>
                      <p className="text-sm text-purple-800">{selected.ai_summary}</p>
                    </div>
                  )}
                </div>

                {/* AI Suggested Reply */}
                <div className="border-t p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Button size="sm" variant="outline" onClick={handleSuggest} disabled={aiLoading}>
                      <Sparkles size={14} className={`ml-1 ${aiLoading ? 'animate-pulse' : ''}`} />
                      {aiLoading ? 'מייצר...' : 'הצע תשובה'}
                    </Button>
                    {aiReply && (
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(aiReply); toast.success('הועתק'); }}>
                        <Copy size={14} className="ml-1" /> העתק
                      </Button>
                    )}
                  </div>
                  {aiReply && (
                    <div className="bg-green-50 rounded-lg p-3 text-sm text-green-800 whitespace-pre-wrap">{aiReply}</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
