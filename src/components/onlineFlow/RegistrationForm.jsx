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
    <div className="space-y-3 py-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-black text-[#1E3A5F] mb-0.5">
          <span className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] bg-clip-text text-transparent">מתחילים פתיחת עוסק פטור אונליין</span>
        </h2>
        <p className="text-xs text-gray-600">פרטים נוספים בבקשה</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-2">
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
            className={`h-10 rounded-lg border-2 text-sm ${
              errors.fullName ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-0.5">{errors.fullName}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Input
            placeholder="תעודת זהות"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            className={`h-10 rounded-lg border-2 text-sm ${
              errors.id ? 'border-red-500' : 'border-gray-200'
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
          transition={{ delay: 0.15 }}
        >
          <Input
            type="tel"
            placeholder="טלפון"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className={`h-10 rounded-lg border-2 text-sm ${
              errors.phone ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Input
            type="email"
            placeholder="אימייל"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={`h-10 rounded-lg border-2 text-sm ${
              errors.email ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Input
            placeholder="סוג עיסוק (למשל: צלם, מעצב...)"
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2 pt-3"
        >
          <Button
            type="submit"
            className="w-full h-12 font-black text-base rounded-lg bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg"
          >
            בחר מסלול 🚀
          </Button>
          <button
            type="button"
            onClick={onBack}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600 font-medium"
          >
            ← חזור
          </button>
        </motion.div>
      </form>
    </div>
  );
}