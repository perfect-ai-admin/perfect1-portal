import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import TemperatureBadge from '../shared/TemperatureBadge';
import SLAIndicator from '../shared/SLAIndicator';
import { TEMPERATURE_MAP } from '../../constants/pipeline';

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

  const tempEmoji = lead.temperature ? TEMPERATURE_MAP[lead.temperature]?.emoji : null;

  return (
    <div
      onClick={() => onClick?.(lead)}
      className={`group bg-white rounded-lg border border-slate-200 p-3 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg ring-2 ring-[#1E3A5F]/20' : ''
      }`}
    >
      {/* Top row: name + temperature emoji */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-slate-900 truncate flex-1">
          {lead.name || 'ללא שם'}
        </h4>
        {tempEmoji && (
          <span className="text-sm ml-1 flex-shrink-0" title={TEMPERATURE_MAP[lead.temperature]?.label}>
            {tempEmoji}
          </span>
        )}
      </div>

      {/* Phone */}
      {lead.phone && (
        <p className="text-xs text-slate-500 mb-2 font-mono" dir="ltr">
          {lead.phone}
        </p>
      )}

      {/* Source page */}
      {lead.source_page && (
        <p className="text-[10px] text-slate-400 mb-1 truncate" title={lead.source_page}>
          📍 {lead.source_page}
        </p>
      )}

      {/* Service type */}
      {lead.service_type && (
        <p className="text-xs text-slate-600 mb-2 truncate">
          {lead.service_type}
        </p>
      )}

      {/* Bottom row: SLA + quick actions (visible on hover) */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        <SLAIndicator deadline={lead.sla_deadline} />

        <div className="flex items-center gap-1.5">
          {lead.agent_name && (
            <span className="text-xs text-slate-400 ml-1 truncate max-w-[60px] hidden md:inline">
              {lead.agent_name}
            </span>
          )}
          <button
            onClick={handleCall}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="התקשר"
          >
            <Phone size={16} />
          </button>
          <button
            onClick={handleWhatsApp}
            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="WhatsApp"
          >
            <MessageCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
