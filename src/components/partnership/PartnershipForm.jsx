import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const professions = [
  { value: 'accountant', label: 'רואה חשבון' },
  { value: 'tax_consultant', label: 'יועץ מס' },
  { value: 'office_manager', label: 'מנהל משרד' },
  { value: 'other_professional', label: 'אחר' }
];

export default function PartnershipForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profession: '',
    profession_text: '',
    experience: '',
    consent: false
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ולידציה בסיסית
      if (!formData.name || !formData.phone || !formData.profession || !formData.experience) {
        setError('נא למלא את כל השדות');
        setLoading(false);
        return;
      }

      if (!formData.consent) {
        setError('חובה לאשר את תנאי השימוש ומדיניות הפרטיות');
        setLoading(false);
        return;
      }

      // יצירת lead
      const leadData = {
        name: formData.name,
        phone: formData.phone,
        profession: formData.profession,
        profession_text: formData.profession === 'other_professional' ? formData.profession_text : '',
        experience: formData.experience
      };

      await base44.entities.Partnership.create(leadData);

      // שליחת אימייל
      try {
        await base44.functions.invoke('sendPartnershipLead', {
          name: formData.name,
          phone: formData.phone,
          profession: formData.profession,
          experience: formData.experience
        });
      } catch (emailError) {
        console.log('Email error:', emailError);
      }

      setSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        profession: '',
        profession_text: '',
        experience: '',
        consent: false
      });

      // הסתר הצלחה אחרי 5 שניות
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message || 'שגיאה בשליחת הטופס');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
      >
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-green-900 mb-2">תודה על הפנייה!</h3>
        <p className="text-green-800 text-sm">
          קיבלנו את הפרטים שלך ונחזור אליך בקרוב.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          שם מלא *
        </label>
        <Input
          type="text"
          placeholder="שם מלא"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full text-right"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          טלפון *
        </label>
        <Input
          type="tel"
          placeholder="050-123-4567"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="w-full text-right"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          תחום עיסוק *
        </label>
        <Select value={formData.profession} onValueChange={(value) => handleChange('profession', value)}>
          <SelectTrigger className="w-full text-right">
            <SelectValue placeholder="בחר תחום עיסוק" />
          </SelectTrigger>
          <SelectContent>
            {professions.map(prof => (
              <SelectItem key={prof.value} value={prof.value}>
                {prof.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.profession === 'other_professional' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            אנא פרט *
          </label>
          <Input
            type="text"
            placeholder="תיאור תחום העיסוק"
            value={formData.profession_text}
            onChange={(e) => handleChange('profession_text', e.target.value)}
            className="w-full text-right"
            disabled={loading}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ניסיון רלוונטי *
        </label>
        <Textarea
          placeholder="תיאור קצר של הניסיון שלך בתחום (רו״ח, ניהול משרד, ייעוץ מס וכדומה)"
          value={formData.experience}
          onChange={(e) => handleChange('experience', e.target.value)}
          className="w-full text-right h-24"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">500 תווים מקסימום</p>
      </div>

      <div className="flex items-start space-x-3 space-x-reverse">
        <Checkbox 
            id="terms-partnership" 
            checked={formData.consent}
            onCheckedChange={(checked) => handleChange('consent', checked)}
            className="mt-1 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        <div className="grid gap-1.5 leading-none">
            <label
                htmlFor="terms-partnership"
                className="text-xs text-gray-600 font-medium leading-relaxed"
            >
                אני מאשר/ת את <Link to="/Terms" className="underline hover:text-blue-600" target="_blank">תנאי השימוש</Link> ו<Link to="/Privacy" className="underline hover:text-blue-600" target="_blank">מדיניות הפרטיות</Link> ומסכימ/ה לקבלת פניות.
            </label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11"
      >
        {loading ? 'שליחה...' : 'שלח פרטים'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        פרטיך מאובטחים ושמורים בהתאם לעדכון GDPR
      </p>
    </form>
  );
}