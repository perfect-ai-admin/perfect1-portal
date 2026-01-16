import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function LandingPageQuestionnaire({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    mainField: '',
    targetAudience: [],
    targetAudienceOther: '',
    painPoints: '',
    consequences: '',
    serviceOffered: '',
    whyChooseYou: [],
    whyChooseYouOther: '',
    experienceYears: '',
    processSteps: '',
    proofs: [],
    testimonialText: '',
    ctaType: '',
    ctaText: '',
    pageStyle: '',
    preferredColors: '',
    logoStatus: '',
    formFields: [],
    leadDestination: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCheckboxChange = (group, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [group]: checked 
        ? [...prev[group], value]
        : prev[group].filter(item => item !== value)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    switch(step) {
      case 1:
        if (!formData.businessName.trim()) newErrors.businessName = 'שדה חובה';
        if (!formData.mainField.trim()) newErrors.mainField = 'שדה חובה';
        if (formData.targetAudience.length === 0) newErrors.targetAudience = 'בחר לפחות אפשרות אחת';
        break;
      case 2:
        if (!formData.painPoints.trim()) newErrors.painPoints = 'שדה חובה';
        if (!formData.consequences.trim()) newErrors.consequences = 'שדה חובה';
        break;
      case 3:
        if (!formData.serviceOffered.trim()) newErrors.serviceOffered = 'שדה חובה';
        if (formData.whyChooseYou.length === 0) newErrors.whyChooseYou = 'בחר לפחות אפשרות אחת';
        if (!formData.processSteps.trim()) newErrors.processSteps = 'שדה חובה';
        break;
      case 5:
        if (!formData.ctaType) newErrors.ctaType = 'בחר אפשרות';
        if (!formData.ctaText) newErrors.ctaText = 'בחר אפשרות';
        break;
      case 6:
        if (!formData.pageStyle) newErrors.pageStyle = 'בחר אפשרות';
        if (!formData.logoStatus) newErrors.logoStatus = 'בחר אפשרות';
        break;
      case 7:
        if (formData.formFields.length === 0) newErrors.formFields = 'בחר לפחות שדה אחד';
        if (!formData.leadDestination) newErrors.leadDestination = 'בחר אפשרות';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      onComplete(formData);
    }
  };

  const progressPercent = (currentStep / 7) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <Label htmlFor="businessName" className="font-semibold">שם העסק / שם מותג *</Label>
              <Input id="businessName" value={formData.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} placeholder="לדוגמה: Perfect One" className={errors.businessName ? 'border-red-500' : ''} />
              {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
            </div>
            <div>
              <Label htmlFor="mainField" className="font-semibold">תחום עיסוק עיקרי *</Label>
              <Input id="mainField" value={formData.mainField} onChange={(e) => handleInputChange('mainField', e.target.value)} placeholder="לדוגמה: פתיחת עוסק פטור" className={errors.mainField ? 'border-red-500' : ''} />
              {errors.mainField && <p className="text-red-500 text-xs mt-1">{errors.mainField}</p>}
            </div>
            <div>
              <Label className="font-semibold mb-2 block">קהל יעד עיקרי *</Label>
              <div className="space-y-2">
                {['freelancers', 'smallBusinesses', 'privateClients'].map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox checked={formData.targetAudience.includes(option)} onCheckedChange={(checked) => handleCheckboxChange('targetAudience', option, checked)} />
                    <Label className="cursor-pointer">
                      {option === 'freelancers' && 'עצמאים'}
                      {option === 'smallBusinesses' && 'עסקים קטנים'}
                      {option === 'privateClients' && 'לקוחות פרטיים'}
                    </Label>
                  </div>
                ))}
                <div>
                  <Input placeholder="אחר (תיאור)" value={formData.targetAudienceOther} onChange={(e) => handleInputChange('targetAudienceOther', e.target.value)} />
                </div>
              </div>
              {errors.targetAudience && <p className="text-red-500 text-xs mt-1">{errors.targetAudience}</p>}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <Label htmlFor="painPoints" className="font-semibold">איזה בעיה/כאב הלקוח חווה? *</Label>
              <Textarea id="painPoints" value={formData.painPoints} onChange={(e) => handleInputChange('painPoints', e.target.value)} placeholder="לדוגמה: אין לו זמן, לא מבין, מפחד לטעות" rows={3} className={errors.painPoints ? 'border-red-500' : ''} />
              {errors.painPoints && <p className="text-red-500 text-xs mt-1">{errors.painPoints}</p>}
            </div>
            <div>
              <Label htmlFor="consequences" className="font-semibold">מה קורה אם הוא לא פותר את הבעיה? *</Label>
              <Textarea id="consequences" value={formData.consequences} onChange={(e) => handleInputChange('consequences', e.target.value)} placeholder="השלכות: כסף, זמן, תסכול, לחץ" rows={3} className={errors.consequences ? 'border-red-500' : ''} />
              {errors.consequences && <p className="text-red-500 text-xs mt-1">{errors.consequences}</p>}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <Label htmlFor="serviceOffered" className="font-semibold">מה השירות שאתה מציע? *</Label>
              <Textarea id="serviceOffered" value={formData.serviceOffered} onChange={(e) => handleInputChange('serviceOffered', e.target.value)} placeholder="תאר בקצרה את השירות" rows={3} className={errors.serviceOffered ? 'border-red-500' : ''} />
              {errors.serviceOffered && <p className="text-red-500 text-xs mt-1">{errors.serviceOffered}</p>}
            </div>
            <div>
              <Label className="font-semibold mb-2 block">למה לבחור בך? *</Label>
              <div className="space-y-2">
                {['price', 'experience', 'personalService', 'speed', 'simplicity'].map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox checked={formData.whyChooseYou.includes(option)} onCheckedChange={(checked) => handleCheckboxChange('whyChooseYou', option, checked)} />
                    <Label className="cursor-pointer">
                      {option === 'price' && 'מחיר'}
                      {option === 'experience' && 'ניסיון'}
                      {option === 'personalService' && 'שירות אישי'}
                      {option === 'speed' && 'מהירות'}
                      {option === 'simplicity' && 'פשטות'}
                    </Label>
                  </div>
                ))}
                <Input placeholder="אחר" value={formData.whyChooseYouOther} onChange={(e) => handleInputChange('whyChooseYouOther', e.target.value)} />
              </div>
              {errors.whyChooseYou && <p className="text-red-500 text-xs mt-1">{errors.whyChooseYou}</p>}
            </div>
            <div>
              <Label htmlFor="processSteps" className="font-semibold">איך נראה התהליך? *</Label>
              <Textarea id="processSteps" value={formData.processSteps} onChange={(e) => handleInputChange('processSteps', e.target.value)} placeholder="שלב 1 → שלב 2 → שלב 3" rows={2} className={errors.processSteps ? 'border-red-500' : ''} />
              {errors.processSteps && <p className="text-red-500 text-xs mt-1">{errors.processSteps}</p>}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <Label className="font-semibold">הוכחות ואמון</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox checked={formData.proofs.includes('experience')} onCheckedChange={(checked) => handleCheckboxChange('proofs', 'experience', checked)} />
                <Label className="cursor-pointer">ניסיון / ותק</Label>
              </div>
              {formData.proofs.includes('experience') && (
                <Input type="number" placeholder="כמה שנים?" value={formData.experienceYears} onChange={(e) => handleInputChange('experienceYears', e.target.value)} />
              )}
              <div className="flex items-center space-x-2">
                <Checkbox checked={formData.proofs.includes('clients')} onCheckedChange={(checked) => handleCheckboxChange('proofs', 'clients', checked)} />
                <Label className="cursor-pointer">לקוחות קיימים</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox checked={formData.proofs.includes('testimonial')} onCheckedChange={(checked) => handleCheckboxChange('proofs', 'testimonial', checked)} />
                <Label className="cursor-pointer">המלצה / ציטוט</Label>
              </div>
              {formData.proofs.includes('testimonial') && (
                <Textarea placeholder="כתוב הצעה או ציטוט" value={formData.testimonialText} onChange={(e) => handleInputChange('testimonialText', e.target.value)} rows={2} />
              )}
              <div className="flex items-center space-x-2">
                <Checkbox checked={formData.proofs.includes('guarantee')} onCheckedChange={(checked) => handleCheckboxChange('proofs', 'guarantee', checked)} />
                <Label className="cursor-pointer">אחריות / התחייבות</Label>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <Label className="font-semibold mb-2 block">מה הפעולה שרוצה מהגולש? *</Label>
              <RadioGroup value={formData.ctaType} onValueChange={(value) => handleInputChange('ctaType', value)} className={`space-y-2 ${errors.ctaType ? 'border border-red-500 p-3 rounded' : ''}`}>
                {[
                  { value: 'details', label: 'השארת פרטים' },
                  { value: 'whatsapp', label: 'פנייה לוואטסאפ' },
                  { value: 'phone', label: 'שיחה טלפונית' },
                  { value: 'meeting', label: 'קביעת פגישה' }
                ].map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.ctaType && <p className="text-red-500 text-xs mt-1">{errors.ctaType}</p>}
            </div>
            <div>
              <Label className="font-semibold mb-2 block">ניסוח הכפתור *</Label>
              <RadioGroup value={formData.ctaText} onValueChange={(value) => handleInputChange('ctaText', value)} className={`space-y-2 ${errors.ctaText ? 'border border-red-500 p-3 rounded' : ''}`}>
                {[
                  { value: 'check', label: '"בדיקה ללא התחייבות"' },
                  { value: 'consultation', label: '"שיחה ראשונית חינם"' },
                  { value: 'offer', label: '"קבל הצעה עכשיו"' }
                ].map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`cta-${option.value}`} />
                    <Label htmlFor={`cta-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.ctaText && <p className="text-red-500 text-xs mt-1">{errors.ctaText}</p>}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <Label className="font-semibold mb-2 block">סגנון הדף *</Label>
              <RadioGroup value={formData.pageStyle} onValueChange={(value) => handleInputChange('pageStyle', value)} className="space-y-2">
                {[
                  { value: 'professional', label: 'רציני / מקצועי' },
                  { value: 'simple', label: 'פשוט / בגובה העיניים' },
                  { value: 'energetic', label: 'צעיר / אנרגטי' },
                  { value: 'luxury', label: 'יוקרתי / פרימיום' }
                ].map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`style-${option.value}`} />
                    <Label htmlFor={`style-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="colors">צבעים מועדפים (אם יש)</Label>
              <Input id="colors" value={formData.preferredColors} onChange={(e) => handleInputChange('preferredColors', e.target.value)} placeholder="לדוגמה: כחול, לבן, זהב" />
            </div>
            <div>
              <Label className="font-semibold mb-2 block">לוגו *</Label>
              <RadioGroup value={formData.logoStatus} onValueChange={(value) => handleInputChange('logoStatus', value)} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="logo-yes" />
                  <Label htmlFor="logo-yes">כן, יש לי לוגו</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="logo-no" />
                  <Label htmlFor="logo-no">לא, צריך ליצור</Label>
                </div>
              </RadioGroup>
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <Label className="font-semibold mb-2 block">שדות בטופס *</Label>
              <div className="space-y-2">
                {['name', 'phone', 'email', 'message'].map(field => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox checked={formData.formFields.includes(field)} onCheckedChange={(checked) => handleCheckboxChange('formFields', field, checked)} />
                    <Label className="cursor-pointer">
                      {field === 'name' && 'שם'}
                      {field === 'phone' && 'טלפון'}
                      {field === 'email' && 'אימייל'}
                      {field === 'message' && 'הודעה חופשית'}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.formFields && <p className="text-red-500 text-xs mt-1">{errors.formFields}</p>}
            </div>
            <div>
              <Label className="font-semibold mb-2 block">היעד של הליד *</Label>
              <RadioGroup value={formData.leadDestination} onValueChange={(value) => handleInputChange('leadDestination', value)} className="space-y-2">
                {[
                  { value: 'whatsapp', label: 'וואטסאפ' },
                  { value: 'email', label: 'מייל' },
                  { value: 'crm', label: 'מערכת CRM' }
                ].map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`dest-${option.value}`} />
                    <Label htmlFor={`dest-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.leadDestination && <p className="text-red-500 text-xs mt-1">{errors.leadDestination}</p>}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl text-[#1E3A5F]">בניית דף נחיתה ממותג</CardTitle>
        <CardDescription>
          שלב {currentStep} מתוך 7
        </CardDescription>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
          <div 
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="flex justify-between pt-6 border-t">
            {currentStep > 1 && (
              <Button type="button" onClick={handlePrev} variant="outline" className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                הקודם
              </Button>
            )}
            <div className="flex-1" />
            {currentStep < 7 ? (
              <Button type="button" onClick={handleNext} className="flex items-center gap-2">
                הבא
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
                בנה את דף הנחיתה
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}