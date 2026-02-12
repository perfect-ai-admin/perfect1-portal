import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play, Loader2, Trash2, ShieldCheck, Wifi, Hash,
  CheckCircle2, XCircle, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import QAStepsTable from '../components/qa/QAStepsTable';
import QAAuditLog from '../components/qa/QAAuditLog';

export default function QAIcount() {
  const [runId, setRunId] = useState('');
  const [skipReports, setSkipReports] = useState(false);
  const [skipExpenses, setSkipExpenses] = useState(false);
  const [e2eResult, setE2eResult] = useState(null);
  const [isolationResult, setIsolationResult] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setAuthLoading(false); }).catch(() => setAuthLoading(false));
  }, []);

  // Preflight
  const preflight = useMutation({
    mutationFn: () => base44.functions.invoke('qaPreflightIcount', {}),
  });

  // Generate runId
  const genRunId = useMutation({
    mutationFn: () => base44.functions.invoke('qaCreateRunId', {}),
    onSuccess: (res) => setRunId(res.data.runId),
  });

  // E2E - use ref for latest runId
  const runIdRef = React.useRef(runId);
  React.useEffect(() => { runIdRef.current = runId; }, [runId]);

  const e2e = useMutation({
    mutationFn: (overrideRunId) => {
      const id = overrideRunId || runIdRef.current;
      return base44.functions.invoke('qaRunIcountE2E', { runId: id, options: { skipReports, skipExpenses } });
    },
    onSuccess: (res) => setE2eResult(res.data),
  });

  // Multi-tenant
  const isolation = useMutation({
    mutationFn: () => base44.functions.invoke('qaMultiTenantIsolationTest', {}),
    onSuccess: (res) => setIsolationResult(res.data),
  });

  // Cleanup
  const cleanup = useMutation({
    mutationFn: () => base44.functions.invoke('qaCleanupRun', { runId }),
  });

  if (authLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <ShieldCheck className="w-16 h-16 text-red-400" />
        <h1 className="text-2xl font-bold">גישה מוגבלת</h1>
        <p className="text-gray-500">דף זה זמין לאדמינים בלבד</p>
      </div>
    );
  }

  const passCount = e2eResult?.steps?.filter(s => s.status === 'pass').length || 0;
  const failCount = e2eResult?.steps?.filter(s => s.status === 'fail').length || 0;
  const warnCount = e2eResult?.steps?.filter(s => s.status === 'warn').length || 0;
  const totalSteps = e2eResult?.steps?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="ltr">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              iCount QA Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Multi-Tenant E2E Testing Framework</p>
          </div>
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Preflight */}
          <Card>
            <CardContent className="p-4">
              <Button
                variant="outline" size="sm" className="w-full gap-2"
                onClick={() => preflight.mutate()}
                disabled={preflight.isPending}
              >
                {preflight.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                Preflight Check
              </Button>
              {preflight.data && (
                <div className="mt-2 text-xs">
                  {preflight.data.data.ok ? (
                    <Badge className="bg-green-100 text-green-800">Connected: {preflight.data.data.provider_account_id}</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">{preflight.data.data.reason}</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate RunId */}
          <Card>
            <CardContent className="p-4">
              <Button
                variant="outline" size="sm" className="w-full gap-2"
                onClick={() => genRunId.mutate()}
                disabled={genRunId.isPending}
              >
                {genRunId.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
                Generate Run ID
              </Button>
              {runId && (
                <div className="mt-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{runId}</code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Multi-Tenant */}
          <Card>
            <CardContent className="p-4">
              <Button
                variant="outline" size="sm" className="w-full gap-2"
                onClick={() => isolation.mutate()}
                disabled={isolation.isPending}
              >
                {isolation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Tenant Isolation
              </Button>
              {isolationResult && (
                <div className="mt-2 text-xs">
                  {isolationResult.ok ? (
                    <Badge className="bg-green-100 text-green-800">All {isolationResult.steps.length} checks PASS</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">FAIL</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cleanup */}
          <Card>
            <CardContent className="p-4">
              <Button
                variant="outline" size="sm" className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => { if (runId) cleanup.mutate(); }}
                disabled={cleanup.isPending || !runId}
              >
                {cleanup.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Cleanup Run
              </Button>
              {cleanup.data && (
                <div className="mt-2 text-xs text-gray-500">
                  Deleted: {cleanup.data.data.deletedCounts?.customers || 0} customers, {cleanup.data.data.deletedCounts?.documents || 0} docs
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* E2E Runner */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-600" />
              End-to-End Test Runner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="skipReports" checked={skipReports} onCheckedChange={setSkipReports} />
                <label htmlFor="skipReports" className="text-sm">Skip Reports</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="skipExpenses" checked={skipExpenses} onCheckedChange={setSkipExpenses} />
                <label htmlFor="skipExpenses" className="text-sm">Skip Expenses</label>
              </div>
              <Button
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (!runId) {
                    genRunId.mutate(undefined, {
                      onSuccess: (res) => {
                        const newId = res.data.runId;
                        setRunId(newId);
                        e2e.mutate(newId);
                      }
                    });
                  } else {
                    e2e.mutate(runId);
                  }
                }}
                disabled={e2e.isPending}
              >
                {e2e.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run E2E Tests
              </Button>
              {runId && <code className="text-xs text-gray-400">runId: {runId}</code>}
            </div>

            {e2e.isPending && (
              <div className="flex items-center gap-3 py-6 justify-center text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin" />
                Running tests... this takes ~8 seconds
              </div>
            )}

            {e2eResult && (
              <div className="space-y-4">
                {/* Summary badges */}
                <div className="flex items-center gap-3">
                  <Badge className={e2eResult.ok ? 'bg-green-100 text-green-800 text-sm' : 'bg-red-100 text-red-800 text-sm'}>
                    {e2eResult.ok ? '✅ ALL PASS' : '❌ HAS FAILURES'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {passCount} pass · {warnCount} warn · {failCount} fail / {totalSteps} total
                  </span>
                </div>

                {/* Steps table */}
                <QAStepsTable steps={e2eResult.steps} />

                {/* Warnings */}
                {e2eResult.warnings?.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Warnings
                    </h4>
                    <ul className="text-xs text-yellow-700 space-y-0.5">
                      {e2eResult.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                    </ul>
                  </div>
                )}

                {/* Created resources */}
                {(e2eResult.created?.customerId || e2eResult.created?.documentIds?.length > 0) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">Created Resources</h4>
                    <div className="text-xs text-blue-700 space-y-0.5">
                      {e2eResult.created.customerId && <p>Customer: <code>{e2eResult.created.customerId}</code></p>}
                      {e2eResult.created.documentIds?.map((id, i) => <p key={i}>Document: <code>{id}</code></p>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {e2e.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                Error: {e2e.error.message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Multi-Tenant Details */}
        {isolationResult && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                Multi-Tenant Isolation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QAStepsTable steps={isolationResult.steps} />
            </CardContent>
          </Card>
        )}

        {/* Audit Log */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Recent QA Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <QAAuditLog runId={runId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}