import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, ChevronRight, X, Sparkles, Building2, Users, 
  FileText, List, Palette, Repeat, Check, Briefcase, 
  Mail, Printer, MessageCircle, Star, Target, LayoutTemplate,
  PaintBucket, FileCheck
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Custom specialized card selector component
const SelectionCard = ({ selected, onClick, icon: Icon, title, description, className }) => (
  <div 
    onClick={onClick}
    className={cn(
      "cursor-pointer relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 w-full",
      selected 
        ? "border-amber-500 bg-amber-50/50 ring-1 ring-amber-500/20" 
        : "border-gray-200 bg-white hover:border-amber-200 hover:bg-gray-50",
      className
    )}
  >
    {selected && (
      <div className="absolute top-1.5 left-1.5 bg-amber-500 rounded-full p-0.5">
        <Check className="w-1.5 h-1.5 text-white" />
      </div>
    )}
    <div className={cn(
      "p-1.5 rounded-lg flex-shrink-0",
      selected ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"
    )}>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div className="flex-1 min-w-0">
      <div className={cn("font-bold text-xs leading-tight", selected ? "text-amber-900" : "text-gray-900")}>{title}</div>
      {description && <div className="text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-1">{description}</div>}
    </div>
  </div>
);

const StepHeader = ({ icon: Icon, title, description, colorClass = "bg-amber-100 text-amber-600" }) => (
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

export default function ProposalQuestionnaire({ onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  const [formData, setFormData] = useState({
    // Step 1
    businessName: '',
    field: '',
    // Step 2
    targetAudience: '',
    sendMethod: [],
    // Step 3
    salesStyle: '',
    keyMessage: '',
    // Step 4
    serviceStructure: '',
    hasCTA: '',
    // Step 5
    hasLogo: '',
    logoFile: null,
    colorPreference: '',
    // Step 6
    reusability: '',
    format: ''
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
        if (value === 'all') {
             // If 'all' is selected, clear others or set all (logic depends, here just set 'all')
             return { ...prev, [group]: checked ? ['all'] : [] };
        }

        // If 'all' was previously selected and now we select something else, remove 'all'
        let newSelection = currentSelection.filter(item => item !== 'all');
        
        if (checked) {
            newSelection = [...newSelection, value];
        } else {
            newSelection = newSelection.filter(item => item !== value);
        }
        return { ...prev, [group]: newSelection };
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
    if (step === 1) {
        if (!formData.businessName) newErrors.businessName = 'שדה חובה';
        if (!formData.field) newErrors.field = 'שדה חובה';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setIsBuilding(true);
      setTimeout(() => {
        setIsBuilding(false);
        setShowSuccess(true);
      }, 2500);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Business Details
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Building2} 
              title="פרטי העסק" 
              description="מי השולח?"
              colorClass="bg-amber-100 text-amber-600"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="businessName" className="text-xs font-semibold">שם העסק / השם שיופיע במסמך</Label>
                <Input 
                  id="businessName" 
                  value={formData.businessName} 
                  onChange={(e) => handleInputChange('businessName', e.target.value)} 
                  placeholder="לדוגמה: כהן שירותי יעוץ" 
                  className={cn("h-10 text-base sm:text-sm", errors.businessName && "border-red-500")}
                />
                {errors.businessName && <p className="text-red-500 text-[10px]">{errors.businessName}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="field" className="text-xs font-semibold">תחום עיסוק</Label>
                <Input 
                  id="field" 
                  value={formData.field} 
                  onChange={(e) => handleInputChange('field', e.target.value)} 
                  placeholder="לדוגמה: שיווק דיגיטלי, שיפוצים..." 
                  className={cn("h-10 text-base sm:text-sm", errors.field && "border-red-500")}
                />
                {errors.field && <p className="text-red-500 text-[10px]">{errors.field}</p>}
              </div>
            </div>
          </div>
        );

      case 2: // Target Audience
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Users} 
              title="למי ההצעה מיועדת" 
              description="קהל היעד ואופן השליחה"
              colorClass="bg-blue-100 text-blue-600"
            />

            <div className="space-y-3">
              <div className="space-y-2">
                 <Label className="block text-xs font-semibold">למי בדרך כלל מיועדת הצעת המחיר?</Label>
                  <div className="grid grid-cols-3 gap-2">
                   {[
                      {id: 'private', label: 'לקוחות פרטיים'},
                      {id: 'business', label: 'עסקים'},
                      {id: 'both', label: 'גם וגם'},
                   ].map(option => (
                      <div 
                        key={option.id}
                        onClick={() => handleInputChange('targetAudience', option.id)}
                        className={cn(
                          "cursor-pointer p-2 rounded-xl border text-center transition-all flex items-center justify-center h-12",
                          formData.targetAudience === option.id 
                            ? "border-amber-500 bg-amber-50 text-amber-900 font-bold" 
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-xs leading-tight">{option.label}</span>
                      </div>
                   ))}
                  </div>
              </div>

              <div className="space-y-2">
                 <Label className="block text-xs font-semibold">איך ההצעה נשלחת לרוב?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                        {id: 'email', label: 'PDF במייל', icon: Mail},
                        {id: 'whatsapp', label: 'וואטסאפ', icon: MessageCircle},
                        {id: 'print', label: 'הדפסה', icon: Printer},
                        {id: 'all', label: 'הכל', icon: Check},
                    ].map(option => (
                        <SelectionCard 
                            key={option.id}
                            selected={formData.sendMethod.includes(option.id)}
                            onClick={() => handleCheckboxChange('sendMethod', option.id, !formData.sendMethod.includes(option.id))}
                            icon={option.icon}
                            title={option.label}
                        />
                    ))}
                  </div>
              </div>
            </div>
          </div>
        );

      case 3: // Sales Structure
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={FileText} 
              title="מבנה המכירה" 
              description="הלב של המסמך"
              colorClass="bg-purple-100 text-purple-600"
            />

            <div className="space-y-3">
               <div className="space-y-2">
                 <Label className="block text-xs font-semibold">איזה סגנון מכירה מתאים לך יותר?</Label>
                  <div className="grid grid-cols-1 gap-2">
                   {[
                      {id: 'professional', label: 'ענייני ומקצועי', icon: Briefcase},
                      {id: 'persuasive', label: 'משכנע ושיווקי', icon: Star},
                      {id: 'concise', label: 'קצר ולעניין', icon: FileText},
                      {id: 'smart', label: 'אתם תבנו לי מבנה שמוכר', icon: Sparkles},
                   ].map(option => (
                      <SelectionCard 
                        key={option.id}
                        selected={formData.salesStyle === option.id}
                        onClick={() => handleInputChange('salesStyle', option.id)}
                        icon={option.icon}
                        title={option.label}
                      />
                   ))}
                  </div>
              </div>

               <div className="space-y-2">
                 <Label className="block text-xs font-semibold">מה הכי חשוב לך שהלקוח יבין מההצעה?</Label>
                  <div className="grid grid-cols-2 gap-2">
                   {[
                      {id: 'value', label: 'הערך שאני נותן'},
                      {id: 'why_me', label: 'למה לבחור בי'},
                      {id: 'clarity', label: 'הבהירות והסדר'},
                      {id: 'confidence', label: 'הביטחון בהחלטה'},
                   ].map(option => (
                      <div 
                        key={option.id}
                        onClick={() => handleInputChange('keyMessage', option.id)}
                        className={cn(
                          "cursor-pointer p-2 rounded-xl border text-center transition-all flex items-center justify-center h-12",
                          formData.keyMessage === option.id 
                            ? "border-amber-500 bg-amber-50 text-amber-900 font-bold" 
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-xs leading-tight">{option.label}</span>
                      </div>
                   ))}
                  </div>
              </div>
            </div>
          </div>
        );

      case 4: // Content
        return (
           <div className="space-y-3">
            <StepHeader 
              icon={List} 
              title="תוכן ההצעה" 
              description="איך מציגים את השירות?"
              colorClass="bg-green-100 text-green-600"
            />

             <div className="space-y-3">
                <div className="space-y-2">
                 <Label className="block text-xs font-semibold">איך אתה מציג שירותים היום?</Label>
                  <div className="grid grid-cols-1 gap-2">
                   {[
                      {id: 'single', label: 'שירות אחד מרכזי'},
                      {id: 'packages', label: 'כמה חבילות'},
                      {id: 'custom', label: 'לפי צורך / התאמה אישית'},
                   ].map(option => (
                      <SelectionCard
                        key={option.id}
                        selected={formData.serviceStructure === option.id}
                        onClick={() => handleInputChange('serviceStructure', option.id)}
                        icon={Target}
                        title={option.label}
                      />
                   ))}
                  </div>
              </div>

               <div className="space-y-2">
                 <Label className="block text-xs font-semibold">האם תרצה מקום קבוע ל־CTA?</Label>
                  <div className="grid grid-cols-3 gap-2">
                   {[
                      {id: 'yes', label: 'כן'},
                      {id: 'no', label: 'לא משנה'},
                      {id: 'decide', label: 'אתם תחליטו'},
                   ].map(option => (
                      <div 
                        key={option.id}
                        onClick={() => handleInputChange('hasCTA', option.id)}
                        className={cn(
                          "cursor-pointer p-2 rounded-xl border text-center transition-all flex items-center justify-center h-10",
                          formData.hasCTA === option.id 
                            ? "border-amber-500 bg-amber-50 text-amber-900 font-bold" 
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-xs leading-tight">{option.label}</span>
                      </div>
                   ))}
                  </div>
              </div>
             </div>
           </div>
        );

      case 5: // Branding
        return (
           <div className="space-y-3">
            <StepHeader 
              icon={Palette} 
              title="מיתוג ועיצוב" 
              description="נראות ההצעה"
              colorClass="bg-pink-100 text-pink-600"
            />

             <div className="space-y-3">
                <div className="space-y-2">
                 <Label className="block text-xs font-semibold">יש לך לוגו?</Label>
                  <div className="grid grid-cols-1 gap-2">
                     <div 
                        className={cn(
                          "cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all relative overflow-hidden",
                          formData.hasLogo === 'yes'
                            ? "border-amber-500 bg-amber-50" 
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
                             <LayoutTemplate className={cn("w-4 h-4", formData.hasLogo === 'yes' ? "text-amber-600" : "text-gray-400")} />
                             <span className={cn("text-xs font-medium", formData.hasLogo === 'yes' ? "text-amber-900" : "text-gray-700")}>
                                 {formData.logoFile ? "כן (לוגו הועלה)" : "כן (לחץ להעלאה)"}
                             </span>
                        </div>
                        {formData.hasLogo === 'yes' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>

                    <SelectionCard
                      selected={formData.hasLogo === 'no'}
                      onClick={() => handleInputChange('hasLogo', 'no')}
                      icon={Sparkles}
                      title="לא – תבנו לי עיצוב נקי"
                    />
                  </div>
              </div>

               <div className="space-y-2">
                 <Label className="block text-xs font-semibold">צבעים מועדפים</Label>
                  <div className="grid grid-cols-1 gap-2">
                   {[
                      {id: 'fixed', label: 'יש צבעים קבועים'},
                      {id: 'open', label: 'פתוח להצעה'},
                      {id: 'clean', label: 'עדיף נקי ושקט'},
                   ].map(option => (
                      <SelectionCard
                        key={option.id}
                        selected={formData.colorPreference === option.id}
                        onClick={() => handleInputChange('colorPreference', option.id)}
                        icon={PaintBucket}
                        title={option.label}
                      />
                   ))}
                  </div>
              </div>
             </div>
           </div>
        );

      case 6: // Future Use
        return (
           <div className="space-y-3">
            <StepHeader 
              icon={Repeat} 
              title="שימוש עתידי" 
              description="שימושיות"
              colorClass="bg-indigo-100 text-indigo-600"
            />

            <div className="space-y-3">
                 <div className="space-y-2">
                 <Label className="block text-xs font-semibold">האם חשוב לך שהתבנית תהיה קלה לשימוש חוזר?</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                        {id: 'yes', label: 'כן, שאוכל למלא לבד'},
                        {id: 'no', label: 'לא משנה'},
                        {id: 'important', label: 'חשוב מאוד'},
                    ].map(option => (
                        <SelectionCard 
                            key={option.id}
                            selected={formData.reusability === option.id}
                            onClick={() => handleInputChange('reusability', option.id)}
                            icon={Repeat}
                            title={option.label}
                        />
                    ))}
                  </div>
              </div>

              <div className="space-y-2">
                 <Label className="block text-xs font-semibold">באיזה פורמט תרצה לקבל?</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                        {id: 'pdf', label: 'PDF מוכן'},
                        {id: 'template', label: 'תבנית לעריכה + PDF'},
                        {id: 'decide', label: 'אתם תחליטו'},
                    ].map(option => (
                        <SelectionCard 
                            key={option.id}
                            selected={formData.format === option.id}
                            onClick={() => handleInputChange('format', option.id)}
                            icon={FileCheck}
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
            <span className="text-xs font-semibold text-amber-600">הצעת מחיר ממותג</span>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300", 
                    i + 1 <= currentStep ? "bg-amber-600" : "bg-gray-200",
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
                <div className="absolute inset-0 border-4 border-amber-600 rounded-full border-t-transparent animate-spin"></div>
                <FileText className="absolute inset-0 m-auto text-amber-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">בונה את הצעת המחיר...</h3>
                <p className="text-gray-500 text-sm">מעצב מבנה שמוכר</p>
              </div>
            </div>
          ) : showSuccess ? (
             <div className="flex flex-col items-center justify-center text-center space-y-6 w-full animate-in fade-in zoom-in duration-500 mt-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-green-200">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900">הצעת המחיר מוכנה! 🎉</h2>
                <div className="text-gray-600 text-sm max-w-xs mx-auto space-y-1">
                    <p>הצעת מחיר ממותגת,</p>
                    <p>עם מבנה שמוכר ולא רק מציג מספרים,</p>
                    <p>מוכנה לשליחה או הדפסה ב־PDF.</p>
                </div>
              </div>

               <Button 
                onClick={() => onComplete(formData)}
                className="bg-amber-600 hover:bg-amber-700 text-white min-w-[200px] shadow-lg shadow-amber-100 mt-4"
              >
                חזרה למרכז השליטה
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
                className="bg-amber-600 hover:bg-amber-700 text-white min-w-[100px] shadow-lg shadow-amber-100 h-9 text-xs"
              >
                הבא
                <ChevronLeft className="w-4 h-4 mr-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white min-w-[100px] shadow-lg shadow-green-100 h-9 text-xs"
              >
                צור הצעה
                <Sparkles className="w-4 h-4 mr-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}