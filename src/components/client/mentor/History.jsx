import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Search } from 'lucide-react';
import MentorHeader from './shared/MentorHeader';

const timelineEvents = [
  {
    date: '14 בינואר',
    type: 'insight',
    title: 'ירידה בלידים מגוגל',
    description: 'זוהתה ירידה של 30% בלידים בשבוע האחרון',
    source: 'ניתוחים'
  },
  {
    date: '13 בינואר',
    type: 'action',
    title: 'הופעלה קמפיין גוגל חדש',
    description: 'קמפיין עם תקציב של ₪1,500',
    source: 'ROI'
  },
  {
    date: '12 בינואר',
    type: 'conversation',
    title: 'שיחה: איך לשפר סגירות',
    description: 'דיון על תסריט פתיחה ותגובה להתנגדויות',
    source: 'שיחים'
  },
  {
    date: '10 בינואר',
    type: 'action',
    title: 'שלחת 5 פולואפים',
    description: 'פולואפים ללידים ממתינים',
    source: 'מכירות'
  },
  {
    date: '8 בינואר',
    type: 'insight',
    title: 'אתה לא עוקב אחרי לידים',
    description: 'רק 20% מהלידים קיבלו פולואפ',
    source: 'ניתוחים'
  }
];

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = timelineEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventColor = (type) => {
    const colors = {
      insight: 'from-yellow-500 to-orange-500',
      action: 'from-green-500 to-emerald-500',
      conversation: 'from-blue-500 to-cyan-500'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getEventLabel = (type) => {
    const labels = {
      insight: 'תובנה',
      action: 'פעולה',
      conversation: 'שיחה'
    };
    return labels[type] || 'אירוע';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <MentorHeader 
        title="היסטוריה"
        subtitle="זיכרון עסקי: מה קרה, מה בוצע, מה השפיע"
        icon={BarChart3}
      />

      {/* Search */}
      <div className="border-b border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="חפש אירוע..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredEvents.map((event, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex gap-3"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-6 h-6 bg-gradient-to-r ${getEventColor(event.type)} rounded-full flex items-center justify-center`}>
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              {idx < filteredEvents.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-200 mt-1" />
              )}
            </div>

            {/* Event card */}
            <div className="flex-1 pb-2">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-gray-600 font-medium">{event.date}</p>
                  <span className={`text-xs bg-gradient-to-r ${getEventColor(event.type)} text-white px-2 py-1 rounded-full`}>
                    {getEventLabel(event.type)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{event.title}</h3>
                <p className="text-xs text-gray-700 mb-2">{event.description}</p>
                <button className="text-xs text-blue-600 hover:underline font-medium">
                  קישור ל{event.source}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}