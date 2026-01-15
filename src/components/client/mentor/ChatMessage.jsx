import React from 'react';
import { motion } from 'framer-motion';

export default function ChatMessage({ message, delay = 0 }) {
  const isMentor = message.role === 'mentor';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`flex ${isMentor ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`max-w-xs ${isMentor ? 'lg:max-w-sm' : ''}`}>
        <div
          className={`rounded-lg px-3 py-2.5 text-sm leading-relaxed ${
            isMentor
              ? 'bg-gray-100 text-gray-900'
              : 'bg-blue-600 text-white'
          }`}
        >
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}