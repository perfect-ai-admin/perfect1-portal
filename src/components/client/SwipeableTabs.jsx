import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

// Swipeable Tabs Container (section 8)
export default function SwipeableTabs({ activeTab, onChange, tabs, children }) {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const currentIndex = tabs.indexOf(activeTab);
    if (containerWidth > 0) {
      animate(x, -currentIndex * containerWidth, {
        type: "spring",
        stiffness: 300,
        damping: 30
      });
    }
  }, [activeTab, containerWidth, tabs, x]);

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const currentIndex = tabs.indexOf(activeTab);
    const threshold = containerWidth * 0.25;

    if (info.offset.x > threshold && currentIndex > 0) {
      onChange(tabs[currentIndex - 1]);
    } else if (info.offset.x < -threshold && currentIndex < tabs.length - 1) {
      onChange(tabs[currentIndex + 1]);
    } else {
      animate(x, -currentIndex * containerWidth, {
        type: "spring",
        stiffness: 300,
        damping: 30
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="overflow-hidden touch-pan-y"
      style={{ touchAction: 'pan-y' }}
    >
      <motion.div
        style={{ x }}
        drag="x"
        dragElastic={0.1}
        dragConstraints={{ left: -(tabs.length - 1) * containerWidth, right: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        className="flex"
      >
        {React.Children.map(children, (child, index) => (
          <div 
            key={tabs[index]}
            className="flex-shrink-0 w-full"
            style={{ 
              width: containerWidth || '100%',
              pointerEvents: isDragging ? 'none' : 'auto'
            }}
          >
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  );
}