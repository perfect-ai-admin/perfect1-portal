import React, { useState } from 'react';
import { Link2, Key, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AUTH_METHOD_LABELS } from './accountingProviders';

export default function ConnectProviderDialog({ open, onClose, provider, onConnect, loading }) {
  const [strategy, setStrategy] = useState(provider?.authMethods?.[0] || 'apikey');
  const [credentials, setCredentials] = useState({ api_key: '', username: '', password: '' });

  if (!provider) return null;

  const handleConnect = () => {
    const payload = strategy === 'apikey'
      ? { api_key: credentials.api_key }
      : { username: credentials.username, password: credentials.password };
    onConnect(provider.id, strategy, payload);
  };

  const canSubmit = strategy === 'apikey' ? !!credentials.api_key : (!!credentials.username && !!credentials.password);

  const STRATEGY_ICON = { apikey: Key, credentials: User };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border"
              style={{ backgroundColor: provider.logoColors.bg, borderColor: provider.logoColors.border }}>
              <span className="font-black text-xs" style={{ color: provider.logoColors.text }}>{provider.logoText}</span>
            </div>
            <span>התחברות ל-{provider.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4" dir="rtl">
          {/* Strategy selector - only show if more than one method */}
          {provider.authMethods.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">שיטת התחברות</label>
              <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${provider.authMethods.length}, 1fr)` }}>
                {provider.authMethods.map(method => {
                  const Icon = STRATEGY_ICON[method] || Key;
                  return (
                    <button
                      key={method}
                      onClick={() => setStrategy(method)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-sm ${
                        strategy === method ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{AUTH_METHOD_LABELS[method]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Credentials */}
          {strategy === 'apikey' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <Input
                type="password"
                placeholder={`הכנס API Key מ-${provider.name}`}
                value={credentials.api_key}
                onChange={e => setCredentials(p => ({ ...p, api_key: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">ניתן למצוא בהגדרות חשבון {provider.name}</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם משתמש</label>
                <Input
                  placeholder={`שם משתמש ב-${provider.name}`}
                  value={credentials.username}
                  onChange={e => setCredentials(p => ({ ...p, username: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
                <Input
                  type="password"
                  placeholder="סיסמה"
                  value={credentials.password}
                  onChange={e => setCredentials(p => ({ ...p, password: e.target.value }))}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleConnect} disabled={loading || !canSubmit}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Link2 className="w-4 h-4 ml-2" />}
            התחבר
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}