import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <p className="text-xs font-medium text-gray-700 mt-2 whitespace-nowrap text-center">
                {step}
              </p>
            </motion.div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.1 }}
                className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
                style={{ originX: 0 }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${((currentStep) / steps.length) * 100}%` }}
        transition={{ duration: 0.5 }}
        className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
      />
    </div>
  );
}