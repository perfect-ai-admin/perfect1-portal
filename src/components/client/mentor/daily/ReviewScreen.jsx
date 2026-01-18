import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trophy, 
  Target, 
  ThumbsDown, 
  ArrowUpRight,
  Sparkles,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReviewScreen({ focus, onSave }) {
  const [step, setStep] = useState(1);
  const [wins, setWins] = useState('');
  const [learnings, setLearnings] = useState('');
  const [nextFocus, setNextFocus] = useState('');

  const handleFinish = () => {
    confetti({
      particleCount: 150,
      spread: 60,
    });
    // Save logic would go here
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Trophy className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">חגיגת ניצחונות! 🎉</h3>
                <p className="text-gray-500">אנחנו נוטים לשכוח את ההצלחות. בוא נתעד אותן.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border-2 border-yellow-100 shadow-sm">
                <label className="block font-bold text-gray-900 mb-3">מה עבד טוב השבוע? (אפילו דבר קטן)</label>
                <Textarea 
                    placeholder="סגרתי עסקה, סיימתי משימה מעצבנת, קמתי בזמן..."
                    className="min-h-[120px] text-lg bg-yellow-50/50 border-yellow-200 focus-visible:ring-yellow-400"
                    value={wins}
                    onChange={(e) => setWins(e.target.value)}
                />
            </div>
            
            <Button onClick={() => setStep(2)} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white h-12 text-lg rounded-xl">
                יש לי את זה! המשיך לשלב הבא
            </Button>
          </div>
        );
      case 2:
        return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ThumbsDown className="w-10 h-10 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">למידה מכישלונות</h3>
                  <p className="text-gray-500">אין כישלון, יש רק משוב לשיפור.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border-2 border-orange-100 shadow-sm">
                  <label className="block font-bold text-gray-900 mb-3">מה לא עבד כמו שרצית? ומה למדת מזה?</label>
                  <Textarea 
                      placeholder="בזבזתי זמן על שטויות, הלקוח אמר לא כי..."
                      className="min-h-[120px] text-lg bg-orange-50/50 border-orange-200 focus-visible:ring-orange-400"
                      value={learnings}
                      onChange={(e) => setLearnings(e.target.value)}
                  />
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-6 rounded-xl">חזור</Button>
                <Button onClick={() => setStep(3)} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-12 text-lg rounded-xl">
                    אוקיי, למדתי. הלאה
                </Button>
              </div>
            </div>
          );
      case 3:
        return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">מבט קדימה</h3>
                  <p className="text-gray-500">בוא נתפקס לשבוע הבא.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-sm">
                  <label className="block font-bold text-gray-900 mb-3">מה הדבר האחד שחייב לקרות בשבוע הבא?</label>
                  <Textarea 
                      placeholder="להכניס X כסף, לסיים את הפרויקט..."
                      className="min-h-[120px] text-lg bg-indigo-50/50 border-indigo-200 focus-visible:ring-indigo-400"
                      value={nextFocus}
                      onChange={(e) => setNextFocus(e.target.value)}
                  />
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="h-12 px-6 rounded-xl">חזור</Button>
                <Button onClick={() => setStep(4)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg rounded-xl">
                    סיימתי סיכום! סגור שבוע 🚀
                </Button>
              </div>
            </div>
          );
       case 4:
        handleFinish();
        return (
            <div className="text-center py-12">
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <Sparkles className="w-16 h-16 text-green-600" />
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">שבוע מצוין!</h2>
                <p className="text-xl text-gray-600 max-w-md mx-auto mb-8">
                    עשית עבודה חשובה השבוע. <br/>
                    הניצחונות שלך נרשמו, הלקחים נלמדו, והיעד לשבוע הבא ברור.
                </p>

                <div className="bg-gray-50 max-w-sm mx-auto p-6 rounded-2xl mb-8 text-right">
                    <p className="font-bold text-gray-900 mb-2">סיכום זריז:</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex gap-2">🏆 <span className="truncate">{wins}</span></li>
                        <li className="flex gap-2">🧠 <span className="truncate">{learnings}</span></li>
                        <li className="flex gap-2">🎯 <span className="truncate">{nextFocus}</span></li>
                    </ul>
                </div>

                <div className="flex justify-center gap-4">
                    <Button variant="outline" className="gap-2" onClick={() => {
                         // Share logic
                    }}>
                        <Share2 className="w-4 h-4" /> שתף עם שותף
                    </Button>
                    <Button className="bg-gray-900 text-white gap-2" onClick={() => setStep(1)}>
                         ערוך שוב
                    </Button>
                </div>
            </div>
        );
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-medium text-gray-400 mb-2 px-1">
            <span>ניצחונות</span>
            <span>למידה</span>
            <span>עתיד</span>
            <span>סיום</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
                className="h-full bg-indigo-600"
                initial={{ width: '0%' }}
                animate={{ width: `${(step / 4) * 100}%` }}
            />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg shadow-gray-100 border border-gray-100 min-h-[500px] flex flex-col justify-center">
        {renderStep()}
      </div>
    </motion.div>
  );
}