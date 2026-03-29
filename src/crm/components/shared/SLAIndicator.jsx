import React from 'react';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';

export default function SLAIndicator({ deadline }) {
  if (!deadline) return null;

  const now = new Date();
  const slaDate = new Date(deadline);
  const diff = slaDate - now;
  const hoursLeft = diff / (1000 * 60 * 60);

  let status, color, Icon;
  if (diff <= 0) {
    status = 'breached';
    color = '#EF4444';
    Icon = AlertCircle;
  } else if (hoursLeft <= 1) {
    status = 'critical';
    color = '#F97316';
    Icon = AlertTriangle;
  } else {
    status = 'ok';
    color = '#22C55E';
    Icon = Clock;
  }

  const label = diff <= 0
    ? 'חריגת SLA'
    : hoursLeft < 1
      ? `${Math.round(hoursLeft * 60)} דקות`
      : hoursLeft < 24
        ? `${Math.round(hoursLeft)} שעות`
        : `${Math.round(hoursLeft / 24)} ימים`;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs"
      style={{ color }}
      title={`SLA: ${slaDate.toLocaleString('he-IL')}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}
