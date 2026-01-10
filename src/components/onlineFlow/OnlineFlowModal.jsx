import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ExplanationStep from './ExplanationStep';
import RegistrationForm from './RegistrationForm';
import PlanSelector from './PlanSelector';
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

  // Hide floating CTAs when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('flow-active');
    } else {
      document.body.classList.remove('flow-active');
    }
    return () => document.body.classList.remove('flow-active');
  }, [isOpen]);

  const handleFirstFormSubmit = () => {
    setCurrentStep(2); // Move to registration form
  };

  const handleFormSubmit = (data) => {
    setFormData(data);
    setCurrentStep(3); // Move to plan selector
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
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
            onNext={handleFirstFormSubmit}
          />
        );
      case 2:
        return (
          <RegistrationForm 
            onSubmit={handleFormSubmit}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <PlanSelector 
            onSelectPlan={handleSelectPlan}
            onBack={() => setCurrentStep(2)}
            formData={formData}
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg max-h-[100vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {/* Step Indicator - Compact */}
            {currentStep !== 5 && (
              <div className="sticky top-0 bg-[#1E3A5F] px-4 sm:px-6 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3 text-white text-sm font-semibold">
                  <span className="text-white/70">{currentStep}/4</span>
                  <div className="flex gap-1.5 mr-auto">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1 rounded-full transition-all ${
                          step <= currentStep
                            ? 'bg-white w-8'
                            : 'bg-white/20 w-8'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content - Compact */}
            <div className="overflow-y-auto px-4 pt-3 pb-3 sm:px-5 sm:pt-4 sm:pb-4">
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