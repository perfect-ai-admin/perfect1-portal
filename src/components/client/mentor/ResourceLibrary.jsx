import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Video, FileText, Download, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const RESOURCES = [
  {
    id: '1',
    type: 'article',
    title: 'איך לדעת אם אתה רווחי',
    description: 'הסבר פשוט וברור על חישוב רווחיות אמיתית',
    category: 'financial',
    duration: '4 דקות',
    difficulty: 'קל'
  },
  {
    id: '2',
    type: 'video',
    title: 'ניהול נכון של הוצאות',
    description: 'מה מותר לנכות ומה אסור - מדריך מלא',
    category: 'tax',
    duration: '8 דקות',
    difficulty: 'בינוני'
  },
  {
    id: '3',
    type: 'template',
    title: 'תבנית מעקב הוצאות',
    description: 'אקסל מוכן לשימוש לניהול הוצאות',
    category: 'tools',
    duration: 'הורדה מיידית',
    difficulty: 'קל'
  },
  {
    id: '4',
    type: 'article',
    title: 'תכנון מס חכם',
    description: 'איך לחסוך במס באופן חוקי',
    category: 'tax',
    duration: '6 דקות',
    difficulty: 'בינוני'
  }
];

export default function ResourceLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredResources = RESOURCES.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="חפש במשאבים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 ml-2" />
          סינון
        </Button>
      </div>

      {/* Tabs by Type */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">הכל</TabsTrigger>
          <TabsTrigger value="article">מאמרים</TabsTrigger>
          <TabsTrigger value="video">סרטונים</TabsTrigger>
          <TabsTrigger value="template">תבניות</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </TabsContent>
        
        {['article', 'video', 'template'].map(type => (
          <TabsContent key={type} value={type} className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {filteredResources.filter(r => r.type === type).map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ResourceCard({ resource }) {
  const getIcon = () => {
    switch(resource.type) {
      case 'video': return <Video className="w-6 h-6" />;
      case 'template': return <Download className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const getColor = () => {
    switch(resource.type) {
      case 'video': return 'from-red-500 to-red-600';
      case 'template': return 'from-green-500 to-green-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
    >
      <div className={`bg-gradient-to-r ${getColor()} p-4 text-white`}>
        <div className="flex items-center gap-3">
          {getIcon()}
          <div className="flex-1">
            <h3 className="font-bold text-lg line-clamp-1">{resource.title}</h3>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>⏱️ {resource.duration}</span>
          <span className="px-2 py-1 bg-gray-100 rounded">{resource.difficulty}</span>
        </div>
      </div>
    </motion.div>
  );
}