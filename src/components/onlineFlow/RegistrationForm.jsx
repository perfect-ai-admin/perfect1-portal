import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegistrationForm({ onSubmit, onBack, selectedPlan }) {
  const [formData, setFormData] = useState({
    fullName: '',
    id: '',
    phone: '',
    email: '',
    profession: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'שם חובה';
    if (!formData.id.trim()) newErrors.id = 'ת.ז. חובה';
    if (!formData.phone.trim()) newErrors.phone = 'טלפון חובה';
    if (!formData.email.trim()) newErrors.email = 'אימייל חובה';
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
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
        <h2 className="text-3xl font-black text-[#1E3A5F] mb-1">
          סיום התהליך
        </h2>
        <p className="text-sm text-gray-600">עוד דקה וחצי בלבד - אז נתחיל</p>
      </motion.div>

      {/* Progress Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="text-xs text-gray-500 text-center"
      >
        הפרטים האלה יהיו בטוחים לחלוטין 🔒
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
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
          transition={{ delay: 0.3 }}
          className="flex gap-2 pt-2"
        >
          <Button
            type="submit"
            className="flex-1 h-10 font-bold rounded-lg bg-[#27AE60] hover:bg-[#229954] text-white text-sm"
          >
            המשך לתשלום
          </Button>
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600"
          >
            חזור
          </button>
        </motion.div>
      </form>
    </div>
  );
}