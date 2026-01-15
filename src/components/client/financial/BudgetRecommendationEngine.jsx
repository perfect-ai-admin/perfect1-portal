import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, DollarSign, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RECOMMENDATION_TYPES = {
  spending_alert: {
    icon: AlertCircle,
    color: 'from-red-500 to-red-600',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50'
  },
  savings_opportunity: {
    icon: DollarSign,
    color: 'from-green-500 to-green-600',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50'
  },
  tax_optimization: {
    icon: Shield,
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50'
  },
  cash_flow_warning: {
    icon: TrendingUp,
    color: 'from-orange-500 to-orange-600',
    borderColor: 'border-orange-200',
    bgColor: 'bg-orange-50'
  }
};

export default function BudgetRecommendationEngine({ recommendations = [], onDismiss, onAction }) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900">💡 המלצות תקציב חכמות</h3>
      
      {recommendations.map((rec) => {
        const config = RECOMMENDATION_TYPES[rec.type] || RECOMMENDATION_TYPES.savings_opportunity;
        const Icon = config.icon;

        return (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${config.bgColor} border-2 ${config.borderColor} rounded-xl p-6 relative`}
          >
            <button
              onClick={() => onDismiss(rec.id)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${config.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-2">{rec.title}</h4>
                <p className="text-gray-700 leading-relaxed mb-4">{rec.description}</p>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => onAction(rec.id, rec.primaryAction)}
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    {rec.primaryActionLabel || 'בצע פעולה'}
                  </Button>
                  {rec.secondaryAction && (
                    <Button
                      variant="outline"
                      onClick={() => onAction(rec.id, rec.secondaryAction)}
                    >
                      {rec.secondaryActionLabel || 'למד עוד'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}