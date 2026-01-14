import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Target, DollarSign, Calendar, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TEMPLATES = [
  {
    id: 'social_media',
    title: 'קמפיין רשתות חברתיות',
    description: 'פוסטים מתוכננים לפייסבוק ואינסטגרם',
    channels: ['Facebook', 'Instagram'],
    suggestedBudget: '500-1000'
  },
  {
    id: 'google_ads',
    title: 'פרסום ב-Google',
    description: 'מודעות בתוצאות חיפוש',
    channels: ['Google Ads'],
    suggestedBudget: '1000-3000'
  },
  {
    id: 'email',
    title: 'שיווק במייל',
    description: 'דיוור ללקוחות קיימים',
    channels: ['Email'],
    suggestedBudget: '0-200'
  }
];

export default function CampaignBuilder() {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [campaignData, setCampaignData] = useState({
    name: '',
    goal: '',
    budget: '',
    duration: '',
    targetAudience: ''
  });

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Megaphone className="w-16 h-16 mx-auto text-pink-600 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">בחר תבנית קמפיין</h2>
          <p className="text-gray-600">נתחיל מתבנית מוכנה ונתאים אותה לעסק שלך</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {TEMPLATES.map(template => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelectedTemplate(template);
                setStep(2);
              }}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{template.title}</h3>
              <p className="text-gray-600 mb-4 text-sm">{template.description}</p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-500">
                  <strong>ערוצים:</strong> {template.channels.join(', ')}
                </p>
                <p className="text-green-700 font-semibold">
                  תקציב מומלץ: ₪{template.suggestedBudget}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setStep(1)}>← חזור</Button>
        
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">הגדרת הקמפיין</h2>
          
          <div className="space-y-4">
            <div>
              <Label>שם הקמפיין</Label>
              <Input
                value={campaignData.name}
                onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="למשל: 'קמפיין קיץ 2026'"
              />
            </div>

            <div>
              <Label>מטרת הקמפיין</Label>
              <Select value={campaignData.goal} onValueChange={(val) => setCampaignData(prev => ({ ...prev, goal: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מטרה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">חשיפה ומודעות</SelectItem>
                  <SelectItem value="leads">יצירת לידים</SelectItem>
                  <SelectItem value="sales">מכירות ישירות</SelectItem>
                  <SelectItem value="engagement">מעורבות קהל</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>תקציב (₪)</Label>
              <Input
                type="number"
                value={campaignData.budget}
                onChange={(e) => setCampaignData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder={`מומלץ: ₪${selectedTemplate?.suggestedBudget}`}
              />
            </div>

            <div>
              <Label>משך הקמפיין</Label>
              <Select value={campaignData.duration} onValueChange={(val) => setCampaignData(prev => ({ ...prev, duration: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר משך זמן" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">שבוע</SelectItem>
                  <SelectItem value="2weeks">שבועיים</SelectItem>
                  <SelectItem value="month">חודש</SelectItem>
                  <SelectItem value="3months">3 חודשים</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>קהל יעד</Label>
              <Textarea
                value={campaignData.targetAudience}
                onChange={(e) => setCampaignData(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="תאר את קהל היעד שלך (גיל, מיקום, תחומי עניין...)"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
            <h4 className="font-bold text-blue-900 mb-2">💡 חישוב ROI משוער</h4>
            <p className="text-sm text-blue-800">
              בהתבסס על התקציב שהגדרת ({campaignData.budget ? `₪${campaignData.budget}` : '___'}), 
              אנחנו מעריכים שתוכל להגיע ל-{campaignData.budget ? Math.round(parseInt(campaignData.budget) / 50) : '___'} לקוחות פוטנציאליים.
            </p>
          </div>

          <Button 
            onClick={() => setStep(3)}
            className="w-full"
            disabled={!campaignData.name || !campaignData.goal || !campaignData.budget}
          >
            <Calendar className="w-5 h-5 ml-2" />
            המשך לתזמון
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <Send className="w-16 h-16 mx-auto text-green-600 mb-4" />
      <h2 className="text-3xl font-bold text-gray-900 mb-3">הקמפיין נוצר! 🎉</h2>
      <p className="text-gray-600 mb-6">הקמפיין שלך מוכן לשיגור</p>
      <Button onClick={() => { setStep(1); setSelectedTemplate(null); }}>
        צור קמפיין נוסף
      </Button>
    </div>
  );
}

function Label({ children }) {
  return <label className="text-sm font-semibold text-gray-700 block mb-2">{children}</label>;
}