import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ChevronLeft, ChevronRight, X, Sparkles, Building2, 
  Target, AlertCircle, Zap, MessageSquare, Paintbrush, 
  Send, Users, Wallet, Briefcase, Clock, ThumbsUp, Check,
  Upload, Phone, Mail, Globe, Lock, CreditCard,
  FileText, Calendar, Layers
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Custom specialized card selector component for better UX
const SelectionCard = ({ selected, onClick, icon: Icon, title, description }) => (
  <div 
    onClick={onClick}
    className={cn(
      "cursor-pointer relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 h-full",
      selected 
        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20" 
        : "border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50"
    )}
  >
    {selected && (
      <div className="absolute top-2 left-2 bg-blue-500 rounded-full p-0.5">
        <Check className="w-2 h-2 text-white" />
      </div>
    )}
    <div className={cn(
      "p-2 rounded-lg flex-shrink-0",
      selected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
    )}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <div className={cn("font-bold text-sm leading-tight", selected ? "text-blue-900" : "text-gray-900")}>{title}</div>
      {description && <div className="text-[11px] text-gray-500 leading-tight mt-0.5 line-clamp-2">{description}</div>}
    </div>
  </div>
);

export default function LandingPageQuestionnaire({ onComplete, onClose, onSwitchToLogo }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  
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
    ctaTypes: [], // Changed from ctaType string to array
    ctaText: '',
    pageStyle: '',
    preferredColors: '',
    logoStatus: '',
    logoFile: null, // New: Store uploaded logo
    formFields: ['name', 'phone'],
    leadDestination: '',
    destinationPhone: '', // New
    destinationEmail: '', // New
  });

  const [errors, setErrors] = useState({});
  const [isBuilding, setIsBuilding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Scroll to top on step change for mobile
  useEffect(() => {
    const scrollArea = document.getElementById('questionnaire-scroll-area');
    if (scrollArea) scrollArea.scrollTop = 0;
  }, [currentStep]);

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
    if (errors[group]) setErrors(prev => ({ ...prev, [group]: '' }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    switch(step) {
      case 1:
        if (!formData.businessName.trim()) newErrors.businessName = 'נא להזין שם עסק';
        if (!formData.mainField.trim()) newErrors.mainField = 'נא להזין תחום עיסוק';
        if (formData.targetAudience.length === 0 && !formData.targetAudienceOther) newErrors.targetAudience = 'יש לבחור לפחות קהל יעד אחד';
        break;
      case 2:
        if (!formData.painPoints.trim()) newErrors.painPoints = 'זהו שדה קריטי להצלחת הדף';
        if (!formData.consequences.trim()) newErrors.consequences = 'חשוב להבין את הכאב של הלקוח';
        break;
      case 3:
        if (!formData.serviceOffered.trim()) newErrors.serviceOffered = 'נא לתאר את השירות';
        if (formData.whyChooseYou.length === 0 && !formData.whyChooseYouOther) newErrors.whyChooseYou = 'מה היתרון שלך?';
        if (!formData.processSteps.trim()) newErrors.processSteps = 'איך זה עובד?';
        break;
      case 5:
        if (formData.ctaTypes.length === 0) newErrors.ctaTypes = 'בחר לפחות דרך אחת ליצירת קשר';
        if (!formData.ctaText) newErrors.ctaText = 'מה כתוב על הכפתור?';
        break;
      case 6:
        if (!formData.pageStyle) newErrors.pageStyle = 'בחר סגנון עיצובי';
        if (!formData.logoStatus) newErrors.logoStatus = 'האם יש לוגו?';
        break;
      case 7:
        if (formData.formFields.length === 0) newErrors.formFields = 'איזה פרטים לקלוט?';
        if (!formData.leadDestination) newErrors.leadDestination = 'לאן לשלוח את הליד?';
        if (formData.leadDestination === 'whatsapp' && !formData.destinationPhone) newErrors.destinationPhone = 'נא להזין מספר טלפון';
        if (formData.leadDestination === 'email' && !formData.destinationEmail) newErrors.destinationEmail = 'נא להזין כתובת מייל';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logoFile: file, logoStatus: 'uploaded' }));
      // In a real app, we would upload this to storage here
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setIsBuilding(true);
      // Simulate building process
      setTimeout(() => {
        setIsBuilding(false);
        setShowSuccess(true);
      }, 2500);
    }
  };

  const handlePurchase = () => {
    // Navigate to checkout or show payment modal
    // For now, we simulate this
    window.location.href = '/Checkout?product=landing-page&price=499';
  };

  const progressPercent = (currentStep / totalSteps) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">נתחיל מהבסיס</h3>
              <p className="text-gray-500 text-xs">מי אתה ומי הקהל שלך?</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="businessName" className="text-xs font-semibold">שם העסק / מותג</Label>
                <Input 
                  id="businessName" 
                  value={formData.businessName} 
                  onChange={(e) => handleInputChange('businessName', e.target.value)} 
                  placeholder="לדוגמה: דיגיטל פרו" 
                  className={cn("h-10", errors.businessName && 'border-red-500 focus-visible:ring-red-500')} 
                  autoFocus
                />
                {errors.businessName && <p className="text-red-500 text-[10px] flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.businessName}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="mainField" className="text-xs font-semibold">תחום עיסוק</Label>
                <Input 
                  id="mainField" 
                  value={formData.mainField} 
                  onChange={(e) => handleInputChange('mainField', e.target.value)} 
                  placeholder="לדוגמה: שיווק דיגיטלי לעסקים קטנים" 
                  className={cn("h-10", errors.mainField && 'border-red-500 focus-visible:ring-red-500')} 
                />
              </div>

              <div className="space-y-2 pt-1">
                <Label className="block text-xs font-semibold">מי הקהל העיקרי שלך?</Label>
                <div className="grid grid-cols-2 gap-2">
                  <SelectionCard 
                    selected={formData.targetAudience.includes('freelancers')}
                    onClick={() => handleCheckboxChange('targetAudience', 'freelancers', !formData.targetAudience.includes('freelancers'))}
                    icon={Users}
                    title="עצמאים"
                    description="בעלי עסק יחיד"
                  />
                  <SelectionCard 
                    selected={formData.targetAudience.includes('smallBusinesses')}
                    onClick={() => handleCheckboxChange('targetAudience', 'smallBusinesses', !formData.targetAudience.includes('smallBusinesses'))}
                    icon={Building2}
                    title="עסקים"
                    description="חברות קטנות"
                  />
                  <SelectionCard 
                    selected={formData.targetAudience.includes('privateClients')}
                    onClick={() => handleCheckboxChange('targetAudience', 'privateClients', !formData.targetAudience.includes('privateClients'))}
                    icon={Target}
                    title="פרטיים"
                    description="B2C"
                  />
                  <div className="flex items-center px-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 h-full min-h-[60px]">
                     <Input 
                        placeholder="אחר..." 
                        value={formData.targetAudienceOther} 
                        onChange={(e) => handleInputChange('targetAudienceOther', e.target.value)} 
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-full text-sm"
                      />
                  </div>
                </div>
                {errors.targetAudience && <p className="text-red-500 text-[10px] mt-1">{errors.targetAudience}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">הכאב של הלקוח</h3>
              <p className="text-gray-500 text-xs">למה הוא צריך אותך?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="painPoints" className="text-sm font-semibold">מה הבעיה או הכאב שהלקוח חווה?</Label>
                <Textarea 
                  id="painPoints" 
                  value={formData.painPoints} 
                  onChange={(e) => handleInputChange('painPoints', e.target.value)} 
                  placeholder="לדוגמה: מבזבז המון זמן על בירוקרטיה..." 
                  className={cn("h-24 resize-none", errors.painPoints && 'border-red-500')} 
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="consequences" className="text-sm font-semibold">מה קורה אם הוא לא פותר את זה?</Label>
                <Textarea 
                  id="consequences" 
                  value={formData.consequences} 
                  onChange={(e) => handleInputChange('consequences', e.target.value)} 
                  placeholder="לדוגמה: מפסיד כסף, לחץ, מאבד לקוחות..." 
                  className={cn("h-24 resize-none", errors.consequences && 'border-red-500')} 
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">הפתרון שלך</h3>
              <p className="text-gray-500 text-xs">איך אתה עוזר לו?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="serviceOffered" className="text-xs font-semibold">מה השירות במשפט אחד?</Label>
                <Input 
                  id="serviceOffered" 
                  value={formData.serviceOffered} 
                  onChange={(e) => handleInputChange('serviceOffered', e.target.value)} 
                  placeholder="אני עוזר ל... לעשות... כדי ש..." 
                  className={cn("h-10", errors.serviceOffered && 'border-red-500')} 
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold">למה שיבחר דווקא בך?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'price', label: 'מחיר משתלם', icon: Wallet },
                    { id: 'experience', label: 'מקצועיות', icon: Briefcase },
                    { id: 'personalService', label: 'יחס אישי', icon: Users },
                    { id: 'speed', label: 'מהירות', icon: Clock },
                  ].map(item => (
                    <SelectionCard
                      key={item.id}
                      selected={formData.whyChooseYou.includes(item.id)}
                      onClick={() => handleCheckboxChange('whyChooseYou', item.id, !formData.whyChooseYou.includes(item.id))}
                      icon={item.icon}
                      title={item.label}
                    />
                  ))}
                </div>
                <Input 
                  placeholder="סיבה אחרת..." 
                  value={formData.whyChooseYouOther} 
                  onChange={(e) => handleInputChange('whyChooseYouOther', e.target.value)} 
                  className="bg-gray-50 h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="processSteps" className="text-xs font-semibold">איך זה עובד? (בקצרה)</Label>
                <Input 
                  id="processSteps" 
                  value={formData.processSteps} 
                  onChange={(e) => handleInputChange('processSteps', e.target.value)} 
                  placeholder="שלב 1 -> שלב 2 -> שלב 3" 
                  className={cn("h-10", errors.processSteps && 'border-red-500')} 
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
             <div className="text-center space-y-1 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ThumbsUp className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">הוכחות ואמון</h3>
              <p className="text-gray-500 text-xs">למה שיסמכו עליך?</p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <SelectionCard
                selected={formData.proofs.includes('experience')}
                onClick={() => handleCheckboxChange('proofs', 'experience', !formData.proofs.includes('experience'))}
                icon={Briefcase}
                title="ותק וניסיון"
                description="שנות פעילות ופרויקטים"
              />
              {formData.proofs.includes('experience') && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <Input 
                    type="number" 
                    placeholder="כמה שנות ניסיון?" 
                    value={formData.experienceYears} 
                    onChange={(e) => handleInputChange('experienceYears', e.target.value)} 
                    className="mr-10 w-[calc(100%-2.5rem)] h-9 text-sm"
                  />
                </motion.div>
              )}

              <SelectionCard
                selected={formData.proofs.includes('clients')}
                onClick={() => handleCheckboxChange('proofs', 'clients', !formData.proofs.includes('clients'))}
                icon={Users}
                title="לקוחות ממליצים"
                description="לוגואים או רשימה"
              />

              <SelectionCard
                selected={formData.proofs.includes('testimonial')}
                onClick={() => handleCheckboxChange('proofs', 'testimonial', !formData.proofs.includes('testimonial'))}
                icon={MessageSquare}
                title="ציטוט לקוח"
                description="המלצה מלקוח מרוצה"
              />
              {formData.proofs.includes('testimonial') && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <Textarea 
                    placeholder="כתוב כאן את ההמלצה..." 
                    value={formData.testimonialText} 
                    onChange={(e) => handleInputChange('testimonialText', e.target.value)} 
                    className="mr-10 w-[calc(100%-2.5rem)] min-h-[60px] text-sm"
                  />
                </motion.div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Send className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">הנעה לפעולה</h3>
              <p className="text-gray-500 text-xs">מה אנחנו רוצים שיקרה?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="block font-bold text-xs">מה הפעולה הרצויה? (ניתן לבחור כמה)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'details', label: 'השארת פרטים', desc: 'טופס לידים', icon: FileText },
                    { value: 'whatsapp', label: 'וואטסאפ', desc: 'פנייה ישירה', icon: MessageSquare },
                    { value: 'phone', label: 'שיחה', desc: 'חיוג מיידי', icon: Phone },
                    { value: 'meeting', label: 'פגישה', desc: 'יומן דיגיטלי', icon: Calendar }
                  ].map(option => (
                    <SelectionCard
                      key={option.value}
                      selected={formData.ctaTypes.includes(option.value)}
                      onClick={() => handleCheckboxChange('ctaTypes', option.value, !formData.ctaTypes.includes(option.value))}
                      icon={option.icon || Send}
                      title={option.label}
                      description={option.desc}
                    />
                  ))}
                </div>
                {errors.ctaTypes && <p className="text-red-500 text-[10px] mt-1">{errors.ctaTypes}</p>}
              </div>

              <div className="space-y-2">
                <Label className="block font-bold text-xs">מה כתוב על הכפתור?</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: 'check', label: 'בדיקה ללא התחייבות' },
                    { value: 'consultation', label: 'אני רוצה שיחת ייעוץ' },
                    { value: 'offer', label: 'קבלת הצעת מחיר' }
                  ].map(option => (
                     <div 
                      key={option.value}
                      onClick={() => handleInputChange('ctaText', option.value)}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all",
                        formData.ctaText === option.value ? "border-purple-500 bg-purple-50 text-purple-900" : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center bg-white", formData.ctaText === option.value ? "border-purple-500" : "border-gray-300")}>
                        {formData.ctaText === option.value && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                      </div>
                      <span className="font-medium text-xs">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Paintbrush className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">עיצוב וסגנון</h3>
              <p className="text-gray-500 text-xs">איך הדף יראה?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold">סגנון כללי</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'professional', label: 'מקצועי', color: 'bg-slate-100' },
                    { value: 'simple', label: 'נקי', color: 'bg-white border' },
                    { value: 'energetic', label: 'אנרגטי', color: 'bg-yellow-50' },
                    { value: 'luxury', label: 'יוקרתי', color: 'bg-zinc-900 text-white' }
                  ].map(option => (
                    <div 
                      key={option.value}
                      onClick={() => handleInputChange('pageStyle', option.value)}
                      className={cn(
                        "cursor-pointer p-3 rounded-xl border-2 text-center transition-all",
                        formData.pageStyle === option.value 
                          ? "border-pink-500 ring-1 ring-pink-500/20" 
                          : "border-gray-100 hover:border-pink-200"
                      )}
                    >
                      <div className={cn("w-full h-6 rounded-md mb-1.5 mx-auto", option.color)} />
                      <span className="text-xs font-bold">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-semibold">האם יש לך לוגו?</Label>
                <div className="grid grid-cols-1 gap-3">
                  {/* Option 1: Have Logo - Upload */}
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 transition-all text-center cursor-pointer relative",
                      formData.logoStatus === 'uploaded' ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-pink-400 hover:bg-pink-50"
                    )}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      {formData.logoStatus === 'uploaded' ? (
                        <>
                          <Check className="w-8 h-8 text-green-600" />
                          <span className="text-sm font-bold text-green-700">הלוגו נשמר בהצלחה!</span>
                          <span className="text-xs text-green-600">{formData.logoFile?.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm font-bold text-gray-700">יש לי לוגו - לחץ להעלאה</span>
                          <span className="text-xs text-gray-500">או גרור את הקובץ לכאן</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Option 2: Need Design */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600">אין לך לוגו? בחר אפשרות:</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onSwitchToLogo}
                        className="flex-1 py-3 px-2 bg-pink-600 text-white rounded-xl text-xs font-bold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Paintbrush className="w-3.5 h-3.5" />
                        עצב לוגו עכשיו
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('logoStatus', 'later')}
                        className={cn(
                          "flex-1 py-3 px-2 border rounded-xl text-xs font-bold transition-colors",
                          formData.logoStatus === 'later' 
                            ? "border-pink-600 bg-pink-50 text-pink-700" 
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        אעצב בהמשך
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">טאצ'ים אחרונים</h3>
              <p className="text-gray-500 text-xs">הגדרות טכניות</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="block font-bold text-xs">איזה שדות יהיו בטופס?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['name', 'phone', 'email', 'message'].map(field => (
                    <div 
                      key={field} 
                      onClick={() => handleCheckboxChange('formFields', field, !formData.formFields.includes(field))}
                      className={cn(
                        "cursor-pointer flex items-center gap-2 p-2.5 rounded-xl border transition-all",
                        formData.formFields.includes(field) ? "border-teal-500 bg-teal-50" : "border-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center bg-white",
                        formData.formFields.includes(field) ? "border-teal-500" : "border-gray-300"
                      )}>
                        {formData.formFields.includes(field) && <Check className="w-2.5 h-2.5 text-teal-600" />}
                      </div>
                      <span className="text-xs font-medium">
                        {field === 'name' && 'שם מלא'}
                        {field === 'phone' && 'טלפון'}
                        {field === 'email' && 'אימייל'}
                        {field === 'message' && 'הערות'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block font-bold text-xs">לאן הליד יגיע?</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: 'whatsapp', label: 'וואטסאפ שלי', icon: MessageSquare },
                    { value: 'email', label: 'מייל שלי', icon: Mail },
                    { value: 'crm', label: 'מערכת CRM', icon: Layers }
                  ].map(option => (
                    <div key={option.value} className="space-y-2">
                       <SelectionCard
                        selected={formData.leadDestination === option.value}
                        onClick={() => handleInputChange('leadDestination', option.value)}
                        icon={option.icon}
                        title={option.label}
                      />
                      
                      {/* Conditional Inputs */}
                      {formData.leadDestination === option.value && option.value === 'whatsapp' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }}
                          className="px-1"
                        >
                          <Label className="text-[10px] text-gray-500 mb-1 block">לאיזה מספר לשלוח את ההודעות?</Label>
                          <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                              placeholder="050-0000000"
                              value={formData.destinationPhone}
                              onChange={(e) => handleInputChange('destinationPhone', e.target.value)}
                              className="pr-9 h-10 bg-gray-50 border-teal-200 focus-visible:ring-teal-500"
                            />
                          </div>
                        </motion.div>
                      )}

                      {formData.leadDestination === option.value && option.value === 'email' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }}
                          className="px-1"
                        >
                           <Label className="text-[10px] text-gray-500 mb-1 block">לאיזה מייל לשלוח את הלידים?</Label>
                           <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                              placeholder="your@email.com"
                              value={formData.destinationEmail}
                              onChange={(e) => handleInputChange('destinationEmail', e.target.value)}
                              className="pr-9 h-10 bg-gray-50 border-teal-200 focus-visible:ring-teal-500"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex-none px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-blue-600">אשף בניית דף נחיתה</span>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300", 
                    i + 1 <= currentStep ? "bg-blue-600" : "bg-gray-200",
                    i + 1 === currentStep && "w-4"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-xs font-medium text-gray-500">
          {currentStep} / {totalSteps}
        </div>
      </div>

      {/* Main Content - Compact & Centered */}
      <div 
        id="questionnaire-scroll-area"
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8"
      >
        <div className="max-w-xl mx-auto min-h-full flex flex-col justify-center py-4">
          
          {isBuilding ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-blue-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">בונה את הדף שלך...</h3>
                <p className="text-gray-500 text-sm">הבינה המלאכותית מחברת את כל החלקים</p>
              </div>
            </div>
          ) : showSuccess ? (
             <div className="flex flex-col items-center justify-center text-center space-y-6 w-full animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-green-200">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900">הדף שלך מוכן! 🎉</h2>
                <p className="text-gray-600">הקמנו עבורך דף נחיתה ראשוני על בסיס התשובות שלך</p>
              </div>

              <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 text-left rtl:text-right overflow-hidden">
                  <div className="text-[10px] text-gray-400 font-medium">הקישור לדף שלך</div>
                  <div className="text-sm font-bold text-blue-600 truncate dir-ltr">
                    landing.bizpilot.co.il/{formData.businessName.replace(/\s+/g, '-').toLowerCase() || 'my-page'}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 mt-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">חבילת השקה מלאה 🚀</h3>
                        <p className="text-blue-100 text-sm opacity-90">דומיין אישי + אחסון + הסרת פרסומות</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold">
                        ₪499
                      </div>
                   </div>
                   
                   <Button 
                    onClick={handlePurchase}
                    className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold h-12 shadow-lg"
                   >
                     רכוש עכשיו והתחל למכור
                     <CreditCard className="w-4 h-4 mr-2" />
                   </Button>
                   <p className="text-center text-[10px] text-blue-200 mt-2 opacity-70">תשלום חד פעמי • חשבונית מס מיידית</p>
                </div>
              </div>

              <Button variant="ghost" onClick={() => onComplete(formData)} className="text-gray-400 hover:text-gray-600">
                דלג למרכז השליטה
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-full"
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </form>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex-none p-4 border-t border-gray-100 bg-white z-10 safe-area-bottom">
        <div className="max-w-2xl mx-auto flex justify-between gap-4">
          <Button
            type="button"
            onClick={handlePrev}
            variant="ghost"
            disabled={currentStep === 1}
            className={cn("transition-opacity", currentStep === 1 ? "opacity-0 pointer-events-none" : "opacity-100")}
          >
            <ChevronRight className="w-4 h-4 ml-2" />
            הקודם
          </Button>

          {currentStep < totalSteps ? (
            <Button 
              type="button" 
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px] shadow-lg shadow-blue-100"
            >
              הבא
              <ChevronLeft className="w-4 h-4 mr-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[120px] shadow-lg shadow-green-100"
            >
              סיים ובנה
              <Sparkles className="w-4 h-4 mr-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}