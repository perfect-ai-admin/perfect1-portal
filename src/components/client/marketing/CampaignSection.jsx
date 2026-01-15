import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CampaignBuilder from './CampaignBuilder';

export default function CampaignSection() {
  const [isCreating, setIsCreating] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const channels = [
    { id: 'google', name: 'Google Ads', color: 'bg-blue-50 border-blue-200' },
    { id: 'email', name: 'Email Marketing', color: 'bg-purple-50 border-purple-200' },
    { id: 'social', name: 'Social Media', color: 'bg-pink-50 border-pink-200' }
  ];

  if (isCreating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <button 
          onClick={() => setIsCreating(false)}
          className="text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          ← ביטול
        </button>
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">בונה קמפיינים</h3>
          <CampaignBuilder />
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl md:text-lg font-bold text-gray-900">קמפיינים שלך</h3>
          <p className="text-sm text-gray-600 mt-1">צור וניהול קמפיינים בערוצים שונים</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="gap-2 w-full md:w-auto h-12 md:h-10 text-base md:text-sm rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 md:w-4 md:h-4" />
          קמפיין חדש
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-300 rounded-xl p-8 md:p-10 text-center">
          <Rocket className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-4">עדיין אין קמפיינים</p>
          <p className="text-sm text-gray-600 mb-6">התחל עם קמפיין ראשון להגביר את הנראות שלך</p>
          <Button 
            onClick={() => setIsCreating(true)}
            className="w-full md:w-auto h-12 md:h-10 text-base md:text-sm rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            צור קמפיין ראשון
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(campaign => (
            <motion.div 
              key={campaign.id} 
              whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              className="border border-gray-200 rounded-xl p-4 md:p-5 hover:border-gray-300 transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base md:text-lg truncate">{campaign.name}</h4>
                  <p className="text-xs md:text-sm text-gray-600 mt-0.5">{campaign.channel}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    campaign.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {campaign.status === 'active' ? 'פעיל' : 'כבוי'}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                    <Settings className="w-5 h-5 md:w-4 md:h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 md:p-6 border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4 text-base">ערוצים לשימוש</h4>
        <div className="space-y-2">
          {channels.map(channel => (
            <motion.div 
              key={channel.id}
              whileHover={{ x: 4 }}
              className={`p-4 md:p-3 border rounded-lg ${channel.color} flex items-center justify-between hover:shadow-sm transition-all cursor-pointer`}
            >
              <span className="text-sm md:text-base font-semibold text-gray-900">{channel.name}</span>
              <span className="text-xs bg-white bg-opacity-60 px-3 py-1 rounded-full text-gray-600">לא פעיל</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}