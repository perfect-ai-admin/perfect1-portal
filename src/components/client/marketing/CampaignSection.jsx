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
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">אזור עבודה על קמפיינים</h3>
          <p className="text-sm text-gray-600 mt-1">צור וניהול קמפיינים בערוצים שונים</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          קמפיין חדש
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">אין קמפיינים פעילים</p>
          <Button 
            variant="outline"
            onClick={() => setIsCreating(true)}
          >
            צור קמפיין ראשון
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                  <p className="text-sm text-gray-600">{campaign.channel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {campaign.status === 'active' ? 'פעיל' : 'כבוי'}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">ערוצים זמינים</h4>
        <div className="space-y-2">
          {channels.map(channel => (
            <div 
              key={channel.id}
              className={`p-3 border rounded-lg ${channel.color} flex items-center justify-between`}
            >
              <span className="text-sm font-medium text-gray-900">{channel.name}</span>
              <span className="text-xs text-gray-500">לא פעיל</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}