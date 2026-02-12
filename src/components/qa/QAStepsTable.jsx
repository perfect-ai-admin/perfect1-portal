import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, SkipForward } from 'lucide-react';

const STATUS_CONFIG = {
  pass: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'PASS' },
  fail: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'FAIL' },
  warn: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'WARN' },
  skipped: { icon: SkipForward, color: 'text-gray-400', bg: 'bg-gray-50', label: 'SKIP' },
};

export default function QAStepsTable({ steps }) {
  if (!steps?.length) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2 font-semibold w-8">#</th>
            <th className="text-left px-4 py-2 font-semibold">Step</th>
            <th className="text-left px-4 py-2 font-semibold w-20">Status</th>
            <th className="text-left px-4 py-2 font-semibold">Details</th>
            <th className="text-left px-4 py-2 font-semibold w-24">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {steps.map((step, i) => {
            const cfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.warn;
            const Icon = cfg.icon;
            const time = step.timestamp ? new Date(step.timestamp).toLocaleTimeString('he-IL') : '';
            return (
              <tr key={i} className={cfg.bg}>
                <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                <td className="px-4 py-2 font-mono text-xs">{step.name}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center gap-1 ${cfg.color} font-bold text-xs`}>
                    <Icon className="w-4 h-4" />
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-700 text-xs max-w-md truncate">{step.details}</td>
                <td className="px-4 py-2 text-gray-400 text-xs">{time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}