import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

// Pull to Refresh Component (section 8)
export default function PullToRefresh({ onRefresh, children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const y = useMotionValue(0);
  
  const opacity = useTransform(y, [0, 80], [0, 1]);
  const rotate = useTransform(y, [0, 80], [0, 360]);

  const handleDragEnd = async (event, info) => {
    if (info.offset.y > 80 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    y.set(0);
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute top-0 left-0 right-0 h-16 flex items-center justify-center z-10"
      >
        <motion.div style={{ rotate }}>
          <RefreshCw 
            className={`w-6 h-6 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y }}
        drag="y"
        dragElastic={0.2}
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        className="touch-none"
      >
        {children}
      </motion.div>
    </div>
  );
}