import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Users, Clock, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { entities } from '@/api/supabaseClient';

export default function EmailCampaign({ onBack, onComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    subject: '',
    segment: 'all',
    content: '',
    schedule: 'now'
  });

  const handleLaunch = async () => {
    try {
        setIsLoading(true);
        await entities.Campaign.create({
            name: `Email Campaign - ${new Date().toLocaleDateString('he-IL')}`,
            channel: 'email',
            status: 'active',
            content: {
                email_subject: data.subject,
                email_content: data.content,
                segment: data.segment,
                schedule: data.schedule
            }
        });
        toast.success('הקמפיין נוצר בהצלחה');
        onComplete();
    } catch (error) {
        console.error(error);
        toast.error('שגיאה ביצירת הקמפיין');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4 pt-2">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-medium mb-2">
            <CheckCircle2 className="w-3 h-3" />
            מערכת הדיוור מחוברת
        </div>
        <h3 className="text-lg font-bold text-gray-900">יצירת קמפיין מייל</h3>
        <p className="text-xs text-gray-500">שלח מסר אישי ללקוחות שלך</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                למי לשלוח?
            </Label>
            <Select onValueChange={(val) => setData({...data, segment: val})} defaultValue="all">
                <SelectTrigger>
                    <SelectValue placeholder="בחר רשימת תפוצה" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">כל הלקוחות</SelectItem>
                    <SelectItem value="active">לקוחות פעילים (30 יום אחרונים)</SelectItem>
                    <SelectItem value="leads">לידים שטרם המירו</SelectItem>
                    <SelectItem value="vip">לקוחות VIP</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                נושא המייל
            </Label>
            <Input 
                placeholder="כותרת מושכת שתגרום לפתיחת המייל..."
                value={data.subject}
                onChange={(e) => setData({...data, subject: e.target.value})}
            />
        </div>

        <div className="space-y-2">
            <Label>תוכן המייל</Label>
            <Textarea 
                placeholder="כתוב כאן את תוכן ההודעה..."
                rows={5}
                value={data.content}
                onChange={(e) => setData({...data, content: e.target.value})}
            />
        </div>

        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                מתי לשלוח?
            </Label>
            <Select onValueChange={(val) => setData({...data, schedule: val})} defaultValue="now">
                <SelectTrigger>
                    <SelectValue placeholder="בחר תזמון" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="now">שלח מיידית</SelectItem>
                    <SelectItem value="morning">מחר בבוקר (09:00)</SelectItem>
                    <SelectItem value="evening">מחר בערב (20:00)</SelectItem>
                    <SelectItem value="custom">תזמון מותאם אישית...</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleLaunch} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base shadow-lg shadow-purple-100">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
            שגר קמפיין
            <ArrowRight className="w-5 h-5 mr-2" />
            </>}
        </Button>
      </div>
    </div>
  );
}