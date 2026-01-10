import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegistrationForm({ onSubmit, onBack }) {
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
    if (!formData.fullName.trim()) newErrors.fullName = 'שם חובה';
    if (!formData.id.trim()) newErrors.id = 'ת.ז. חובה';
    if (!formData.phone.trim()) newErrors.phone = 'טלפון חובה';
    if (!formData.email.trim()) newErrors.email = 'אימייל חובה';
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
    <div className="space-y-3 h-full flex flex-col justify-between pb-0">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-bold text-[#27AE60] mb-1">
          מתחילים פתיחת עוסק פטור אונליין
        </h2>
        <p className="text-xs text-gray-600">פרטים נוספים בבקשה</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-2 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Input
            placeholder="שם מלא"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className={`h-11 rounded-lg border text-sm ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-0.5">{errors.fullName}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <Input
            placeholder="תעודת זהות"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            className={`h-11 rounded-lg border text-sm ${
              errors.id ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength="9"
          />
          {errors.id && (
            <p className="text-red-500 text-xs mt-0.5">{errors.id}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11 }}
        >
          <Input
            type="tel"
            placeholder="טלפון"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className={`h-11 rounded-lg border text-sm ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <Input
            type="email"
            placeholder="אימייל"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={`h-11 rounded-lg border text-sm ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
        >
          <Input
            placeholder="סוג עיסוק (למשל: צלם, מעצב...)"
            value={formData.profession}
            onChange={(e) =>
              setFormData({ ...formData, profession: e.target.value })
            }
            className={`h-11 rounded-lg border text-sm ${
              errors.profession ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 pt-2"
        >
          <Button
            type="submit"
            className="w-full h-11 font-semibold text-base rounded-lg bg-[#27AE60] hover:bg-[#229954] text-white shadow-md"
          >
            בחר מסלול ✨
          </Button>
          <button
            type="button"
            onClick={onBack}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-600 font-medium"
          >
            ← חזור
          </button>
        </motion.div>
      </form>
    </div>
  );
}