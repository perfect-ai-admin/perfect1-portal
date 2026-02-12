import React, { useState } from 'react';
import { Link2, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

/**
 * Dynamic provider connection dialog.
 * Renders auth fields dynamically based on provider.authFields config.
 * Works for any provider — no provider-specific code.
 */
export default function ConnectProviderDialog({ open, onClose, provider, onConnect, loading }) {
  const [credentials, setCredentials] = useState({});

  if (!provider) return null;

  const authFields = provider.authFields || [];

  const handleFieldChange = (fieldName, value) => {
    setCredentials(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleConnect = () => {
    onConnect(provider.id, credentials);
  };

  const allFieldsFilled = authFields.every(f => (credentials[f.name] || '').trim());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border"
              style={{ backgroundColor: provider.logoColors.bg, borderColor: provider.logoColors.border }}>
              <span className="font-black text-xs" style={{ color: provider.logoColors.text }}>{provider.logoText}</span>
            </div>
            <span>חיבור חשבון {provider.name}</span>
          </DialogTitle>
          <DialogDescription className="text-right">
            חבר את חשבון ה-{provider.name} שלך כדי להפיק מסמכים, לסנכרן לקוחות ועוד
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>החיבור מאובטח ומוצפן. הנתונים נשמרים רק בחשבון שלך.</span>
          </div>

          {authFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <Input
                type={field.type || 'text'}
                placeholder={field.placeholder || ''}
                value={credentials[field.name] || ''}
                onChange={e => handleFieldChange(field.name, e.target.value)}
                dir={field.type === 'password' ? 'ltr' : 'auto'}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleConnect} disabled={loading || !allFieldsFilled}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Link2 className="w-4 h-4 ml-2" />}
            התחבר
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}