import React from 'react';
import { PRIORITY_MAP } from '../../constants/pipeline';

export default function PriorityBadge({ priority, size = 'sm' }) {
  const info = PRIORITY_MAP[priority];
  if (!info) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      }`}
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
