import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Trash2 } from 'lucide-react';
import { invokeLLM } from '@/api/supabaseClient';
// Extract action items from conversation using AI
export async function extractActionItems(conversationHistory) {
  try {
    const recentMessages = conversationHistory.slice(-10); // Last 10 messages
    const conversationText = recentMessages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const response = await invokeLLM({
      prompt: `נתח את השיחה הבאה וחלץ פעולות (action items) שהמשתמש צריך לבצע.
      
השיחה:
${conversationText}

החזר רשימה של פעולות בפורמט JSON:
{
  "action_items": [
    {
      "title": "כותרת הפעולה",
      "description": "תיאור קצר",
      "priority": "high/medium/low",
      "estimated_time": "זמן משוער בדקות"
    }
  ]
}

אם אין פעולות, החזר רשימה רקה.`,
      response_json_schema: {
        type: 'object',
        properties: {
          action_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                priority: { type: 'string' },
                estimated_time: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return response.action_items || [];
  } catch (error) {
    console.error('Failed to extract action items:', error);
    return [];
  }
}

export default function ActionItemsExtractor({ conversationHistory }) {
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (conversationHistory.length >= 4) {
      extractItems();
    }
  }, [conversationHistory.length]);

  const extractItems = async () => {
    setLoading(true);
    try {
      const items = await extractActionItems(conversationHistory);
      const itemsWithId = items.map((item, i) => ({
        ...item,
        id: `action_${Date.now()}_${i}`,
        completed: false
      }));
      setActionItems(prev => [...prev, ...itemsWithId]);
    } catch (error) {
      console.error('Error extracting action items:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = (id) => {
    setActionItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id) => {
    setActionItems(prev => prev.filter(item => item.id !== id));
  };

  if (actionItems.length === 0 && !loading) {
    return null;
  }

  const activeItems = actionItems.filter(item => !item.completed);
  const completedItems = actionItems.filter(item => item.completed);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">פעולות לביצוע</h3>

      {loading && (
        <div className="text-center py-4 text-gray-500">
          מחלץ פעולות מהשיחה...
        </div>
      )}

      {/* Active Items */}
      {activeItems.length > 0 && (
        <div className="space-y-3 mb-6">
          {activeItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleComplete(item.id)}
                  className="mt-1"
                >
                  <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
                </button>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.priority === 'high' ? 'bg-red-100 text-red-700' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.priority === 'high' ? 'דחוף' : item.priority === 'medium' ? 'בינוני' : 'נמוך'}
                    </span>
                    {item.estimated_time && (
                      <span className="text-xs text-gray-500">⏱ {item.estimated_time}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-900 mb-3">
            הושלמו ({completedItems.length})
          </summary>
          <div className="space-y-2">
            {completedItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 text-gray-500 line-through">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}