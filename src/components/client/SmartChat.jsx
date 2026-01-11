import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function SmartChat({ clientData, onUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load chat history
    if (clientData.chat_history) {
      setMessages(clientData.chat_history);
    } else {
      // Welcome message
      setMessages([{
        role: 'assistant',
        content: 'היי! אני המלווה החכם שלך 👋\n\nאני כאן כדי להכיר אותך ולבנות לך תוכנית עבודה מותאמת אישית.\n\nבוא נתחיל - ספר לי קצת על העסק שלך:',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [clientData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context from client data
      const clientContext = `
שם הלקוח: ${clientData.name}
תחום עסק: ${clientData.profession || 'לא צוין'}
סוג עסק: ${clientData.category || 'לא צוין'}
סטטוס: ${clientData.status || 'לא צוין'}
הערות קיימות: ${clientData.notes || 'אין'}
`;

      // Get chat history for context
      const recentMessages = messages.slice(-6).map(m => 
        `${m.role === 'user' ? 'לקוח' : 'מלווה'}: ${m.content}`
      ).join('\n');

      const prompt = `אתה מלווה עסקי חכם של עצמאים בישראל. 
המטרה שלך: להכיר את הלקוח, לזהות את המטרות שלו, ולבנות לו תוכנית פעולה שלב אחרי שלב.

פרטי הלקוח:
${clientContext}

היסטוריית שיחה:
${recentMessages}

הודעה אחרונה מהלקוח:
${userMessage.content}

הנחיות:
1. אם הלקוח לא ספר על המטרות שלו - שאל אותו על:
   - כמה הוא רוצה להרוויח בחודש
   - מה תחום העסק שלו
   - מה ההכנסות וההוצאות הנוכחיות שלו

2. אם יש לך מספיק מידע - תן לו צעד ראשון קונקרטי לביצוע

3. היה חם, אנושי, תומך ומעשי
4. דבר בשפה פשוטה וברורה
5. אם הוא שואל שאלה טכנית - תן תשובה מדויקת
6. אם הוא שואל על מסים/ביטוח לאומי - הסבר בפשטות

תשובתך:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);

      // Save to database
      await base44.entities.Lead.update(clientData.id, {
        chat_history: updatedMessages
      });

      // Extract insights and update client data
      await analyzeAndUpdateClient(updatedMessages, clientData);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'מצטער, הייתה בעיה. נסה שוב בבקשה 🙏',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeAndUpdateClient = async (messages, clientData) => {
    try {
      // Use AI to extract insights
      const chatText = messages.map(m => m.content).join('\n');
      
      const analysisPrompt = `נתח את השיחה הבאה וחלץ מידע מובנה:

${chatText}

החזר JSON עם המידע הבא (אם קיים בשיחה):
{
  "monthly_income_goal": מספר או null,
  "current_monthly_income": מספר או null,
  "current_monthly_expenses": מספר או null,
  "business_field": טקסט או null,
  "main_challenges": רשימת אתגרים או null,
  "next_action": הפעולה הבאה שהלקוח צריך לעשות או null
}

אם המידע לא קיים - החזר null. אל תמציא מידע.`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            monthly_income_goal: { type: ["number", "null"] },
            current_monthly_income: { type: ["number", "null"] },
            current_monthly_expenses: { type: ["number", "null"] },
            business_field: { type: ["string", "null"] },
            main_challenges: { 
              type: ["array", "null"],
              items: { type: "string" }
            },
            next_action: { type: ["string", "null"] }
          }
        }
      });

      // Update business metrics
      const businessMetrics = clientData.business_metrics || {};
      const updates = {};

      if (analysis.monthly_income_goal) {
        businessMetrics.income_goal = analysis.monthly_income_goal;
        updates.business_metrics = businessMetrics;
      }

      if (analysis.current_monthly_income) {
        businessMetrics.current_income = analysis.current_monthly_income;
        updates.business_metrics = businessMetrics;
      }

      if (analysis.current_monthly_expenses) {
        businessMetrics.current_expenses = analysis.current_monthly_expenses;
        updates.business_metrics = businessMetrics;
      }

      if (analysis.business_field && !clientData.profession) {
        updates.profession = analysis.business_field;
      }

      if (Object.keys(updates).length > 0) {
        await base44.entities.Lead.update(clientData.id, updates);
        if (onUpdate) onUpdate();
      }

    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">המלווה החכם שלך</h3>
            <p className="text-sm opacity-90">זמין תמיד, לומד אותך כל הזמן</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#E5DDD5]" style={{ 
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23E5DDD5\'/%3E%3Cpath d=\'M50 0L0 50M100 0L50 50M100 50L50 100M50 50L0 100\' stroke=\'%23D1C4BA\' stroke-width=\'0.5\' opacity=\'0.1\'/%3E%3C/svg%3E")'
      }}>
        <AnimatePresence>
          {messages.map((message, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-[#DCF8C6] text-gray-900'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-60 mt-1 text-left">
                  {new Date(message.timestamp).toLocaleTimeString('he-IL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
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
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <span className="text-sm text-gray-600">מקליד...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-100 p-4 rounded-b-2xl">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="כתוב הודעה..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-white rounded-full px-6 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-green-600 hover:bg-green-700 rounded-full w-12 h-12 p-0 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}