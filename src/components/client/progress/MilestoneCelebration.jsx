import React, { useEffect, useState } from 'react';
import CelebrationOverlay from '../shared/CelebrationOverlay';
import { MILESTONES } from './JourneyTimeline';

// Milestone celebration configurations
const MILESTONE_CELEBRATIONS = {
  registration: {
    title: 'עוסק פטור רשמי! 🎉',
    description: 'קפצת לבריכה! עכשיו אתה עצמאי רשמי. זה הצעד הראשון במסע של בניית עסק.',
    badge: '📝',
    badgeTitle: 'תג המייסד',
    promptNextGoal: true
  },
  first_invoice: {
    title: 'החשבונית הראשונה! 💰',
    description: 'זה הרגע שהעסק שלך הופך מרעיון למציאות. חשבונית ראשונה = עסק אמיתי.',
    badge: '📄',
    badgeTitle: 'תג המקצוען',
    promptNextGoal: true
  },
  first_client_payment: {
    title: 'התשלום הראשון הגיע! 🚀',
    description: 'יש לך הכנסה ראשונה! זה מרגש לראות את העבודה שלך מתורגמת לכסף.',
    badge: '💳',
    badgeTitle: 'תג היזם',
    promptNextGoal: true
  },
  monthly_report: {
    title: 'דיווח חודשי ראשון הושלם! ✅',
    description: 'אתה רציני! דיווח חודשי זה חובה, ועשית את זה מושלם בפעם הראשונה.',
    badge: '📊',
    badgeTitle: 'תג המסודר',
    promptNextGoal: true
  },
  steady_income: {
    title: 'הכנסה יציבה 3 חודשים! 🔥',
    description: 'זה כבר לא מזל - זו עקביות. העסק שלך מתחיל להיות יציב!',
    badge: '🎯',
    badgeTitle: 'תג העקביות',
    promptNextGoal: true
  },
  annual_report: {
    title: 'סיימת שנה ראשונה! 🏆',
    description: 'מחזור שנה שלם! אתה יודע מה? רוב העסקים לא מגיעים לכאן. אתה כבר במקום אחר.',
    badge: '👑',
    badgeTitle: 'תג הוותיק',
    promptNextGoal: true
  }
};

export default function MilestoneCelebration({ 
  completedMilestones = [], 
  onGoalPrompt,
  onCelebrationComplete 
}) {
  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const [currentCelebration, setCurrentCelebration] = useState(null);

  // Monitor completed milestones and trigger celebration
  useEffect(() => {
    const newCompletions = completedMilestones.filter(milestoneId => {
      const wasShown = localStorage.getItem(`celebrated_${milestoneId}`);
      return !wasShown;
    });

    if (newCompletions.length > 0) {
      const celebrations = newCompletions.map(id => ({
        milestoneId: id,
        ...MILESTONE_CELEBRATIONS[id]
      }));
      setCelebrationQueue(prev => [...prev, ...celebrations]);
    }
  }, [completedMilestones]);

  // Show next celebration from queue
  useEffect(() => {
    if (celebrationQueue.length > 0 && !currentCelebration) {
      const next = celebrationQueue[0];
      setCurrentCelebration(next);
      setCelebrationQueue(prev => prev.slice(1));
    }
  }, [celebrationQueue, currentCelebration]);

  const handleClose = () => {
    if (currentCelebration) {
      localStorage.setItem(`celebrated_${currentCelebration.milestoneId}`, 'true');
      onCelebrationComplete?.(currentCelebration.milestoneId);
    }
    setCurrentCelebration(null);
  };

  const handleShare = () => {
    const milestone = MILESTONES.find(m => m.id === currentCelebration?.milestoneId);
    const text = `🎉 זה עתה השלמתי: ${milestone?.title}!\n\nעוד צעד במסע העסקי שלי עם Perfect One 💪\n#עוסקפטור #יזמות #הצלחה`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'הישג חדש!',
        text: text,
        url: window.location.href
      }).catch(err => console.log('Share cancelled'));
    } else {
      // Fallback: Open sharing options
      const shareUrl = encodeURIComponent(window.location.href);
      const shareText = encodeURIComponent(text);
      
      const options = [
        { name: 'WhatsApp', url: `https://wa.me/?text=${shareText}` },
        { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
        { name: 'Twitter', url: `https://twitter.com/intent/tweet?text=${shareText}` },
        { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` }
      ];

      // Show modal with sharing options
      const choice = window.confirm('בחר אפשרות שיתוף:\n\n1. WhatsApp\n2. Facebook\n3. Twitter\n4. LinkedIn\n\nלחץ OK לפתיחת WhatsApp');
      if (choice) {
        window.open(options[0].url, '_blank');
      }
    }
  };

  if (!currentCelebration) return null;

  return (
    <CelebrationOverlay
      show={true}
      achievement={{
        ...currentCelebration,
        onSetNextGoal: onGoalPrompt
      }}
      onClose={handleClose}
      onShare={handleShare}
    />
  );
}