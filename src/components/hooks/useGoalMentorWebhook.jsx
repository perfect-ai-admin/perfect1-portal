import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * React hook for triggering goal mentor interactions via webhook
 * Based on Perfect-1.one Webhook API v1.0
 */
export function useGoalMentorWebhook(userPhone, userEmail, userName) {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [goalState, setGoalState] = useState(null);

  const sendWebhookEvent = useCallback(
    async (eventPayload) => {
      setLoading(true);
      try {
        const response = await base44.functions.invoke('webhookGoalMentor', eventPayload);

        if (response.data.success) {
          // Add assistant response to conversation
          if (response.data.response?.text) {
            setConversation(prev => [
              ...prev,
              {
                role: 'assistant',
                text: response.data.response.text,
                timestamp: new Date()
              }
            ]);
          }

          // Update goal state if provided
          if (response.data.goal_update) {
            setGoalState(response.data.goal_update);
          }

          return response.data;
        } else {
          toast.error('שגיאה בתקשורת עם המנטור');
          console.error('Webhook error:', response.data.error);
          return null;
        }
      } catch (error) {
        console.error('Webhook invoke error:', error);
        toast.error('שגיאה בחיבור לשרת');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Send user message
  const sendMessage = useCallback(
    async (text, goalCode, goalStep = 1) => {
      if (!text.trim()) return;

      // Add user message to conversation
      setConversation(prev => [
        ...prev,
        {
          role: 'user',
          text,
          timestamp: new Date()
        }
      ]);

      return sendWebhookEvent({
        source: 'webapp',
        event_type: 'user_interaction',
        customer: {
          phone: userPhone,
          email: userEmail,
          name: userName
        },
        message: {
          text,
          type: 'text'
        },
        context: {
          current_stage: 'goal_mentor',
          current_goal_code: goalCode,
          current_goal_step: goalStep
        }
      });
    },
    [userPhone, userEmail, userName, sendWebhookEvent]
  );

  // Start a goal
  const startGoal = useCallback(
    async (goalCode) => {
      return sendWebhookEvent({
        source: 'webapp',
        event_type: 'goal_start',
        customer: {
          phone: userPhone,
          email: userEmail,
          name: userName
        },
        message: {
          text: '',
          type: 'button_click',
          payload: { action: 'start_goal' }
        },
        context: {
          current_stage: 'goal_mentor',
          current_goal_code: goalCode,
          current_goal_step: 1
        }
      });
    },
    [userPhone, userEmail, userName, sendWebhookEvent]
  );

  // Complete a goal
  const completeGoal = useCallback(
    async (goalCode) => {
      return sendWebhookEvent({
        source: 'webapp',
        event_type: 'goal_complete',
        customer: {
          phone: userPhone,
          email: userEmail,
          name: userName
        },
        message: {
          text: '',
          type: 'system'
        },
        context: {
          current_stage: 'goal_mentor',
          current_goal_code: goalCode,
          goal_progress_percent: 100
        }
      });
    },
    [userPhone, userEmail, userName, sendWebhookEvent]
  );

  // Send reminder
  const sendReminder = useCallback(
    async (reminderType, goalCode, daysInactive = 1) => {
      return sendWebhookEvent({
        source: 'scheduler',
        event_type: 'reminder',
        customer: {
          phone: userPhone,
          email: userEmail,
          name: userName
        },
        message: {
          text: '',
          type: 'system'
        },
        context: {
          current_stage: 'goal_mentor',
          current_goal_code: goalCode,
          reminder_type: reminderType,
          days_inactive: daysInactive
        }
      });
    },
    [userPhone, userEmail, userName, sendWebhookEvent]
  );

  const clearConversation = useCallback(() => {
    setConversation([]);
  }, []);

  return {
    loading,
    conversation,
    goalState,
    sendMessage,
    startGoal,
    completeGoal,
    sendReminder,
    clearConversation
  };
}