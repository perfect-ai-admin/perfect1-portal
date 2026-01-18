import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Phone, 
  Mail, 
  FileText, 
  Coffee,
  Plus,
  Trash2,
  CalendarDays
} from 'lucide-react';

const TASK_TYPES = [
  { id: 'sales', label: 'מכירות', icon: Phone, color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'work', label: 'ביצוע', icon: Briefcase, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'admin', label: 'מנהלה', icon: FileText, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { id: 'marketing', label: 'שיווק', icon: Mail, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'break', label: 'אישי', icon: Coffee, color: 'bg-orange-100 text-orange-700 border-orange-200' },
];

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'];

const DEFAULT_WEEK = {
  'ראשון': [{ type: 'sales', title: 'פולואפ לידים' }, { type: 'work', title: 'פרויקטים' }],
  'שני': [{ type: 'work', title: 'פוקוס עבודה' }],
  'שלישי': [{ type: 'marketing', title: 'יצירת תוכן' }, { type: 'sales', title: 'שיחות יזומות' }],
  'רביעי': [{ type: 'admin', title: 'חשבוניות וסדר' }],
  'חמישי': [{ type: 'work', title: 'סגירת שבוע' }, { type: 'break', title: 'יציאה מוקדמת' }],
};

export default function WeeklyStructureScreen() {
  const [weekPlan, setWeekPlan] = useState(DEFAULT_WEEK);
  const [selectedDay, setSelectedDay] = useState(null);

  const addTask = (day, type) => {
    const taskType = TASK_TYPES.find(t => t.id === type);
    setWeekPlan(prev => ({
      ...prev,
      [day]: [...prev[day], { type, title: taskType.label }]
    }));
  };

  const removeTask = (day, index) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">האסטרטגיה השבועית</h2>
          <p className="text-gray-500">תכנון נכון מונע כיבוי שריפות. איך השבוע שלך נראה?</p>
        </div>
        <div className="hidden md:flex gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></span> מכירות
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></span> ביצוע
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-purple-100 border border-purple-200"></span> שיווק
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        {DAYS.map((day) => (
          <div 
            key={day} 
            className={`bg-white rounded-2xl border-2 transition-all overflow-hidden flex flex-col ${selectedDay === day ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-lg scale-105 z-10' : 'border-gray-100 hover:border-gray-200'}`}
            onClick={() => setSelectedDay(day)}
          >
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-900">{day}</span>
              {selectedDay === day && (
                <div className="flex gap-1">
                   {/* Task Type Selector Mini */}
                </div>
              )}
            </div>
            
            <div className="p-3 space-y-2 flex-1 min-h-[150px]">
              {weekPlan[day].map((task, idx) => {
                const typeConfig = TASK_TYPES.find(t => t.id === task.type);
                const Icon = typeConfig.icon;
                return (
                  <motion.div
                    layout
                    key={`${day}-${idx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-2 rounded-xl border flex items-center gap-2 text-sm font-medium ${typeConfig.color} group relative`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{task.title}</span>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTask(day, idx);
                      }}
                      className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 rounded-full transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                );
              })}
              
              {selectedDay === day && (
                <div className="grid grid-cols-5 gap-1 pt-2 border-t border-gray-100 mt-2">
                    {TASK_TYPES.map(type => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addTask(day, type.id);
                                }}
                                className={`p-1.5 rounded-lg flex justify-center items-center hover:scale-110 transition-transform ${type.color}`}
                                title={type.label}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        )
                    })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex items-start gap-4">
        <div className="bg-white p-3 rounded-xl shadow-sm text-indigo-600">
            <CalendarDays className="w-6 h-6" />
        </div>
        <div>
            <h3 className="font-bold text-indigo-900">למה זה חשוב?</h3>
            <p className="text-indigo-700 text-sm mt-1 leading-relaxed max-w-2xl">
                רוב העצמאים נשאבים לכיבוי שריפות. כשאתה מחליט מראש שיום שלישי הוא "יום שיווק", אתה מפנה לזה מקום במוח. 
                נסה לקבץ משימות דומות יחד (Batching) כדי לחסוך אנרגיה מנטלית.
            </p>
        </div>
      </div>
    </motion.div>
  );
}