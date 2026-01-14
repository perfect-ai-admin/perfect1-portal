import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function ActionItems({ items, onToggle, onNavigate }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Circle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-600">אין פעולות ממתינות כרגע</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:border-blue-300 transition-all"
        >
          <div className="flex items-start gap-4">
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => onToggle(item.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className={`font-semibold text-gray-900 mb-1 ${item.completed ? 'line-through opacity-50' : ''}`}>
                {item.title}
              </p>
              {item.description && (
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              )}
              {item.relatedTab && !item.completed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(item.relatedTab)}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  עבור ל{item.relatedTab}
                  <ArrowLeft className="w-3 h-3 mr-1" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}