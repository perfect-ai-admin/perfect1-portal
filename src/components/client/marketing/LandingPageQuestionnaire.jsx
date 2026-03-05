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
  CheckCircle2, Pencil, Info, Monitor, Smartphone, Shield, Loader2, ShoppingCart
} from 'lucide-react';
import { toast } from 'sonner';
import DynamicLandingPage from '@/components/landing-page/DynamicLandingPage';
import CheckoutDialog from '@/components/checkout/CheckoutDialog';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { addToCart } from '../shared/cartUtils';

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
  const [creationError, setCreationError] = useState(null); // Add error state
  const [showSuccess, setShowSuccess] = useState(false);
  const [pageSlug, setPageSlug] = useState('');
  const [createdPageData, setCreatedPageData] = useState(null);
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [publishedUrl, setPublishedUrl] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [showingPreview, setShowingPreview] = useState(false);
  const [previewPageId, setPreviewPageId] = useState(null);

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

  // Countdown timer during building
  useEffect(() => {
    if (!isBuilding) {
      setCountdown(60);
      return;
    }
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [isBuilding]);

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
        if (!formData.contactPhone) newErrors.contactPhone = 'נא להזין טלפון ליצירת קשר';
        if (formData.formFields.length === 0) newErrors.formFields = 'איזה פרטים לקלוט?';
        if (!formData.leadDestination) newErrors.leadDestination = 'לאן לשלוח את הליד?';
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
    if (!validateStep(currentStep)) return;

    setIsBuilding(true);

    try {
      // Step 1: Create the landing page
      console.log('[STEP 1] Creating landing page...');
      const createRes = await base44.functions.invoke('createLandingPage', { data: formData });

      if (!createRes?.data?.id) {
        throw new Error('Failed to create page - no ID returned');
      }

      const pageId = createRes.data.id;
      console.log('[STEP 1] ✓ Page created with ID:', pageId);

      // Step 2: Use the returned data directly (Fastest & Most Reliable)
      // This avoids DB replication lag/RLS issues where the page exists but isn't readable yet
      const pageData = createRes.data;
      
      // Validate critical data exists
      if (!pageData.sections_json || pageData.sections_json.length === 0) {
         console.error('❌ Critical: Created page missing sections_json', pageData);
         throw new Error('הדף נוצר אך התוכן חסר. אנא נסה שוב.');
      }

      console.log('[STEP 2] ✓ Using returned page data immediately');
      setCreatedPageData(pageData);
      setPageSlug(pageData.slug || pageId);
      setPreviewPageId(pageId);
      console.log('[STEP 2] ✓ Page data loaded');

      // Show preview first (don't publish yet)
      setIsBuilding(false);
      setShowingPreview(true);
      localStorage.removeItem('landingPageFormData');

    } catch (error) {
      console.error('❌ Landing page creation failed:', error);
      setCreationError(error.message || 'אירעה שגיאה בבניית הדף');
      // Keep isBuilding true so we show the error state inside the building view
    }
  };

  const [showCheckout, setShowCheckout] = useState(false);

  const handlePublishToLive = () => {
    // Open checkout dialog instead of publishing directly
    setShowCheckout(true);
  };

  const handlePaymentSuccess = async () => {
    // After successful payment, publish to live domain
    setShowCheckout(false);
    setIsPublishing(true);
    try {
      let url = null;
      
      // First try: publish
      try {
        const publishRes = await base44.functions.invoke('publishLandingPage', {
          landingPageId: previewPageId,
          action: 'publish'
        });
        url = publishRes?.data?.url;
      } catch (e) {
        console.log('Publish attempt:', e.message);
      }
      
      // Fallback: fetch the landing page to get its published_url
      if (!url) {
        try {
          const pageRes = await base44.functions.invoke('getPublicLandingPageById', { pageId: previewPageId });
          url = pageRes?.data?.published_url;
        } catch (e) {
          console.log('Fetch page attempt:', e.message);
        }
      }

      // Last fallback: construct URL from slug
      if (!url && pageSlug) {
        url = `https://one-pai.com/LP?s=${pageSlug}`;
      }

      // CRITICAL: Move away from the preview/draft screen and show published URL
      setShowingPreview(false);
      setIsBuilding(false);
      
      if (url) {
        setPublishedUrl(url);
      } else {
        toast.error('התשלום בוצע! הדף פורסם אך לא הצלחנו לטעון את הקישור. בדוק במוצרים שלי.');
      }
    } catch (error) {
      console.error('Error publishing:', error);
      setShowingPreview(false);
      toast.error('התשלום בוצע! אירעה שגיאה בטעינת הקישור.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePurchase = async () => {
    setIsPublishing(true);
    try {
      // Mark as paid
      await base44.functions.invoke('publishLandingPage', {
        landingPageId: createdPageData?.id,
        action: 'markPaid'
      });

      // Publish to get real domain
      const response = await base44.functions.invoke('publishLandingPage', {
        landingPageId: createdPageData?.id,
        action: 'publish'
      });

      if (response.data?.url) {
        setPublishedUrl(response.data.url);
      } else {
        alert('שגיאה בפרסום הדף. אנא נסה שוב.');
      }
    } catch (error) {
      console.error('Error publishing:', error);
      alert('אירעה שגיאה בפרסום. אנא נסה שוב.');
    } finally {
      setIsPublishing(false);
    }
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
                  className={cn("h-9 text-base md:text-xs", errors.businessName && 'border-red-500 focus-visible:ring-red-500')} 
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
                  className={cn("h-9 text-base md:text-xs", errors.mainField && 'border-red-500 focus-visible:ring-red-500')} 
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
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-full text-base md:text-xs"
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
                  className={cn("h-20 resize-none text-base md:text-xs", errors.painPoints && 'border-red-500')} 
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
                  className={cn("h-20 resize-none text-base md:text-xs", errors.consequences && 'border-red-500')} 
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
                  className={cn("h-9 text-base md:text-xs", errors.serviceOffered && 'border-red-500')} 
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
                  className="bg-gray-50 h-8 text-base md:text-xs"
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
                  className={cn("h-9 text-base md:text-xs", errors.processSteps && 'border-red-500')} 
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
                    className="mr-8 w-[calc(100%-2rem)] h-8 text-base md:text-xs"
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
                    className="mr-8 w-[calc(100%-2rem)] min-h-[50px] text-base md:text-xs"
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

              {/* Public Contact Phone */}
              <div className="space-y-2">
                <Label className="block font-bold text-xs">טלפון ליצירת קשר (יופיע באתר)</Label>
                <div className="relative bg-white rounded-md">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input 
                    placeholder="050-0000000"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className={cn("pr-8 h-9 text-base md:text-xs border-gray-200 focus-visible:ring-teal-500 w-full", errors.contactPhone && "border-red-500")}
                  />
                </div>
                {errors.contactPhone && <p className="text-red-500 text-[10px]">{errors.contactPhone}</p>}
              </div>

              <div className="space-y-2">
                <Label className="block font-bold text-xs">לאן הליד יגיע?</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div className="space-y-2">
                    <SelectionCard
                      selected={formData.leadDestination === 'email'}
                      onClick={() => handleInputChange('leadDestination', 'email')}
                      icon={Mail}
                      title="מייל שלי"
                    />
                    
                    <AnimatePresence>
                      {formData.leadDestination === 'email' && (
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
                                className="pr-8 h-9 text-base md:text-xs border-gray-200 focus-visible:ring-teal-500 w-full"
                                autoFocus
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div 
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 bg-gray-50/80 cursor-default opacity-70"
                  >
                    <div className="p-1.5 rounded-lg bg-gray-100 text-gray-400 flex-shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-gray-500 leading-tight">מערכת CRM</div>
                      <div className="text-[10px] text-gray-400 leading-tight mt-0.5">לאחר קבלת הדף יהיה ניתן לחבר למערכות CRM</div>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 rounded-3xl overflow-hidden relative">

            {/* Minimal Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30 px-5 py-4 flex items-center justify-between shrink-0">
              <button 
                onClick={handlePrev}
                className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <Button 
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Scrollable Content - Clean & Minimal */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="max-w-lg mx-auto px-5 py-10 space-y-8">

                {/* Hero - Simple & Premium */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4"
                >
                  <div className="w-14 h-14 mx-auto bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">
                      {formData.businessName}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">הדף שלך מוכן לבנייה</p>
                  </div>
                </motion.div>

                {/* What we build - Compact List */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-2"
                >
                  {[
                    { label: 'כותרות שיווקיות', detail: 'קופי מקצועי בעברית' },
                    { label: '8 סקשנים משכנעים', detail: 'כאב → פתרון → הוכחות → טופס' },
                    { label: `עיצוב ${formData.pageStyle || 'מקצועי'}`, detail: 'צבעים, תמונות ואנימציות' },
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx + 0.2 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 text-sm">{item.label}</div>
                        <div className="text-xs text-gray-400">{item.detail}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* KEY Message - Editable after purchase */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center"
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-relaxed">
                    לאחר הבחירה והתשלום, תוכל לערוך את כל התוכן והעיצוב של הדף בקלות.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    שנה טקסטים, תמונות, צבעים וכל מה שתרצה — בלי מגבלות.
                  </p>
                </motion.div>

              </div>
            </div>

            {/* Sticky Footer CTA - Clean */}
            <div className="p-5 bg-white border-t border-gray-100 z-40 sticky bottom-0 w-full">
              <div className="max-w-lg mx-auto w-full">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSubmit}
                    className="w-full h-13 py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    בנה את הדף שלי
                  </motion.button>
                  <p className="text-center text-[11px] text-gray-400 mt-2.5">כ-60 שניות · ללא התחייבות</p>
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
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative z-10 mb-8"
              >
                <div className="relative w-32 h-32">
                  {/* Outer rotating ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-blue-400 rounded-full"
                  />
                  {/* Middle pulsing ring */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-4 border-2 border-blue-300 rounded-full"
                  />
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative z-10 text-center space-y-3"
              >
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                  בונה את הדף שלך ✨
                </h3>
                <p className="text-slate-600 text-sm md:text-base max-w-xs mx-auto">
                  הבינה המלאכותית בחוכמה מחברת את כל החלקים לדף מושלם
                </p>
                <div className="flex gap-2 justify-center pt-2">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-blue-600"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-blue-600"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-blue-600"
                  />
                </div>
              </motion.div>

              {/* Loading steps or Error View */}
              {creationError ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-10 mt-10 mb-8 flex flex-col items-center max-w-sm text-center"
                >
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">אופס, משהו השתבש</h4>
                  <p className="text-slate-600 text-sm mb-6">
                    נתקלנו בבעיה קטנה בבניית הדף. אל דאגה, זה קורה לפעמים בגלל עומס.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => {
                        setCreationError(null);
                        setIsBuilding(false);
                      }}
                      variant="outline"
                      className="border-red-200 hover:bg-red-50 text-red-700"
                    >
                      חזור לעריכה
                    </Button>
                    <Button 
                      onClick={() => {
                        setCreationError(null);
                        handleSubmit({ preventDefault: () => {} });
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
                    >
                      נסה שוב
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Countdown Timer */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="relative z-10 mt-10 mb-8"
                  >
                    <div className="relative w-28 h-28">
                      <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${(countdown / 60) * 283} 283`}
                          animate={{ strokeDasharray: [`${(countdown / 60) * 283} 283`] }}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                          key={countdown}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-4xl font-black text-blue-600"
                        >
                          {countdown}
                        </motion.div>
                        <span className="text-xs text-slate-500 mt-1">שניות</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="relative z-10 space-y-3 text-sm"
                  >
                    <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600" /> ניתוח העסק שלך
                    </motion.div>
                    <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600" /> יצירת תוכן עמוק
                    </motion.div>
                    <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="flex items-center gap-2 text-slate-700">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" /> שיפור עיצובים
                    </motion.div>
                  </motion.div>
                </>
              )}
            </div>
          ) : showingPreview ? (
            <div className="flex flex-col h-full bg-slate-50 animate-in fade-in zoom-in duration-500 relative overflow-hidden">

              {/* Header */}
              <div className="flex-none bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-20 shadow-sm">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                    הטיוטה שלך מוכנה ✨
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    זו תצוגה זמנית. בחר אם את רוצה להמשיך או לערוך.
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setShowingPreview(false)} size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></Button>
              </div>

              {/* Main Content - Centered Preview Trigger */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden relative">
                 <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px]" />

                 <div className="relative z-10 w-full max-w-2xl group cursor-pointer" onClick={() => setIsFullPreviewOpen(true)}>
                    {/* Floating Badge */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-blue-200 z-20 animate-bounce">
                       לחץ כאן לתצוגה מלאה 👇
                    </div>

                    {/* The Card */}
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-500 transform group-hover:scale-[1.02] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]">
                        {/* Browser Header */}
                        <div className="bg-slate-100 border-b border-slate-200 p-3 flex items-center gap-3">
                           <div className="flex gap-1.5">
                             <div className="w-3 h-3 rounded-full bg-red-400" />
                             <div className="w-3 h-3 rounded-full bg-amber-400" />
                             <div className="w-3 h-3 rounded-full bg-green-400" />
                           </div>
                           <div className="flex-1 bg-white h-6 rounded-md shadow-sm border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                              one-pai.com/LP?s={pageSlug}
                           </div>
                        </div>

                        {/* Preview Placeholder Area */}
                        <div className="aspect-[16/9] bg-slate-50 relative overflow-hidden flex items-center justify-center">
                           {!createdPageData ? (
                              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                           ) : (
                              <>
                                 <div className="absolute inset-0 opacity-40 blur-[2px] group-hover:blur-sm transition-all duration-500 scale-[0.6] origin-top pointer-events-none select-none">
                                    <DynamicLandingPage data={createdPageData} isThumbnail={true} />
                                 </div>
                                 <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                 {/* Big Play Button */}
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 border border-white/50">
                                       <Eye className="w-8 h-8 text-blue-600 ml-1" />
                                    </div>
                                 </div>
                              </>
                           )}
                        </div>
                    </div>
                 </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="flex-none bg-white border-t border-slate-100 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
                 <div className="max-w-4xl mx-auto">
                    <div className="mb-4 p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="text-sm font-bold text-white">הטיוטה שלך מוכנה לתצוגה</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 text-slate-300 text-xs">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-emerald-400" /></div>
                          <span>צפה בדף המלא בדומיין זמני</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300 text-xs">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-emerald-400" /></div>
                          <span>המשך לדומיין אמיתי עם רכישה</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300 text-xs">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-emerald-400" /></div>
                          <span>לאחר הרכישה — עריכה מלאה, חיבור CRM ואנליטיקס</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                       <Button
                         onClick={() => {
                            addToCart({
                                type: 'landing_page',
                                data: {
                                    landingPageId: createdPageData?.id,
                                    slug: pageSlug,
                                    businessName: formData.businessName,
                                    sections: createdPageData?.sections_json
                                },
                                price: 299,
                                title: `דף נחיתה: ${formData.businessName}`,
                                preview_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60',
                                description: 'דף נחיתה ממותג כולל תוכן ועיצוב',
                                openCart: false
                                });
                            toast.success('נוסף לסל בהצלחה!');
                            // Stay on page to allow continuing the process
                         }}
                         variant="secondary"
                         className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold flex-1 flex items-center justify-center gap-2"
                       >
                         <ShoppingCart className="w-4 h-4" />
                         הוסף לסל
                       </Button>
                       <Button
                         onClick={handlePublishToLive}
                         disabled={isPublishing}
                         className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-200 font-bold flex-1 flex items-center justify-center gap-2"
                       >
                         {isPublishing ? (
                            <>
                               <Loader2 className="w-4 h-4 animate-spin" />
                               מעבד...
                            </>
                         ) : (
                            <>
                               🚀 המשך לדומיין אמיתי
                            </>
                         )}
                       </Button>
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
                                  <span className="text-xs text-slate-500 dir-ltr font-mono">one-pai.com/LP/{pageSlug}</span>
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

              {/* Checkout Dialog - Tranzila Payment */}
              <CheckoutDialog 
                open={showCheckout}
                onClose={() => setShowCheckout(false)}
                product={{
                  name: `דף נחיתה: ${formData.businessName}`,
                  description: 'דף נחיתה ממותג כולל תוכן, עיצוב ודומיין אמיתי',
                  price: 299,
                  product_type: 'landing-page',
                  product_id: previewPageId || '',
                  metadata: {
                    landingPageId: previewPageId,
                    slug: pageSlug,
                    businessName: formData.businessName
                  }
                }}
                onPaymentSuccess={handlePaymentSuccess}
              />

            </div>
          ) : publishedUrl ? (
            <div className="flex flex-col h-full bg-slate-50 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
              
              {/* Header */}
              <div className="flex-none bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-20 shadow-sm">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                    הדף שלך מוכן 🎉
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    זו טיוטה ראשונית. אל דאגה, תוכל לערוך הכל אחרי הרכישה.
                  </p>
                </div>
                <Button variant="ghost" onClick={onClose} size="icon" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></Button>
              </div>

              {/* Main Content - Centered Preview Trigger */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden relative">
                 <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px]" />
                 
                 <div className="relative z-10 w-full max-w-2xl group cursor-pointer" onClick={() => setIsFullPreviewOpen(true)}>
                    {/* Floating Badge */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-blue-200 z-20 animate-bounce">
                       לחץ כאן לתצוגה מקדימה 👇
                    </div>

                    {/* The Card */}
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-500 transform group-hover:scale-[1.02] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]">
                        {/* Browser Header */}
                        <div className="bg-slate-100 border-b border-slate-200 p-3 flex items-center gap-3">
                           <div className="flex gap-1.5">
                             <div className="w-3 h-3 rounded-full bg-red-400" />
                             <div className="w-3 h-3 rounded-full bg-amber-400" />
                             <div className="w-3 h-3 rounded-full bg-green-400" />
                           </div>
                           <div className="flex-1 bg-white h-6 rounded-md shadow-sm border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                              one-pai.com/LP?s={pageSlug}
                           </div>
                        </div>
                        
                        {/* Preview Placeholder Area */}
                        <div className="aspect-[16/9] bg-slate-50 relative overflow-hidden flex items-center justify-center">
                           {!createdPageData ? (
                              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                           ) : (
                              <>
                                 <div className="absolute inset-0 opacity-40 blur-[2px] group-hover:blur-sm transition-all duration-500 scale-[0.6] origin-top pointer-events-none select-none">
                                    <DynamicLandingPage data={createdPageData} isThumbnail={true} />
                                 </div>
                                 <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                 
                                 {/* Big Play Button */}
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 border border-white/50">
                                       <Eye className="w-8 h-8 text-blue-600 ml-1" />
                                    </div>
                                 </div>
                              </>
                           )}
                        </div>
                    </div>
                 </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="flex-none bg-white border-t border-slate-100 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
                 <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                    
                    <div className="flex-1 w-full md:w-auto">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-700">חבילת השקה הכל-כלול</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">מומלץ</span>
                       </div>
                       <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> דומיין מתנה</span>
                          <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> אחסון מהיר</span>
                          <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> ללא פרסומות</span>
                       </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                       {/* Preview Link */}
                       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                          <div className="text-[10px] text-slate-500 font-bold mb-2">תצוגה מקדימה (פנימית בלבד):</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0 bg-white rounded-lg p-3 border border-blue-100 font-mono text-xs font-bold text-blue-600 truncate">
                              preview-sandbox
                            </div>
                            <Button 
                              onClick={() => {
                                window.open(`/preview/${createdPageData?.id}`, '_blank');
                              }}
                              className="h-12 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold flex-shrink-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                       </div>

                       {/* Price & CTA */}
                       <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-black text-slate-900">299₪</span>
                            <span className="text-xs text-slate-400 line-through">990₪</span>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                               onClick={() => addToCart({
                                 type: 'landing_page',
                                 data: { pageId: createdPageData?.id, slug: pageSlug, businessName: formData.businessName },
                                 price: 299,
                                 title: `דף נחיתה: ${formData.businessName}`,
                                 description: 'דף נחיתה ממותג',
                                 preview_image: 'https://cdn.dribbble.com/users/1615584/screenshots/15710288/media/7847c075727463697274636972746369.jpg', // Placeholder or use screenshot service if available
                                 openCart: false
                               })}
                               className="h-12 px-6 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-bold flex-shrink-0"
                            >
                               הוסף לסל
                            </Button>
                            <Button 
                               onClick={() => handlePurchase()}
                               disabled={isPublishing}
                               className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-200 font-bold disabled:opacity-50"
                            >
                               {isPublishing ? (
                                  <>
                                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                     מעבד...
                                  </>
                               ) : (
                                  <>
                                     המשך לרכישה
                                     <CreditCard className="w-4 h-4 mr-2" />
                                  </>
                               )}
                            </Button>
                          </div>
                       </div>
                    </div>

                 </div>
                 
                 <div className="text-center mt-3">
                    <button onClick={() => onComplete(formData)} className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline">
                       אני רוצה לשמור כטיוטה ולהמשיך אחר כך
                    </button>
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
                                  <span className="text-xs text-slate-500 dir-ltr font-mono">one-pai.com/LP/{pageSlug}</span>
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

      {/* Success Modal - Published to Air */}
      <AnimatePresence>
        {publishedUrl && (
          <Dialog open={!!publishedUrl} onOpenChange={(open) => !open && setPublishedUrl(null)}>
            <DialogContent className="max-w-lg rounded-3xl border-0 shadow-2xl bg-gradient-to-b from-white to-slate-50 overflow-hidden">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-center py-8 px-6 space-y-6"
              >
                {/* Success Icon with Animation */}
                <motion.div 
                  className="relative flex justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <div className="absolute inset-0 bg-green-100 blur-2xl opacity-50 rounded-full animate-pulse" />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <CheckCircle2 className="w-12 h-12" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Message */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-4xl font-black text-slate-900">הדף שלך באוויר 🚀</h2>
                  <p className="text-slate-600 text-base">תודה על הרכישה! הנה הדומיין שלך:</p>
                </motion.div>

                {/* URL Box */}
                <motion.div 
                  className="bg-white border-2 border-green-200 rounded-2xl p-6 space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">קישור ייחודי שלך:</div>
                  <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <code className="flex-1 font-mono text-sm font-bold text-green-700 break-all">{publishedUrl}</code>
                    <motion.button
                      onClick={() => {
                        navigator.clipboard.writeText(publishedUrl);
                        alert('✓ קישור הועתק!');
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0 p-3 hover:bg-slate-200 rounded-lg transition-colors"
                      title="העתק קישור"
                    >
                      <Copy className="w-5 h-5 text-slate-600" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-3 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={() => window.open(publishedUrl, '_blank')}
                    className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg"
                  >
                    פתח את הדף
                    <ExternalLink className="w-4 h-4 mr-2" />
                  </Button>
                  <Button
                    onClick={() => setPublishedUrl(null)}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl font-bold"
                  >
                    סגור
                    <X className="w-4 h-4 mr-2" />
                  </Button>
                </motion.div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

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