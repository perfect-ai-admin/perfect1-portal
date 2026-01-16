import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Zap, MessageSquare, Layers, Briefcase, MoreVertical, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const WORK_TYPE_CONFIG = {
  campaign: { label: 'קמפיין', icon: Zap, color: 'bg-blue-100 text-blue-700' },
  sales: { label: 'מכירה', icon: MessageSquare, color: 'bg-green-100 text-green-700' },
  experiment: { label: 'ניסוי', icon: BookOpen, color: 'bg-purple-100 text-purple-700' },
  content: { label: 'תוכן', icon: Layers, color: 'bg-orange-100 text-orange-700' },
  funnel: { label: 'משפך', icon: Briefcase, color: 'bg-pink-100 text-pink-700' },
  task: { label: 'משימה', icon: MoreVertical, color: 'bg-gray-100 text-gray-700' },
  other: { label: 'אחר', icon: BookOpen, color: 'bg-slate-100 text-slate-700' }
};

const STATUS_CONFIG = {
  idea: { label: '💡 רעיון', color: 'bg-gray-50 border-gray-200' },
  in_progress: { label: '⚡ בתהליך', color: 'bg-blue-50 border-blue-200' },
  waiting: { label: '⏳ בהמתנה', color: 'bg-yellow-50 border-yellow-200' },
  completed: { label: '✅ בוצע', color: 'bg-green-50 border-green-200' },
  cancelled: { label: '❌ בוטל', color: 'bg-red-50 border-red-200' }
};

export default function SavedWorksSection({ onSelectWork }) {
  const [filter, setFilter] = useState('all');

  const { data: works = [], isLoading } = useQuery({
    queryKey: ['savedWorks'],
    queryFn: () => base44.entities.SavedWork.list('-updated_date'),
    initialData: []
  });

  const filteredWorks = filter === 'all' 
    ? works 
    : works.filter(w => w.status === filter);

  const openWorks = works.filter(w => ['idea', 'in_progress', 'waiting'].includes(w.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">מה בתהליך</h3>
          <p className="text-gray-600 text-sm mt-1">
            {openWorks} עבודות פתוחות • {works.filter(w => w.status === 'completed').length} בוצעו
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-10"
        >
          <Plus className="w-4 h-4 ml-2" />
          עבודה חדשה
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'הכל' },
          { id: 'in_progress', label: '⚡ בתהליך' },
          { id: 'idea', label: '💡 רעיונות' },
          { id: 'waiting', label: '⏳ בהמתנה' },
          { id: 'completed', label: '✅ בוצע' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
              filter === f.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Works Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredWorks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">אין עבודות בקטגוריה זו</p>
          <p className="text-gray-500 text-sm">התחל עבודה חדשה או שמור עבודה קיימת</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorks.map((work, idx) => {
            const typeConfig = WORK_TYPE_CONFIG[work.workType];
            const StatusIcon = typeConfig.icon;

            return (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectWork(work)}
                className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${STATUS_CONFIG[work.status].color}`}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {typeConfig.label}
                  </span>
                  <span className="text-lg">{STATUS_CONFIG[work.status].label}</span>
                </div>

                {/* Title */}
                <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{work.title}</h4>

                {/* Description */}
                {work.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{work.description}</p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(work.updated_date).toLocaleDateString('he-IL', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {work.daysInactive > 7 && (
                    <span className="ml-auto text-orange-600 font-medium">
                      לא נגעת {work.daysInactive} ימים
                    </span>
                  )}
                </div>

                {/* CTA */}
                <button className="w-full mt-3 py-2 bg-white/60 hover:bg-white rounded-lg text-sm font-semibold text-gray-900 transition-colors">
                  ▶ המשך לעבוד
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}