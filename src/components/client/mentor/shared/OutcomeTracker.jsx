import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OutcomeTracker({ actionId, onComplete }) {
  const [status, setStatus] = useState('pending');

  const handleStatus = (newStatus) => {
    setStatus(newStatus);
    if (onComplete) {
      onComplete(actionId, newStatus);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 mt-3"
    >
      <Button
        onClick={() => handleStatus('done')}
        variant={status === 'done' ? 'default' : 'outline'}
        size="sm"
        className="h-7 px-2 text-xs gap-1"
      >
        <Check className="w-3 h-3" />
        בוצע
      </Button>
      <Button
        onClick={() => handleStatus('pending')}
        variant={status === 'pending' ? 'default' : 'outline'}
        size="sm"
        className="h-7 px-2 text-xs gap-1"
      >
        <HelpCircle className="w-3 h-3" />
        ממתין
      </Button>
      <Button
        onClick={() => handleStatus('irrelevant')}
        variant={status === 'irrelevant' ? 'default' : 'outline'}
        size="sm"
        className="h-7 px-2 text-xs gap-1"
      >
        <X className="w-3 h-3" />
        לא רלוונטי
      </Button>
    </motion.div>
  );
}