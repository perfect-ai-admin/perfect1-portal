import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Battery, 
  BatteryLow, 
  BatteryMedium, 
  BatteryFull, 
  Coffee,
  Music,
  Moon,
  Users,
  Wind
} from 'lucide-react';

export default function LoadScreen({ focus, onSave }) {
  const [energyLevel, setEnergyLevel] = useState(50); // 0-100

  useEffect(() => {
    if (focus?.load_score) {
        setEnergyLevel(focus.load_score);
    }
  }, [focus]);

  const updateEnergy = (val) => {
    setEnergyLevel(val);
    onSave({ load_score: val });
  }

  const getBatteryIcon = () => {
    if (energyLevel > 70) return <BatteryFull className="w-16 h-16 text-green-500" />;
    if (energyLevel > 30) return <BatteryMedium className="w-16 h-16 text-yellow-500" />;
    return <BatteryLow className="w-16 h-16 text-red-500" />;
  };

  const getAdvice = () => {
    if (energyLevel > 80) return {
        title: "אתה על הגל! 🌊",
        text: "המנטור מזהה שיש לך אנרגיה גבוהה. זה הזמן לתקוף את המשימות הכי קשות ומורכבות.",
        actions: []
    };
    if (energyLevel > 40) return {
        title: "מצב יציב ✨",
        text: "זמן טוב לעבודה שוטפת. המנטור ממליץ על הפסקות קטנות כדי לשמור על הקצב.",
        actions: [
            { icon: Music, label: 'שים פלייליסט מרים' },
            { icon: Coffee, label: 'שתה כוס מים/קפה' }
        ]
    };
    return {
        title: "סכנת שחיקה ⚠️",
        text: "המוח שלך מאותת שהוא צריך מנוחה. השיחות האחרונות שלך מראות סימני עומס. תעצור רגע.",
        actions: [
            { icon: Wind, label: 'צא לנשום אוויר (10 דק)' },
            { icon: Moon, label: 'שנ"צ קצר או מדיטציה' },
            { icon: Users, label: 'דבר עם חבר (לא על עבודה)' }
        ]
    };
  };

  const advice = getAdvice();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">ניהול אנרגיה</h2>
        <p className="text-gray-500">העסק שלך צריך אותך חד. המנטור עוקב אחרי רמות האנרגיה שלך.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="mb-8 relative">
            {getBatteryIcon()}
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-bold text-gray-900">{energyLevel}%</span>
        </div>
        
        <input 
            type="range" 
            min="0" 
            max="100" 
            step="10"
            value={energyLevel}
            onChange={(e) => updateEnergy(parseInt(e.target.value))}
            className="w-full max-w-md h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-8"
        />
        <div className="flex justify-between w-full max-w-md text-xs text-gray-400 px-1">
            <span>גמור לגמרי</span>
            <span>חצי כוח</span>
            <span>מלא אנרגיה</span>
        </div>
      </div>

      <motion.div 
        layout
        className={`rounded-2xl p-6 border-2 transition-colors ${
            energyLevel > 70 ? 'bg-green-50 border-green-100' : 
            energyLevel > 30 ? 'bg-yellow-50 border-yellow-100' : 
            'bg-red-50 border-red-100'
        }`}
      >
        <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-white shadow-sm ${
                 energyLevel > 70 ? 'text-green-600' : 
                 energyLevel > 30 ? 'text-yellow-600' : 
                 'text-red-600'
            }`}>
                <Battery className="w-8 h-8" />
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{advice.title}</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                    {advice.text}
                </p>

                {advice.actions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {advice.actions.map((action, idx) => {
                            const Icon = action.icon;
                            return (
                                <button key={idx} className="bg-white p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group">
                                    <Icon className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </motion.div>

      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h4 className="font-bold text-blue-900 mb-2">💡 חוק הברזל:</h4>
        <p className="text-blue-800 text-sm">
            אנחנו מנהלים אנרגיה, לא זמן. המערכת לומדת מתי אתה בשיא שלך ומתי כדאי להוריד הילוך.
        </p>
      </div>

    </motion.div>
  );
}