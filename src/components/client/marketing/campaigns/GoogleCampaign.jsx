import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Check, Link2, ArrowRight, DollarSign, Globe } from 'lucide-react';

export default function GoogleCampaign({ onBack, onComplete }) {
  const [step, setStep] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState({
    keywords: '',
    location: '',
    budget: '',
    headline: ''
  });

  const handleConnect = () => {
    // Simulate connection
    setTimeout(() => setIsConnected(true), 1500);
  };

  const renderStep1_Connect = () => (
    <div className="space-y-4 pt-2">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">חיבור ל-Google Ads</h3>
        <p className="text-xs text-gray-500">חבר את חשבון הפרסום שלך בגוגל</p>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
            <Search className="w-8 h-8 text-blue-600" />
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900">Google Ads</h4>
          <p className="text-xs text-gray-500">פרסום בתוצאות החיפוש של גוגל</p>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">החשבון מחובר</span>
          </div>
        ) : (
          <Button onClick={handleConnect} variant="outline" className="border-blue-200 hover:bg-blue-50 hover:text-blue-700 text-blue-600 w-full max-w-xs">
            <img src="https://www.gstatic.com/images/branding/product/1x/ads_24dp.png" alt="Google Ads" className="w-5 h-5 mr-2" />
            התחבר לחשבון Google
          </Button>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button 
            onClick={() => setStep(2)} 
            disabled={!isConnected}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
        >
            המשך להגדרת המודעות
            <ArrowRight className="w-4 h-4 mr-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep2_Details = () => (
    <div className="space-y-6">
       <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">הגדרת קמפיין Google</h3>
        <p className="text-sm text-gray-500">איפה ומתי הלקוחות ימצאו אותך?</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" />
                מילות מפתח (מופרדות בפסיקים)
            </Label>
            <Textarea 
                placeholder="למשל: שיפוץ דירה, קבלן שיפוצים, עיצוב פנים..."
                value={data.keywords}
                onChange={(e) => setData({...data, keywords: e.target.value})}
                className="min-h-[80px]"
            />
        </div>

        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                אזור גיאוגרפי
            </Label>
            <Input 
                placeholder="למשל: תל אביב והמרכז"
                value={data.location}
                onChange={(e) => setData({...data, location: e.target.value})}
            />
        </div>

        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-500" />
                כותרת המודעה הראשית
            </Label>
            <Input 
                placeholder="המסר המרכזי שיופיע בכחול"
                value={data.headline}
                onChange={(e) => setData({...data, headline: e.target.value})}
            />
        </div>

        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                תקציב יומי (₪)
            </Label>
            <Input 
                type="number"
                placeholder="מומלץ להתחיל מ-₪50"
                value={data.budget}
                onChange={(e) => setData({...data, budget: e.target.value})}
            />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">חזור</Button>
        <Button onClick={onComplete} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white">
            השק את הקמפיין
            <ArrowRight className="w-4 h-4 mr-2" />
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