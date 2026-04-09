import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, UserCheck, Settings, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useWhatsAppMessages, useSendWhatsAppMessage } from '../../hooks/useCRM';

const SENDER_CONFIG = {
  bot: { label: 'בוט', color: 'bg-blue-100 text-blue-700', icon: Bot },
  user: { label: 'לקוח', color: 'bg-slate-100 text-slate-700', icon: User },
  agent: { label: 'נציג', color: 'bg-green-100 text-green-700', icon: UserCheck },
  system: { label: 'מערכת', color: 'bg-yellow-100 text-yellow-700', icon: Settings },
};

function MessageBubble({ msg }) {
  const isOutbound = msg.direction === 'outbound';
  const sender = SENDER_CONFIG[msg.sender_type] || SENDER_CONFIG.bot;
  const SenderIcon = sender.icon;

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${isOutbound ? 'order-2' : 'order-1'}`}>
        {/* Sender badge */}
        <div className={`flex items-center gap-1 mb-1 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
          <SenderIcon size={10} className="text-slate-400" />
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sender.color}`}>
            {sender.label}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words ${
            isOutbound
              ? 'bg-green-100 border border-green-200 text-green-900'
              : 'bg-white border border-slate-200 text-slate-900'
          }`}
          dir="rtl"
        >
          {msg.message_type === 'payment_link' ? (
            <div>
              <div className="flex items-center gap-1 text-xs text-purple-600 font-medium mb-1">
                <ExternalLink size={12} />
                קישור לתשלום
              </div>
              {msg.message_text}
            </div>
          ) : (
            msg.message_text
          )}
        </div>

        {/* Timestamp + delivery */}
        <div className={`flex items-center gap-1 mt-0.5 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-slate-400">
            {format(new Date(msg.created_at), 'HH:mm', { locale: he })}
          </span>
          {isOutbound && msg.delivery_status === 'failed' && (
            <span className="text-[10px] text-red-500">נכשל</span>
          )}
        </div>
      </div>
    </div>
  );
}

function DateDivider({ date }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs text-slate-400 whitespace-nowrap">
        {format(new Date(date), 'dd/MM/yyyy', { locale: he })}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

export default function WhatsAppConversation({ leadId }) {
  const { data: messages = [], isLoading } = useWhatsAppMessages(leadId);
  const sendMessage = useSendWhatsAppMessage();
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);
  const prevLenRef = useRef(0);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > prevLenRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevLenRef.current = messages.length;
  }, [messages.length]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage.mutate({ lead_id: leadId, message: text });
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  let lastDate = '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 bg-slate-50 rounded-t-lg border border-b-0 border-slate-200">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            אין הודעות עדיין
          </div>
        ) : (
          messages.map((msg) => {
            const msgDate = msg.created_at?.substring(0, 10);
            const showDate = msgDate !== lastDate;
            lastDate = msgDate;
            return (
              <React.Fragment key={msg.id}>
                {showDate && <DateDivider date={msg.created_at} />}
                <MessageBubble msg={msg} />
              </React.Fragment>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2 p-3 bg-white rounded-b-lg border border-slate-200">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="כתוב הודעה..."
          rows={1}
          className="flex-1 resize-none min-h-[40px] max-h-[100px] text-sm"
          dir="rtl"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!draft.trim() || sendMessage.isPending}
          className="bg-green-600 hover:bg-green-700 text-white h-10 px-3"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
