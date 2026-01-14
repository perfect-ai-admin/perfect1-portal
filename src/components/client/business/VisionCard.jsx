import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function VisionCard({ vision, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedVision, setEditedVision] = useState(vision || '');

  const handleSave = async () => {
    await onSave(editedVision);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedVision(vision || '');
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">החזון העסקי שלי</h2>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-indigo-600 hover:text-indigo-700"
          >
            <Edit2 className="w-4 h-4 ml-2" />
            ערוך
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={editedVision}
            onChange={(e) => setEditedVision(e.target.value)}
            placeholder="מה החזון העסקי שלך? למה פתחת את העסק הזה? מה אתה רוצה להשיג?"
            className="min-h-[120px] text-base"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {editedVision.length}/500 תווים
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 ml-2" />
                ביטול
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 ml-2" />
                שמור
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-lg text-gray-700 leading-relaxed">
          {vision || 'לחץ על "ערוך" כדי להגדיר את החזון העסקי שלך'}
        </p>
      )}
    </motion.div>
  );
}