import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { invokeFunction } from '@/api/supabaseClient';
import { 
  ChevronLeft, ChevronRight, X, Sparkles, Building2, Smile, 
  Target, Zap, MessageSquare, Paintbrush, Users, Briefcase, Check,
  Upload, Calendar, Layers, Instagram, Facebook,
  Image, Layout, Quote, Megaphone, Smartphone, Star
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Custom specialized card selector component for better UX
const SelectionCard = ({ selected, onClick, icon: Icon, title, description, className }) => (
  <div 
    onClick={onClick}
    className={cn(
      "cursor-pointer relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 w-full",
      selected 
        ? "border-pink-500 bg-pink-50/50 ring-1 ring-pink-500/20" 
        : "border-gray-200 bg-white hover:border-pink-200 hover:bg-gray-50",
      className
    )}
  >
    {selected && (
      <div className="absolute top-1.5 left-1.5 bg-pink-500 rounded-full p-0.5">
        <Check className="w-1.5 h-1.5 text-white" />
      </div>
    )}
    <div className={cn(
      "p-1.5 rounded-lg flex-shrink-0",
      selected ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-500"
    )}>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div className="flex-1 min-w-0">
      <div className={cn("font-bold text-xs leading-tight", selected ? "text-pink-900" : "text-gray-900")}>{title}</div>
      {description && <div className="text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-1">{description}</div>}
    </div>
  </div>
);

const StepHeader = ({ icon: Icon, title, description, colorClass = "bg-pink-100 text-pink-600" }) => (
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

export default function SocialMediaQuestionnaire({ onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  
  const [formData, setFormData] = useState({
    // Step 1
    businessName: '',
    networks: [],
    targetAudience: '',
    // Step 2
    goals: [],
    vibe: '',
    // Step 3 (Select 5)
    designTypes: [],
    // Step 4
    writingStyle: '',
    language: '',
    // Step 5
    hasBranding: '',
    preferredColors: '',
    logoFile: null,
    // Step 6
    futureUse: '',
    editPlatform: '',
    // Step 7
    inspirationLinks: '',
    excludeElements: ''
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
      setFormData(prev => ({ ...prev, logoFile: file, hasBranding: 'yes' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 3 && formData.designTypes.length === 0) {
        newErrors.designTypes = 'נא לבחור לפחות סוג עיצוב אחד (עד 5)';
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

  const [generatedDesigns, setGeneratedDesigns] = useState(null);
  const [generateError, setGenerateError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setIsBuilding(true);
      setGenerateError('');
      try {
        const response = await invokeFunction('generateSocialDesigns', { formData });
        if (response?.error) {
          throw new Error(response.error);
        }
        setGeneratedDesigns(response);
        setShowSuccess(true);
      } catch (err) {
        console.error('Social designs generation error:', err);
        setGenerateError(err.message || 'שגיאה ביצירת העיצובים. נסה שוב.');
      } finally {
        setIsBuilding(false);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Introduction
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Building2} 
              title="היכרות מהירה" 
              description="פרטי העסק והרשתות"
              colorClass="bg-pink-100 text-pink-600"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="businessName" className="text-xs font-semibold">שם העסק / השם שיופיע בעיצובים</Label>
                <Input 
                  id="businessName" 
                  value={formData.businessName} 
                  onChange={(e) => handleInputChange('businessName', e.target.value)} 
                  placeholder="הזן טקסט חופשי..." 
                  className="h-10 text-base sm:text-sm"
                />
              </div>

              <div className="space-y-2 pt-1">
                <Label className="block text-xs font-semibold">באילו רשתות אתה פעיל?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                      {id: 'instagram', label: 'אינסטגרם', icon: Instagram},
                      {id: 'facebook', label: 'פייסבוק', icon: Facebook},
                      {id: 'both', label: 'גם וגם', icon: Layers},
                  ].map(option => (
                      <SelectionCard 
                        key={option.id}
                        selected={formData.networks.includes(option.id)}
                        onClick={() => handleCheckboxChange('networks', option.id, !formData.networks.includes(option.id))}
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
              title="מטרת העיצובים" 
              description="למה זה נועד?"
              colorClass="bg-purple-100 text-purple-600"
            />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold">מה המטרה המרכזית? (עד 2)</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'branding', label: 'מיתוג ונראות מקצועית', icon: Check },
                    { id: 'attention', label: 'משיכת תשומת לב / עוקבים', icon: Zap },
                    { id: 'trust', label: 'יצירת אמון', icon: Users },
                    { id: 'promotion', label: 'קידום שירותים', icon: Megaphone },
                    { id: 'content', label: 'תוכן קבוע שקל לפרסם', icon: Calendar },
                  ].map(option => (
                    <SelectionCard
                      key={option.id}
                      selected={formData.goals.includes(option.id)}
                      onClick={() => handleCheckboxChange('goals', option.id, !formData.goals.includes(option.id), 2)}
                      icon={option.icon}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold">מה הכי חשוב שהעיצוב ישדר?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'professional', label: 'מקצועיות', icon: Briefcase },
                    { id: 'light', label: 'קלילות', icon: Smile },
                    { id: 'warm', label: 'חום ואנושיות', icon: Users },
                    { id: 'luxury', label: 'יוקרה', icon: Star },
                    { id: 'energy', label: 'אנרגיה / תנועה', icon: Zap },
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

      case 3: // Design Types
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Layout} 
              title="סוגי העיצובים" 
              description="בחר 5 עיצובים"
              colorClass="bg-blue-100 text-blue-600"
            />

            <div className="space-y-3">
              <div className="bg-blue-50 p-2 rounded-lg text-[10px] text-blue-800">
                📌 אם לא תבחר 5 – אנחנו נבחר עבורך בצורה חכמה. ({formData.designTypes.length}/5 נבחרו)
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                 {[
                    { id: 'post', label: 'פוסט רגיל (ריבוע / אנכי)', icon: Image },
                    { id: 'story', label: 'סטורי', icon: Smartphone },
                    { id: 'story_text', label: 'סטורי עם מקום לטקסט משתנה', icon: Smartphone },
                    { id: 'highlight', label: 'קאבר להיילייט', icon: Star },
                    { id: 'post_template', label: 'תבנית קבועה לפוסטים', icon: Layout },
                    { id: 'quote', label: 'תבנית לציטוט / טיפ', icon: Quote },
                    { id: 'service', label: 'תבנית לפרסום שירות', icon: Megaphone },
                 ].map(option => (
                    <SelectionCard
                      key={option.id}
                      selected={formData.designTypes.includes(option.id)}
                      onClick={() => handleCheckboxChange('designTypes', option.id, !formData.designTypes.includes(option.id), 5)}
                      icon={option.icon}
                      title={option.label}
                    />
                 ))}
              </div>
              {errors.designTypes && <p className="text-red-500 text-[10px]">{errors.designTypes}</p>}
            </div>
          </div>
        );

      case 4: // Language & Tone
        return (
           <div className="space-y-3">
            <StepHeader 
              icon={MessageSquare} 
              title="שפה וטון" 
              description="איך מדברים?"
              colorClass="bg-teal-100 text-teal-600"
            />

             <div className="space-y-3">
                <div className="space-y-2">
                 <Label className="block text-xs font-semibold">סגנון כתיבה</Label>
                  <div className="grid grid-cols-1 gap-2">
                   {[
                      {id: 'professional', label: 'ענייני ומקצועי'},
                      {id: 'flow', label: 'קליל וזורם'},
                      {id: 'marketing', label: 'שיווקי ומניע לפעולה'},
                      {id: 'inspiring', label: 'השראתי'},
                      {id: 'you_decide', label: 'אתם תחליטו בשבילי'},
                   ].map(option => (
                       <div 
                        key={option.id}
                        onClick={() => handleInputChange('writingStyle', option.id)}
                        className={cn(
                          "cursor-pointer p-2 rounded-xl border flex items-center transition-all",
                          formData.writingStyle === option.id 
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
                 <Label className="block text-xs font-semibold">שפת העיצובים</Label>
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
             </div>
           </div>
        );

      case 5: // Branding & Colors
        return (
           <div className="space-y-3">
            <StepHeader 
              icon={Paintbrush} 
              title="מיתוג וצבעים" 
              description="הנראות שלך"
              colorClass="bg-indigo-100 text-indigo-600"
            />

            <div className="space-y-3">
                 <div className="space-y-2">
                 <Label className="block text-xs font-semibold">יש לך מיתוג קיים?</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <div 
                        className={cn(
                          "cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all relative overflow-hidden",
                          formData.hasBranding === 'yes'
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
                        <div className="flex items-center gap-2">
                             <Upload className={cn("w-4 h-4", formData.hasBranding === 'yes' ? "text-indigo-600" : "text-gray-400")} />
                             <span className={cn("text-xs font-medium", formData.hasBranding === 'yes' ? "text-indigo-900" : "text-gray-700")}>
                                 {formData.logoFile ? "כן (לוגו הועלה)" : "כן (לחץ להעלאת לוגו/צבעים)"}
                             </span>
                        </div>
                        {formData.hasBranding === 'yes' && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>

                    {[
                        {id: 'partial', label: 'חלקי'},
                        {id: 'no', label: 'אין – תבנו לי שפה חדשה'},
                    ].map(option => (
                        <div 
                            key={option.id}
                            onClick={() => handleInputChange('hasBranding', option.id)}
                            className={cn(
                            "cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all",
                            formData.hasBranding === option.id
                                ? "border-indigo-500 bg-indigo-50 text-indigo-900 font-bold" 
                                : "border-gray-200 hover:bg-gray-50 text-gray-700"
                            )}
                        >
                            <span className="text-xs">{option.label}</span>
                            {formData.hasBranding === option.id && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                    ))}
                  </div>
              </div>

               <div className="space-y-2">
                 <Label className="block text-xs font-semibold">צבעים מועדפים</Label>
                  <div className="grid grid-cols-1 gap-2">
                   {[
                      {id: 'fixed', label: 'יש צבעים קבועים'},
                      {id: 'open', label: 'פתוח להצעה'},
                      {id: 'style', label: 'עדיף רגוע / חזק / כהה / בהיר'},
                   ].map(option => (
                       <div 
                        key={option.id}
                        onClick={() => handleInputChange('preferredColors', option.id)}
                        className={cn(
                          "cursor-pointer p-2 rounded-xl border flex items-center gap-2 transition-all",
                          formData.preferredColors === option.id 
                            ? "border-indigo-500 bg-indigo-50 text-indigo-900 font-bold" 
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <div className={cn("w-3 h-3 rounded-full border", formData.preferredColors === option.id ? "bg-indigo-500 border-indigo-600" : "bg-gray-100 border-gray-300")} />
                        <span className="text-xs">{option.label}</span>
                      </div>
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
              icon={Calendar} 
              title="שימוש עתידי" 
              description="חשוב מאוד"
              colorClass="bg-amber-100 text-amber-600"
            />
             <div className="space-y-3">
                <div className="space-y-2">
                    <Label className="text-xs font-semibold">האם חשוב שהתבניות יהיו קלות לשימוש חוזר?</Label>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            {id: 'yes', label: 'כן, שאוכל להמשיך לבד'},
                            {id: 'no_matter', label: 'לא משנה'},
                            {id: 'very_important', label: 'חשוב מאוד'},
                        ].map(option => (
                            <SelectionCard
                                key={option.id}
                                selected={formData.futureUse === option.id}
                                onClick={() => handleInputChange('futureUse', option.id)}
                                icon={Check}
                                title={option.label}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-semibold">איפה תרצה לערוך בעתיד את התבניות?</Label>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            {id: 'canva', label: 'Canva'},
                            {id: 'no_matter', label: 'לא משנה'},
                            {id: 'you_decide', label: 'אתם תחליטו'},
                        ].map(option => (
                            <SelectionCard
                                key={option.id}
                                selected={formData.editPlatform === option.id}
                                onClick={() => handleInputChange('editPlatform', option.id)}
                                icon={Layout}
                                title={option.label}
                            />
                        ))}
                    </div>
                </div>
             </div>
          </div>
        );

      case 7: // Inspiration
        return (
          <div className="space-y-3">
             <StepHeader 
              icon={Sparkles} 
              title="השראות" 
              description="אופציונלי"
              colorClass="bg-green-100 text-green-600"
            />
             <div className="space-y-3">
                <div className="space-y-1">
                    <Label className="text-xs font-semibold">יש עמודים שאתה אוהב את הסגנון שלהם? (קישור)</Label>
                    <Input 
                      value={formData.inspirationLinks} 
                      onChange={(e) => handleInputChange('inspirationLinks', e.target.value)} 
                      placeholder="https://instagram.com/..." 
                      className="h-10 text-base sm:text-sm"
                      />
                      </div>

                      <div className="space-y-1">
                      <Label className="text-xs font-semibold">יש משהו שחשוב לך שלא יופיע בעיצוב?</Label>
                      <Textarea 
                      value={formData.excludeElements} 
                      onChange={(e) => handleInputChange('excludeElements', e.target.value)} 
                      placeholder="טקסט חופשי..." 
                      className="h-20 text-base sm:text-sm resize-none"
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
            <span className="text-xs font-semibold text-pink-600">עיצובים לרשתות חברתיות</span>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300", 
                    i + 1 <= currentStep ? "bg-pink-600" : "bg-gray-200",
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
                <div className="absolute inset-0 border-4 border-pink-600 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-pink-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">מעצב את הרשתות שלך...</h3>
                <p className="text-gray-500 text-sm">הבינה המלאכותית יוצרת את הקיט המושלם</p>
              </div>
            </div>
          ) : showSuccess ? (
             <div className="flex flex-col items-center justify-center text-center space-y-6 w-full animate-in fade-in zoom-in duration-500 mt-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-green-200">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900">העיצובים בדרך! 🎉</h2>
                <div className="text-gray-600 text-sm max-w-xs mx-auto space-y-1">
                    <p>תקבל 5 עיצובים ממותגים,</p>
                    <p>מותאמים לרשתות שבחרת,</p>
                    <p>ותבניות חכמות שקל להמשיך איתן לבד.</p>
                </div>
              </div>

               <Button 
                onClick={() => onComplete(formData)}
                className="bg-pink-600 hover:bg-pink-700 text-white min-w-[200px] shadow-lg shadow-pink-100 mt-4"
              >
                חזרה למרכז השליטה
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full">
              {generateError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm text-center">
                  {generateError}
                </div>
              )}
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
                className="bg-pink-600 hover:bg-pink-700 text-white min-w-[100px] shadow-lg shadow-pink-100 h-9 text-xs"
              >
                הבא
                <ChevronLeft className="w-4 h-4 mr-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white min-w-[100px] shadow-lg shadow-green-100 h-9 text-xs"
              >
                צור עיצובים
                <Sparkles className="w-4 h-4 mr-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}