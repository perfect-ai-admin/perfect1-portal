import React from 'react';
import { Link2, Wifi, WifiOff, Loader2, RefreshCw, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RESOURCE_LABELS } from './accountingProviders';

const PROVIDER_LOGOS = {
  finbot: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d476070d43f37f05394ca/bad1e678a_Logo-Finbot-2048x470.png',
  morning: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d476070d43f37f05394ca/c4ed41c81_image.png',
  sumit: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d476070d43f37f05394ca/ee666d319_image.png',
  icount: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d476070d43f37f05394ca/14f110f3a_image.png',
};

export default function ProviderCard({ provider, connectionStatus, loading, syncLoading, onConnect, onDisconnect, onSync, disconnectLoading }) {
  const isConnected = connectionStatus?.connected;
  const isComingSoon = provider.status === 'coming_soon';

  return (
    <div className={`border-2 rounded-xl p-4 transition-all ${
      isComingSoon ? 'border-gray-200 bg-gray-50/50 opacity-75' :
      isConnected ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border overflow-hidden`}
          style={{ 
            backgroundColor: provider.logoColors.bg, 
            borderColor: provider.logoColors.border 
          }}
        >
          {PROVIDER_LOGOS[provider.id] ? (
            <img src={PROVIDER_LOGOS[provider.id]} alt={provider.name} className="h-8 w-auto object-contain" />
          ) : (
            <span className="font-black text-sm" style={{ color: provider.logoColors.text }}>
              {provider.logoText}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900">{provider.name}</p>
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
            ) : isComingSoon ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" /> בקרוב
              </span>
            ) : isConnected ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                <Wifi className="w-3 h-3" /> מחובר
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3" /> לא מחובר
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{provider.description}</p>

          {/* Features pills */}
          <div className="flex flex-wrap gap-1 mt-2">
            {provider.features.map(f => (
              <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{f}</span>
            ))}
          </div>

          {/* Last sync & error */}
          {connectionStatus?.last_sync_at && (
            <p className="text-[10px] text-gray-400 mt-2">
              סנכרון אחרון: {new Date(connectionStatus.last_sync_at).toLocaleString('he-IL')}
            </p>
          )}
          {connectionStatus?.last_error && (
            <div className="flex items-start gap-1 mt-1.5 text-[10px] text-red-600 bg-red-50 rounded p-1.5">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{connectionStatus.last_error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isComingSoon && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
          {!isConnected ? (
            <Button size="sm" className="gap-2 h-8 text-xs" onClick={onConnect}>
              <Link2 className="w-3 h-3" /> התחבר
            </Button>
          ) : (
            <>
              {provider.syncResources.map(resource => (
                <Button
                  key={resource}
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-7 text-[11px]"
                  disabled={syncLoading?.[resource]}
                  onClick={() => onSync(resource)}
                >
                  {syncLoading?.[resource] ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  {RESOURCE_LABELS[resource] || resource}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 h-7 text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={disconnectLoading}
                onClick={onDisconnect}
              >
                {disconnectLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                התנתק
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}