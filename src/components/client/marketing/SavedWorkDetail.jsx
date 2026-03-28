import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { entities } from '@/api/supabaseClient';
const STATUS_OPTIONS = [
  { id: 'idea', label: '💡 רעיון' },
  { id: 'in_progress', label: '⚡ בתהליך' },
  { id: 'waiting', label: '⏳ בהמתנה' },
  { id: 'completed', label: '✅ בוצע' },
  { id: 'cancelled', label: '❌ בוטל' }
];

export default function SavedWorkDetail({ work, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(work);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await entities.SavedWork.update(work.id, editData);
      onUpdate(editData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setIsSaving(true);
    try {
      await entities.SavedWork.update(work.id, { status: newStatus });
      onUpdate({ ...work, status: newStatus });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="text-2xl font-bold mb-2"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{work.title}</h2>
            )}
            
            {isEditing ? (
              <Input
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="text-sm text-gray-600"
                placeholder="למה זה נוצר?"
              />
            ) : (
              <p className="text-gray-600 text-sm">{work.description}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="ml-4 text-2xl text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Status Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900">סטטוס</h3>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleStatusChange(opt.id)}
                  disabled={isSaving}
                  className={`p-3 rounded-lg border-2 font-medium transition-all text-sm ${
                    work.status === opt.id
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Context Section */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-900">ההקשר</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">סוג עבודה</p>
                <p className="font-medium text-gray-900">{work.workType}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">מטרה עסקית</p>
                <p className="font-medium text-gray-900">{work.businessGoal || 'לא הוגדרה'}</p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">התוכן</h3>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  בטל
                </button>
              )}
            </div>
            
            {isEditing ? (
              <textarea
                value={editData.content || ''}
                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none min-h-32 font-mono text-sm"
                placeholder="כתוב את התוכן כאן..."
              />
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap font-mono text-sm min-h-32">
                {work.content || 'אין תוכן עדיין'}
              </div>
            )}
          </div>

          {/* Insights Section */}
          {work.insights && work.insights.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">תובנות והחלטות</h3>
              <div className="space-y-2">
                {work.insights.map((insight, idx) => {
                  const icons = {
                    insight: <AlertCircle className="w-4 h-4 text-blue-600" />,
                    decision: <CheckCircle className="w-4 h-4 text-green-600" />,
                    question: <HelpCircle className="w-4 h-4 text-orange-600" />
                  };

                  return (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      {icons[insight.type]}
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{insight.title}</p>
                        <p className="text-xs text-gray-600">{insight.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Next Step Section */}
          <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-gray-900">צעד הבא</h3>
            {isEditing ? (
              <textarea
                value={editData.nextStep || ''}
                onChange={(e) => setEditData({ ...editData, nextStep: e.target.value })}
                className="w-full p-3 border-2 border-blue-300 rounded-lg focus:outline-none"
                placeholder="מה צריך לעשות בהמשך?"
              />
            ) : (
              <p className="text-gray-700">
                {work.nextStep || 'טרם הוגדר'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            סגור
          </Button>
          
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit2 className="w-4 h-4 ml-2" />
              ערוך
            </Button>
          )}

          {isEditing && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSaving ? 'שמירה...' : 'שמור שינויים'}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}