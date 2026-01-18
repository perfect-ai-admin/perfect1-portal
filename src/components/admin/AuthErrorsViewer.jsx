import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AuthErrorsViewer() {
  const [searchErrorId, setSearchErrorId] = useState('');
  const [filterResolved, setFilterResolved] = useState(false);

  // Fetch auth errors sorted by timestamp (newest first)
  const { data: errors = [], isLoading, refetch } = useQuery({
    queryKey: ['authErrors', filterResolved],
    queryFn: async () => {
      try {
        const allErrors = await base44.asServiceRole.entities.AuthError.list('-timestamp', 100);
        return filterResolved 
          ? allErrors.filter(e => !e.resolved)
          : allErrors;
      } catch (err) {
        console.error('Error fetching auth errors:', err);
        return [];
      }
    },
    refetchInterval: 5000 // Refresh every 5 seconds for real-time viewing
  });

  // Filter by search term
  const filtered = errors.filter(err => 
    err.error_id?.toLowerCase().includes(searchErrorId.toLowerCase()) ||
    err.endpoint?.toLowerCase().includes(searchErrorId.toLowerCase()) ||
    err.step?.toLowerCase().includes(searchErrorId.toLowerCase())
  );

  const handleMarkResolved = async (errorId) => {
    try {
      await base44.asServiceRole.entities.AuthError.update(errorId, { resolved: true });
      refetch();
    } catch (err) {
      console.error('Failed to mark resolved:', err);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Authentication Errors</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Input
          placeholder="Search by Error ID, endpoint, or step..."
          value={searchErrorId}
          onChange={(e) => setSearchErrorId(e.target.value)}
          className="flex-1"
        />
        <Button 
          variant={filterResolved ? 'default' : 'outline'}
          onClick={() => setFilterResolved(!filterResolved)}
          size="sm"
        >
          {filterResolved ? 'Unresolved Only' : 'Show All'}
        </Button>
      </div>

      {/* Error List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-gray-500 border rounded-lg">
            No auth errors found
          </div>
        ) : (
          filtered.map((err) => (
            <div
              key={err.id}
              className={`border rounded-lg p-4 space-y-2 ${
                err.resolved ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm font-bold text-gray-900 break-all">
                    {err.error_id}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {new Date(err.timestamp).toLocaleString()}
                  </div>
                </div>
                {err.resolved ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Resolved
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Endpoint:</span>
                  <div className="text-gray-600 font-mono text-xs">{err.endpoint}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Step:</span>
                  <div className="text-gray-600 font-mono text-xs">{err.step}</div>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-700">Message:</span>
                  <div className="text-gray-600 text-xs bg-white p-2 rounded font-mono break-all">
                    {err.message}
                  </div>
                </div>
                {err.user_email && (
                  <div className="col-span-2">
                    <span className="font-semibold text-gray-700">User:</span>
                    <div className="text-gray-600 text-xs">{err.user_email}</div>
                  </div>
                )}
              </div>

              {err.notes && (
                <div className="bg-white p-2 rounded text-xs text-gray-600">
                  <strong>Notes:</strong> {err.notes}
                </div>
              )}

              {!err.resolved && (
                <div className="pt-2 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleMarkResolved(err.id)}
                    className="text-xs"
                  >
                    Mark Resolved
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-gray-500 mt-6">
        Showing {filtered.length} of {errors.length} errors • Auto-refreshing every 5 seconds
      </div>
    </div>
  );
}