import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Clock, X } from 'lucide-react';

export default function DailyFocusScreen({ focus, onSave }) {
  const [primaryFocus, setPrimaryFocus] = useState(focus?.primary_focus || '');
  const [estimatedTime, setEstimatedTime] = useState(focus?.estimated_time || 60);
  const [action, setAction] = useState(null);

  const handleAction = (act) => {
    setAction(act);
    onSave({
      primary_focus: primaryFocus,
      estimated_time: estimatedTime,
      status: act
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">הדבר האחד להיום</h2>
        <p className="text-lg text-gray-600">
          עדיף להשלים משהו אחד טוב מלהתחיל בהרבה דברים.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-200">
        {!primaryFocus ? (
          <div className="space-y-6">
            <label>
              <p className="text-sm font-semibold text-gray-700 mb-2">מה הדבר החשוב ביותר היום?</p>
              <Textarea
                placeholder="כתוב משהו קצר וברור. למשל: להשלים 3 שיחות מכירות"
                value={primaryFocus}
                onChange={(e) => setPrimaryFocus(e.target.value)}
                className="h-16 text-lg"
              />
            </label>

            <label>
              <p className="text-sm font-semibold text-gray-700 mb-2">כמה זמן לדעתך זה ייקח?</p>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(parseInt(e.target.value))}
                  className="w-24 text-lg"
                />
                <span className="text-gray-600">דקות</span>
              </div>
            </label>

            <Button
              onClick={() => handleAction('pending')}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              בוא נתחיל
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-white rounded-2xl p-6">
              <p className="text-sm text-gray-600 mb-2">פוקוס היום:</p>
              <h3 className="text-2xl font-bold text-gray-900">{primaryFocus}</h3>
              <p className="text-sm text-gray-500 mt-3 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                ~{estimatedTime} דקות
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => handleAction('completed')}
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                בוצע ✓
              </Button>
              <Button
                onClick={() => handleAction('postponed')}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                ⏸️ נדחה לשלחרק
              </Button>
              <Button
                onClick={() => {
                  setPrimaryFocus('');
                  setAction(null);
                }}
                variant="ghost"
                size="lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mindset */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <p className="text-sm text-gray-700 leading-relaxed">
          💭 <strong>זכור:</strong> היום שלך הוא הצלחה אם עשית את הדבר הזה. כל דבר אחר הוא בונוס.
        </p>
      </div>
    </motion.div>
  );
}