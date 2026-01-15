import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StepIndicator from '../../components/common/StepIndicator';

export default function RegistrationForm({ onSubmit, onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['פרטים אישיים', 'מידע תעודה', 'ממנו נשמע', 'סיכום'];
  
  const [formData, setFormData] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('onlineFlowFormData');
    return saved ? JSON.parse(saved) : {
      fullName: '',
      id: '',
      phone: '',
      email: '',
      profession: ''
    };
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
     const newErrors = {};
     if (!formData.fullName.trim()) {
       newErrors.fullName = 'אנא הכנס שם מלא (לפחות 2 תווים)';
     } else if (formData.fullName.trim().length < 2) {
       newErrors.fullName = 'שם חייב להיות לפחות 2 תווים';
     }

     if (!formData.id.trim()) {
       newErrors.id = 'אנא הכנס מספר תעודת זהות';
     } else if (!/^\d{9}$/.test(formData.id.trim())) {
       newErrors.id = 'תעודת זהות חייבת להיות 9 ספרות';
     }

     if (!formData.phone.trim()) {
       newErrors.phone = 'אנא הכנס מספר טלפון';
     } else if (!/^0[0-9]{8,9}$/.test(formData.phone.trim())) {
       newErrors.phone = 'טלפון חייב להיות בפורמט: 05XXXXXXXX';
     }

     if (!formData.email.trim()) {
       newErrors.email = 'אנא הכנס כתובת מייל';
     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
       newErrors.email = 'אנא הכנס מייל תקין (דוגמה: name@example.com)';
     }

     return newErrors;
   };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      localStorage.setItem('onlineFlowFormData', JSON.stringify(formData));
      onSubmit(formData);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-black text-[#1E3A5F] mb-0.5">
          <span className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] bg-clip-text text-transparent">מתחילים פתיחת עוסק פטור אונליין</span>
        </h2>
        <p className="text-xs text-gray-600">{steps[currentStep]}</p>
      </motion.div>

      {/* Step Indicator */}
      <StepIndicator steps={steps} currentStep={currentStep} />

      <form onSubmit={(e) => {
        e.preventDefault();
        if (currentStep === steps.length - 1) {
          handleSubmit(e);
        } else {
          setCurrentStep(currentStep + 1);
        }
      }} className="space-y-2">
        {currentStep === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Input
            id="fullName"
            placeholder="למשל: דוד כהן"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'error-fullName' : undefined}
            className={`h-10 rounded-lg border-2 text-sm ${
              errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'
            }`}
          />
          {errors.fullName && (
            <p id="error-fullName" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
              <span>⚠️</span>{errors.fullName}
            </p>
          )}
        </motion.div>
        )}

        {currentStep === 1 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Input
              id="id"
              placeholder="למשל: 123456789"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              aria-invalid={!!errors.id}
              aria-describedby={errors.id ? 'error-id' : undefined}
              className={`h-10 rounded-lg border-2 text-sm ${
                errors.id ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'
              }`}
              maxLength="9"
              inputMode="numeric"
            />
            {errors.id && (
              <p id="error-id" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                <span>⚠️</span>{errors.id}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Input
              id="phone"
              type="tel"
              placeholder="למשל: 0501234567"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'error-phone' : undefined}
              className={`h-10 rounded-lg border-2 text-sm ${
                errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'
              }`}
            />
            {errors.phone && (
              <p id="error-phone" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                <span>☎️</span>{errors.phone}
              </p>
            )}
          </motion.div>
        </>
        )}

        {currentStep === 2 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Input
              id="email"
              type="email"
              placeholder="למשל: david@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'error-email' : undefined}
              className={`h-10 rounded-lg border-2 text-sm ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'
              }`}
            />
            {errors.email && (
              <p id="error-email" className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                <span>✉️</span>{errors.email}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Input
              placeholder="למשל: צלם, מעצב גרפי, כתיבה עצמאית"
              value={formData.profession}
              onChange={(e) =>
                setFormData({ ...formData, profession: e.target.value })
              }
              className={`h-10 rounded-lg border-2 text-sm ${
                errors.profession ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.profession && (
              <p className="text-red-500 text-xs mt-0.5">{errors.profession}</p>
            )}
          </motion.div>
        </>
        )}

        {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-lg p-4 space-y-2"
        >
          <p className="text-sm font-medium text-gray-900">בדוק את הפרטים שלך:</p>
          <ul className="text-xs space-y-1 text-gray-700">
            <li>👤 {formData.fullName}</li>
            <li>🆔 {formData.id}</li>
            <li>📞 {formData.phone}</li>
            <li>📧 {formData.email}</li>
            <li>💼 {formData.profession}</li>
          </ul>
        </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2 pt-3 flex gap-2"
        >
          {currentStep > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600 font-medium"
            >
              ← חזור
            </button>
          )}
          <Button
            type="submit"
            className="flex-1 h-10 font-black text-base rounded-lg bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg"
          >
            {currentStep === steps.length - 1 ? 'בחר מסלול 🚀' : 'הבא →'}
          </Button>
        </motion.div>
        {currentStep === 0 && (
          <button
            type="button"
            onClick={onBack}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600 font-medium"
          >
            ← חזור לעמוד הקודם
          </button>
        )}
      </form>
    </div>
  );
}