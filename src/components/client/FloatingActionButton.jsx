import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Target, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FloatingActionButton({ onAction }) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'invoice',
      label: 'חשבונית חדשה',
      icon: FileText,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => onAction('invoice')
    },
    {
      id: 'goal',
      label: 'מטרה חדשה',
      icon: Target,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => onAction('goal')
    },
    {
      id: 'mentor',
      label: 'שאל מנטור',
      icon: MessageSquare,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => onAction('mentor')
    }
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50 md:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-0 space-y-3"
          >
            {actions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 ${action.color} text-white rounded-full shadow-lg`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{action.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}