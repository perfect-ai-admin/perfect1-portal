import { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || Deno.env.get('N8N_WEBHOOK_URL');

export function useGoalMentor(userPhone, userEmail, userName) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [goalState, setGoalState] = useState(null);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState([]);

  // Load conversation history
  const loadConversation = useCallback(async (customerGoalId) => {
    try {
      // In a real app, fetch from Supabase
      // const { data } = await supabase
      //   .from('goal_interactions')
      //   .select('*')
      //   .eq('customer_goal_id', customerGoalId);
      // setConversation(data || []);
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  }, []);

  // Send to webhook
  const sendToWebhook = useCallback(async (payload) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || 'Unknown error');
        return null;
      }

      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('הבקשה לקחה יותר מדי זמן');
      } else if (!navigator.onLine) {
        setError('בעיית חיבור, בדוק את האינטרנט');
      } else {
        setError(err.message || 'שגיאה לא צפויה');
      }
      return null;
    }
  }, []);

  // Handle response from webhook
  const handleResponse = useCallback((data) => {
    if (data.response?.text) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: data.response.text 
      }]);
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        text: data.response.text 
      }]);
    }

    if (data.goal_update) {
      setGoalState(prev => ({
        ...prev,
        ...data.goal_update,
        status: data.goal_update.status
      }));
    }

    if (data.ui_hints?.show_quick_replies && data.ui_hints?.quick_replies) {
      setQuickReplies(data.ui_hints.quick_replies);
    } else {
      setQuickReplies([]);
    }

    setError(null);
  }, []);

  // Start a goal
  const startGoal = useCallback(async (goalCode) => {
    setIsLoading(true);
    setMessages([]);
    setQuickReplies([]);
    setError(null);
    
    setGoalState({
      goal_code: goalCode,
      current_step: 1,
      progress_percent: 0,
      status: 'intro'
    });

    const payload = {
      source: 'webapp',
      event_type: 'goal_start',
      customer: { phone: userPhone, name: userName, email: userEmail },
      message: { text: '', type: 'button_click' },
      context: {
        current_stage: 'goal_mentor',
        current_goal_code: goalCode,
        current_goal_step: 1
      }
    };

    const response = await sendToWebhook(payload);
    
    if (response) {
      handleResponse(response);
    }
    
    setIsLoading(false);
  }, [userPhone, userName, userEmail, sendToWebhook, handleResponse]);

  // Send message
  const sendMessage = useCallback(async (text, goalCode, currentStep) => {
    if (!text.trim() || !goalCode) return;

    // Optimistic update
    setMessages(prev => [...prev, { role: 'user', text }]);
    setConversation(prev => [...prev, { role: 'user', text }]);
    setQuickReplies([]);
    setIsLoading(true);
    setError(null);

    const payload = {
      source: 'webapp',
      event_type: 'user_interaction',
      customer: { phone: userPhone, email: userEmail },
      message: { text, type: 'text' },
      context: {
        current_stage: 'goal_mentor',
        current_goal_code: goalCode,
        current_goal_step: currentStep || 1,
        goal_progress_percent: goalState?.progress_percent || 0
      }
    };

    const response = await sendToWebhook(payload);
    
    if (response) {
      handleResponse(response);
    } else {
      // Rollback on error
      setMessages(prev => prev.slice(0, -1));
      setConversation(prev => prev.slice(0, -1));
    }
    
    setIsLoading(false);
  }, [userPhone, userEmail, goalState, sendToWebhook, handleResponse]);

  // Send quick reply
  const sendQuickReply = useCallback((reply) => {
    sendMessage(reply.text, goalState?.goal_code, goalState?.current_step);
  }, [goalState, sendMessage]);

  return {
    messages,
    conversation,
    isLoading,
    quickReplies,
    goalState,
    error,
    startGoal,
    sendMessage,
    sendQuickReply,
    loadConversation,
    setError
  };
}