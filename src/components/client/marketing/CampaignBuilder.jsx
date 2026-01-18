import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Target, 
  DollarSign, 
  Calendar, 
  Send, 
  ArrowRight, 
  Instagram, 
  Facebook, 
  Mail, 
  Search, 
  Globe, 
  ChevronRight, 
  X,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SocialCampaign from './campaigns/SocialCampaign';
import GoogleCampaign from './campaigns/GoogleCampaign';
import EmailCampaign from './campaigns/EmailCampaign';

const TEMPLATES = [
  {
    id: 'social_media',
    title: 'קמפיין רשתות חברתיות',
    description: 'פוסטים מתוכננים לפייסבוק ואינסטגרם',
    channels: ['Facebook', 'Instagram'],
    suggestedBudget: '500-1000',
    icon: LayoutGrid,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50'
  },
  {
    id: 'google_ads',
    title: 'פרסום ב-Google',
    description: 'מודעות בתוצאות חיפוש בגוגל',
    channels: ['Google Ads'],
    suggestedBudget: '1000-3000',
    icon: Search,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'email',
    title: 'שיווק במייל',
    description: 'דיוור ללקוחות קיימים ושימור קשר',
    channels: ['Email'],
    suggestedBudget: '0-200',
    icon: Mail,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
];

export default function CampaignBuilder({ onClose }) {
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
      <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-900 gap-2 p-0 hover:bg-transparent"
          >
            <ArrowRight className="w-4 h-4" />
            ביטול
          </Button>
          <h1 className="text-lg font-bold text-gray-900">בונה קמפיינים</h1>
        </div>

        {/* Hero Section */}
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 transform rotate-[-10deg]">
            <Megaphone className="w-10 h-10 text-pink-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">בחר תבנית קמפיין</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
            נתחיל מתבנית מוכנה ונתאים אותה אישית לעסק שלך, 
            כדי להשיג את התוצאות הטובות ביותר.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {TEMPLATES.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => {
                  setSelectedTemplate(template);
                  setStep(2);
                }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-xl hover:border-blue-200 transition-all group h-full flex flex-col"
              >
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${template.bgColor} group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-6 h-6 ${template.color}`} />
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{template.title}</h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        {template.description}
                    </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-50 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold">ערוצים:</span>
                    <span>{template.channels.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full w-fit">
                    <span className="">תקציב מומלץ:</span>
                    <span className="dir-ltr">₪{template.suggestedBudget}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Button variant="ghost" onClick={() => setStep(1)} className="gap-2 pl-0 hover:bg-transparent text-gray-500">
            <ChevronRight className="w-4 h-4" />
            חזרה לבחירת תבנית
        </Button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            {selectedTemplate?.id === 'social_media' && (
                <SocialCampaign 
                    onBack={() => setStep(1)}
                    onComplete={() => setStep(3)}
                />
            )}
            {selectedTemplate?.id === 'google_ads' && (
                <GoogleCampaign 
                    onBack={() => setStep(1)}
                    onComplete={() => setStep(3)}
                />
            )}
            {selectedTemplate?.id === 'email' && (
                <EmailCampaign 
                    onBack={() => setStep(1)}
                    onComplete={() => setStep(3)}
                />
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-12 h-12 text-green-600 ml-1" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">הקמפיין נוצר! 🎉</h2>
        <p className="text-gray-500 mb-8 text-lg">
            הקמפיין שלך מוכן לשיגור. שלחנו לך סיכום למייל.
        </p>
        <div className="flex flex-col gap-3">
            <Button 
                onClick={() => { setStep(1); setSelectedTemplate(null); }}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11"
            >
                צור קמפיין נוסף
            </Button>
            {onClose && (
                <Button 
                    variant="ghost" 
                    onClick={onClose}
                    className="w-full text-gray-500"
                >
                    חזרה ללוח הבקרה
                </Button>
            )}
        </div>
      </motion.div>
    </div>
  );
}