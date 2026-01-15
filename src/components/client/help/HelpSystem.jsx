import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, PlayCircle, MessageCircle, Book, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Help System Context (section 9.3)
const HelpContext = createContext();

export function HelpProvider({ children }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [seenHints, setSeenHints] = useState({});
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Load seen hints from localStorage
    const saved = localStorage.getItem('bizpilot_seen_hints');
    if (saved) {
      setSeenHints(JSON.parse(saved));
    } else {
      // First time user - show onboarding
      const isFirstTime = !localStorage.getItem('bizpilot_onboarded');
      if (isFirstTime) {
        setShowOnboarding(true);
      }
    }
  }, []);

  const markHintSeen = (hintId) => {
    const updated = { ...seenHints, [hintId]: true };
    setSeenHints(updated);
    localStorage.setItem('bizpilot_seen_hints', JSON.stringify(updated));
  };

  const completeOnboarding = () => {
    localStorage.setItem('bizpilot_onboarded', 'true');
    setShowOnboarding(false);
  };

  return (
    <HelpContext.Provider 
      value={{ 
        activeTooltip, 
        setActiveTooltip,
        seenHints,
        markHintSeen,
        showHelpCenter,
        setShowHelpCenter,
        showOnboarding,
        setShowOnboarding,
        completeOnboarding
      }}
    >
      {children}
      <HelpButton />
      <HelpCenter />
      <OnboardingTour />
      <LiveChatWidget />
    </HelpContext.Provider>
  );
}

export function useHelp() {
   const context = useContext(HelpContext);
   if (!context) {
     // Return a default context when provider is not present
     return {
       activeTooltip: null,
       setActiveTooltip: () => {},
       seenHints: {},
       markHintSeen: () => {},
       showHelpCenter: false,
       setShowHelpCenter: () => {},
       showOnboarding: false,
       setShowOnboarding: () => {},
       completeOnboarding: () => {}
     };
   }
   return context;
 }

// Contextual Tooltip
export function HelpTooltip({ id, content, position = 'top', children }) {
  const { activeTooltip, setActiveTooltip } = useHelp();
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setActiveTooltip(activeTooltip === id ? null : id)}
      >
        {children}
      </div>
      <AnimatePresence>
        {(show || activeTooltip === id) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute z-50 ${
              position === 'top' ? 'bottom-full mb-2' :
              position === 'bottom' ? 'top-full mt-2' :
              position === 'left' ? 'right-full mr-2' :
              'left-full ml-2'
            } w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl`}
          >
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Feature Hint (shows once on first use)
export function FeatureHint({ id, title, message, action }) {
  const { seenHints, markHintSeen } = useHelp();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!seenHints[id]) {
      setTimeout(() => setShow(true), 500);
    }
  }, [seenHints, id]);

  const handleDismiss = () => {
    setShow(false);
    markHintSeen(id);
  };

  if (seenHints[id] || !show) return null;

  // Desktop: compact card, Mobile: hidden (use floating button instead)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="hidden md:flex fixed bottom-6 left-6 w-72 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-4 z-50 flex-col gap-2"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-1 left-1 text-white/80 hover:text-white p-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-start gap-2 pr-5">
        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-xs mb-0.5">{title}</h4>
          <p className="text-xs opacity-90 leading-tight">{message}</p>
        </div>
      </div>
      {action && (
        <Button 
          onClick={() => {
            action.onClick();
            handleDismiss();
          }}
          size="sm"
          className="bg-white text-blue-600 hover:bg-gray-100 w-full text-xs h-7"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

// Help Button (floating)
function HelpButton() {
  const { setShowHelpCenter } = useHelp();

  return (
    <button
      onClick={() => setShowHelpCenter(true)}
      className="fixed bottom-6 left-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all hover:scale-110"
    >
      <HelpCircle className="w-6 h-6" />
    </button>
  );
}

// Help Center Dialog
function HelpCenter() {
  const { showHelpCenter, setShowHelpCenter } = useHelp();
  const [activeTab, setActiveTab] = useState('guides');

  const guides = [
    { id: 'getting-started', title: 'מדריך התחלה מהירה', duration: '5 דקות', icon: '🚀' },
    { id: 'invoices', title: 'איך ליצור חשבונית', duration: '3 דקות', icon: '📄' },
    { id: 'goals', title: 'הגדרת מטרות עסקיות', duration: '4 דקות', icon: '🎯' },
    { id: 'mentor', title: 'שימוש במנטור החכם', duration: '6 דקות', icon: '🤖' }
  ];

  const videos = [
    { id: 'intro', title: 'סיור במערכת - 2 דקות', thumbnail: '🎬', url: '#' },
    { id: 'financial', title: 'ניהול כספי - 5 דקות', thumbnail: '💰', url: '#' },
    { id: 'marketing', title: 'כלי שיווק - 4 דקות', thumbnail: '📣', url: '#' }
  ];

  return (
    <Dialog open={showHelpCenter} onOpenChange={setShowHelpCenter}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>מרכז העזרה</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'guides' ? 'default' : 'outline'}
            onClick={() => setActiveTab('guides')}
            size="sm"
          >
            <Book className="w-4 h-4 ml-2" />
            מדריכים
          </Button>
          <Button
            variant={activeTab === 'videos' ? 'default' : 'outline'}
            onClick={() => setActiveTab('videos')}
            size="sm"
          >
            <PlayCircle className="w-4 h-4 ml-2" />
            סרטוני הדרכה
          </Button>
        </div>

        {activeTab === 'guides' && (
          <div className="space-y-3">
            {guides.map(guide => (
              <div
                key={guide.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{guide.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{guide.title}</h4>
                    <p className="text-sm text-gray-500">זמן קריאה: {guide.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="grid md:grid-cols-2 gap-4">
            {videos.map(video => (
              <div
                key={video.id}
                className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 cursor-pointer transition-all"
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center text-6xl">
                  {video.thumbnail}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-900">{video.title}</h4>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">לא מצאת את מה שחיפשת?</p>
          <Button variant="outline" className="w-full">
            <MessageCircle className="w-4 h-4 ml-2" />
            פתח צ'אט עם התמיכה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Onboarding Tour
function OnboardingTour() {
  const { showOnboarding, setShowOnboarding, completeOnboarding } = useHelp();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'ברוכים הבאים ל-BizPilot! 🎉',
      description: 'אנחנו כאן כדי לעזור לך לנהל את העסק בצורה החכמה ביותר. בואו נתחיל בסיור קצר.',
      action: 'התחל סיור'
    },
    {
      title: 'לשונית ההתקדמות 📊',
      description: 'כאן תראה את המסע העסקי שלך, מטרות, והישגים. זה המקום לעקוב אחרי ההצלחה שלך.',
      action: 'הבנתי'
    },
    {
      title: 'המנטור החכם 🤖',
      description: 'יש לך שאלה? המנטור החכם כאן כדי לעזור - מניתוח מכירות ועד עצות עסקיות.',
      action: 'נהדר'
    },
    {
      title: 'כלים פיננסיים 💰',
      description: 'צור חשבוניות, סרוק מסמכים, וסנכרן בנק - הכל במקום אחד.',
      action: 'מעולה'
    },
    {
      title: 'אתה מוכן! 🚀',
      description: 'זהו זה! תתחיל לעבוד והמערכת תלמד את העסק שלך ותציע המלצות מותאמות אישית.',
      action: 'בואו נתחיל'
    }
  ];

  const currentStepData = steps[currentStep];

  if (!showOnboarding) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        <div className="flex gap-2 mb-6 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === currentStep ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              חזור
            </Button>
          )}
          <Button
            onClick={() => {
              if (currentStep === steps.length - 1) {
                completeOnboarding();
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {currentStepData.action}
          </Button>
        </div>

        <button
          onClick={completeOnboarding}
          className="text-sm text-gray-500 hover:text-gray-700 mt-4 w-full"
        >
          דלג על הסיור
        </button>
      </motion.div>
    </div>
  );
}

// Live Chat Widget (placeholder for integration)
function LiveChatWidget() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-24 left-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 left-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-40 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">תמיכה חיה</h4>
                  <p className="text-xs opacity-80">בדרך כלל עונים תוך דקות</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 h-[calc(100%-140px)] overflow-y-auto">
              <div className="bg-gray-100 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700">שלום! איך אפשר לעזור לך היום?</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <input
                type="text"
                placeholder="הקלד הודעה..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}