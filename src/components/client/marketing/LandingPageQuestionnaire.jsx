import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
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
  FileText, Calendar, Layers, Share2, Copy, Eye, Maximize2, ExternalLink,
  CheckCircle2, Pencil, Info, Monitor, Smartphone, Shield
} from 'lucide-react';
import DynamicLandingPage from '@/components/landing-page/DynamicLandingPage';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

export default function LandingPageQuestionnaire({ onComplete, onClose, onSwitchToLogo, onStepChange }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  // Notify parent about step changes for layout adjustments
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);
  
  const [formData, setFormData] = useState(() => {
    // Load from localStorage if exists
    const saved = localStorage.getItem('landingPageFormData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved form data', e);
      }
    }
    return {
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
      ctaTypes: [],
      ctaText: '',
      pageStyle: '',
      preferredColors: '',
      logoStatus: '',
      logoFile: null,
      formFields: ['name', 'phone'],
      leadDestination: '',
      destinationPhone: '',
      destinationEmail: '',
    };
  });

  const [errors, setErrors] = useState({});
  const [isBuilding, setIsBuilding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pageSlug, setPageSlug] = useState('');
  const [createdPageData, setCreatedPageData] = useState(null);
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');

  useEffect(() => {
    // Auto-detect mobile
    if (window.innerWidth < 768) {
        setPreviewDevice('mobile');
    }
  }, []);

  // Scroll to top on step change for mobile
  useEffect(() => {
    const scrollArea = document.getElementById('questionnaire-scroll-area');
    if (scrollArea) scrollArea.scrollTop = 0;
  }, [currentStep]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Save to localStorage (except file)
      const toSave = { ...updated };
      delete toSave.logoFile;
      localStorage.setItem('landingPageFormData', JSON.stringify(toSave));
      return updated;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCheckboxChange = (group, value, checked) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [group]: checked 
          ? [...prev[group], value]
          : prev[group].filter(item => item !== value)
      };
      const toSave = { ...updated };
      delete toSave.logoFile;
      localStorage.setItem('landingPageFormData', JSON.stringify(toSave));
      return updated;
    });
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
      case 4:
        // Step 4 is optional - no validation needed
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
      case 8:
        // Review step - no validation needed
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setIsBuilding(true);
      try {
        const res = await base44.functions.invoke('createLandingPage', { data: formData });
        if (res.data && res.data.slug) {
            setPageSlug(res.data.slug);
            
            // Fetch the full page data for preview
            try {
                // Try to get by ID if available, otherwise filter by slug
                let pageData = null;
                if (res.data.id) {
                    try {
                        pageData = await base44.entities.LandingPage.get(res.data.id);
                    } catch (e) {
                        console.log("Could not get by ID, trying filter...");
                    }
                }
                
                if (!pageData) {
                    const pages = await base44.entities.LandingPage.filter({ slug: res.data.slug });
                    if (pages && pages.length > 0) {
                        pageData = pages[0];
                    }
                }

                if (pageData) {
                    setCreatedPageData(pageData);
                } else {
                    throw new Error("Page not found after creation");
                }
            } catch (err) {
                console.error("Failed to fetch page details, using fallback", err);
                // Fallback: Construct preview data from local state so user sees something
                setCreatedPageData({
                    business_name: formData.businessName,
                    primary_color: '#3B82F6', // Default blue
                    headline: formData.businessName,
                    subheadline: 'הדף שלך מוכן!',
                    sections_json: [
                        {
                            type: 'hero',
                            title: formData.businessName,
                            subtitle: formData.serviceOffered || 'הפתרון המושלם עבורך',
                            ctaText: formData.ctaText || 'צור קשר',
                            image_prompt: 'abstract modern business background blue and white professional'
                        },
                        {
                            type: 'features',
                            title: 'היתרונות שלנו',
                            items: formData.whyChooseYou.map(id => ({ 
                                title: id === 'price' ? 'מחיר משתלם' : id === 'experience' ? 'ניסיון ומקצועיות' : 'שירות אישי', 
                                description: 'אנחנו כאן כדי לתת לך את הטוב ביותר' 
                            }))
                        },
                        {
                            type: 'contact',
                            title: 'צור קשר',
                            subtitle: 'השאר פרטים ונחזור אליך',
                            form_fields: formData.formFields,
                            phone: formData.destinationPhone
                        }
                    ]
                });
            }

            // Clear saved form data on success
            localStorage.removeItem('landingPageFormData');
            setShowSuccess(true);
        } else {
            console.error("Failed to create landing page", res);
            alert('היה קושי ביצירת הדף. אנא נסה שוב או צור קשר עם התמיכה.');
            setIsBuilding(false);
            return;
            // Mock data for preview in case of error (so user sees SOMETHING)
            setCreatedPageData({
                business_name: formData.businessName,
                primary_color: '#3B82F6',
                sections_json: [
                    {
                        type: 'hero',
                        title: formData.businessName,
                        subtitle: 'הדף שלך כמעט מוכן (מצב הדגמה)',
                        ctaText: 'צור קשר',
                    },
                    {
                        type: 'features',
                        title: 'השירותים שלנו',
                        items: [
                            { title: 'שירות מקצועי', description: 'תיאור השירות שלך יופיע כאן' },
                            { title: 'זמינות מלאה', description: 'פרטים נוספים יופיעו כאן' }
                        ]
                    }
                ]
            });
            setShowSuccess(true);
        }
      } catch (error) {
        console.error("Error creating landing page:", error);
        alert('אירעה שגיאה ביצירת הדף. אנא נסה שוב.');
        setIsBuilding(false);
        return;
        setPageSlug('demo-error');
        // Mock data for preview
        setCreatedPageData({
            business_name: formData.businessName,
            primary_color: '#3B82F6',
            sections_json: [
                {
                    type: 'hero',
                    title: formData.businessName,
                    subtitle: 'הדף שלך כמעט מוכן (מצב הדגמה - אירעה שגיאה)',
                    ctaText: 'נסה שוב',
                }
            ]
        });
        setShowSuccess(true);
      } finally {
        setIsBuilding(false);
      }
    }
  };

  const handlePurchase = () => {
    // Navigate to checkout with the special price
    window.location.href = `/Checkout?product=landing-page&price=299&slug=${pageSlug || ''}`;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Building2} 
              title="נתחיל מהבסיס" 
              description="מי אתה ומי הקהל שלך?"
              colorClass="bg-blue-100 text-blue-600"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="businessName" className="text-xs font-semibold">שם העסק / מותג</Label>
                <Input 
                  id="businessName" 
                  value={formData.businessName} 
                  onChange={(e) => handleInputChange('businessName', e.target.value)} 
                  placeholder="לדוגמה: דיגיטל פרו" 
                  className={cn("h-9 text-xs", errors.businessName && 'border-red-500 focus-visible:ring-red-500')} 
                  autoFocus
                />
                {errors.businessName && <p className="text-red-600 text-xs font-semibold flex items-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200"><AlertCircle className="w-4 h-4" /> {errors.businessName}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="mainField" className="text-xs font-semibold">תחום עיסוק</Label>
                <Input 
                  id="mainField" 
                  value={formData.mainField} 
                  onChange={(e) => handleInputChange('mainField', e.target.value)} 
                  placeholder="לדוגמה: שיווק דיגיטלי" 
                  className={cn("h-9 text-xs", errors.mainField && 'border-red-500 focus-visible:ring-red-500')} 
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
                  <div className="flex items-center px-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 h-full">
                     <Input 
                        placeholder="אחר..." 
                        value={formData.targetAudienceOther} 
                        onChange={(e) => handleInputChange('targetAudienceOther', e.target.value)} 
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-full text-xs"
                      />
                  </div>
                </div>
                {errors.targetAudience && <p className="text-red-600 text-xs font-semibold flex items-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200"><AlertCircle className="w-4 h-4" /> {errors.targetAudience}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={AlertCircle} 
              title="הכאב של הלקוח" 
              description="למה הוא צריך אותך?"
              colorClass="bg-red-100 text-red-600"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="painPoints" className="text-xs font-semibold">מה הבעיה או הכאב שהלקוח חווה?</Label>
                <Textarea 
                  id="painPoints" 
                  value={formData.painPoints} 
                  onChange={(e) => handleInputChange('painPoints', e.target.value)} 
                  placeholder="לדוגמה: מבזבז המון זמן על בירוקרטיה..." 
                  className={cn("h-20 resize-none text-xs", errors.painPoints && 'border-red-500')} 
                  autoFocus
                />
                {errors.painPoints && <p className="text-red-600 text-xs font-semibold flex items-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200"><AlertCircle className="w-4 h-4" /> {errors.painPoints}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="consequences" className="text-xs font-semibold">מה קורה אם הוא לא פותר את זה?</Label>
                <Textarea 
                  id="consequences" 
                  value={formData.consequences} 
                  onChange={(e) => handleInputChange('consequences', e.target.value)} 
                  placeholder="לדוגמה: מפסיד כסף, לחץ, מאבד לקוחות..." 
                  className={cn("h-20 resize-none text-xs", errors.consequences && 'border-red-500')} 
                />
                {errors.consequences && <p className="text-red-600 text-xs font-semibold flex items-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200"><AlertCircle className="w-4 h-4" /> {errors.consequences}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Zap} 
              title="הפתרון שלך" 
              description="איך אתה עוזר לו?"
              colorClass="bg-green-100 text-green-600"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="serviceOffered" className="text-xs font-semibold">מה השירות במשפט אחד?</Label>
                <Input 
                  id="serviceOffered" 
                  value={formData.serviceOffered} 
                  onChange={(e) => handleInputChange('serviceOffered', e.target.value)} 
                  placeholder="אני עוזר ל... לעשות... כדי ש..." 
                  className={cn("h-9 text-xs", errors.serviceOffered && 'border-red-500')} 
                  autoFocus
                />
                {errors.serviceOffered && <p className="text-red-600 text-xs font-semibold flex items-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200"><AlertCircle className="w-4 h-4" /> {errors.serviceOffered}</p>}
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
                  className="bg-gray-50 h-8 text-xs"
                />
                {errors.whyChooseYou && <p className="text-red-500 text-[10px]">{errors.whyChooseYou}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="processSteps" className="text-xs font-semibold">איך זה עובד? (בקצרה)</Label>
                <Input 
                  id="processSteps" 
                  value={formData.processSteps} 
                  onChange={(e) => handleInputChange('processSteps', e.target.value)} 
                  placeholder="שלב 1 -> שלב 2 -> שלב 3" 
                  className={cn("h-9 text-xs", errors.processSteps && 'border-red-500')} 
                />
                {errors.processSteps && <p className="text-red-500 text-[10px]">{errors.processSteps}</p>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={ThumbsUp} 
              title="הוכחות ואמון" 
              description="למה שיסמכו עליך?"
              colorClass="bg-amber-100 text-amber-600"
            />

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
                    className="mr-8 w-[calc(100%-2rem)] h-8 text-xs"
                    autoFocus
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
                    className="mr-8 w-[calc(100%-2rem)] min-h-[50px] text-xs"
                    autoFocus
                  />
                </motion.div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">* שלב אופציונלי - ניתן לדלג</p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Send} 
              title="הנעה לפעולה" 
              description="מה אנחנו רוצים שיקרה?"
              colorClass="bg-purple-100 text-purple-600"
            />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="block font-bold text-xs">מה הפעולה הרצויה?</Label>
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
                {errors.ctaTypes && <p className="text-red-600 text-xs font-semibold flex items-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200 mt-1"><AlertCircle className="w-4 h-4" /> {errors.ctaTypes}</p>}
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
          <div className="space-y-3">
            <StepHeader 
              icon={Paintbrush} 
              title="עיצוב וסגנון" 
              description="איך הדף יראה?"
              colorClass="bg-pink-100 text-pink-600"
            />

            <div className="space-y-3">
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
                        "cursor-pointer p-2 rounded-xl border text-center transition-all",
                        formData.pageStyle === option.value 
                          ? "border-pink-500 ring-1 ring-pink-500/20" 
                          : "border-gray-200 hover:border-pink-200"
                      )}
                    >
                      <div className={cn("w-full h-4 rounded-sm mb-1 mx-auto", option.color)} />
                      <span className="text-xs font-bold">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold">האם יש לך לוגו?</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div 
                    className={cn(
                      "border border-dashed rounded-xl p-4 transition-all text-center cursor-pointer relative",
                      formData.logoStatus === 'uploaded' ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-pink-400 hover:bg-pink-50"
                    )}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-1 pointer-events-none">
                      {formData.logoStatus === 'uploaded' ? (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-xs font-bold text-green-700">הלוגו נשמר בהצלחה!</span>
                          <span className="text-[10px] text-green-600">{formData.logoFile?.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-xs font-bold text-gray-700">יש לי לוגו - לחץ להעלאה</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {onSwitchToLogo && (
                      <button
                        type="button"
                        onClick={onSwitchToLogo}
                        className="flex-1 py-2 px-2 bg-pink-600 text-white rounded-lg text-xs font-bold hover:bg-pink-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Paintbrush className="w-3 h-3" />
                        עצב לוגו
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleInputChange('logoStatus', 'later')}
                      className={cn(
                        "flex-1 py-2 px-2 border rounded-lg text-xs font-bold transition-colors",
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
        );

      case 7:
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Sparkles} 
              title="טאצ'ים אחרונים" 
              description="הגדרות טכניות"
              colorClass="bg-teal-100 text-teal-600"
            />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="block font-bold text-xs">איזה שדות יהיו בטופס?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['name', 'phone', 'email', 'message'].map(field => (
                    <div 
                      key={field} 
                      onClick={() => handleCheckboxChange('formFields', field, !formData.formFields.includes(field))}
                      className={cn(
                        "cursor-pointer flex items-center gap-2 p-2 rounded-lg border transition-all",
                        formData.formFields.includes(field) ? "border-teal-500 bg-teal-50" : "border-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-3.5 h-3.5 rounded border flex items-center justify-center bg-white",
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
                      
                      <AnimatePresence>
                        {formData.leadDestination === option.value && option.value === 'whatsapp' && (
                          <motion.div 
                            key="whatsapp-input"
                            initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden w-full"
                          >
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <Label className="text-[10px] text-gray-500 mb-1.5 block">לאיזה מספר לשלוח את ההודעות?</Label>
                              <div className="relative bg-white rounded-md">
                                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <Input 
                                  placeholder="050-0000000"
                                  value={formData.destinationPhone}
                                  onChange={(e) => handleInputChange('destinationPhone', e.target.value)}
                                  className="pr-8 h-9 text-xs border-gray-200 focus-visible:ring-teal-500 w-full"
                                  autoFocus
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {formData.leadDestination === option.value && option.value === 'email' && (
                          <motion.div 
                            key="email-input"
                            initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden w-full"
                          >
                             <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                               <Label className="text-[10px] text-gray-500 mb-1.5 block">לאיזה מייל לשלוח את הלידים?</Label>
                               <div className="relative bg-white rounded-md">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <Input 
                                  placeholder="your@email.com"
                                  value={formData.destinationEmail}
                                  onChange={(e) => handleInputChange('destinationEmail', e.target.value)}
                                  className="pr-8 h-9 text-xs border-gray-200 focus-visible:ring-teal-500 w-full"
                                  autoFocus
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="flex flex-col h-full bg-[#f8fafc] animate-in fade-in zoom-in-95 duration-500 rounded-3xl overflow-hidden relative">
            
            {/* Header - Compact */}
            <div className="bg-white/95 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-3 md:gap-4">
                <button 
                  onClick={handlePrev}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg md:text-2xl font-black text-slate-900 leading-tight">הכל מוכן לבנייה ✨</h2>
                  <p className="text-xs md:text-sm font-medium text-slate-500">ה-AI שלנו מוכן לפעולה</p>
                </div>
              </div>
              <Button 
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="max-w-4xl mx-auto p-3 md:p-5 space-y-4">
                  
                {/* AI Building Promise - "Magic" Section - Compact */}
                <div className="text-center space-y-2 py-1">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-200 animate-pulse">
                    <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-tight">
                    בונים דף עבור <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{formData.businessName}</span>
                  </h3>
                  <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
                    המערכת תבנה דף נחיתה מותאם אישית עם עיצוב {formData.pageStyle === 'professional' ? 'מקצועי' : 'מותאם'} ותוכן שיווקי.
                  </p>
                </div>

                {/* Data Summary Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3">
                  {/* Branding Card */}
                  <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm relative group hover:shadow-md transition-all">
                    <button onClick={() => setCurrentStep(1)} className="absolute top-3 left-3 p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-2xl border border-blue-100 shrink-0">
                          {formData.logoFile ? <img src={URL.createObjectURL(formData.logoFile)} className="w-full h-full object-contain rounded-lg" /> : '🏢'}
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">מיתוג</div>
                          <div className="font-bold text-slate-900 text-sm">{formData.mainField}</div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-slate-50 rounded-md text-[10px] font-medium text-slate-600 border border-slate-200">{formData.targetAudience[0] || 'קהל כללי'}</span>
                    </div>
                  </div>

                  {/* Strategy Card */}
                  <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm relative group hover:shadow-md transition-all">
                      <button onClick={() => setCurrentStep(2)} className="absolute top-3 left-3 p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">אסטרטגיה</div>
                          <div className="font-bold text-slate-900 text-sm">פתרון וכאב</div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{formData.serviceOffered}</p>
                  </div>
                  
                  {/* Conversion Card */}
                  <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm relative group hover:shadow-md transition-all">
                      <button onClick={() => setCurrentStep(7)} className="absolute top-3 left-3 p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shrink-0">
                          <Send className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">המרות</div>
                          <div className="font-bold text-slate-900 text-sm">{formData.ctaText}</div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      יעד: {formData.leadDestination === 'whatsapp' ? 'וואטסאפ' : formData.leadDestination === 'email' ? 'מייל' : 'CRM'}
                    </div>
                  </div>

                  {/* AI Technology Card */}
                  <div className="bg-slate-900 p-3 md:p-4 rounded-2xl border border-slate-700 shadow-sm flex items-center justify-between text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 blur-2xl opacity-20 -mr-5 -mt-5" />
                      <div className="relative z-10">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">טכנולוגיה</div>
                        <div className="font-bold flex items-center gap-2 text-sm">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                          בניית AI אוטומטית
                        </div>
                      </div>
                      <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center border border-white/5 shadow-inner">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                      </div>
                  </div>
                </div>

                <div className="h-2"></div>
              </div>
            </div>

            {/* Sticky Footer CTA */}
            <div className="p-3 bg-white border-t border-slate-100 shadow-[0_-5px_30px_rgba(0,0,0,0.05)] z-40 sticky bottom-0 w-full">
              <div className="max-w-sm mx-auto w-full">
                  <Button 
                  onClick={handleSubmit}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-200/50 font-black text-base flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    בנה את הדף שלי
                  </Button>
                  <p className="text-center text-[10px] text-slate-400 mt-1.5">ה-AI יבנה את הדף תוך שניות</p>
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
      <div className={cn(
        "flex-none px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 transition-all duration-500",
        currentStep === 8 ? "hidden" : "block"
      )}>
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-blue-600">אשף בניית דף נחיתה</span>
            <span className="text-[10px] text-gray-500">
              {currentStep === 1 && "בסיס"}
              {currentStep === 2 && "כאב הלקוח"}
              {currentStep === 3 && "הפתרון"}
              {currentStep === 4 && "הוכחות"}
              {currentStep === 5 && "קריאה לפעולה"}
              {currentStep === 6 && "עיצוב"}
              {currentStep === 7 && "הגדרות"}
              {currentStep === 8 && "סקירה"}
            </span>
            <div className="flex gap-1 mt-0.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (i + 1 <= currentStep || i + 1 === currentStep + 1) {
                      setCurrentStep(i + 1);
                    }
                  }}
                  disabled={i + 1 > currentStep + 1}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i + 1 <= currentStep ? "bg-blue-600 cursor-pointer hover:bg-blue-700" : "bg-gray-200",
                    i + 1 === currentStep && "w-4",
                    i + 1 !== currentStep && "w-1.5",
                    i + 1 > currentStep + 1 && "cursor-not-allowed opacity-50"
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

      {/* Main Content */}
      <div 
        id="questionnaire-scroll-area"
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden transition-all duration-500 scrollbar-hide",
          currentStep === 8 ? "p-0 bg-slate-50" : "p-4 bg-white"
        )}
      >
        <div className={cn(
          "mx-auto min-h-full flex flex-col justify-start transition-all duration-500",
          currentStep === 8 ? "max-w-full" : "max-w-xl pt-2"
        )}>
          
          {isBuilding ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 mt-10">
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
            <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden animate-in fade-in zoom-in duration-500">
              
              {/* Top Header - Reassuring & Clean */}
              <div className="flex-none bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm z-20">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    הדף שלך מוכן 🎉
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    זו טיוטה ראשונית. ניתן לערוך, לשפר ולהתאים גם אחרי הרכישה.
                  </p>
                </div>
                <div className="hidden md:flex gap-2">
                   {/* Optional: Device toggles if needed, but prompt focuses on 'Preview Experience' */}
                </div>
              </div>

              {/* Main Content Area - Split View */}
              <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
                
                {/* Center/Left: The Preview (Hero) */}
                <div className="flex-1 bg-slate-50 p-4 md:p-8 overflow-hidden flex flex-col items-center justify-center relative">
                   {/* Background Decor */}
                   <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px]" />
                   
                   {!createdPageData ? (
                      <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p>טוען תצוגה...</p>
                      </div>
                   ) : (
                      <div className="w-full max-w-5xl aspect-[16/10] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative group transition-all hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
                          {/* Browser Toolbar */}
                          <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-3 shrink-0">
                             <div className="flex gap-1.5">
                               <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
                               <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d8a126]" />
                               <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aac2f]" />
                             </div>
                             <div className="flex-1 flex justify-center px-4">
                                <div className="h-7 w-full max-w-lg bg-white border border-slate-200 rounded-md flex items-center justify-center gap-2 text-xs text-slate-500 font-mono shadow-sm">
                                   <Lock className="w-3 h-3 opacity-50" />
                                   <span className="opacity-50">https://</span>
                                   <span>{window.location.host}/LP/{pageSlug}</span>
                                </div>
                             </div>
                          </div>
                          
                          {/* Viewport */}
                          <div className="flex-1 relative bg-white w-full overflow-hidden group cursor-zoom-in" onClick={() => setIsFullPreviewOpen(true)}>
                             <div className="absolute inset-0 w-[1280px] h-[800px] origin-top-left transform-gpu pointer-events-none select-none"
                                  ref={el => {
                                      if (!el || !el.parentElement) return;
                                      const resize = () => {
                                          const parent = el.parentElement;
                                          if (parent) {
                                              const scale = parent.offsetWidth / 1280;
                                              el.style.transform = `scale(${scale})`;
                                          }
                                      };
                                      new ResizeObserver(resize).observe(el.parentElement);
                                      resize();
                                  }}
                             >
                                <DynamicLandingPage data={createdPageData} isThumbnail={true} />
                             </div>

                             {/* Overlay for Click */}
                             <div className="absolute inset-0 bg-slate-900/0 hover:bg-slate-900/5 transition-all duration-300 flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-md text-slate-900 px-6 py-3 rounded-full font-bold shadow-2xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 border border-white/20">
                                   <Maximize2 className="w-4 h-4" />
                                   לחץ לתצוגה מלאה
                                </div>
                             </div>
                          </div>
                      </div>
                   )}
                </div>

                {/* Right/Sidebar: The Sales Pitch (Sticky) */}
                <div className="w-full md:w-[380px] bg-white border-r border-slate-200 flex flex-col z-10 shadow-xl md:shadow-none">
                   <div className="p-6 flex-1 overflow-y-auto">
                      
                      <div className="mb-8 text-center">
                         <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-3">
                            הצעה מיוחדת למצטרפים חדשים
                         </div>
                         <div className="flex items-baseline justify-center gap-1 dir-ltr">
                            <span className="text-5xl font-black text-slate-900">299₪</span>
                            <span className="text-lg text-slate-400 line-through">990₪</span>
                         </div>
                         <p className="text-slate-600 text-sm mt-2 font-medium">כולל פרסום הדף + מערכת עריכה מלאה</p>
                      </div>

                      <div className="space-y-4 mb-8">
                         {[
                           "דומיין אישי במתנה",
                           "אחסון מהיר ומאובטח",
                           "הסרת פרסומות ולוגו המערכת",
                           "מערכת ניהול לידים מובנית",
                           "אפשרות לעריכת תוכן חופשית"
                         ].map((item, i) => (
                           <div key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                              </div>
                              <span className="text-sm text-slate-700">{item}</span>
                           </div>
                         ))}
                      </div>

                      <Button 
                        onClick={handlePurchase}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-200/50 text-lg font-bold flex items-center justify-center gap-2 group transition-all hover:scale-[1.02]"
                      >
                        רוצה לפרסם את הדף 🚀
                      </Button>
                      
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                         <div className="flex flex-col items-center gap-1">
                            <Shield className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] text-slate-500 leading-tight">רכישה מאובטחת</span>
                         </div>
                         <div className="flex flex-col items-center gap-1">
                            <Zap className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] text-slate-500 leading-tight">פרסום מיידי</span>
                         </div>
                         <div className="flex flex-col items-center gap-1">
                            <Target className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] text-slate-500 leading-tight">ללא התחייבות</span>
                         </div>
                      </div>

                   </div>
                   
                   <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                      <button 
                        onClick={() => onComplete(formData)}
                        className="text-slate-400 hover:text-slate-600 text-sm underline decoration-slate-300 underline-offset-4 transition-colors"
                      >
                        שמור כטיוטה (ללא פרסום)
                      </button>
                   </div>
                </div>

              </div>

              {/* Full Preview Dialog */}
              <Dialog open={isFullPreviewOpen} onOpenChange={setIsFullPreviewOpen}>
                  <DialogContent className="max-w-[98vw] w-[1600px] h-[95vh] p-0 flex flex-col gap-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-gray-100">
                      <div className="bg-white border-b px-4 py-3 flex justify-between items-center shrink-0 z-50">
                           <div className="flex gap-3 items-center">
                               <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                  <Globe className="w-5 h-5" />
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-sm font-bold text-gray-900 leading-tight">{createdPageData?.business_name}</span>
                                  <span className="text-xs text-slate-500 dir-ltr font-mono">{window.location.host}/LP/{pageSlug}</span>
                               </div>
                           </div>
                           <DialogClose asChild>
                              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></Button>
                           </DialogClose>
                      </div>
                      <div className="flex-1 overflow-auto bg-white relative">
                          {createdPageData && <DynamicLandingPage data={createdPageData} />}
                      </div>
                  </DialogContent>
              </Dialog>

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
      {!isBuilding && !showSuccess && currentStep !== 8 && (
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
                סיים ובנה
                <Sparkles className="w-4 h-4 mr-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}