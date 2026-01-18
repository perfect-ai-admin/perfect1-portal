import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import HeroGoal from '../goals/HeroGoal';
import SecondaryGoals from '../goals/SecondaryGoals';
import GoalTemplates from '../goals/GoalTemplatesFixed';
// GoalsCatalog removed
import LimitUpgradeDialog from '../goals/LimitUpgradeDialog';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

export default function GoalsTab({ user, data, openAddGoal = false }) {
  const [goals, setGoals] = useState([]);
  const [userGoals, setUserGoals] = useState([]);
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const goalsTopRef = useRef(null);
  const processedOpenAddGoal = useRef(false);

  useEffect(() => {
    if (user?.id) {
      loadUserGoals();
    }
  }, [user?.id]);

  const loadUserGoals = async () => {
    try {
      const ug = await base44.entities.UserGoal.filter({ user_id: user.id });
      // Filter out invalid goals (no title)
      const validGoals = ug.filter(g => g.title && g.title.trim() !== '');
      setUserGoals(validGoals);
      setGoals(validGoals);
      setGoalsLoaded(true);
    } catch (error) {
      console.error('Error loading user goals:', error);
      setGoalsLoaded(true);
    }
  };

  // Handle openAddGoal prop once goals are loaded
  useEffect(() => {
    if (openAddGoal && goalsLoaded && !processedOpenAddGoal.current) {
      processedOpenAddGoal.current = true;
      handleShowAddGoal();
    }
  }, [openAddGoal, goalsLoaded]);

  // Reset processed ref if openAddGoal becomes false (user navigated away and back)
  useEffect(() => {
    if (!openAddGoal) {
      processedOpenAddGoal.current = false;
    }
  }, [openAddGoal]);



  const handleShowAddGoal = () => {
    const limit = user?.goals_limit;
    // If limit is null/undefined -> Unlimited (Elite plan). If number -> Limit.
    // However, default logic for Free plan is 1. If user has no plan, we assume Free (1).
    const effectiveLimit = limit === null || limit === undefined ? 1 : limit;
    
    // Allow unlimited if explicitly null/high number, but here we treat null as 1 for safety unless plan says otherwise?
    // Wait, in ClientLogin: goals_limit: freePlan?.goals_limit || 1.
    // In Pricing: Elite has "goals_limit: null" (unlimited).
    // So if limit === null, it allows infinite.
    
    const isUnlimited = limit === null; // Based on Elite plan config in Pricing
    
    if (!isUnlimited && goals.length >= limit) {
      setShowUpgradeDialog(true);
      return;
    }
    
    setShowAddGoal(true);
  };

  const heroGoal = goals[0];
  const secondaryGoals = goals.slice(1);

  const handleStatusChange = (goal, nextStatus) => {
    setGoals(prev => prev.map(g => 
      g.id === goal.id 
        ? { ...g, status: nextStatus }
        : g
    ));
  };

  const handleEditGoal = (goal) => {
     setEditingGoal(goal);
     setShowAddGoal(true);
   };

  const handleDeleteGoal = (goalId) => {
     setGoals(prev => prev.filter(g => g.id !== goalId));
   };

  const handleCreateGoal = async (newGoal, isEditing = false) => {
     try {
       // Save to DB
       if (isEditing) {
          await base44.entities.UserGoal.update(newGoal.id, newGoal);
          setGoals(prev => prev.map(g => g.id === newGoal.id ? newGoal : g));
       } else {
          // Remove ID if it's undefined or generated locally, let DB handle it or use it if valid
          // If newGoal.id is undefined, entity create will generate one.
          const goalToCreate = { ...newGoal, user_id: user.id };
          // If id is undefined, don't include it in payload to avoid issues? 
          // Actually if it's undefined, it's fine.
          
          const created = await base44.entities.UserGoal.create(goalToCreate);
          
          if (newGoal.isPrimary) {
             setGoals(prev => [created, ...prev.filter(g => !g.isPrimary)]);
          } else {
             setGoals(prev => [...prev, created]);
          }
       }
       setShowAddGoal(false);
     } catch (error) {
        console.error("Error saving goal:", error);
        throw error; // Re-throw so GoalTemplatesFixed can catch it
     }
   };

  return (
    <>
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent className="p-0 border-0 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col gap-0 w-full sm:max-w-2xl bg-white">
          {showAddGoal && (
            <GoalTemplates
              user={user}
              onCreateGoal={handleCreateGoal}
              onClose={() => {
                setShowAddGoal(false);
                setEditingGoal(null);
              }}
              hasPrimaryGoal={goals.some(g => g.isPrimary && g.id !== editingGoal?.id)}
              editingGoal={editingGoal}
            />
          )}
        </DialogContent>
      </Dialog>

      <LimitUpgradeDialog 
        isOpen={showUpgradeDialog} 
        onClose={() => setShowUpgradeDialog(false)} 
        limit={user?.goals_limit || 1}
      />

      <div className="container mx-auto max-w-4xl p-0 md:p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-8"
        >
          
          {/* Goals Catalog removed */}

          {/* Header Section */}
          <div className="flex items-end justify-between px-1">
             <div>
               <h1 className="text-2xl font-bold text-gray-900">המטרות שלי</h1>
               <p className="text-gray-500 text-sm mt-1">
                 {goals.length > 0 
                   ? `יש לך ${goals.length} מטרות פעילות. תן בראש! 💪` 
                   : 'זה הזמן להגדיר מטרות חדשות ולהתחיל לצמוח 🌱'}
               </p>
             </div>
             <Button 
                onClick={handleShowAddGoal}
                size="sm"
                className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all rounded-full px-4"
              >
                <Plus className="w-4 h-4 ml-2" />
                מטרה חדשה
              </Button>
          </div>

          {/* Hero Goal */}
          {heroGoal && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">הפוקוס העיקרי שלך</p>
              </div>
              <HeroGoal 
                goal={heroGoal}
                onStatusChange={handleStatusChange}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
              />
            </div>
          )}

          {/* Secondary Goals */}
          {secondaryGoals.length > 0 && (
            <SecondaryGoals 
              goals={secondaryGoals}
              onStatusChange={handleStatusChange}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
            />
          )}

          {/* Empty State */}
          {goals.length === 0 && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">אין מטרות עדיין</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">מטרות הן המצפן של העסק. בוא נגדיר את היעד הבא שלך ונתחיל לנוע לעברו.</p>
              <Button onClick={handleShowAddGoal} size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                <Plus className="w-5 h-5 ml-2" />
                צור מטרה ראשונה
              </Button>
            </motion.div>
          )}

        </motion.div>
      </div>
    </>
      );
      }