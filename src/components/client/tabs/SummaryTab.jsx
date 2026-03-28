import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Rocket, Brain, Zap, Award, Target, TrendingUp, Users, Crown, Shield, Sparkles, Star } from 'lucide-react';
import GoalTemplatesFixed, { GOAL_TEMPLATES } from '@/components/client/goals/GoalTemplatesFixed';
import { entities, invokeFunction } from '@/api/supabaseClient';

export default function SummaryTab({ data }) {
  const navigate = useNavigate();
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [recommendedGoal, setRecommendedGoal] = useState(null);

  useEffect(() => {
    if (data && GOAL_TEMPLATES.length > 0) {
      setRecommendedGoal(GOAL_TEMPLATES[0]);
    }
  }, [data]);

  const handleCreateGoal = async (goalData, isEditing) => {
    try {
      await entities.UserGoal.create({
        ...goalData,
        user_id: data.id
      });
      setShowGoalDialog(false);
      window.location.href = createPageUrl('ClientDashboard') + '?tab=goals';
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const journeyStages = [
    { 
      icon: Rocket, 
      title: 'קביעת מטרה', 
      description: 'נבחר יחד את המטרה הכי חשובה לעסק שלך',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      icon: Brain, 
      title: 'בניית תוכנית', 
      description: 'המערכת תבנה תוכנית פעולה מותאמת אישית',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      icon: Zap, 
      title: 'ליווי יומיומי', 
      description: 'המנטור העסקי ילווה אותך בכל צעד',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    { 
      icon: Award, 
      title: 'השגת תוצאות', 
      description: 'נעקוב אחר ההתקדמות ונחגוג הצלחות',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="w-full -mx-3 sm:-mx-6 lg:-mx-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span className="text-sm font-medium">ליווי עסקי מקצועי</span>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight"
          >
            הגיע הזמן להצליח
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 mt-2">
              עם מנטור עסקי חכם
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            {data?.full_name ? `${data.full_name}, ` : ''}בניית עסק מצליח דורשת יותר מרעיון טוב. צריך תוכנית, ביצוע, וליווי מקצועי. אנחנו כאן בשבילך.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4 justify-center items-center"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <Star className="w-4 h-4 text-amber-300" />
              <span className="text-sm">ליווי 24/7</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <Shield className="w-4 h-4 text-green-300" />
              <span className="text-sm">תוכניות מותאמות אישית</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm">טכנולוגיית AI</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Journey Timeline */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            המסע שלך להצלחה
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            תהליך מובנה שמוכח שעובד - מהגדרת מטרה ועד להשגת תוצאות
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {journeyStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`p-6 h-full border-2 ${stage.borderColor} ${stage.bgColor} hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 justify-center">
                        <span className="text-sm font-bold text-gray-400">שלב {idx + 1}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">{stage.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{stage.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Why Mentor Section */}
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              למה אתה צריך מנטור עסקי?
            </h2>
            <p className="text-lg text-gray-600">
              ההבדל בין עסק שמצליח לעסק שנכשל לא תמיד בעבודה הקשה - אלא בכיוון הנכון
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Brain, title: 'החלטות חכמות', desc: 'קבלת החלטות מבוססות נתונים ולא אינטואיציה' },
              { icon: Target, title: 'מיקוד ברור', desc: 'הפסקת בזבוז זמן על דברים לא חשובים' },
              { icon: TrendingUp, title: 'גדילה מהירה', desc: 'קיצור דרך להצלחה עם אסטרטגיות מוכחות' },
              { icon: Users, title: 'אתה לא לבד', desc: 'מישהו שתומך בך גם בזמנים הקשים' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-6 bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 sm:p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white border-0 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
            </div>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Rocket className="w-4 h-4" />
                <span className="text-sm font-semibold">הצעד הראשון שלך</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                בואו נתחיל את המסע
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                בחר את המטרה הראשונה שלך ותקבל תוכנית פעולה מפורטת תוך דקות. המנטור שלך ילווה אותך בכל שלב.
              </p>

              {recommendedGoal && (
                <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${recommendedGoal.color} flex items-center justify-center shadow-lg`}>
                      <recommendedGoal.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">המלצה מיוחדת עבורך</h3>
                  <p className="text-2xl font-black text-amber-300 mb-2">{recommendedGoal.name}</p>
                  <p className="text-sm text-blue-100">{recommendedGoal.description}</p>
                </div>
              )}

              <Button
                onClick={() => setShowGoalDialog(true)}
                size="lg"
                className="h-14 px-8 bg-white text-indigo-600 hover:bg-gray-100 font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                <Target className="w-5 h-5 ml-2" />
                בחר את המטרה שלך עכשיו
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {showGoalDialog && recommendedGoal && (
        <GoalTemplatesFixed
          onCreateGoal={handleCreateGoal}
          onClose={() => setShowGoalDialog(false)}
          user={data}
          initialTemplate={recommendedGoal}
        />
      )}
    </div>
  );
}