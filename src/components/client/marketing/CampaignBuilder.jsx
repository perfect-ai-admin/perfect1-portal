import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, 
  Send, 
  Mail, 
  Search, 
  ChevronRight, 
  X,
  LayoutGrid,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function CampaignBuilder({ onClose, onCampaignCreated }) {
  const [step, setStep] = useState(1);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [campaignData, setCampaignData] = useState({
    name: '',
    goal: '',
    budget: '',
    duration: '',
    targetAudience: ''
  });

  const handleComplete = () => {
    if (onCampaignCreated) {
        onCampaignCreated();
    }
    setStep(3);
  };

  if (step === 1) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto px-4 pt-2 pb-6 relative">
        <Button 
            variant="ghost" 
            onClick={onClose} 
            className="absolute top-2 left-4 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full w-8 h-8 p-0"
        >
            <X className="w-5 h-5" />
        </Button>

        {/* Centered Header */}
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <Megaphone className="w-6 h-6 text-pink-600" />
                בחר תבנית קמפיין
            </h1>
            <p className="text-gray-500 text-sm">
                נתחיל מתבנית מוכנה ונתאים אותה אישית לעסק שלך
            </p>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-3 gap-4">
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
                  // setSelectedTemplate(template);
                  // setStep(2);
                  setShowComingSoon(true);
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

        <AnimatePresence>
            {showComingSoon && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    onClick={() => setShowComingSoon(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />
                        
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 relative group">
                            <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-20" />
                            <Clock className="w-10 h-10 text-blue-600 relative z-10" />
                            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-full border-4 border-white shadow-sm z-20">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                            בקרוב... 🚀
                        </h3>
                        <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                            אנחנו עובדים מסביב לשעון כדי להביא לך את חווית הקמפיינים המתקדמת ביותר. המערכת תהיה זמינה לשימוש מלא בזמן הקרוב.
                        </p>

                        <Button 
                            onClick={() => setShowComingSoon(false)}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 font-medium text-base shadow-xl shadow-gray-200"
                        >
                            הבנתי, תודה
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-4 relative">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8 relative">
            <Button 
                variant="ghost" 
                onClick={() => setStep(1)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 gap-1 p-0 h-auto text-xs font-normal z-10"
            >
                <ChevronRight className="w-3 h-3" />
                חזרה לתבניות
            </Button>

            {selectedTemplate?.id === 'social_media' && (
                <SocialCampaign 
                    onBack={() => setStep(1)}
                    onComplete={handleComplete}
                />
            )}
            {selectedTemplate?.id === 'google_ads' && (
                <GoogleCampaign 
                    onBack={() => setStep(1)}
                    onComplete={handleComplete}
                />
            )}
            {selectedTemplate?.id === 'email' && (
                <EmailCampaign 
                    onBack={() => setStep(1)}
                    onComplete={handleComplete}
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