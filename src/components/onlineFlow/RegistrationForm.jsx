import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const professions = [
  'צלם',
  'מעצב גרפי',
  'מדריך כושר',
  'מעצב שיער',
  'מניקור / פדיקור',
  'קוסמטיקאית',
  'מורה פרטי',
  'תורגמן',
  'ייעוץ עסקי',
  'תיקייה / ניקיון',
  'תיקונים וטכנאות',
  'הנדסה / טכנולוגיה',
  'אחר'
];

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
    if (!formData.fullName.trim()) newErrors.fullName = 'שם מלא חובה';
    if (!formData.id.trim()) newErrors.id = 'תעודת זהות חובה';
    if (!formData.phone.trim()) newErrors.phone = 'טלפון חובה';
    if (!formData.email.trim()) newErrors.email = 'אימייל חובה';
    if (!formData.profession) newErrors.profession = 'בחר מקצוע';
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-black text-[#1E3A5F] mb-1">
          הפרטים שלך
        </h2>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-bold text-gray-700 mb-2">
            שם מלא *
          </label>
          <Input
            placeholder="למשל: יוסי כהן"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className={`h-12 rounded-lg border-2 ${
              errors.fullName ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="block text-sm font-bold text-gray-700 mb-2">
            תעודת זהות *
          </label>
          <Input
            placeholder="123456789"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            className={`h-12 rounded-lg border-2 ${
              errors.id ? 'border-red-500' : 'border-gray-200'
            }`}
            maxLength="9"
          />
          {errors.id && (
            <p className="text-red-500 text-xs mt-1">{errors.id}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-bold text-gray-700 mb-2">
            טלפון *
          </label>
          <Input
            type="tel"
            placeholder="050-1234567"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className={`h-12 rounded-lg border-2 ${
              errors.phone ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <label className="block text-sm font-bold text-gray-700 mb-2">
            אימייל *
          </label>
          <Input
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={`h-12 rounded-lg border-2 ${
              errors.email ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-bold text-gray-700 mb-2">
            סוג עיסוק *
          </label>
          <Select value={formData.profession} onValueChange={(value) => setFormData({ ...formData, profession: value })}>
            <SelectTrigger className={`h-12 rounded-lg border-2 ${errors.profession ? 'border-red-500' : 'border-gray-200'}`}>
              <SelectValue placeholder="בחר את סוג העיסוק" />
            </SelectTrigger>
            <SelectContent>
              {professions.map((prof) => (
                <SelectItem key={prof} value={prof}>
                  {prof}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.profession && (
            <p className="text-red-500 text-xs mt-1">{errors.profession}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-600"
        >
          הפרטים הללו יהיו בטוחים ומאובטחים. אנחנו משתמשים בהצפנה מתקדמת.
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 pt-4"
        >
          <Button
            type="submit"
            className="flex-1 h-14 font-bold rounded-lg bg-[#27AE60] hover:bg-[#229954] text-white text-lg"
          >
            אישור והמשך לתשלום
          </Button>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-600 font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </motion.div>
      </form>
    </div>
  );
}