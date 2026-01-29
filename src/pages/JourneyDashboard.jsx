import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Target, Zap, Flame } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import JourneyProgress from '@/components/client/journey/JourneyProgress';
import CurrentGoalCard from '@/components/client/journey/CurrentGoalCard';
import StatCard from '@/components/client/journey/StatCard';

export default function JourneyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          navigate('/');
          return;
        }
        setUser(currentUser);
      } catch (err) {
        console.error('Auth error:', err);
        navigate('/');
      }
    };
    loadUser();
  }, [navigate]);

  // Fetch journey state
  const { data: journeyState, isLoading: journeyLoading } = useQuery({
    queryKey: ['journeyState', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // In production, fetch from Supabase
      // For now, return mock data
      return {
        journey_progress_percent: 14,
        total_goals_completed: 1,
        total_goals_assigned: 7,
        total_points: 100,
        streak_days: 3,
        current_goal_id: 'idea_development'
      };
    },
    enabled: !!user?.id
  });

  // Fetch goals
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['customerGoals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // In production, fetch from Supabase with proper join
      // Mock data structure:
      return [
        {
          id: '1',
          status: 'completed',
          progress_percent: 100,
          current_step: 5,
          goals: {
            id: 'goal_1',
            goal_code: 'business_status',
            goal_name_he: 'תמונת מצב העסק שלך',
            description_he: 'תיאור המטרה',
            sort_order: 1,
            points_value: 100
          }
        },
        {
          id: '2',
          status: 'in_progress',
          progress_percent: 25,
          current_step: 2,
          goals: {
            id: 'goal_2',
            goal_code: 'idea_development',
            goal_name_he: 'גיבוש הרעיון',
            description_he: 'השתמש במנטור AI שלנו כדי להבהיר את הרעיון שלך',
            sort_order: 2,
            points_value: 100
          }
        },
        {
          id: '3',
          status: 'not_started',
          progress_percent: 0,
          current_step: 1,
          goals: {
            id: 'goal_3',
            goal_code: 'first_customer',
            goal_name_he: 'גיוס לקוח ראשון',
            description_he: 'תיאור המטרה',
            sort_order: 3,
            points_value: 100
          }
        },
        {
          id: '4',
          status: 'not_started',
          progress_percent: 0,
          current_step: 1,
          goals: {
            id: 'goal_4',
            goal_code: 'open_business',
            goal_name_he: 'פתיחת עוסק פטור',
            description_he: 'תיאור המטרה',
            sort_order: 4,
            points_value: 100
          }
        },
        {
          id: '5',
          status: 'not_started',
          progress_percent: 0,
          current_step: 1,
          goals: {
            id: 'goal_5',
            goal_code: 'product_portfolio',
            goal_name_he: 'יצירת תיק מוצרים',
            description_he: 'תיאור המטרה',
            sort_order: 5,
            points_value: 100
          }
        },
        {
          id: '6',
          status: 'not_started',
          progress_percent: 0,
          current_step: 1,
          goals: {
            id: 'goal_6',
            goal_code: 'marketing_campaign',
            goal_name_he: 'הקמת קמפיין שיווקי',
            description_he: 'תיאור המטרה',
            sort_order: 6,
            points_value: 100
          }
        },
        {
          id: '7',
          status: 'not_started',
          progress_percent: 0,
          current_step: 1,
          goals: {
            id: 'goal_7',
            goal_code: 'weekly_target',
            goal_name_he: 'קביעת יעד שבועי',
            description_he: 'תיאור המטרה',
            sort_order: 7,
            points_value: 100
          }
        }
      ];
    },
    enabled: !!user?.id
  });

  const isLoading = journeyLoading || goalsLoading;
  const currentGoal = goals.find(g => g.status === 'in_progress');

  const handleStartGoal = () => {
    if (currentGoal) {
      navigate(`/goal/${currentGoal.goals.goal_code}`);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>דאשבורד | המסע שלך</title>
        <meta name="description" content="עקוב אחר התקדמותך בדרך להקמת העסק שלך" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              דאשבורד
            </h1>
            <p className="text-gray-600">
              שלום {user.full_name}, ברוכים הבאים חזרה! 👋
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="מטרות פעילות"
              value={journeyState?.total_goals_assigned - journeyState?.total_goals_completed || 0}
              icon={Target}
              color="blue"
            />
            <StatCard
              label="נקודות"
              value={journeyState?.total_points || 0}
              icon={Zap}
              color="amber"
            />
            <StatCard
              label="רצף ימים"
              value={journeyState?.streak_days || 0}
              icon={Flame}
              color="green"
            />
          </div>

          {/* Current Goal Recommendation */}
          {!isLoading && currentGoal && (
            <CurrentGoalCard goal={currentGoal} onStart={handleStartGoal} />
          )}

          {/* Journey Progress */}
          {!isLoading && (
            <JourneyProgress
              progress={journeyState?.journey_progress_percent || 0}
              completed={journeyState?.total_goals_completed || 0}
              total={journeyState?.total_goals_assigned || 0}
              goals={goals}
            />
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">טוען את המסע שלך...</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}