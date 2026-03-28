import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronRight, ArrowRight } from 'lucide-react';
import GoalMentorChat from '@/components/client/mentor/GoalMentorChat';
import { Helmet } from 'react-helmet-async';
import { entities, auth } from '@/api/supabaseClient';

export default function GoalPage() {
  const { goalCode } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await auth.me();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        // Fetch goal
        const goalsData = await entities.Goal.filter(
          { goal_code: goalCode },
          null,
          1
        );
        if (goalsData && goalsData.length > 0) {
          setGoal(goalsData[0]);

          // Update journey to set current goal
          const journeys = await entities.BusinessJourney.filter(
            { user_id: currentUser.id },
            '-updated_date',
            1
          );
          if (journeys && journeys.length > 0) {
            const j = journeys[0];
            setJourney(j);

            // Set as current goal if not already
            if (j.current_goal_code !== goalCode) {
              await entities.BusinessJourney.update(j.id, {
                current_goal_code: goalCode
              });
            }
          }
        }
      } catch (err) {
        console.error('Error loading goal:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [goalCode, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F]" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">לא נמצאה המטרה המבוקשת</p>
        <Button onClick={() => navigate('/journey')}>חזור למסע</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${goal.name} | Perfect One`}</title>
        <meta name="description" content={goal.description} />
        <link rel="canonical" href={`https://perfect-dashboard.com/goal/${goalCode}`} />
      </Helmet>

      <main className="min-h-screen bg-[#F8F9FA] py-8">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/journey')}
              className="mb-4 text-[#1E3A5F]"
            >
              <ChevronRight className="ml-2 w-4 h-4" />
              חזור למסע
            </Button>

            <h1 className="text-4xl font-black text-[#1E3A5F] mb-3">
              {goal.name}
            </h1>
            <p className="text-lg text-gray-600">
              {goal.description}
            </p>
          </motion.div>

          {/* Mentor Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GoalMentorChat 
              goalCode={goalCode}
              goalData={goal}
              customerGoalId={null}
            />
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-6 bg-white rounded-2xl border-2 border-blue-100"
          >
            <h3 className="font-bold text-[#1E3A5F] mb-3">💡 טיפים להצלחה:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {goal.tasks && goal.tasks.map((task, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-[#27AE60] flex-shrink-0 mt-0.5" />
                  <span>{task.title}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </main>
    </>
  );
}