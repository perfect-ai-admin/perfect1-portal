import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ConnectAccountingSoftwareDialog({ open, onOpenChange, onConnect, user }) {
  const [connectingTo, setConnectingTo] = useState(null);

  const softwareOptions = [
    { id: 'morning', name: 'Morning', color: 'bg-[#00c853]', textColor: 'text-white' },
    { id: 'finbot', name: 'Finbot', color: 'bg-[#2979ff]', textColor: 'text-white' },
    { id: 'icount', name: 'iCount', color: 'bg-[#4caf50]', textColor: 'text-white' },
    { id: 'sumit', name: 'Sumit', color: 'bg-[#ff6d00]', textColor: 'text-white' },
  ];

  const handleConnect = async (softwareId) => {
    setConnectingTo(softwareId);
    try {
      // Simulation of connection flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user entity with the connection
      // In a real scenario this would be handled by an OAuth callback or API key verification
      await base44.auth.updateMe({
        accounting_software: {
            provider: softwareId,
            connected_at: new Date().toISOString(),
            is_active: true
        }
      });
      
      toast.success(`התחברת בהצלחה ל-${softwareOptions.find(s => s.id === softwareId).name}`);
      onConnect && onConnect();
      onOpenChange(false);
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('שגיאה בהתחברות. אנא נסה שנית.');
    } finally {
      setConnectingTo(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">חיבור למערכת הנהלת חשבונות</DialogTitle>
          <DialogDescription className="text-center">
            כדי לבצע פעולה זו, עליך לחבר תחילה את מערכת הנהלת החשבונות שלך
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          {softwareOptions.map((software) => (
            <button
              key={software.id}
              onClick={() => handleConnect(software.id)}
              disabled={!!connectingTo}
              className={`
                relative h-24 rounded-xl shadow-sm hover:shadow-md transition-all 
                flex flex-col items-center justify-center gap-2
                ${connectingTo && connectingTo !== software.id ? 'opacity-50 cursor-not-allowed' : ''}
                ${connectingTo === software.id ? 'ring-2 ring-offset-2 ring-blue-500' : 'hover:scale-105'}
                bg-white border border-gray-100
              `}
            >
              {connectingTo === software.id ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              ) : (
                <>
                  <div className={`w-12 h-12 rounded-lg ${software.color} flex items-center justify-center text-xl font-bold ${software.textColor} shadow-inner`}>
                    {software.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-gray-700">{software.name}</span>
                </>
              )}
            </button>
          ))}
        </div>

        <div className="text-center pt-2 border-t mt-2">
          <p className="text-sm text-gray-600 mb-2">אין לך עדיין מערכת חשבוניות?</p>
          <a 
            href="https://www.morning.co.il/join?ref=perfectone" // Placeholder link
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline"
          >
            לחץ כאן לפתיחה מהירה
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}