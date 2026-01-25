import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

/**
 * צ'אט המנטור למטרה הראשונה
 * מממש את הפלואו המלא עם השהיות ועצירות
 */
export default function FirstGoalMentorChat({ goal, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState('intro');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const messagesEndRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // התחלת הפלואו
    startFlow();
  }, []);

  const startFlow = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('firstGoalMentorFlow', {
        action: 'start_flow',
        goal_id: goal.id
      });

      if (response.data.success) {
        // שלח הודעת וואצאפ עם ההודעה הראשונה
        const firstMessage = response.data.messages[0];
        if (firstMessage) {
          try {
            await base44.functions.invoke('smartMentorEngine', {
              action: 'send_whatsapp',
              content: firstMessage.content,
              goal_id: goal.id
            });
          } catch (whatsappErr) {
            console.warn('Failed to send WhatsApp message:', whatsappErr);
          }
        }

        // הצגת ההודעות עם השהיות
        for (const msg of response.data.messages) {
          await displayMessageWithDelay(msg);
        }
        
        setCurrentStage(response.data.next_stage);
        if (response.data.messages.some(m => m.requires_response)) {
          setWaitingForResponse(true);
          startTimeRef.current = new Date();
        }
      }
    } catch (error) {
      console.error('Failed to start flow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayMessageWithDelay = async (msg) => {
    return new Promise(async (resolve) => {
      // הצגת ההודעה
      setMessages(prev => [...prev, {
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }]);

      // אם יש השהיה - להמתין
      if (msg.delay_after) {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, msg.delay_after));
        setIsLoading(false);
      }

      resolve();
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !waitingForResponse) return;

    const userMessage = input.trim();
    setInput('');
    setWaitingForResponse(false);

    // הוספת הודעת המשתמש
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    setIsLoading(true);

    try {
      const response = await base44.functions.invoke('firstGoalMentorFlow', {
        action: 'handle_response',
        goal_id: goal.id,
        user_response: userMessage,
        stage: currentStage
      });

      if (response.data.success) {
        // הצגת תגובת המנטור עם השהיות
        for (const msg of response.data.messages) {
          await displayMessageWithDelay(msg);
        }

        setCurrentStage(response.data.next_stage);
        
        // בדיקה אם צריך תגובה נוספת
        const needsResponse = response.data.messages.some(m => m.requires_response);
        if (needsResponse) {
          setWaitingForResponse(true);
          startTimeRef.current = new Date();
        } else if (response.data.next_stage === 'completed') {
          // סיום הפלואו
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Failed to handle response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'מצטער, נתקלתי בבעיה. בוא ננסה שוב.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-900">המנטור האישי שלך</h3>
            <p className="text-sm text-gray-500">מלווה אותך במטרה: {goal.title}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                }`}
              >
                <ReactMarkdown 
                  className={`text-sm leading-relaxed prose max-w-none whitespace-pre-wrap ${
                    message.role === 'user' ? 'prose-invert' : ''
                  }`}
                >
                  {message.content}
                </ReactMarkdown>
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
            <div className="bg-gray-100 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-sm">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-sm text-gray-600">המנטור חושב...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {waitingForResponse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white border-t border-gray-100"
        >
          <div className="flex gap-3 items-end bg-gray-50 p-3 rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 transition-all">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="כתוב את התשובה שלך..."
              className="flex-1 resize-none bg-transparent border-none focus-visible:ring-0 shadow-none min-h-[60px] max-h-40 py-3 text-sm"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 h-12 w-12 p-0 rounded-xl shadow-md disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-center text-gray-400 mt-3">
            המנטור מחכה לתשובה שלך • קח את הזמן שאתה צריך
          </p>
        </motion.div>
      )}

      {!waitingForResponse && !isLoading && currentStage !== 'completed' && (
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">המנטור ממתין...</p>
        </div>
      )}
    </div>
  );
}