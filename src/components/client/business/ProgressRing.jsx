import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressRing({ 
  progress = 0, 
  size = 120, 
  strokeWidth = 12,
  color = '#22C55E',
  backgroundColor = '#E5E7EB',
  showLabel = true,
  label = '',
  className = ''
}) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedProgress / 100) * circumference;

  const getColor = () => {
    if (normalizedProgress >= 80) return '#22C55E'; // green
    if (normalizedProgress >= 50) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const progressColor = color === 'auto' ? getColor() : color;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div 
            className="text-2xl font-bold"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {Math.round(normalizedProgress)}%
          </motion.div>
          {label && (
            <div className="text-xs text-gray-600 mt-1">{label}</div>
          )}
        </div>
      )}
    </div>
  );
}