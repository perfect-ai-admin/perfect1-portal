import React from 'react';
import { motion } from 'framer-motion';
import { Palette, FileText, Image, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LogoCreator from './LogoCreator';

export default function BrandingSection({ businessName, onActionStart }) {
  const [selectedTool, setSelectedTool] = React.useState(null);

  const tools = [
    {
      id: 'logo',
      title: 'לוגו',
      icon: Palette,
      description: 'צור לוגו חדש או ערוך קיים'
    },
    {
      id: 'landing',
      title: 'דף נחיתה',
      icon: FileText,
      description: 'בנה דף נחיתה להצגת העסק'
    },
    {
      id: 'colors',
      title: 'צבעים',
      icon: Image,
      description: 'הגדר פלטת צבעים'
    },
    {
      id: 'fonts',
      title: 'פונטים',
      icon: Type,
      description: 'בחר פונטים לעסק'
    }
  ];

  if (selectedTool === 'logo') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <button 
          onClick={() => setSelectedTool(null)}
          className="text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          ← חזור למיתוג
        </button>
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">סטודיו למיתוג</h3>
          <LogoCreator businessName={businessName} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 md:space-y-6"
    >
      <div>
        <h3 className="text-xl md:text-lg font-bold text-gray-900 mb-2">בנה את הזהות שלך</h3>
        <p className="text-sm text-gray-600 mb-6">כל כלי בעמוד זה עוזר לך ליצור מראה עקבי בכל הערוצים</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {tools.map(tool => {
            const Icon = tool.icon;
            return (
              <motion.button
                key={tool.id}
                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (tool.id === 'logo') setSelectedTool('logo');
                  else onActionStart(tool.id);
                }}
                className="p-4 md:p-5 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all text-left active:scale-95"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-base md:text-lg">{tool.title}</h4>
                <p className="text-xs md:text-sm text-gray-600 mt-1.5">{tool.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 md:p-6 border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4 text-base">נכסים שלי</h4>
        <div className="space-y-2">
          {[
            { name: 'לוגו', status: 'לא הוגדר' },
            { name: 'צבעים', status: 'לא הוגדר' },
            { name: 'פונטים', status: 'לא הוגדר' }
          ].map((asset, i) => (
            <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <span className="text-sm md:text-base font-medium text-gray-900">{asset.name}</span>
              <span className="text-xs md:text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{asset.status}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}