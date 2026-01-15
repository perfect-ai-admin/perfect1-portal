import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoalsFloatingButton({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Floating Button */}
      <motion.div
        className="fixed bottom-24 left-4 z-40 md:hidden"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={() => {
            onNavigate('goals');
            setIsOpen(false);
          }}
          className="h-14 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg"
        >
          <Target className="w-5 h-5 mr-2" />
          המטרות שלי
        </Button>
      </motion.div>
    </>
  );
}