import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoalsFloatingButton({ onNavigate }) {
  return (
    <motion.div
      className="md:hidden mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Button
        onClick={() => onNavigate('goals')}
        className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md"
      >
        <Target className="w-5 h-5 mr-2" />
        המטרות שלי
      </Button>
    </motion.div>
  );
}