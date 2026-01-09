import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import ExplanationStep from './ExplanationStep';
import PlanSelector from './PlanSelector';
import RegistrationForm from './RegistrationForm';
import PaymentStep from './PaymentStep';
import SuccessStep from './SuccessStep';

export default function OnlineFlowModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    id: '',
    phone: '',
    email: '',
    profession: ''
  });

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setCurrentStep(3); // Jump to form after plan selection
  };

  const handleFormSubmit = (data) => {
    setFormData(data);
    setCurrentStep(4); // Move to payment
  };

  const handlePaymentSuccess = () => {
    setCurrentStep(5); // Move to success
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedPlan(null);
    setFormData({
      fullName: '',
      id: '',
      phone: '',
      email: '',
      profession: ''
    });
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ExplanationStep 
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <PlanSelector 
            onSelectPlan={handleSelectPlan}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <RegistrationForm 
            onSubmit={handleFormSubmit}
            onBack={() => setCurrentStep(2)}
            selectedPlan={selectedPlan}
          />
        );
      case 4:
        return (
          <PaymentStep 
            formData={formData}
            selectedPlan={selectedPlan}
            onSuccess={handlePaymentSuccess}
            onBack={() => setCurrentStep(3)}
          />
        );
      case 5:
        return (
          <SuccessStep 
            formData={formData}
            selectedPlan={selectedPlan}
            onClose={handleClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {/* Step Indicator */}
            {currentStep !== 5 && (
              <div className="sticky top-0 bg-gradient-to-r from-[#3498DB] to-[#2980B9] px-8 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2 text-white text-sm font-bold">
                  <span>שלב {currentStep} מ-4</span>
                  <div className="flex gap-1 mr-auto">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-2 rounded-full transition-all ${
                          step <= currentStep
                            ? 'bg-white w-8'
                            : 'bg-white/30 w-2'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}