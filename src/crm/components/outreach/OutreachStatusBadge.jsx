import React from 'react';
import { WEBSITE_STATUS_MAP, MESSAGE_STATUS_MAP, INTENT_MAP, SENTIMENT_MAP, CAMPAIGN_STATUS_MAP } from '../../constants/outreach';

const MAPS = {
  website: WEBSITE_STATUS_MAP,
  message: MESSAGE_STATUS_MAP,
  intent: INTENT_MAP,
  sentiment: SENTIMENT_MAP,
  campaign: CAMPAIGN_STATUS_MAP,
};

export default function OutreachStatusBadge({ value, type = 'website', size = 'sm' }) {
  const map = MAPS[type];
  const info = map?.[value];
  if (!info) return null;

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${sizeClasses}`}
      style={{
        backgroundColor: `${info.color}15`,
        color: info.color,
        border: `1px solid ${info.color}30`,
      }}
    >
      {info.label}
    </span>
  );
}
