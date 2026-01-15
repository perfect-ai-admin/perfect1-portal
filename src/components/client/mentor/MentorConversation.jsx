import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Zap } from 'lucide-react';
import QuickPrompts from './QuickPrompts';
import ChatMessage from './ChatMessage';
import ReplyComposer from './ReplyComposer';

export default function MentorConversation() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'mentor',
      content: 'היי! אני כאן כדי לעזור לך. מה החושך ביותר עכשיו?',
      timestamp: new Date()
    }
  ]);
  const [openInsights, setOpenInsights] = useState(0);

  const handlePromptSelect = (prompt) => {
    // Add user message
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };
    setMessages([...messages, userMsg]);

    // Simulate mentor response
    setTimeout(() => {
      const mentorMsg = {
        id: Date.now() + 1,
        role: 'mentor',
        content: 'זה שאלה טובה. בואו נעבור על זה בשלבים.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, mentorMsg]);
    }, 500);
  };

  const handleSendMessage = (content) => {
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages([...messages, userMsg]);

    setTimeout(() => {
      const mentorMsg = {
        id: Date.now() + 1,
        role: 'mentor',
        content: 'הבנתי. בואו נפעל על זה.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, mentorMsg]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header - Mobile Optimized */}
      <div className="border-b border-gray-200 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">שיח עם המנטור</h1>
        </div>
        {openInsights > 0 && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            יש לך {openInsights} תובנות פתוחות
          </p>
        )}
      </div>

      {/* Quick Prompts - Show only if no conversation started */}
      {messages.length === 1 && (
        <div className="px-4 py-3 border-b border-gray-100">
          <QuickPrompts onSelect={handlePromptSelect} />
        </div>
      )}

      {/* Chat Area - Mobile Optimized */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <ChatMessage key={msg.id} message={msg} delay={idx * 0.1} />
        ))}
      </div>

      {/* Reply Composer - Mobile Optimized */}
      <div className="border-t border-gray-200 p-3 md:p-6 bg-white">
        <ReplyComposer onSend={handleSendMessage} />
      </div>
    </div>
  );
}