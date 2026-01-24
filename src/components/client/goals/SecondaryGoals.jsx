import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle, Edit2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SecondaryGoals({ goals, onStatusChange, onEdit, onDelete, showHeader = true }) {
  if (!goals || goals.length === 0) return null;

  const statusIcons = {
    active: <Circle className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />,
    achieved: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    stuck: <AlertCircle className="w-4 h-4 text-orange-500" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3 pt-2"
    >
      {showHeader && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-bold text-gray-900">מטרות נוספות</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {goals.map(goal => (
          <motion.div
            key={goal.id}
            layoutId={goal.id}
            className="group bg-white rounded-xl border border-gray-100 p-3 hover:border-blue-200 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                 onClick={() => {
                   const nextStatus = goal.status === 'active' ? 'achieved' : goal.status === 'achieved' ? 'stuck' : 'active';
                   onStatusChange(goal, nextStatus);
                 }}
                 className="flex-shrink-0 p-1 rounded-full hover:bg-gray-50 transition-colors"
               >
                 {statusIcons[goal.status]}
               </button>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-semibold truncate transition-colors",
                  goal.status === 'achieved' ? 'text-gray-400 line-through' : 'text-gray-800 group-hover:text-blue-700'
                )}>
                  {goal.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{goal.deadline && !isNaN(new Date(goal.deadline).getTime()) ? new Date(goal.deadline).toLocaleDateString('he-IL') : ''}</span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(goal)}>
                  <Edit2 className="w-3.5 h-3.5 ml-2" />
                  עריכה
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-red-600 focus:text-red-700">
                  <X className="w-3.5 h-3.5 ml-2" />
                  מחיקה
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}