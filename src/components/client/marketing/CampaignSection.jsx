import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Search, Mail, LayoutGrid, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CampaignBuilder from './CampaignBuilder';

export default function CampaignSection() {
  const [isCreating, setIsCreating] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const channels = [
    { id: 'google', name: 'Google Ads', description: 'חיפוש', icon: Search, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-100' },
    { id: 'email', name: 'Email Marketing', description: 'דיוור', icon: Mail, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-100' },
    { id: 'social', name: 'Social Media', description: 'רשתות', icon: LayoutGrid, color: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-100' }
  ];

  if (isCreating) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <CampaignBuilder onClose={() => setIsCreating(false)} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">אזור עבודה על קמפיינים</h3>
          <p className="text-gray-500 mt-1">צור ונהל קמפיינים בערוצים שונים במקום אחד</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 px-6 shadow-lg shadow-gray-200"
        >
          <Plus className="w-5 h-5 ml-2" />
          קמפיין חדש
        </Button>
      </div>

      {/* Campaigns List or Empty State */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">עדיין אין קמפיינים פעילים</h4>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            זה הזמן להשיק את הקמפיין הראשון שלך ולהתחיל להביא תוצאות לעסק.
          </p>
          <Button 
            onClick={() => setIsCreating(true)}
            variant="outline"
            className="rounded-xl h-11 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            צור קמפיין ראשון
            <ArrowRight className="w-4 h-4 mr-2" />
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{campaign.name}</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {campaign.channel}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    campaign.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {campaign.status === 'active' ? 'פעיל' : 'כבוי'}
                  </span>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                    <Settings className="w-5 h-5 text-gray-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Channels */}
      <div className="space-y-4">
        <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
            ערוצים זמינים
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {channels.map(channel => {
            const Icon = channel.icon;
            return (
              <div 
                key={channel.id}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all"
              >
                <div className={`p-3 rounded-xl ${channel.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${channel.color}`} />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-gray-900">{channel.name}</h5>
                  <p className="text-xs text-gray-500">{channel.description}</p>
                </div>
                <div className="text-xs font-medium px-2 py-1 bg-gray-50 text-gray-400 rounded-md">
                    זמין
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}