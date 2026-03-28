import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Facebook, Instagram, Check, Link2, Image, Layout, ArrowRight, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { entities } from '@/api/supabaseClient';

export default function SocialCampaign({ onBack, onComplete }) {
  const [step, setStep] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    platforms: [],
    objective: '',
    budget: '',
    creativeType: 'image'
  });

  const togglePlatform = (p) => {
    setData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p) 
        ? prev.platforms.filter(x => x !== p)
        : [...prev.platforms, p]
    }));
  };

  const handleConnect = () => {
    // Simulate connection
    setTimeout(() => setIsConnected(true), 1500);
  };

  const handleLaunch = async () => {
    try {
        setIsLoading(true);
        await entities.Campaign.create({
            name: `Social Campaign - ${new Date().toLocaleDateString('he-IL')}`,
            channel: 'social',
            platform: data.platforms.join(', '),
            budget: Number(data.budget) || 0,
            status: 'active',
            content: {
                objective: data.objective,
                creativeType: data.creativeType
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

  const renderStep1_Connect = () => (
    <div className="space-y-4 pt-2">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">חיבור לרשתות חברתיות</h3>
        <p className="text-xs text-gray-500">חבר את הנכסים הדיגיטליים שלך כדי להריץ קמפיינים</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col items-center text-center space-y-3">
        <div className="flex -space-x-2 space-x-reverse">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm z-10">
            <Facebook className="w-6 h-6 text-blue-600" />
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Instagram className="w-6 h-6 text-pink-600" />
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900">Meta Business Suite</h4>
          <p className="text-xs text-gray-500">ניהול קמפיינים בפייסבוק ואינסטגרם</p>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">החשבון מחובר בהצלחה</span>
          </div>
        ) : (
          <Button onClick={handleConnect} className="bg-[#1877F2] hover:bg-[#166fe5] text-white w-full max-w-xs">
            <Link2 className="w-4 h-4 mr-2" />
            התחבר עם Facebook
          </Button>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button 
            onClick={() => setStep(2)} 
            disabled={!isConnected}
            className="w-full md:w-auto"
        >
            המשך להגדרת הקמפיין
            <ArrowRight className="w-4 h-4 mr-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep2_Details = () => (
    <div className="space-y-6">
       <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">הגדרת קמפיין סושיאל</h3>
        <p className="text-sm text-gray-500">בחר את המאפיינים המדויקים לקמפיין שלך</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
            <Label>באילו פלטפורמות תרצה לפרסם?</Label>
            <div className="grid grid-cols-2 gap-4">
                <div 
                    onClick={() => togglePlatform('facebook')}
                    className={`cursor-pointer p-4 rounded-xl border flex items-center gap-3 transition-all ${data.platforms.includes('facebook') ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                    <Facebook className={`w-5 h-5 ${data.platforms.includes('facebook') ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">Facebook</span>
                </div>
                <div 
                    onClick={() => togglePlatform('instagram')}
                    className={`cursor-pointer p-4 rounded-xl border flex items-center gap-3 transition-all ${data.platforms.includes('instagram') ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                    <Instagram className={`w-5 h-5 ${data.platforms.includes('instagram') ? 'text-pink-600' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">Instagram</span>
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <Label>מטרת הקמפיין</Label>
            <Select onValueChange={(val) => setData({...data, objective: val})}>
                <SelectTrigger>
                    <SelectValue placeholder="בחר מטרה" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="awareness">חשיפה למותג</SelectItem>
                    <SelectItem value="traffic">תנועה לאתר</SelectItem>
                    <SelectItem value="engagement">מעורבות (לייקים/תגובות)</SelectItem>
                    <SelectItem value="leads">לידים (טופס)</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <Label>סוג קריאייטיב מועדף</Label>
            <div className="grid grid-cols-2 gap-4">
                <div 
                    onClick={() => setData({...data, creativeType: 'image'})}
                    className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${data.creativeType === 'image' ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}
                >
                    <Image className="w-6 h-6 text-gray-600" />
                    <span className="text-xs font-medium">תמונה יחידה</span>
                </div>
                <div 
                    onClick={() => setData({...data, creativeType: 'carousel'})}
                    className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${data.creativeType === 'carousel' ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}
                >
                    <Layout className="w-6 h-6 text-gray-600" />
                    <span className="text-xs font-medium">קרוסלה</span>
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <Label>תקציב יומי (₪)</Label>
            <div className="relative">
                <Input 
                    type="number" 
                    placeholder="למשל: 50" 
                    className="pl-8"
                    onChange={(e) => setData({...data, budget: e.target.value})}
                />
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">חזור</Button>
        <Button onClick={handleLaunch} disabled={isLoading} className="flex-[2] bg-pink-600 hover:bg-pink-700 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
            צור קמפיין
            <ArrowRight className="w-4 h-4 mr-2" />
            </>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      {step === 1 ? renderStep1_Connect() : renderStep2_Details()}
    </div>
  );
}