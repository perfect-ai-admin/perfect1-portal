import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import { entities, invokeFunction } from '@/api/supabaseClient';

export default function MentorChat({ clientData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
        const history = await entities.MentorMessage.filter({}, '-created_date', 20);
        if (history.length > 0) {
            setMessages(history.reverse());
        } else {
            // Initial greeting
            setMessages([{
                role: 'assistant',
                content: `שלום ${clientData.name || 'חבר'}! 👋\n\nאני המנטור העסקי החכם שלך. אני לומד את העסק שלך תוך כדי שיחה.\n\nספר לי - מה מטריד אותך כרגע? עומס? חוסר פוקוס? או שאולי בא לך לחגוג הצלחה?`
            }]);
        }
    } catch (error) {
        console.error("Failed to load history", error);
    }
  };

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
        // Call the smart backend function
        const response = await invokeFunction('mentorChat', {
            user_id: clientData?.id || '',
            message: userMessage,
            clientData: clientData
        });

        const reply = response.reply;

        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

        // Trigger a refresh of the dashboard/focus if a suggestion was made
        // In a real app we might use a context or event emitter, here we rely on the user navigating or refresh intervals
        if (response.suggested_focus) {
            // Optional: Show a toast or small indicator that the plan was updated
            console.log("Plan updated by mentor!");
        }

    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'מצטער, נתקלתי בבעיה בחיבור למח. נסה שוב רגע.' 
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">המנטור האישי</h3>
                    <p className="text-xs text-gray-500">לומד ומתעדכן בזמן אמת</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={loadHistory} title="רענן שיחה">
                <RefreshCw className="w-4 h-4 text-gray-400" />
            </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
                {messages.map((message, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                                message.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white border border-gray-100 text-gray-900 rounded-bl-none'
                            }`}
                        >
                            <ReactMarkdown className={`text-sm leading-relaxed prose max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}>
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                        <span className="text-xs text-gray-500">מנתח את המצב...</span>
                    </div>
                </motion.div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
            <div className="flex gap-2 items-end bg-gray-50 p-2 rounded-xl border focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="כתוב הודעה..."
                    className="flex-1 resize-none bg-transparent border-none focus-visible:ring-0 shadow-none min-h-[44px] max-h-32 py-3 text-sm"
                    rows={1}
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
                    className="bg-indigo-600 hover:bg-indigo-700 h-10 w-10 p-0 rounded-lg mb-1 shadow-sm"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
                המערכת מנתחת את השיחה כדי לעדכן את תוכנית העבודה שלך
            </p>
        </div>
    </div>
  );
}