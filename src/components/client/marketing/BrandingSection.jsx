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
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">אזור עבודה על מיתוג</h3>
        <p className="text-sm text-gray-600 mb-6">בנה את הזהות החזותית של העסק שלך</p>

        <div className="grid md:grid-cols-2 gap-4">
          {tools.map(tool => {
            const Icon = tool.icon;
            return (
              <motion.button
                key={tool.id}
                whileHover={{ y: -2 }}
                onClick={() => {
                  if (tool.id === 'logo') setSelectedTool('logo');
                  else onActionStart(tool.id);
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
              >
                <Icon className="w-6 h-6 text-gray-600 mb-3" />
                <h4 className="font-semibold text-gray-900">{tool.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">נכסי מיתוג שלי</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
            <span className="text-gray-700">לוגו</span>
            <span className="text-gray-400">-</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
            <span className="text-gray-700">צבעים</span>
            <span className="text-gray-400">-</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
            <span className="text-gray-700">פונטים</span>
            <span className="text-gray-400">-</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}