import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  Flame, 
  ArrowRight,
  Shield,
  Zap,
  Bot,
  Sparkles,
  Link
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';

export default function DailyFocusScreen({ focus, onSave }) {
  const [primaryFocus, setPrimaryFocus] = useState(focus?.primary_focus || '');
  const [selectedGoalId, setSelectedGoalId] = useState(focus?.goal_id || '');
  const [activeGoals, setActiveGoals] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState(focus?.estimated_time || 60);
  const [subTasks, setSubTasks] = useState(focus?.sub_tasks || []);
  const [newSubTask, setNewSubTask] = useState('');
  const [status, setStatus] = useState(focus?.status || 'pending');

  useEffect(() => {
    if (focus) {
        setPrimaryFocus(focus.primary_focus || '');
        setEstimatedTime(focus.estimated_time || 60);
        setStatus(focus.status || 'pending');
        setSelectedGoalId(focus.goal_id || '');
    }

    const loadGoals = async () => {
        try {
            const goals = await base44.entities.UserGoal.filter({ status: 'active' }, '-created_date', 20);
            if (goals) {
                setActiveGoals(goals);
                // If no goal selected and there are goals, default to primary or first one
                if (!focus?.goal_id && !selectedGoalId) {
                    const primary = goals.find(g => g.isPrimary) || goals[0];
                    if (primary) setSelectedGoalId(primary.id);
                }
            }
        } catch (error) {
            console.error('Failed to load goals:', error);
        }
    };
    loadGoals();
  }, [focus]);

  const handleComplete = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setStatus('completed');
    onSave({ 
      primary_focus: primaryFocus, 
      goal_id: selectedGoalId,
      estimated_time: estimatedTime, 
      sub_tasks: subTasks,
      status: 'completed' 
    });
  };

  const acceptAiSuggestion = () => {
    if (focus?.ai_suggestion) {
        setPrimaryFocus(focus.ai_suggestion);
        onSave({ primary_focus: focus.ai_suggestion });
    }
  };

  const addSubTask = () => {
    if (newSubTask.trim()) {
      setSubTasks([...subTasks, { id: Date.now(), title: newSubTask, completed: false }]);
      setNewSubTask('');
    }
  };

  const toggleSubTask = (id) => {
    setSubTasks(subTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const progress = subTasks.length > 0 
    ? (subTasks.filter(t => t.completed).length / subTasks.length) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* Header Section */}
      <div className="text-center space-y-3">
        <Badge variant="outline" className="px-4 py-1 border-indigo-200 bg-indigo-50 text-indigo-700 mx-auto w-fit flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          מצב ביצוע: {status === 'completed' ? 'הושלם!' : 'פעיל'}
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">המשימה האחת להיום</h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          תשכח מכל הרעש. אם תעשה רק את הדבר הזה היום - היום שלך ייחשב להצלחה.
        </p>
      </div>

      {status === 'pending' ? (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Focus Card */}
          <div className="md:col-span-2 space-y-6">
            
            {/* AI Suggestion Banner */}
            {focus?.ai_suggestion && focus.ai_suggestion !== primaryFocus && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-indigo-900 text-white p-4 rounded-2xl flex items-start gap-4 shadow-lg relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -ml-10 -mt-10"></div>
                    <div className="p-2 bg-white/10 rounded-xl shrink-0">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                    </div>
                    <div className="flex-1 relative z-10">
                        <h4 className="font-bold text-sm mb-1 text-indigo-100">המנטור זיהה הזדמנות:</h4>
                        <p className="font-bold text-lg mb-2">"{focus.ai_suggestion}"</p>
                        <p className="text-xs text-indigo-300 mb-3">{focus.ai_reasoning}</p>
                        <Button 
                            size="sm" 
                            variant="secondary" 
                            className="bg-white text-indigo-900 hover:bg-indigo-50 w-full md:w-auto"
                            onClick={acceptAiSuggestion}
                        >
                            קבל הצעה והתמקד בזה
                        </Button>
                    </div>
                </motion.div>
            )}

            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100 border border-indigo-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
              
              <div className="relative z-10 space-y-6">
                <div>
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-600" />
                            הגדר את המשימה העיקרית
                        </label>
                    </div>
                    
                    {activeGoals.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {activeGoals.map(goal => (
                                <button
                                    key={goal.id}
                                    onClick={() => setSelectedGoalId(goal.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                        selectedGoalId === goal.id
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                    {selectedGoalId === goal.id && <CheckCircle2 className="w-3 h-3" />}
                                    {goal.title}
                                    {goal.isPrimary && <span className="bg-white/20 px-1.5 rounded-full text-[10px] ml-1">ראשי</span>}
                                </button>
                            ))}
                        </div>
                    )}
                  </div>

                  {/* Selected Goal Context & Tasks */}
                  <AnimatePresence mode="wait">
                    {selectedGoalId && activeGoals.find(g => g.id === selectedGoalId) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            key={selectedGoalId}
                            className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 mb-4 space-y-3"
                        >
                            {/* Plan Summary / Context */}
                            {activeGoals.find(g => g.id === selectedGoalId).plan_summary && (
                                <div className="text-sm text-indigo-800 bg-indigo-100/50 p-3 rounded-lg flex gap-2 items-start">
                                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold block text-xs uppercase tracking-wider text-indigo-500 mb-1">האסטרטגיה למטרה זו:</span>
                                        <p className="leading-relaxed">{activeGoals.find(g => g.id === selectedGoalId).plan_summary}</p>
                                    </div>
                                </div>
                            )}

                            {/* Goal Pending Tasks */}
                            {activeGoals.find(g => g.id === selectedGoalId).tasks?.filter(t => t.status !== 'done').length > 0 ? (
                                <div>
                                    <span className="text-xs font-bold text-gray-500 mb-2 block px-1">משימות פתוחות מהתוכנית:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {activeGoals.find(g => g.id === selectedGoalId).tasks
                                            .filter(t => t.status !== 'done')
                                            .slice(0, 5) // Show top 5
                                            .map(task => (
                                                <button
                                                    key={task.id}
                                                    onClick={() => setPrimaryFocus(task.title)}
                                                    className="text-xs bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 px-3 py-1.5 rounded-full transition-colors text-right truncate max-w-[200px]"
                                                    title={task.title}
                                                >
                                                    {task.title}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 italic px-1">
                                    אין משימות פתוחות למטרה זו כרגע. זה הזמן ליצור חדשות!
                                </div>
                            )}
                        </motion.div>
                    )}
                  </AnimatePresence>
                  <Textarea
                    placeholder="למשל: לסגור את העסקה עם יוסי..."
                    value={primaryFocus}
                    onChange={(e) => setPrimaryFocus(e.target.value)}
                    className="text-xl md:text-2xl font-medium border-0 border-b-2 border-indigo-100 rounded-none px-0 focus-visible:ring-0 focus-visible:border-indigo-600 bg-transparent resize-none h-auto min-h-[80px] placeholder:text-gray-300 leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl w-fit">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">זמן משוער:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      className="w-20 text-center font-bold text-lg bg-white border-gray-200"
                    />
                    <span className="text-gray-500">דקות</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtasks Section */}
            {primaryFocus && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ListIcon className="w-5 h-5 text-gray-400" />
                    צעדים לביצוע
                  </h3>
                  <span className="text-xs text-gray-500">{subTasks.filter(t => t.completed).length}/{subTasks.length}</span>
                </div>
                
                <div className="space-y-3 mb-4">
                  {subTasks.map(task => (
                    <motion.div 
                      key={task.id}
                      layout
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${task.completed ? 'bg-green-50' : 'bg-gray-50'}`}
                    >
                      <button 
                        onClick={() => toggleSubTask(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}
                      >
                        {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <span className={`flex-1 font-medium ${task.completed ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                        {task.title}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input 
                    placeholder="הוסף צעד קטן..." 
                    value={newSubTask}
                    onChange={(e) => setNewSubTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSubTask()}
                    className="bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-indigo-500"
                  />
                  <Button onClick={addSubTask} size="icon" variant="secondary">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar / Motivation */}
          <div className="space-y-4">
            <div className="bg-indigo-900 text-white rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <Shield className="w-10 h-10 text-indigo-300 mb-4" />
              <h3 className="font-bold text-lg mb-2">למה זה חשוב?</h3>
              <p className="text-indigo-200 text-sm leading-relaxed mb-6">
                כשאתה מתמקד בדבר אחד ומסיים אותו, אתה בונה מומנטום חיובי. אל תתן להסחות דעת לעצור אותך.
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-indigo-300 mb-1">
                  <span>התקדמות</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-indigo-800" indicatorClassName="bg-indigo-400" />
              </div>

              <Button 
                onClick={handleComplete}
                className="w-full mt-8 bg-white text-indigo-900 hover:bg-indigo-50 font-bold h-12 rounded-xl"
                disabled={!primaryFocus}
              >
                סיימתי את המשימה! 🎉
              </Button>
            </div>

            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex items-start gap-3">
              <Zap className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-orange-900 text-sm">טיפ לפוקוס</h4>
                <p className="text-orange-800 text-xs mt-1">
                  שים את הטלפון על "נא לא להפריע" למשך {estimatedTime} הדקות הקרובות.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-50 rounded-3xl p-12 text-center border-2 border-green-100"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrophyIcon className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-green-900 mb-2">כל הכבוד! 🏆</h2>
          <p className="text-green-700 text-lg max-w-md mx-auto mb-8">
            עשית את הדבר החשוב ביותר להיום. כל מה שתעשה מעכשיו הוא בונוס.
          </p>
          <Button 
            onClick={() => setStatus('pending')}
            variant="outline" 
            className="border-green-200 text-green-700 hover:bg-green-100"
          >
            הגדר משימה חדשה (אופציונלי)
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

function Badge({ children, className, variant }) {
    return <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</div>
}

function ListIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
    )
}

function TrophyIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    )
}