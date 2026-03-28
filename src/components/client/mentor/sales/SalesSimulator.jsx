import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, StopCircle, RotateCcw, Bot, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { invokeLLM } from '@/api/supabaseClient';

const SCENARIOS = [
  { id: 'cold_call', title: 'שיחה קרה', description: 'נסה לקבוע פגישה עם לקוח שלא מכיר אותך', difficulty: 'hard' },
  { id: 'price_objection', title: 'התנגדות מחיר', description: 'הלקוח אומר "זה יקר לי"', difficulty: 'medium' },
  { id: 'closing', title: 'סגירת עסקה', description: 'הלקוח מתלבט, תן לו את הדחיפה האחרונה', difficulty: 'easy' }
];

export default function SalesSimulator() {
  const [activeScenario, setActiveScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false); // Mock recording
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const messagesEndRef = useRef(null);

  const startScenario = (scenario) => {
    setActiveScenario(scenario);
    setMessages([
      { role: 'system', content: `התחלת סימולציה: ${scenario.title}. המנטור משחק את הלקוח. בהצלחה!` },
      { role: 'assistant', content: getOpeningLine(scenario.id) }
    ]);
    setFeedback(null);
  };

  const getOpeningLine = (id) => {
    switch(id) {
      case 'cold_call': return "הלו? מי זה?";
      case 'price_objection': return "שמע, ההצעה נראית טוב, אבל המחיר... זה פשוט יקר לי מדי כרגע.";
      case 'closing': return "אני לא יודע... אני צריך לחשוב על זה עוד קצת.";
      default: return "שלום, איך אפשר לעזור?";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI response + quick feedback
      const prompt = `
        אתה משחק תפקיד של לקוח בסימולציית מכירות.
        הסיטואציה: ${activeScenario.title} (${activeScenario.description}).
        
        המשתמש הוא איש המכירות.
        התגובה האחרונה של המשתמש: "${input}"
        
        תפקידך:
        1. להגיב כמו לקוח ישראלי טיפוסי (קצת חשדן אבל פתוח אם יש ערך).
        2. אם המשתמש ענה טוב, תתקדם לקראת סגירה.
        3. אם המשתמש ענה רע, תקשה עליו.
        
        תחזיר רק את התגובה שלך כלקוח.
      `;

      const response = await invokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const endSimulation = async () => {
    setIsLoading(true);
    // Generate feedback
    try {
        const conversation = messages.filter(m => m.role !== 'system').map(m => `${m.role === 'user' ? 'אני' : 'לקוח'}: ${m.content}`).join('\n');
        const prompt = `
            נתח את שיחת המכירה הזו ותן משוב קצר ובונה.
            
            השיחה:
            ${conversation}
            
            תן ציון מ-1 עד 100, ו3 נקודות לשימור ו3 לשיפור.
            תבנית JSON:
            {
                "score": number,
                "good_points": ["point 1", "point 2", "point 3"],
                "improvements": ["point 1", "point 2", "point 3"],
                "summary": "string"
            }
        `;
        
        const res = await invokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    score: { type: "number" },
                    good_points: { type: "array", items: { type: "string" } },
                    improvements: { type: "array", items: { type: "string" } },
                    summary: { type: "string" }
                }
            }
        });
        
        setFeedback(res);
    } catch(e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeScenario) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {SCENARIOS.map(scenario => (
          <motion.div 
            key={scenario.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
            onClick={() => startScenario(scenario)}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                scenario.difficulty === 'hard' ? 'bg-red-100 text-red-600' :
                scenario.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
            }`}>
                <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{scenario.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{scenario.description}</p>
            <Badge variant="outline">רמת קושי: {
                scenario.difficulty === 'hard' ? 'קשה' :
                scenario.difficulty === 'medium' ? 'בינוני' : 'קל'
            }</Badge>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h3 className="font-bold text-gray-900">{activeScenario.title}</h3>
          <p className="text-xs text-gray-500">אתה מדבר עם הלקוח (AI)</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setActiveScenario(null)}>
            <RotateCcw className="w-4 h-4 ml-2" />
            יציאה
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
          >
            {msg.role === 'system' ? (
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msg.content}</span>
            ) : (
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                    <p className="text-sm">{msg.content}</p>
                </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {feedback && (
            <motion.div 
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                className="absolute inset-0 bg-white z-20 overflow-y-auto"
            >
                <div className="p-8 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">הציון שלך: {feedback.score}</h2>
                        <p className="text-gray-600">{feedback.summary}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                            <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                                <span className="text-xl">👍</span> לשימור
                            </h3>
                            <ul className="space-y-2">
                                {feedback.good_points?.map((p, i) => (
                                    <li key={i} className="text-sm text-green-900 flex gap-2">
                                        <span className="text-green-500">•</span> {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                            <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                                <span className="text-xl">💪</span> לשיפור
                            </h3>
                            <ul className="space-y-2">
                                {feedback.improvements?.map((p, i) => (
                                    <li key={i} className="text-sm text-orange-900 flex gap-2">
                                        <span className="text-orange-500">•</span> {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Button onClick={() => setActiveScenario(null)} size="lg">
                            תרגל שוב
                        </Button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      {!feedback && (
        <div className="p-4 bg-white border-t border-gray-100">
            {messages.length > 2 && (
                <div className="flex justify-center mb-2">
                    <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-red-500" onClick={endSimulation}>
                        <StopCircle className="w-4 h-4 mr-1" />
                        סיים סימולציה וקבל משוב
                    </Button>
                </div>
            )}
            <div className="flex gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="הקלד את התשובה שלך..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
            />
            <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                className="rounded-xl w-12 h-12 p-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700"
            >
                <Send className="w-5 h-5" />
            </Button>
            </div>
        </div>
      )}
    </div>
  );
}