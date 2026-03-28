import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { entities } from '@/api/supabaseClient';

export default function QAAuditLog({ runId }) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['qa-audit-logs', runId],
    queryFn: async () => {
      const all = await entities.FinbotAuditLog.filter(
        { action: { $regex: 'qa.' } },
        '-created_date',
        50
      );
      if (runId) {
        return all.filter(l => 
          l.request_data?.runId === runId || 
          l.response_data?.runId === runId ||
          l.action?.includes(runId)
        );
      }
      return all.slice(0, 20);
    },
    enabled: true,
    refetchInterval: false,
  });

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;

  if (!logs.length) return <p className="text-sm text-gray-400 py-4">אין לוגים{runId ? ` עבור ${runId}` : ''}</p>;

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto">
      {logs.map(log => (
        <div key={log.id} className="flex items-start gap-2 text-xs border-b border-gray-100 py-1.5 px-2">
          {log.success ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <span className="font-mono text-gray-600">{log.action}</span>
            <span className="text-gray-400 mr-2">
              {new Date(log.created_date).toLocaleTimeString('he-IL')}
            </span>
            {log.response_data?.details && (
              <p className="text-gray-500 truncate">{typeof log.response_data.details === 'string' ? log.response_data.details : JSON.stringify(log.response_data.details)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}