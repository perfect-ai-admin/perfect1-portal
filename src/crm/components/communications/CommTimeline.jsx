import React from 'react';
import {
  Phone, MessageCircle, Mail, MessageSquare, Users, FileText,
  ArrowDownLeft, ArrowUpRight, Bot, CreditCard, Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { STAGE_MAP } from '../../constants/pipeline';

const CHANNEL_ICONS = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  sms: MessageSquare,
  meeting: Users,
  note: FileText,
};

const CHANNEL_LABELS = {
  phone: 'שיחה',
  whatsapp: 'WhatsApp',
  email: 'אימייל',
  sms: 'SMS',
  meeting: 'פגישה',
  note: 'הערה',
};

const OUTCOME_LABELS = {
  answered: 'ענה',
  no_answer: 'לא ענה',
  voicemail: 'הודעה קולית',
  callback_requested: 'ביקש שנחזור',
  left_message: 'הושארה הודעה',
};

const SENDER_LABELS = {
  bot: 'בוט',
  user: 'לקוח',
  agent: 'נציג',
  system: 'מערכת',
};

const BOT_EVENT_LABELS = {
  bot_flow_started: 'בוט התחיל שיחה',
  bot_flow_started_confirmed: 'הלקוח אישר התחלה',
  bot_step_completed: 'שלב הושלם',
  bot_first_response: 'תגובה ראשונה',
  bot_cta_clicked: 'לחץ על CTA',
  bot_handoff_to_agent: 'הועבר לנציג',
  bot_asked_question: 'שאל שאלה',
  bot_booked_call: 'קבע שיחה',
  bot_sent_documents: 'שלח מסמכים',
  bot_requested_quote: 'ביקש הצעת מחיר',
  bot_started_checkout: 'התחיל רכישה',
};

const PAYMENT_STATUS_COLORS = {
  pending: 'text-yellow-600 bg-yellow-50',
  completed: 'text-green-600 bg-green-50',
  failed: 'text-red-600 bg-red-50',
};

export default function CommTimeline({
  communications = [],
  statusHistory = [],
  whatsappMessages = [],
  payments = [],
  botEvents = [],
}) {
  // Merge and sort all event types by created_at desc
  const items = [
    ...communications.map(c => ({ ...c, _type: 'comm' })),
    ...statusHistory.map(h => ({ ...h, _type: 'history' })),
    ...whatsappMessages.map(w => ({ ...w, _type: 'whatsapp' })),
    ...payments.map(p => ({ ...p, _type: 'payment' })),
    ...botEvents.map(b => ({ ...b, _type: 'bot_event' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <FileText size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">אין פעילות עדיין</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const { iconBg, IconComp } = getItemStyle(item);
        return (
          <div key={`${item._type}-${item.id}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <IconComp size={14} />
              </div>
              <div className="w-px flex-1 bg-slate-200 mt-1" />
            </div>
            <div className="flex-1 pb-4">
              {item._type === 'comm' && <CommItem comm={item} />}
              {item._type === 'history' && <HistoryItem item={item} />}
              {item._type === 'whatsapp' && <WhatsAppItem msg={item} />}
              {item._type === 'payment' && <PaymentItem payment={item} />}
              {item._type === 'bot_event' && <BotEventItem event={item} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getItemStyle(item) {
  switch (item._type) {
    case 'whatsapp':
      return { iconBg: 'bg-green-50 text-green-600', IconComp: MessageCircle };
    case 'payment':
      return { iconBg: 'bg-purple-50 text-purple-600', IconComp: CreditCard };
    case 'bot_event':
      return { iconBg: 'bg-cyan-50 text-cyan-600', IconComp: Bot };
    case 'comm':
      return {
        iconBg: 'bg-blue-50 text-blue-600',
        IconComp: CHANNEL_ICONS[item.channel] || FileText,
      };
    default:
      return { iconBg: 'bg-slate-100 text-slate-500', IconComp: ArrowUpRight };
  }
}

function CommItem({ comm }) {
  const channelLabel = CHANNEL_LABELS[comm.channel] || comm.channel;
  const DirIcon = comm.direction === 'inbound' ? ArrowDownLeft : ArrowUpRight;
  const isNote = comm.channel === 'note' || comm.direction === 'internal';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{channelLabel}</span>
          {!isNote && (
            <>
              <DirIcon size={12} className="text-slate-400" />
              <span className="text-xs text-slate-400">
                {comm.direction === 'inbound' ? 'נכנס' : 'יוצא'}
              </span>
            </>
          )}
          {comm.outcome && (
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
              {OUTCOME_LABELS[comm.outcome] || comm.outcome}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {format(new Date(comm.created_at), 'dd/MM HH:mm', { locale: he })}
        </span>
      </div>
      {comm.content && (
        <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{comm.content}</p>
      )}
      {comm.next_step && (
        <p className="text-xs text-blue-600 mt-1">צעד הבא: {comm.next_step}</p>
      )}
      {comm.follow_up_date && (
        <p className="text-xs text-orange-600 mt-1">
          מעקב: {format(new Date(comm.follow_up_date), 'dd/MM/yyyy')}
        </p>
      )}
    </div>
  );
}

function HistoryItem({ item }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-slate-500">שינוי שלב: </span>
          {item.old_stage && (
            <>
              <span className="font-medium">{STAGE_MAP[item.old_stage]?.label || item.old_stage}</span>
              <span className="text-slate-400 mx-1">&larr;</span>
            </>
          )}
          <span className="font-medium text-[#1E3A5F]">{STAGE_MAP[item.new_stage]?.label || item.new_stage}</span>
        </div>
        <span className="text-xs text-slate-400">
          {format(new Date(item.created_at), 'dd/MM HH:mm', { locale: he })}
        </span>
      </div>
      {item.change_reason && (
        <p className="text-xs text-slate-500 mt-1">{item.change_reason}</p>
      )}
    </div>
  );
}

function WhatsAppItem({ msg }) {
  const DirIcon = msg.direction === 'inbound' ? ArrowDownLeft : ArrowUpRight;
  const senderLabel = SENDER_LABELS[msg.sender_type] || msg.sender_type;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-green-800">WhatsApp</span>
          <DirIcon size={12} className="text-green-500" />
          <span className="text-xs text-green-600">
            {msg.direction === 'inbound' ? 'נכנס' : 'יוצא'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
            {senderLabel}
          </span>
        </div>
        <span className="text-xs text-green-500">
          {format(new Date(msg.created_at), 'dd/MM HH:mm', { locale: he })}
        </span>
      </div>
      {msg.message_text && (
        <p className="text-sm text-green-900 mt-1 whitespace-pre-wrap line-clamp-3">
          {msg.message_text}
        </p>
      )}
    </div>
  );
}

function PaymentItem({ payment }) {
  const statusStyle = PAYMENT_STATUS_COLORS[payment.status] || 'text-slate-600 bg-slate-50';

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-purple-800">תשלום</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle}`}>
            {payment.status === 'completed' ? 'שולם' : payment.status === 'failed' ? 'נכשל' : 'ממתין'}
          </span>
        </div>
        <span className="text-xs text-purple-500">
          {format(new Date(payment.created_at), 'dd/MM HH:mm', { locale: he })}
        </span>
      </div>
      <p className="text-sm text-purple-900 mt-1">
        ₪{payment.amount} — {payment.product_name || payment.product_type}
      </p>
    </div>
  );
}

function BotEventItem({ event }) {
  const label = BOT_EVENT_LABELS[event.event_type] || event.event_type;

  return (
    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-cyan-600" />
          <span className="text-sm font-medium text-cyan-800">{label}</span>
        </div>
        <span className="text-xs text-cyan-500">
          {format(new Date(event.created_at), 'dd/MM HH:mm', { locale: he })}
        </span>
      </div>
      {event.event_data?.button && (
        <p className="text-xs text-cyan-600 mt-1">כפתור: {event.event_data.button}</p>
      )}
    </div>
  );
}
