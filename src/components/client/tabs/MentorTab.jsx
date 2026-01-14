import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MentorChat from '../mentor/MentorChat';
import ConversationHistory from '../mentor/ConversationHistory';
import ActionItems from '../mentor/ActionItems';
import ResourceLibrary from '../mentor/ResourceLibrary';
import SalesScripts from '../mentor/SalesScripts';
import DailyOperations from '../mentor/DailyOperations';
import { Lightbulb, Database, Lock, Sparkles, MessageSquare, CheckSquare, BookOpen, Zap, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MentorTab({ data }) {
  const [actionItems, setActionItems] = useState([
    { id: '1', title: 'צור חשבונית ראשונה', description: 'התחל לעבוד עם לקוחות', relatedTab: 'ניהול כספים', completed: false },
    { id: '2', title: 'הגדר מטרה חודשית', description: 'קבע יעד הכנסה', relatedTab: 'המטרות שלי', completed: false }
  ]);

  const mockConversations = [
    {
      id: '1',
      title: 'האם עכשיו זמן טוב להשקיע בשיווק?',
      preview: 'שאלה על תזמון השקעה שיווקית...',
      timestamp: new Date().toISOString()
    }
  ];

  const handleToggleAction = (itemId) => {
    setActionItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">המנטור החכם שלך 🤖</h1>
            <p className="text-xl opacity-90 mb-4">
              קבל עצות עסקיות מותאמות אישית, מבוססות על הנתונים שלך
            </p>
            <div className="flex items-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>גישה לכל הנתונים שלך</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>פרטיות מלאה</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>עצות מותאמות אישית</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Panel */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <Database className="w-5 h-5" />
          המידע שהמנטור רואה עליך
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-blue-700 font-semibold mb-1">נתונים כספיים</p>
            <p className="text-gray-700">הכנסות, הוצאות, חשבוניות</p>
          </div>
          <div>
            <p className="text-blue-700 font-semibold mb-1">מטרות אישיות</p>
            <p className="text-gray-700">היעדים וההתקדמות שלך</p>
          </div>
          <div>
            <p className="text-blue-700 font-semibold mb-1">היסטוריה עסקית</p>
            <p className="text-gray-700">שלבים שעברת, החלטות שקיבלת</p>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 ml-2" />
            שיחה
          </TabsTrigger>
          <TabsTrigger value="sales">
            <Zap className="w-4 h-4 ml-2" />
            מכירות
          </TabsTrigger>
          <TabsTrigger value="operations">
            <Calendar className="w-4 h-4 ml-2" />
            יום יום
          </TabsTrigger>
          <TabsTrigger value="history" className="hidden lg:flex">היסטוריה</TabsTrigger>
          <TabsTrigger value="actions" className="hidden lg:flex">
            <CheckSquare className="w-4 h-4 ml-2" />
            פעולות
          </TabsTrigger>
          <TabsTrigger value="resources" className="hidden lg:flex">
            <BookOpen className="w-4 h-4 ml-2" />
            משאבים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <div className="h-[600px]">
            <MentorChat clientData={data} />
          </div>
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">תסרטי מכירות - שפר את הערוצים שלך 📞</h3>
            <SalesScripts />
          </div>
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">סדר יום יעיל 📅</h3>
            <DailyOperations />
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">שיחות קודמות</h3>
            <ConversationHistory 
              conversations={mockConversations}
              onSelect={(conv) => console.log('Selected:', conv)}
              onDelete={(id) => console.log('Delete:', id)}
            />
          </div>
        </TabsContent>

        <TabsContent value="actions" className="mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">פעולות שהמנטור המליץ</h3>
            <ActionItems 
              items={actionItems}
              onToggle={handleToggleAction}
              onNavigate={(tab) => console.log('Navigate to:', tab)}
            />
          </div>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">ספריית משאבים</h3>
            <ResourceLibrary />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}