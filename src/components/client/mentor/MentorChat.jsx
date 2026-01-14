import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import ContextPanel from './ContextPanel';
import ReactMarkdown from 'react-markdown';

export default function MentorChat({ clientData }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `שלום ${clientData.name}! 👋\n\nאני המנטור העסקי החכם שלך. אני כאן כדי לעזור לך לקבל החלטות נכונות בעסק, לענות על שאלות, ולתת לך עצות מבוססות נתונים.\n\nאני מכיר את כל המידע העסקי שלך - ההכנסות, ההוצאות, המטרות שלך, ועוד. תרגיש חופשי לשאול אותי כל דבר! 💡`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    'האם עכשיו זמן טוב להשקיע בשיווק?',
    'איך אני יכול להגדיל את הרווחיות?',
    'מה ההוצאות שכדאי לי לעקוב אחריהן?',
    'איך אני יכול לחסוך במס באופן חוקי?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה מנטור עסקי חכם ותומך. אתה מדבר עברית, בצורה חמה ומעודדת.
        
הנה המידע על העסק של ${clientData.name}:
- שם: ${clientData.name}
- טלפון: ${clientData.phone}
- מקצוע: ${clientData.profession || 'לא צוין'}
- קטגוריה: ${clientData.category || 'לא צוין'}
- סטטוס: ${clientData.status}
- הערות: ${clientData.notes || 'אין'}

השאלה של הלקוח:
${userMessage}

תן תשובה ממוקדת, מעשית ומעודדת. השתמש במידע שיש לך על הלקוח. אם אתה לא בטוח במשהו, הצע לפנות למומחה (רואה חשבון או עורך דין).`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'מצטער, נתקלתי בבעיה. אנא נסה שוב או פנה לתמיכה.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="space-y-4">
      {/* Context Panel */}
      <ContextPanel clientData={clientData} />
      
      <div className="flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: '600px' }}>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.role === 'assistant' && (
                  <Sparkles className="w-5 h-5 text-blue-600 mb-2" />
                )}
                {message.role === 'user' ? (
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <ReactMarkdown className="text-base leading-relaxed prose prose-sm max-w-none">
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-2xl px-6 py-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-gray-600">חושב...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-6 pb-4">
          <p className="text-sm text-gray-600 mb-3">שאלות מוצעות:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedQuestion(q)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="שאל אותי כל דבר על העסק שלך..."
            className="flex-1 resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 h-auto"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}