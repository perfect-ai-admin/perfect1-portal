import React from 'react';
import { TEMPERATURE_MAP } from '../../constants/pipeline';
import { Flame, Sun, Snowflake } from 'lucide-react';

const TEMP_ICONS = {
  hot: Flame,
  warm: Sun,
  cold: Snowflake,
};

export default function TemperatureBadge({ temperature, showLabel = true, size = 'sm' }) {
  const info = TEMPERATURE_MAP[temperature];
  if (!info) return null;

  const Icon = TEMP_ICONS[temperature];
  const iconSize = size === 'sm' ? 12 : 16;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      }`}
      style={{
        backgroundColor: `${info.color}15`,
        color: info.color,
      }}
    >
      {Icon && <Icon size={iconSize} />}
      {showLabel && info.label}
    </span>
  );
}
