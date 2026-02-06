import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, ChevronRight, X, Sparkles, User, Briefcase, 
  Layout, Phone, Mail, Globe, Instagram, Facebook, 
  Image, Share2, Check, Smartphone, Link as LinkIcon, Users
} from 'lucide-react';
import { cn } from "@/lib/utils";
import BusinessCardPreview from './BusinessCardPreview';

// Custom specialized card selector component
const SelectionCard = ({ selected, onClick, icon: Icon, title, description, className }) => (
  <div 
    onClick={onClick}
    className={cn(
      "cursor-pointer relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 w-full",
      selected 
        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20" 
        : "border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50",
      className
    )}
  >
    {selected && (
      <div className="absolute top-1.5 left-1.5 bg-blue-500 rounded-full p-0.5">
        <Check className="w-1.5 h-1.5 text-white" />
      </div>
    )}
    <div className={cn(
      "p-1.5 rounded-lg flex-shrink-0",
      selected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
    )}>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div className="flex-1 min-w-0">
      <div className={cn("font-bold text-xs leading-tight", selected ? "text-blue-900" : "text-gray-900")}>{title}</div>
      {description && <div className="text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-1">{description}</div>}
    </div>
  </div>
);

const StepHeader = ({ icon: Icon, title, description, colorClass = "bg-blue-100 text-blue-600" }) => (
  <div className="flex items-center gap-3 mb-2 pb-2 border-b border-gray-100">
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <h3 className="text-sm font-bold text-gray-900 leading-tight">{title}</h3>
      <p className="text-[10px] text-gray-500 leading-tight">{description}</p>
    </div>
  </div>
);

export default function BusinessCardQuestionnaire({ onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    profession: '',
    // Step 2
    presentationStyle: '',
    service1: '',
    service2: '',
    service3: '',
    // Step 3
    phone: '',
    email: '',
    socialNetworks: [],
    // Step 4
    hasLogo: '',
    logoFile: null,
    preferredStyle: '',
    // Step 5
    primaryUsage: ''
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
    setFormData(prev => {
        const currentSelection = prev[group] || [];
        if (checked) {
            return { ...prev, [group]: [...currentSelection, value] };
        } else {
            return { ...prev, [group]: currentSelection.filter(item => item !== value) };
        }
    });
    if (errors[group]) setErrors(prev => ({ ...prev, [group]: '' }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logoFile: file, hasLogo: 'yes' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1 && !formData.fullName) newErrors.fullName = 'שדה חובה';
    // Add more validation if needed
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setIsBuilding(true);
      setTimeout(() => {
        setIsBuilding(false);
        setShowSuccess(true);
        // onComplete(formData);
      }, 2500);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Who are you
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={User} 
              title="מי אתה / העסק" 
              description="פרטים אישיים לכרטיס"
              colorClass="bg-blue-100 text-blue-600"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs font-semibold">שם מלא / שם העסק</Label>
                <Input 
                  id="fullName" 
                  value={formData.fullName} 
                  onChange={(e) => handleInputChange('fullName', e.target.value)} 
                  placeholder="כפי שיופיע בכרטיס" 
                  className={cn("h-9 text-xs", errors.fullName && "border-red-500")}
                  autoFocus
                />
                {errors.fullName && <p className="text-red-500 text-[10px]">{errors.fullName}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="profession" className="text-xs font-semibold">תחום עיסוק</Label>
                <Input 
                  id="profession" 
                  value={formData.profession} 
                  onChange={(e) => handleInputChange('profession', e.target.value)} 
                  placeholder="לדוגמה: יועץ משכנתאות, מעצבת גרפית..." 
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Card Content
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Layout} 
              title="מה יופיע בכרטיס" 
              description="תוכן הכרטיס"
              colorClass="bg-indigo-100 text-indigo-600"
            />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold">איך תרצה להציג את עצמך?</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'name_role', label: 'שם + תחום' },
                    { id: 'name_phrase', label: 'שם + משפט קצר' },
                    { id: 'you_decide', label: 'אתם תנסחו לי' },
                  ].map(option => (
                    <SelectionCard
                      key={option.id}
                      selected={formData.presentationStyle === option.id}
                      onClick={() => handleInputChange('presentationStyle', option.id)}
                      icon={User}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold">שירותים עיקריים (עד 3, בקצרה)</Label>
                <div className="space-y-2">
                    <Input 
                        value={formData.service1} 
                        onChange={(e) => handleInputChange('service1', e.target.value)} 
                        placeholder="שירות 1" 
                        className="h-9 text-xs"
                    />
                    <Input 
                        value={formData.service2} 
                        onChange={(e) => handleInputChange('service2', e.target.value)} 
                        placeholder="שירות 2" 
                        className="h-9 text-xs"
                    />
                    <Input 
                        value={formData.service3} 
                        onChange={(e) => handleInputChange('service3', e.target.value)} 
                        placeholder="שירות 3" 
                        className="h-9 text-xs"
                    />
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Contact Details
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Phone} 
              title="פרטי קשר" 
              description="איך יצרו איתך קשר?"
              colorClass="bg-green-100 text-green-600"
            />

            <div className="space-y-3">
                <div className="space-y-1">
                    <Label className="text-xs font-semibold">טלפון ליצירת קשר (כולל וואטסאפ)</Label>
                    <Input 
                        type="tel"
                        value={formData.phone} 
                        onChange={(e) => handleInputChange('phone', e.target.value)} 
                        placeholder="050-0000000" 
                        className="h-9 text-xs"
                    />
                </div>
                
                <div className="space-y-1">
                    <Label className="text-xs font-semibold">אימייל (אופציונלי)</Label>
                    <Input 
                        type="email"
                        value={formData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)} 
                        placeholder="example@mail.com" 
                        className="h-9 text-xs"
                    />
                </div>

                <div className="space-y-2 pt-1">
                    <Label className="text-xs font-semibold">רשתות חברתיות להצגה</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            {id: 'instagram', label: 'אינסטגרם', icon: Instagram},
                            {id: 'facebook', label: 'פייסבוק', icon: Facebook},
                            {id: 'website', label: 'אתר', icon: Globe},
                            {id: 'none', label: 'אין', icon: X},
                        ].map(option => (
                            <SelectionCard
                                key={option.id}
                                selected={formData.socialNetworks.includes(option.id)}
                                onClick={() => handleCheckboxChange('socialNetworks', option.id, !formData.socialNetworks.includes(option.id))}
                                icon={option.icon}
                                title={option.label}
                            />
                        ))}
                    </div>
                </div>
            </div>
          </div>
        );

      case 4: // Branding
        return (
           <div className="space-y-3">
            <StepHeader 
              icon={Image} 
              title="מיתוג" 
              description="עיצוב הכרטיס"
              colorClass="bg-purple-100 text-purple-600"
            />

             <div className="space-y-3">
                <div className="space-y-2">
                 <Label className="block text-xs font-semibold">יש לך לוגו / תמונה?</Label>
                  <div className="grid grid-cols-1 gap-2">
                     <div 
                        className={cn(
                          "cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all relative overflow-hidden",
                          formData.hasLogo === 'yes'
                            ? "border-purple-500 bg-purple-50" 
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                      >
                         <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex items-center gap-2">
                             <Image className={cn("w-4 h-4", formData.hasLogo === 'yes' ? "text-purple-600" : "text-gray-400")} />
                             <span className={cn("text-xs font-medium", formData.hasLogo === 'yes' ? "text-purple-900" : "text-gray-700")}>
                                 {formData.logoFile ? "כן (קובץ הועלה)" : "כן (לחץ להעלאה)"}
                             </span>
                        </div>
                        {formData.hasLogo === 'yes' && <Check className="w-4 h-4 text-purple-600" />}
                    </div>
                    
                     <SelectionCard
                      selected={formData.hasLogo === 'no'}
                      onClick={() => handleInputChange('hasLogo', 'no')}
                      icon={X}
                      title="לא – תבנו לי עיצוב נקי"
                    />
                  </div>
              </div>

               <div className="space-y-2">
                 <Label className="block text-xs font-semibold">סגנון מועדף</Label>
                  <div className="grid grid-cols-2 gap-2">
                   {[
                      {id: 'professional', label: 'מקצועי'},
                      {id: 'light', label: 'קליל'},
                      {id: 'warm', label: 'חמים'},
                      {id: 'you_decide', label: 'אתם תחליטו'},
                   ].map(option => (
                      <div 
                        key={option.id}
                        onClick={() => handleInputChange('preferredStyle', option.id)}
                        className={cn(
                          "cursor-pointer p-2 rounded-xl border text-center transition-all",
                          formData.preferredStyle === option.id 
                            ? "border-purple-500 bg-purple-50 text-purple-900 font-bold" 
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-xs">{option.label}</span>
                      </div>
                   ))}
                  </div>
              </div>
             </div>
           </div>
        );

      case 5: // Usage
        return (
           <div className="space-y-3">
            <StepHeader 
              icon={Share2} 
              title="שימוש ושיתוף" 
              description="איך תשתמש בכרטיס?"
              colorClass="bg-teal-100 text-teal-600"
            />

            <div className="space-y-3">
                 <div className="space-y-2">
                 <Label className="block text-xs font-semibold">איך תשתמש בעיקר בכרטיס?</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                        {id: 'whatsapp', label: 'שיתוף בוואטסאפ', icon: Smartphone},
                        {id: 'profile_link', label: 'קישור בפרופיל', icon: LinkIcon},
                        {id: 'meetings', label: 'פגישות / נטוורקינג', icon: Users},
                        {id: 'all', label: 'הכל', icon: Check},
                    ].map(option => (
                        <SelectionCard 
                            key={option.id}
                            selected={formData.primaryUsage === option.id}
                            onClick={() => handleInputChange('primaryUsage', option.id)}
                            icon={option.icon}
                            title={option.label}
                        />
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
            <span className="text-xs font-semibold text-blue-600">כרטיס ביקור דיגיטלי</span>
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
        className="flex-1 overflow-y-auto overflow-x-hidden p-4"
      >
        <div className="max-w-xl mx-auto min-h-full flex flex-col justify-start pt-2">
          
          {isBuilding ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 mt-10">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-blue-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">מכין את הכרטיס שלך...</h3>
                <p className="text-gray-500 text-sm">הבינה המלאכותית מרכיבה כרטיס ביקור מנצח</p>
              </div>
            </div>
          ) : showSuccess ? (
            <BusinessCardPreview 
              data={formData}
              onPurchase={() => onComplete({ ...formData, action: 'purchase' })}
              onBack={() => onComplete(formData)}
            />
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
      {!isBuilding && !showSuccess && (
        <div className="flex-none p-4 border-t border-gray-100 bg-white z-10 safe-area-bottom">
          <div className="max-w-2xl mx-auto flex justify-between gap-4">
            <Button
              type="button"
              onClick={handlePrev}
              variant="ghost"
              disabled={currentStep === 1}
              className={cn("transition-opacity text-xs h-9", currentStep === 1 ? "opacity-0 pointer-events-none" : "opacity-100")}
            >
              <ChevronRight className="w-4 h-4 ml-2" />
              הקודם
            </Button>

            {currentStep < totalSteps ? (
              <Button 
                type="button" 
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px] shadow-lg shadow-blue-100 h-9 text-xs"
              >
                הבא
                <ChevronLeft className="w-4 h-4 mr-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white min-w-[100px] shadow-lg shadow-green-100 h-9 text-xs"
              >
                צור כרטיס
                <Sparkles className="w-4 h-4 mr-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}