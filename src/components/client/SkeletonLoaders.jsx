import React from 'react';
import { motion } from 'framer-motion';

const shimmer = {
  initial: { backgroundPosition: '200% center' },
  animate: { backgroundPosition: '-200% center' },
};

export function SkeletonCard({ className = 'h-32' }) {
  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      transition={{ duration: 2, repeat: Infinity }}
      className={`rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${className}`}
    />
  );
}

export function SkeletonText({ width = 'w-3/4', height = 'h-4' }) {
  return <SkeletonCard className={`${width} ${height}`} />;
}

export function SkeletonTabContent() {
  return (
    <div className="space-y-6">
      <SkeletonCard className="h-40" />
      <div className="grid grid-cols-2 gap-4">
        <SkeletonCard className="h-24" />
        <SkeletonCard className="h-24" />
      </div>
      <SkeletonCard className="h-64" />
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <SkeletonCard className="w-14 h-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-1/2" />
          <SkeletonText width="w-1/3" height="h-3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPricing() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12 space-y-4">
        <SkeletonText width="w-1/3" height="h-10" className="mx-auto" />
        <SkeletonText width="w-1/4" height="h-6" className="mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-2xl p-6 space-y-4">
            <SkeletonText width="w-1/2" height="h-8" className="mx-auto" />
            <SkeletonText width="w-1/3" height="h-12" className="mx-auto" />
            <div className="space-y-2 pt-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <SkeletonText key={j} width="w-full" height="h-4" />
              ))}
            </div>
            <SkeletonCard className="h-12 w-full mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}