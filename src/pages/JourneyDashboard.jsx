import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Target, TrendingUp, Flame, RefreshCw } from 'lucide-react';
import GoalCard from '@/components/client/journey/GoalCard';
import JourneyProgress from '@/components/client/journey/JourneyProgress';
import SEOOptimized from './SEOOptimized';

export default function JourneyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [journey, setJourney] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load user and journey data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        // Fetch journey state
        const journeyData = await base44.entities.BusinessJourney.filter(
          { user_id: currentUser.email },
          '-updated_date',
          1
        );

        if (journeyData && journeyData.length > 0) {
          setJourney(journeyData[0]);
        } else {
          // Initialize journey if not exists
          const newJourney = await base44.entities.BusinessJourney.create({
            user_id: currentUser.email,
            status: 'active',
            stage: 'idea',
            journey_progress_percent: 0,
            completed_goals: []
          });
          setJourney(newJourney);
        }

        // Fetch goals with status
        const goalsData = await base44.entities.Goal.list('-display_order', 7);
        if (goalsData && goalsData.length > 0) {
          setGoals(goalsData);
        }
      } catch (err) {
        console.error('Error loading journey:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleStartGoal = (goalCode) => {
    navigate(`/goal/${goalCode}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const journeyData = await base44.entities.BusinessJourney.filter(
        { user_id: user?.email },
        '-updated_date',
        1
      );
      if (journeyData && journeyData.length > 0) {
        setJourney(journeyData[0]);
      }
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">טוען את המסע שלך...</p>
        </div>
      </div>
    );
  }

  const currentGoal = goals.find(g => 
    journey?.current_goal_code === g.goal_code
  );

  return (
    <>
      <SEOOptimized
        title="המסע שלך - מטרות עסקיות | Perfect One"
        description="עקוב אחרי התקדמותך בהשגת מטרות העסק שלך עם AI Mentor אישי"
        canonical="https://perfect1.co.il/journey"
      />

      <main className="min-h-screen bg-[#F8F9FA] py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-2">
                  🚀 המסע שלך
                </h1>
                <p className="text-gray-600 font-medium">
                  עקוב אחרי התקדמותך בהשגת מטרות העסק שלך
                </p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <StatCard
              icon={<Target className="w-6 h-6" />}
              label="מטרות פעילות"
              value={Math.max(0, (journey?.journey_progress_percent ? 7 - Math.round(7 * (journey.journey_progress_percent / 100)) : 6))}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="נקודות"
              value={(journey?.total_points || 0)}
              color="green"
            />
            <StatCard
              icon={<Flame className="w-6 h-6" />}
              label="רצף ימים"
              value={(journey?.total_streak_days || 0)}
              color="orange"
            />
          </motion.div>

          {/* Recommendation Box */}
          {currentGoal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border-2 border-[#1E3A5F]/10"
            >
              <div className="flex items-start gap-4 mb-4">
                <Sparkles className="w-8 h-8 text-[#1E3A5F] flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-[#1E3A5F] mb-2">
                    🎯 המלצה אישית עבורך
                  </h2>
                  <p className="text-gray-700 mb-4">
                    המטרה הבאה שלך היא <span className="font-bold">{currentGoal.name}</span>. זה הזמן המושלם להתחיל!
                  </p>
                  <Button
                    onClick={() => handleStartGoal(currentGoal.goal_code)}
                    className="h-12 px-6 bg-[#27AE60] hover:bg-[#229954] text-white font-bold rounded-xl"
                  >
                    התחל את המטרה הזו
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Journey Progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <JourneyProgress
              progress={journey?.journey_progress_percent || 0}
              completed={journey?.completed_goals?.length || 0}
              total={7}
              goals={goals}
            />
          </motion.div>

          {/* Goals Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6">כל המטרות שלך</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal, index) => {
                const isCurrentGoal = journey?.current_goal_code === goal.goal_code;
                const isCompleted = journey?.completed_goals?.includes(goal.goal_code);

                return (
                  <GoalCard
                    key={goal.id}
                    goal={{
                      goals: {
                        goal_name_he: goal.name,
                        description_he: goal.description,
                        points_value: goal.points_value || 100,
                        estimated_duration_days: goal.estimated_duration_days || 7
                      },
                      status: isCompleted ? 'completed' : isCurrentGoal ? 'in_progress' : 'not_started',
                      progress_percent: isCurrentGoal ? 25 : (isCompleted ? 100 : 0),
                      current_step: isCurrentGoal ? 2 : (isCompleted ? 5 : 1)
                    }}
                    isCurrentGoal={isCurrentGoal}
                    isCompleted={isCompleted}
                    onStart={() => handleStartGoal(goal.goal_code)}
                    index={index}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Motivation Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-lg text-gray-600 mb-2">
              💪 כל צעד קטן הוא צעד גדול לעבר ההצלחה שלך
            </p>
            <p className="text-sm text-gray-500">
              המנטור שלך בחכה לך כדי לעזור בכל צעד
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
}

function StatCard({ icon, label, value, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-50 to-indigo-50 border-blue-200',
    green: 'from-green-50 to-emerald-50 border-green-200',
    orange: 'from-orange-50 to-amber-50 border-orange-200'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600'
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-gradient-to-br ${colorClasses[color]} border-2 rounded-2xl p-6`}
    >
      <div className="flex items-center gap-4">
        <div className={`${iconColorClasses[color]} p-3 bg-white rounded-xl`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-black text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}