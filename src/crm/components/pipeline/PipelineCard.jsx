import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import TemperatureBadge from '../shared/TemperatureBadge';
import SLAIndicator from '../shared/SLAIndicator';

export default function PipelineCard({ lead, onClick, isDragging }) {
  const handleCall = (e) => {
    e.stopPropagation();
    window.open(`tel:${lead.phone}`, '_self');
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const phone = (lead.phone || '').replace(/\D/g, '');
    const intlPhone = phone.startsWith('0') ? '972' + phone.slice(1) : phone;
    window.open(`https://wa.me/${intlPhone}`, '_blank');
  };

  return (
    <div
      onClick={() => onClick?.(lead)}
      className={`bg-white rounded-lg border border-slate-200 p-3 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg ring-2 ring-[#1E3A5F]/20' : ''
      }`}
    >
      {/* Top row: name + temperature */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-slate-900 truncate flex-1">
          {lead.name || 'ללא שם'}
        </h4>
        {lead.temperature && (
          <TemperatureBadge temperature={lead.temperature} showLabel={false} size="sm" />
        )}
      </div>

      {/* Phone */}
      {lead.phone && (
        <p className="text-xs text-slate-500 mb-2 font-mono" dir="ltr">
          {lead.phone}
        </p>
      )}

      {/* Service type */}
      {lead.service_type && (
        <p className="text-xs text-slate-600 mb-2 truncate">
          {lead.service_type}
        </p>
      )}

      {/* Bottom row: SLA + quick actions */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        <SLAIndicator deadline={lead.sla_deadline} />

        <div className="flex items-center gap-1">
          {lead.agent_name && (
            <span className="text-xs text-slate-400 ml-2 truncate max-w-[60px]">
              {lead.agent_name}
            </span>
          )}
          <button
            onClick={handleCall}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-green-600 transition-colors"
            title="התקשר"
          >
            <Phone size={14} />
          </button>
          <button
            onClick={handleWhatsApp}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-green-600 transition-colors"
            title="WhatsApp"
          >
            <MessageCircle size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
