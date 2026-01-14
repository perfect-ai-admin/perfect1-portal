import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Palette, TrendingUp, Users, BookOpen, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MarketingTab({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
        <Megaphone className="w-16 h-16 mb-4" />
        <h1 className="text-4xl font-bold mb-3">לגדל את העסק 📈</h1>
        <p className="text-xl opacity-90">
          כלים ואסטרטגיות שיווק נגישים - גם ללא תקציב גדול
        </p>
      </div>

      {/* Marketing Readiness Check */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">האם אתה מוכן לשיווק?</h2>
        <div className="space-y-3 mb-6">
          <ReadinessItem label="בסיס לקוחות קיים" status="yes" />
          <ReadinessItem label="הכנסה חודשית יציבה" status="yes" />
          <ReadinessItem label="תקציב זמין לשיווק" status="partial" />
          <ReadinessItem label="זמן להשקיע בשיווק" status="no" />
        </div>
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-900">
            <strong>המלצה:</strong> אתה כמעט מוכן! התמקד קודם בבניית תקציב קטן ובהקצאת זמן קבוע לשיווק.
          </p>
        </div>
      </div>

      {/* Marketing Tools Tabs */}
      <Tabs defaultValue="brand" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="brand">
            <Palette className="w-4 h-4 ml-2" />
            מיתוג
          </TabsTrigger>
          <TabsTrigger value="gbp">
            <Users className="w-4 h-4 ml-2" />
            Google Business
          </TabsTrigger>
          <TabsTrigger value="roi">
            <TrendingUp className="w-4 h-4 ml-2" />
            ROI
          </TabsTrigger>
          <TabsTrigger value="education">
            <BookOpen className="w-4 h-4 ml-2" />
            לימוד
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">סטודיו למיתוג</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <ToolCard
                title="יצירת לוגו"
                description="צור לוגו מקצועי עם AI תוך דקות"
                icon={<Palette className="w-8 h-8" />}
                color="from-purple-500 to-purple-600"
              />
              <ToolCard
                title="פלטת צבעים"
                description="בחר צבעים שמתאימים לעסק שלך"
                icon={<Palette className="w-8 h-8" />}
                color="from-pink-500 to-pink-600"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gbp">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Users className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Google Business Profile</h3>
            <p className="text-gray-600 mb-6">נהל את הנוכחות שלך ב-Google Maps ובתוצאות חיפוש</p>
            <Button size="lg">התחבר ל-Google Business</Button>
          </div>
        </TabsContent>

        <TabsContent value="roi">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">ייעוץ השקעות שיווקיות</h3>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
              <Lightbulb className="w-8 h-8 text-green-600 mb-3" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">המלצה מותאמת אישית</h4>
              <p className="text-gray-700 leading-relaxed">
                בשלב הנוכחי שלך, עדיף להשקיע בשיווק אורגני (תוכן, רשתות חברתיות) לפני שמשקיעים בפרסום בתשלום.
                כשתגיע להכנסה של ₪20,000 בחודש, אפשר לשקול השקעה של 5-10% בפרסום.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="education">
          <div className="grid md:grid-cols-2 gap-6">
            <EducationCard
              title="שיווק לעצמאים 101"
              description="המדריך המלא לשיווק עסק קטן"
              duration="15 דקות"
            />
            <EducationCard
              title="רשתות חברתיות ביעילות"
              description="איך לנהל רשתות בלי לבזבז זמן"
              duration="10 דקות"
            />
            <EducationCard
              title="המלצות שמביאות לקוחות"
              description="איך לבקש המלצות ולהשתמש בהן"
              duration="8 דקות"
            />
            <EducationCard
              title="מדידת ROI"
              description="איך לדעת אם השיווק שלך עובד"
              duration="12 דקות"
            />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function ReadinessItem({ label, status }) {
  const icons = {
    yes: '✓',
    no: '✗',
    partial: '~'
  };
  const colors = {
    yes: 'text-green-600 bg-green-50',
    no: 'text-red-600 bg-red-50',
    partial: 'text-yellow-600 bg-yellow-50'
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <span className="text-gray-700">{label}</span>
      <span className={`px-3 py-1 rounded-full font-semibold ${colors[status]}`}>
        {icons[status]}
      </span>
    </div>
  );
}

function ToolCard({ title, description, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer">
      <div className={`bg-gradient-to-r ${color} p-6 text-white`}>
        {icon}
        <h3 className="text-xl font-bold mt-3">{title}</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">{description}</p>
        <Button className="w-full">התחל</Button>
      </div>
    </div>
  );
}

function EducationCard({ title, description, duration }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer">
      <BookOpen className="w-10 h-10 text-blue-600 mb-3" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">⏱️ {duration}</span>
        <Button variant="ghost" size="sm">קרא עכשיו</Button>
      </div>
    </div>
  );
}