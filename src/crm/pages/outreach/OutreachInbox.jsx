import React, { useState, useEffect, useRef } from 'react';
import {
  useOutreachThreads,
  useOutreachThread,
  useMarkThreadRead,
  useSuggestReply,
  useSendReply,
  useUpdateReply,
} from '../../hooks/useOutreach';
import OutreachStatusBadge from '../../components/outreach/OutreachStatusBadge';
import { REPLY_INTENTS, REPLY_SENTIMENTS, INTENT_MAP, SENTIMENT_MAP } from '../../constants/outreach';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Inbox, Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
}

function formatFull(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ─── Thread List Item ───────────────────────────────────────────────────────
function ThreadItem({ thread, selected, onClick }) {
  const intent = thread.last_intent ? INTENT_MAP[thread.last_intent] : null;
  const sentiment = thread.last_sentiment ? SENTIMENT_MAP[thread.last_sentiment] : null;

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer border transition-colors ${
        selected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-800 truncate">
            {thread.website?.domain || thread.website_id}
          </span>
          {thread.unread_count > 0 && (
            <span className="flex-shrink-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {thread.unread_count}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 flex-shrink-0 mr-2">
          {formatTime(thread.latest_message_at)}
        </span>
      </div>
      <p className="text-xs text-slate-500 truncate">{thread.preview || '—'}</p>
      <div className="flex items-center gap-1 mt-1">
        {intent && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: intent.color + '20', color: intent.color }}
          >
            {intent.label}
          </span>
        )}
        {sentiment && sentiment.value !== 'needs_review' && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: sentiment.color + '20', color: sentiment.color }}
          >
            {sentiment.label}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Chat Bubble ─────────────────────────────────────────────────────────────
function ChatBubble({ item }) {
  const isOutbound = item.type === 'outbound';
  const intent = item.intent ? INTENT_MAP[item.intent] : null;

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isOutbound
            ? 'bg-[#dcf8c6] text-slate-800 rounded-br-sm'
            : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
        }`}
      >
        {item.subject && (
          <p className="text-[11px] font-semibold text-slate-500 mb-1 truncate">{item.subject}</p>
        )}
        <p className="whitespace-pre-wrap leading-relaxed">{item.body || '—'}</p>
        <div className={`flex items-center gap-1 mt-1 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
          {intent && !isOutbound && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: intent.color + '20', color: intent.color }}
            >
              {intent.label}
            </span>
          )}
          <span className="text-[10px] text-slate-400">{formatFull(item.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
function ChatPanel({ websiteId, websiteDomain, lastInbound }) {
  const { data: items = [], isLoading } = useOutreachThread(websiteId);
  const suggestReply = useSuggestReply();
  const sendReply = useSendReply();
  const updateReply = useUpdateReply();
  const bottomRef = useRef(null);

  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (lastInbound) {
      setReplySubject(`Re: ${lastInbound.subject || ''}`);
    }
  }, [websiteId, lastInbound?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items.length]);

  const handleSend = async () => {
    if (!replyBody.trim() || !lastInbound) return;
    try {
      const result = await sendReply.mutateAsync({
        reply_id: lastInbound.id,
        subject: replySubject,
        body_text: replyBody,
      });
      toast.success(`נשלח (${result?.resend_message_id || 'ok'})`);
      setReplyBody('');
    } catch (err) {
      toast.error(`שגיאה: ${err.message}`);
    }
  };

  const handleSuggest = async () => {
    if (!lastInbound) return;
    setAiLoading(true);
    try {
      const result = await suggestReply.mutateAsync({
        reply_body: lastInbound.body,
        original_subject: lastInbound.subject || '',
        website_domain: websiteDomain,
      });
      setReplyBody(result?.suggested_reply || '');
    } catch {
      toast.error('שגיאה ביצירת הצעה');
    }
    setAiLoading(false);
  };

  const handleClassify = (field, value) => {
    if (!lastInbound) return;
    updateReply.mutate({ id: lastInbound.id, [field]: value }, {
      onSuccess: () => toast.success('עודכן'),
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8b9a0' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>
      {/* Header */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="font-semibold text-base">{websiteDomain}</p>
          {lastInbound && (
            <p className="text-xs text-green-200">
              תגובה אחרונה: {formatFull(lastInbound.received_at)}
            </p>
          )}
        </div>
        {lastInbound && (
          <div className="flex gap-1">
            <Select value={lastInbound.intent || 'unknown'} onValueChange={v => handleClassify('intent', v)}>
              <SelectTrigger className="h-7 text-xs w-[110px] bg-[#128C7E] border-0 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPLY_INTENTS.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={lastInbound.sentiment || 'needs_review'} onValueChange={v => handleClassify('sentiment', v)}>
              <SelectTrigger className="h-7 text-xs w-[110px] bg-[#128C7E] border-0 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPLY_SENTIMENTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-[#075E54] rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">אין הודעות</div>
        ) : (
          items.map(item => <ChatBubble key={`${item.type}-${item.id}`} item={item} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div className="bg-[#f0f0f0] border-t border-slate-200 p-3 flex-shrink-0">
        {!lastInbound && (
          <p className="text-xs text-center text-slate-400 mb-2">אין תגובה נכנסת — לא ניתן לשלוח תגובה</p>
        )}
        <div className="flex items-center gap-2 mb-2">
          <input
            className="flex-1 text-sm border border-slate-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#075E54]"
            placeholder="נושא..."
            value={replySubject}
            onChange={e => setReplySubject(e.target.value)}
            disabled={!lastInbound}
          />
          <Button
            size="sm"
            variant="ghost"
            className="text-[#075E54] hover:bg-green-50 text-xs"
            onClick={handleSuggest}
            disabled={!lastInbound || aiLoading}
          >
            <Sparkles size={14} className={`ml-1 ${aiLoading ? 'animate-pulse' : ''}`} />
            {aiLoading ? 'מייצר...' : 'הצעת AI'}
          </Button>
        </div>
        <div className="flex items-end gap-2">
          <textarea
            dir="rtl"
            rows={3}
            className="flex-1 text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-[#075E54]"
            placeholder={lastInbound ? 'כתוב הודעה...' : ''}
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            disabled={!lastInbound}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.ctrlKey) handleSend();
            }}
          />
          <Button
            size="icon"
            className="rounded-full bg-[#075E54] hover:bg-[#128C7E] h-10 w-10 flex-shrink-0"
            onClick={handleSend}
            disabled={!replyBody.trim() || !lastInbound || sendReply.isPending}
          >
            {sendReply.isPending
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send size={16} className="text-white" />}
          </Button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 text-center">Ctrl+Enter לשליחה</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OutreachInbox() {
  const { data: threads = [], isLoading } = useOutreachThreads();
  const markRead = useMarkThreadRead();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(null);
  const [filterIntent, setFilterIntent] = useState('all');

  const filtered = filterIntent === 'all'
    ? threads
    : threads.filter(t => t.last_intent === filterIntent);

  const selectedThread = threads.find(t => t.website_id === selectedWebsiteId);

  const handleSelect = (websiteId) => {
    setSelectedWebsiteId(websiteId);
    // Mark unread as read
    const t = threads.find(t => t.website_id === websiteId);
    if (t?.unread_count > 0) {
      markRead.mutate(websiteId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold text-[#1E3A5F]">תיבת דואר נכנס</h1>

      {threads.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Inbox size={40} className="mx-auto mb-2 text-slate-300" />
          <p>אין שיחות</p>
        </div>
      ) : (
        <div className="flex gap-0 h-[calc(100vh-200px)] border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Thread List */}
          <div className="w-full md:w-[340px] flex-shrink-0 border-l border-slate-200 bg-white flex flex-col">
            <div className="p-3 border-b border-slate-100 bg-[#f0f2f5]">
              <Select value={filterIntent} onValueChange={setFilterIntent}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                  <SelectValue placeholder="סנן לפי כוונה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל השיחות ({threads.length})</SelectItem>
                  {REPLY_INTENTS.map(i => {
                    const count = threads.filter(t => t.last_intent === i.value).length;
                    return count > 0 ? (
                      <SelectItem key={i.value} value={i.value}>{i.label} ({count})</SelectItem>
                    ) : null;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {filtered.map(t => (
                <ThreadItem
                  key={t.website_id}
                  thread={t}
                  selected={t.website_id === selectedWebsiteId}
                  onClick={() => handleSelect(t.website_id)}
                />
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 hidden md:flex flex-col">
            {!selectedThread ? (
              <div className="flex flex-col items-center justify-center h-full bg-[#f0f2f5] text-slate-400 gap-3">
                <Inbox size={48} className="text-slate-300" />
                <p className="text-sm">בחרו שיחה מהרשימה</p>
              </div>
            ) : (
              <ChatPanel
                key={selectedThread.website_id}
                websiteId={selectedThread.website_id}
                websiteDomain={selectedThread.website?.domain || selectedThread.website_id}
                lastInbound={selectedThread.last_inbound}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
