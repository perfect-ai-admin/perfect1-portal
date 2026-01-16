import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function CollapsibleSection({ title, children, defaultOpen = false, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl overflow-hidden shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-white/50 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          )}
          <h3 className="text-base md:text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-purple-600" strokeWidth={2.5} />
        </motion.div>
      </button>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          {children}
        </div>
      </motion.div>
    </div>
  );
}