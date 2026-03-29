import React from 'react';
import { STAGE_MAP } from '../../constants/pipeline';

export default function StatusBadge({ stage, size = 'sm' }) {
  const stageInfo = STAGE_MAP[stage];
  if (!stageInfo) return null;

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses}`}
      style={{
        backgroundColor: `${stageInfo.color}15`,
        color: stageInfo.color,
        border: `1px solid ${stageInfo.color}30`,
      }}
    >
      {stageInfo.label}
    </span>
  );
}
