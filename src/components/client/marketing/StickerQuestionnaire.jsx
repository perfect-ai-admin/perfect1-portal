import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, ChevronRight, X, Sparkles, Building2, 
  Target, AlertCircle, Zap, MessageSquare, Paintbrush, 
  Send, Users, Wallet, Briefcase, Clock, ThumbsUp, Check,
  Upload, Phone, Mail, Globe, Lock, CreditCard,
  FileText, Calendar, Layers, Share2, Sticker, Smile, Shield, Download, ExternalLink
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Custom specialized card selector component for better UX
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

export default function StickerQuestionnaire({ onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  const [formData, setFormData] = useState({
    businessName: '',
    field: '',
    targetAudience: '',
    
    purposes: [],
    platforms: [],
    
    style: '',
    hasText: '',
    textType: '',
    
    language: '',
    vibe: '',
    
    hasLogo: '',
    colors: '',
    logoFile: null,
    
    exampleSentence: '',
    excludeText: ''
  });

  const [errors, setErrors] = useState({});
  const [isBuilding, setIsBuilding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedStickerUrl, setGeneratedStickerUrl] = useState(null);
  const [aiBrief, setAiBrief] = useState(null);
  const [aiPrompt, setAiPrompt] = useState(null);

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

  const handleCheckboxChange = (group, value, checked, maxSelect = null) => {
    setFormData(prev => {
        const currentSelection = prev[group] || [];
        
        if (checked) {
            // Check max selection limit
            if (maxSelect && currentSelection.length >= maxSelect) {
                return prev;
            }
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
    // Validation logic can be added here if strictly required
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setIsBuilding(true);
      
      try {
        let finalFormData = { ...formData };

        // 1. Upload Logo if exists
        if (formData.logoFile) {
            try {
                toast.info('מעלה את הלוגו שלך...');
                const { file_url } = await base44.integrations.Core.UploadFile({ file: formData.logoFile });
                finalFormData.logoUrl = file_url;
                delete finalFormData.logoFile; // Don't send the blob
            } catch (uploadError) {
                console.error('Logo upload failed:', uploadError);
                toast.warning('לא הצלחנו להעלות את הלוגו, ממשיכים בלי...');
            }
        }

        console.log('Sending sticker request with data:', finalFormData);

        const response = await base44.functions.invoke('generateSticker', { 
            formData: finalFormData,
            width: 1024,
            height: 1024
        });

        if (response.data && response.data.ok) {
            setGeneratedStickerUrl(response.data.image_url);
            setAiBrief(response.data.ai_brief);
            setAiPrompt(response.data.used_prompt);
            
            // Console log for transparency as requested
            console.log('🔵 AI Product Brief (Hebrew):', response.data.ai_brief);
            console.log('🔵 Generated Prompt (English):', response.data.used_prompt);
            
            setShowSuccess(true);
            toast.success('הסטיקר נוצר בהצלחה!');
        } else {
            console.error('Sticker generation failed:', response.data);
            toast.error('שגיאה ביצירת הסטיקר. נסה שנית.');
        }

      } catch (error) {
        console.error('Error generating sticker:', error);
        // Show detailed error if available
        const msg = error.response?.data?.error || error.response?.data?.message || 'שגיאה בתקשורת עם השרת';
        toast.error(msg);
      } finally {
        setIsBuilding(false);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Basic Details
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Building2} 
              title="פרטי בסיס" 
              description="זיהוי העסק"
              colorClass="bg-blue-100 text-blue-600"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="businessName" className="text-xs font-semibold">שם העסק / השם שיופיע בסטיקר</Label>
                <Input 
                  id="businessName" 
                  value={formData.businessName} 
                  onChange={(e) => handleInputChange('businessName', e.target.value)} 
                  placeholder="הזן טקסט חופשי..." 
                  className="h-9 text-xs"
                  autoFocus
                />
              </div>

              <div className="space-y-2 pt-1">
                <Label className="block text-xs font-semibold">תחום עיסוק</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                      {id: 'service', label: 'נותן שירות', icon: Briefcase},
                      {id: 'shop', label: 'חנות / מכירה', icon: Wallet},
                      {id: 'digital', label: 'דיגיטל / אונליין', icon: Globe},
                      {id: 'therapy', label: 'טיפול / אימון', icon: Users},
                      {id: 'other', label: 'אחר', icon: Layers},
                  ].map(option => (
                      <SelectionCard 
                        key={option.id}
                        selected={formData.field === option.id}
                        onClick={() => handleInputChange('field', option.id)}
                        icon={option.icon}
                        title={option.label}
                      />
                  ))}
                </div>
              </div>

               <div className="space-y-2 pt-1">
                <Label className="block text-xs font-semibold">קהל היעד העיקרי שלך</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                      {id: 'private', label: 'פרטיים', icon: Users},
                      {id: 'business', label: 'עסקים', icon: Building2},
                      {id: 'both', label: 'גם וגם', icon: Layers},
                  ].map(option => (
                      <SelectionCard 
                        key={option.id}
                        selected={formData.targetAudience === option.id}
                        onClick={() => handleInputChange('targetAudience', option.id)}
                        icon={option.icon}
                        title={option.label}
                      />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Purpose
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Target} 
              title="מטרת הסטיקר" 
              description="הכי חשוב"
              colorClass="bg-red-100 text-red-600"
            />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold">למה ישמש הסטיקר? (עד 2)</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'closing', label: 'סגירת עסקה / תיאום', icon: Check },
                    { id: 'service', label: 'שירות לקוחות', icon: Users },
                    { id: 'branding', label: 'מיתוג ונוכחות', icon: Shield },
                    { id: 'quick', label: 'תגובה מהירה בוואטסאפ', icon: Zap },
                    { id: 'fun', label: 'משהו קליל / הומוריסטי', icon: Smile },
                  ].map(option => (
                    <SelectionCard
                      key={option.id}
                      selected={formData.purposes.includes(option.id)}
                      onClick={() => handleCheckboxChange('purposes', option.id, !formData.purposes.includes(option.id), 2)}
                      icon={option.icon}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold">איפה תשתמש בו בעיקר?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'whatsapp', label: 'וואטסאפ', icon: MessageSquare },
                    { id: 'instagram', label: 'אינסטגרם', icon: Layers },
                    { id: 'telegram', label: 'טלגרם', icon: Send },
                    { id: 'all', label: 'הכל', icon: Globe },
                  ].map(option => (
                    <SelectionCard
                      key={option.id}
                      selected={formData.platforms.includes(option.id)}
                      onClick={() => handleCheckboxChange('platforms', option.id, !formData.platforms.includes(option.id))}
                      icon={option.icon}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Style & Language
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Paintbrush} 
              title="סגנון ושפה" 
              description="האופי של הסטיקר"
              colorClass="bg-purple-100 text-purple-600"
            />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold">איזה סגנון הכי מתאים לך?</Label>
                 <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'professional', label: 'מקצועי', icon: Briefcase },
                    { id: 'light', label: 'קליל', icon: Smile },
                    { id: 'warm', label: 'חמים', icon: Users },
                    { id: 'sharp', label: 'חד / אסרטיבי', icon: Zap },
                    { id: 'humorous', label: 'הומוריסטי', icon: Smile },
                  ].map(option => (
                    <SelectionCard
                      key={option.id}
                      selected={formData.style === option.id}
                      onClick={() => handleInputChange('style', option.id)}
                      icon={option.icon}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                 <Label className="block text-xs font-semibold">האם אתה רוצה טקסט בסטיקר?</Label>
                  <div className="grid grid-cols-3 gap-2">
                   {[
                      {id: 'yes', label: 'כן'},
                      {id: 'no', label: 'לא'},
                      {id: 'combined', label: 'טקסט + אייקון'},
                   ].map(option => (
                       <div 
                        key={option.id}
                        onClick={() => handleInputChange('hasText', option.id)}
                        className={cn(
                          "cursor-pointer p-2 rounded-xl border text-center transition-all",
                          formData.hasText === option.id 
                            ? "border-purple-500 bg-purple-50 text-purple-900 font-bold" 
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-xs">{option.label}</span>
                      </div>
                   ))}
                  </div>
              </div>

              <AnimatePresence>
                {(formData.hasText === 'yes' || formData.hasText === 'combined') && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                    >
                        <Label className="block text-xs font-semibold">איזה סוג טקסט אתה מעדיף?</Label>
                         <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: 'short', label: 'קצר וברור', desc: 'לדוגמה: "סגור", "מעולה"' },
                            { id: 'marketing', label: 'שיווקי', desc: 'לדוגמה: "יאללה מתקדמים"' },
                            { id: 'service', label: 'שירותי', desc: 'לדוגמה: "בודק וחוזר אליך"' },
                            { id: 'you_decide', label: 'אתם תחליטו בשבילי', desc: '' },
                            ].map(option => (
                            <SelectionCard
                              key={option.id}
                              selected={formData.textType === option.id}
                              onClick={() => handleInputChange('textType', option.id)}
                              icon={FileText}
                              title={option.label}
                              description={option.desc}
                            />
                          ))}
                        </div>
                        {formData.hasText !== 'no' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-[11px] text-yellow-800 flex items-start gap-2 mt-2">
                                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>שים לב: אם תבחר טקסט בעברית, המערכת תיצור מקום/בועה לטקסט, אך הטקסט עצמו יוסף ידנית על ידך (בינה מלאכותית עדיין מתקשה עם עברית).</span>
                            </div>
                        )}
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );

      case 4: // Language & Vibe
        return (
           <div className="space-y-3">
            <StepHeader 
              icon={MessageSquare} 
              title="שפה ותחושה" 
              description="איך זה ירגיש?"
              colorClass="bg-teal-100 text-teal-600"
            />

             <div className="space-y-3">
                <div className="space-y-2">
                 <Label className="block text-xs font-semibold">שפת הסטיקר</Label>
                  <div className="grid grid-cols-3 gap-2">
                   {[
                      {id: 'hebrew', label: 'עברית'},
                      {id: 'hebrew_english', label: 'עברית + אנגלית'},
                      {id: 'english', label: 'אנגלית'},
                   ].map(option => (
                       <div 
                        key={option.id}
                        onClick={() => handleInputChange('language', option.id)}
                        className={cn(
                          "cursor-pointer p-2 rounded-xl border text-center transition-all",
                          formData.language === option.id 
                            ? "border-teal-500 bg-teal-50 text-teal-900 font-bold" 
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-xs">{option.label}</span>
                      </div>
                   ))}
                  </div>
              </div>

               <div className="space-y-2">
                 <Label className="block text-xs font-semibold">איך היית רוצה שהלקוח ירגיש?</Label>
                  <div className="grid grid-cols-2 gap-2">
                   {[
                      {id: 'confidence', label: 'ביטחון', icon: Shield},
                      {id: 'comfort', label: 'נוחות', icon: Smile},
                      {id: 'smile', label: 'חיוך', icon: Smile},
                      {id: 'serious', label: 'רצינות', icon: Briefcase},
                      {id: 'trust', label: 'יש על מי לסמוך', icon: Check},
                   ].map(option => (
                      <SelectionCard
                          key={option.id}
                          selected={formData.vibe === option.id}
                          onClick={() => handleInputChange('vibe', option.id)}
                          icon={option.icon}
                          title={option.label}
                        />
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
              icon={Shield} 
              title="מיתוג" 
              description="אם קיים"
              colorClass="bg-indigo-100 text-indigo-600"
            />

            <div className="space-y-3">
                 <div className="space-y-2">
                 <Label className="block text-xs font-semibold">יש לך לוגו?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div 
                        className={cn(
                          "cursor-pointer p-4 rounded-xl border text-center transition-all relative overflow-hidden",
                          formData.hasLogo === 'yes'
                            ? "border-indigo-500 bg-indigo-50" 
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                      >
                         <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-1">
                             <Upload className={cn("w-5 h-5", formData.hasLogo === 'yes' ? "text-indigo-600" : "text-gray-400")} />
                             <span className={cn("text-xs font-medium", formData.hasLogo === 'yes' ? "text-indigo-900" : "text-gray-700")}>
                                 {formData.logoFile ? "לוגו נבחר" : "כן (אעלה קובץ)"}
                             </span>
                        </div>
                    </div>

                    <div 
                        onClick={() => handleInputChange('hasLogo', 'no')}
                        className={cn(
                          "cursor-pointer p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1",
                          formData.hasLogo === 'no'
                            ? "border-indigo-500 bg-indigo-50" 
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                      >
                         <X className={cn("w-5 h-5", formData.hasLogo === 'no' ? "text-indigo-600" : "text-gray-400")} />
                         <span className={cn("text-xs font-medium", formData.hasLogo === 'no' ? "text-indigo-900" : "text-gray-700")}>לא</span>
                    </div>
                  </div>
              </div>

               <div className="space-y-2">
                 <Label className="block text-xs font-semibold">צבעים מועדפים?</Label>
                  <div className="grid grid-cols-1 gap-2">
                   {[
                      {id: 'fixed', label: 'יש לי צבעים קבועים'},
                      {id: 'you_choose', label: 'אין, תבחרו אתם'},
                      {id: 'open', label: 'פתוח להצעה'},
                   ].map(option => (
                       <div 
                        key={option.id}
                        onClick={() => handleInputChange('colors', option.id)}
                        className={cn(
                          "cursor-pointer p-2 rounded-xl border flex items-center gap-2 transition-all",
                          formData.colors === option.id 
                            ? "border-indigo-500 bg-indigo-50 text-indigo-900 font-bold" 
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <div className={cn("w-3 h-3 rounded-full border", formData.colors === option.id ? "bg-indigo-500 border-indigo-600" : "bg-gray-100 border-gray-300")} />
                        <span className="text-xs">{option.label}</span>
                      </div>
                   ))}
                  </div>
              </div>
            </div>
           </div>
        );

      case 6: // Actual Usage
        return (
          <div className="space-y-3">
             <StepHeader 
              icon={Send} 
              title="שימוש בפועל" 
              description="דיוק אחרון"
              colorClass="bg-amber-100 text-amber-600"
            />
             <div className="space-y-3">
                <div className="space-y-1">
                    <Label className="text-xs font-semibold">תן דוגמה למשפט שאתה שולח הרבה ללקוחות (אופציונלי)</Label>
                    <Textarea 
                      value={formData.exampleSentence} 
                      onChange={(e) => handleInputChange('exampleSentence', e.target.value)} 
                      placeholder="טקסט חופשי..." 
                      className="h-20 text-xs resize-none"
                    />
                </div>

                <div className="space-y-1">
                    <Label className="text-xs font-semibold">משהו שחשוב לך שלא יופיע בסטיקר? (אופציונלי)</Label>
                    <Textarea 
                      value={formData.excludeText} 
                      onChange={(e) => handleInputChange('excludeText', e.target.value)} 
                      placeholder="טקסט חופשי..." 
                      className="h-20 text-xs resize-none"
                    />
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
            <span className="text-xs font-semibold text-blue-600">יצירת סטיקר ממותג</span>
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">מעצב את הסטיקר...</h3>
                <p className="text-gray-500 text-sm">הבינה המלאכותית יוצרת סטיקר מותאם אישית</p>
              </div>
            </div>
          ) : showSuccess ? (
             <div className="flex flex-col items-center justify-center text-center space-y-6 w-full animate-in fade-in zoom-in duration-500 mt-4">
              {generatedStickerUrl ? (
                  <div className="relative w-64 h-64 bg-gray-100 rounded-xl overflow-hidden shadow-lg border-4 border-white">
                      <img 
                          src={generatedStickerUrl} 
                          alt="Generated Sticker" 
                          className="w-full h-full object-contain p-4"
                      />
                  </div>
              ) : (
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-green-200">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
              )}
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900">הסטיקר שלך מוכן! 🎉</h2>
                <p className="text-gray-600 text-sm max-w-xs mx-auto">
                    הנה הסטיקר הממותג שלך,
                    מוכן לשימוש מיידי בוואטסאפ / רשתות.
                </p>
              </div>
              
              {/* AI Details Expansion */}
              {aiBrief && (
                  <div className="w-full max-w-sm bg-gray-50 rounded-lg p-3 text-right text-xs border border-gray-100 mb-2">
                      <details className="group">
                          <summary className="cursor-pointer font-bold text-gray-700 flex items-center justify-between">
                              <span>📝 אפיון מוצר ופרומפט</span>
                              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                          </summary>
                          <div className="mt-2 space-y-3 text-gray-600 leading-relaxed">
                              <div>
                                  <span className="block font-bold text-gray-800 mb-1">אפיון (Product Brief):</span>
                                  {aiBrief}
                              </div>
                              <div className="border-t pt-2" dir="ltr">
                                  <span className="block font-bold text-gray-800 mb-1">Prompt Generated:</span>
                                  <span className="font-mono text-[10px] bg-white p-1 block rounded border">{aiPrompt}</span>
                              </div>
                          </div>
                      </details>
                  </div>
              )}

               <div className="flex flex-col gap-3 w-full max-w-xs">
                   {generatedStickerUrl && (
                       <a 
                           href={generatedStickerUrl} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           download="sticker.png"
                           className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-bold shadow-lg shadow-green-100 transition-all"
                       >
                           <Download className="w-4 h-4" />
                           הורד סטיקר
                       </a>
                   )}
                   
                   <Button 
                    onClick={() => onComplete(formData)}
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50 text-gray-700"
                  >
                    חזרה למרכז השליטה
                  </Button>
               </div>
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
                צור סטיקר
                <Sparkles className="w-4 h-4 mr-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}