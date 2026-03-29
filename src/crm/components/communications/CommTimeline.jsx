import React from 'react';
import { Phone, MessageCircle, Mail, MessageSquare, Users, FileText, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

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

export default function CommTimeline({ communications = [], statusHistory = [] }) {
  // Merge and sort by created_at desc
  const items = [
    ...communications.map(c => ({ ...c, _type: 'comm' })),
    ...statusHistory.map(h => ({ ...h, _type: 'history' })),
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
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              item._type === 'comm' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
            }`}>
              {item._type === 'comm' ? (
                (() => {
                  const Icon = CHANNEL_ICONS[item.channel] || FileText;
                  return <Icon size={14} />;
                })()
              ) : (
                <ArrowUpRight size={14} />
              )}
            </div>
            <div className="w-px flex-1 bg-slate-200 mt-1" />
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            {item._type === 'comm' ? (
              <CommItem comm={item} />
            ) : (
              <HistoryItem item={item} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CommItem({ comm }) {
  const channelLabel = CHANNEL_LABELS[comm.channel] || comm.channel;
  const dirIcon = comm.direction === 'inbound' ? ArrowDownLeft : ArrowUpRight;
  const DirIcon = dirIcon;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{channelLabel}</span>
          <DirIcon size={12} className="text-slate-400" />
          <span className="text-xs text-slate-400">
            {comm.direction === 'inbound' ? 'נכנס' : 'יוצא'}
          </span>
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
              <span className="font-medium">{item.old_stage}</span>
              <span className="text-slate-400 mx-1">&larr;</span>
            </>
          )}
          <span className="font-medium text-[#1E3A5F]">{item.new_stage}</span>
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
