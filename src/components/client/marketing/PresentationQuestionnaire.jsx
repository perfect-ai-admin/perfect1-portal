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
  Upload, Layers, FileText, MonitorPlay, BarChart3, Star,
  Lightbulb, Trophy, Presentation, Calendar, Loader2, ExternalLink, CheckCircle2, Maximize2, Globe, Download
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { addToCart } from '../shared/cartUtils';
import { useQuery } from '@tanstack/react-query';
import CheckoutDialog from '@/components/checkout/CheckoutDialog';

// Custom specialized card selector component for better UX
const SelectionCard = ({ selected, onClick, icon: Icon, title, description, className }) => (
  <div 
    onClick={onClick}
    className={cn(
      "cursor-pointer relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 h-full",
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

export default function PresentationQuestionnaire({ onComplete, onClose, onSwitchToLogo }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;
  
  const [formData, setFormData] = useState({
    // Step 1
    presentationType: [],
    targetAudience: [],
    // Step 2
    businessName: '',
    businessField: '',
    businessDescription: '',
    // Step 3
    painPoint: '',
    whyPainful: [],
    currentSolutions: '',
    // Step 4
    solution: '',
    solutionSteps: { step1: '', step2: '', step3: '' },
    // Step 5
    uniqueAdvantage: [],
    advantageExplanation: '',
    // Step 6
    proofs: [],
    strongMetric: '',
    // Step 7
    valueProposition: '',
    afterPicture: '',
    // Step 8
    additionalDetails: '',
    uploadedFileUrl: null,
    uploadedFileName: '',
    // Step 9
    style: '',
    colors: '',
    logoStatus: '',
    logoFile: null,
    gammaTheme: null,
    gammaFolder: null,
    // Step 10
    language: 'hebrew',
    length: ''
  });

  const [errors, setErrors] = useState({});
  const [isBuilding, setIsBuilding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [presentationUrl, setPresentationUrl] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [themes, setThemes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showDraftPreview, setShowDraftPreview] = useState(false);
  const [draftPreviewUrl, setDraftPreviewUrl] = useState(null);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

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

  // Set predefined professional themes
  useEffect(() => {
    const predefinedThemes = [
      { id: 'minimal', name: 'מינימליסטי', type: 'modern' },
      { id: 'corporate', name: 'קורפוראטיבי', type: 'professional' },
      { id: 'creative', name: 'יצירתי', type: 'bold' },
      { id: 'startup', name: 'סטארטאפ', type: 'trendy' }
    ];
    setThemes(predefinedThemes);
  }, []);

  // Fetch folders from backend
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await base44.functions.invoke('getGammaFolders', {});
        if (response.data.success) {
          setFolders(response.data.folders);
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
        setFolders([]);
      }
    };
    fetchFolders();
  }, []);

  // Scroll to top on step change for mobile
  useEffect(() => {
    const scrollArea = document.getElementById('questionnaire-scroll-area');
    if (scrollArea) scrollArea.scrollTop = 0;
    // Also scroll window to top to prevent page jumping
    window.scrollTo(0, 0);
  }, [currentStep, showDraftPreview, paymentComplete]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logoFile: file, logoStatus: 'uploaded' }));
    }
  };

  const handleAdditionalFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.info('מעלה קובץ...');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ 
        ...prev, 
        uploadedFileUrl: file_url, 
        uploadedFileName: file.name 
      }));
      toast.success('הקובץ הועלה בהצלחה!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת הקובץ');
    }
  };

  const validateStep = (step) => {
    // For now basic validation to not block flow too much
    return true; 
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
         // Call the correct function name
         const response = await base44.functions.invoke('generatePresentationWithGamma', { formData });

         console.log('🔵 Full response object:', response);
         console.log('🔵 response.data:', response.data);
         console.log('🔵 response.data.presentationUrl:', response.data?.presentationUrl);

         if (response.data.success) {
           const url = response.data.presentationUrl;
           const pdf = response.data.pdfUrl;
           console.log('✅ Setting presentation URL:', url);
           console.log('✅ Setting PDF URL:', pdf);
           setPresentationUrl(url);
           setDraftPreviewUrl(url);
           if (pdf) setPdfUrl(pdf);
           setShowDraftPreview(true);
           toast.success('המצגה שלך מוכנה! 🎉');
         } else {
           console.error('❌ API returned error:', response.data);
           toast.error('שגיאה: ' + (response.data.error || 'לא הצלח ליצור מצגה'));
         }
       } catch (error) {
         console.error('❌ Exception error:', error);
         toast.error('שגיאה בחיבור לשרת. בדוק את הגדרות ה-API.');
       } finally {
         setIsBuilding(false);
       }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Type & Audience
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Presentation} 
              title="סוג וקהל" 
              description="למי המצגת מיועדת?"
              colorClass="bg-blue-100 text-blue-600"
            />
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold">לאיזה מטרה?</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'customers', label: 'הצגת שירות/מוצר ללקוחות', icon: Users },
                    { id: 'investors', label: 'משקיעים / שותפים', icon: Briefcase },
                    { id: 'both', label: 'גם וגם', icon: Layers }
                  ].map(option => (
                    <SelectionCard
                      key={option.id}
                      selected={formData.presentationType.includes(option.id)}
                      onClick={() => handleCheckboxChange('presentationType', option.id, !formData.presentationType.includes(option.id))}
                      icon={option.icon}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold">מי הקהל העיקרי?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'individuals', label: 'לקוחות פרטיים', icon: Users },
                    { id: 'smb', label: 'עסקים קטנים', icon: Building2 },
                    { id: 'companies', label: 'חברות גדולות', icon: Building2 },
                    { id: 'investors', label: 'משקיעים', icon: Wallet }
                  ].map(option => (
                    <SelectionCard
                      key={option.id}
                      selected={formData.targetAudience.includes(option.id)}
                      onClick={() => handleCheckboxChange('targetAudience', option.id, !formData.targetAudience.includes(option.id))}
                      icon={option.icon}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Business Details
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Building2} 
              title="פרטי העסק" 
              description="ספרו לנו על עצמכם"
              colorClass="bg-indigo-100 text-indigo-600"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="businessName" className="text-xs font-semibold">שם העסק / המיזם</Label>
                <Input 
                  id="businessName" 
                  value={formData.businessName} 
                  onChange={(e) => handleInputChange('businessName', e.target.value)} 
                  placeholder="למשל: Perfect One" 
                  className="h-10 text-base md:h-9 md:text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="businessField" className="text-xs font-semibold">תחום פעילות</Label>
                <Input 
                  id="businessField" 
                  value={formData.businessField} 
                  onChange={(e) => handleInputChange('businessField', e.target.value)} 
                  placeholder="למשל: ייעוץ עסקי" 
                  className="h-10 text-base md:h-9 md:text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="businessDescription" className="text-xs font-semibold">במשפט אחד - מה אתם עושים?</Label>
                <Textarea 
                  id="businessDescription"
                  value={formData.businessDescription} 
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)} 
                  placeholder="אנחנו עוזרים ל... לעשות... כדי ש..." 
                  className="h-20 text-base md:text-xs resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 3: // The Problem
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={AlertCircle} 
              title="הבעיה" 
              description="מה הכאב של הקהל?"
              colorClass="bg-red-100 text-red-600"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="painPoint" className="text-xs font-semibold">מה הבעיה הכואבת של הקהל?</Label>
                <Textarea 
                  id="painPoint"
                  value={formData.painPoint} 
                  onChange={(e) => handleInputChange('painPoint', e.target.value)} 
                  placeholder="תארו את הבעיה בפרטים..." 
                  className="h-20 text-base md:text-xs resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold">למה זה קריטי?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'money', label: 'כסף', icon: Wallet },
                    { id: 'time', label: 'זמן', icon: Clock },
                    { id: 'frustration', label: 'תסכול', icon: AlertCircle },
                    { id: 'uncertainty', label: 'חוסר ודאות', icon: Target }
                  ].map(option => (
                    <SelectionCard
                      key={option.id}
                      selected={formData.whyPainful.includes(option.id)}
                      onClick={() => handleCheckboxChange('whyPainful', option.id, !formData.whyPainful.includes(option.id))}
                      icon={option.icon}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Solution
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Zap} 
              title="הפתרון" 
              description="איך אתם פותרים את זה?"
              colorClass="bg-yellow-100 text-yellow-600"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="solution" className="text-xs font-semibold">מה הפתרון שאתם מציעים?</Label>
                <Textarea 
                  id="solution"
                  value={formData.solution} 
                  onChange={(e) => handleInputChange('solution', e.target.value)} 
                  placeholder="תארו את הפתרון בקצרה" 
                  className="h-16 text-base md:text-xs resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold">איך זה עובד? (3 שלבים)</Label>
                <div className="space-y-2">
                  <Input 
                    value={formData.solutionSteps.step1} 
                    onChange={(e) => handleNestedInputChange('solutionSteps', 'step1', e.target.value)} 
                    placeholder="שלב 1" 
                    className="h-10 text-base md:h-8 md:text-xs"
                  />
                  <Input 
                    value={formData.solutionSteps.step2} 
                    onChange={(e) => handleNestedInputChange('solutionSteps', 'step2', e.target.value)} 
                    placeholder="שלב 2" 
                    className="h-10 text-base md:h-8 md:text-xs"
                  />
                  <Input 
                    value={formData.solutionSteps.step3} 
                    onChange={(e) => handleNestedInputChange('solutionSteps', 'step3', e.target.value)} 
                    placeholder="שלב 3" 
                    className="h-10 text-base md:h-8 md:text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Unique Advantage
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Star} 
              title="היתרון שלכם" 
              description="מה מבדיל אתכם?"
              colorClass="bg-amber-100 text-amber-600"
            />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold">במה אתם שונים?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'simplicity', label: 'פשטות', icon: Check },
                    { id: 'price', label: 'מחיר', icon: Wallet },
                    { id: 'speed', label: 'מהירות', icon: Clock },
                    { id: 'experience', label: 'ניסיון', icon: Briefcase },
                    { id: 'technology', label: 'טכנולוגיה', icon: MonitorPlay },
                    { id: 'service', label: 'שירות אישי', icon: Users }
                  ].map(option => (
                    <SelectionCard
                      key={option.id}
                      selected={formData.uniqueAdvantage.includes(option.id)}
                      onClick={() => handleCheckboxChange('uniqueAdvantage', option.id, !formData.uniqueAdvantage.includes(option.id))}
                      icon={option.icon}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                 <Label className="text-xs font-semibold">למה זה עדיף על האלטרנטיבה?</Label>
                 <Textarea 
                  value={formData.advantageExplanation} 
                  onChange={(e) => handleInputChange('advantageExplanation', e.target.value)} 
                  placeholder="הסבירו בקצרה..." 
                  className="h-14 text-base md:text-xs resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 6: // Proofs
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Trophy} 
              title="הוכחות ואמון" 
              description="למה שיאמינו לכם?"
              colorClass="bg-orange-100 text-orange-600"
            />

            <div className="space-y-3">
               <div className="space-y-2">
                <Label className="block text-xs font-semibold">מה יש לכם להציג?</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'customers', label: 'לקוחות קיימים / המלצות', icon: Users },
                    { id: 'metrics', label: 'מספרים ותוצאות', icon: BarChart3 },
                    { id: 'experience', label: 'ניסיון / ותק בשוק', icon: Briefcase },
                    { id: 'partnerships', label: 'שיתופי פעולה אסטרטגיים', icon: Layers }
                  ].map(option => (
                    <SelectionCard
                      key={option.id}
                      selected={formData.proofs.includes(option.id)}
                      onClick={() => handleCheckboxChange('proofs', option.id, !formData.proofs.includes(option.id))}
                      icon={option.icon}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">נתון אחד חזק (אופציונלי)</Label>
                <Input 
                  value={formData.strongMetric} 
                  onChange={(e) => handleInputChange('strongMetric', e.target.value)} 
                  placeholder="למשל: 5000+ לקוחות, 98% הצלחה" 
                  className="h-10 text-base md:h-9 md:text-xs"
                />
              </div>
            </div>
          </div>
        );

      case 7: // Value Proposition
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Lightbulb} 
              title="הצעת הערך" 
              description="מה הלקוח מקבל?"
              colorClass="bg-teal-100 text-teal-600"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">מה מקבלים בפועל?</Label>
                <Textarea 
                  value={formData.valueProposition} 
                  onChange={(e) => handleInputChange('valueProposition', e.target.value)} 
                  placeholder="תוצאה ברורה ולא רק 'שירות'..." 
                  className="h-20 text-base md:text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">איך החיים יראו אחרי?</Label>
                <Textarea 
                  value={formData.afterPicture} 
                  onChange={(e) => handleInputChange('afterPicture', e.target.value)} 
                  placeholder="תארו את המצב החדש והטוב יותר..." 
                  className="h-20 text-base md:text-xs resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 8: // Additional Details
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={FileText} 
              title="מידע נוסף" 
              description="פרטים נוספים ומסמכים"
              colorClass="bg-purple-100 text-purple-600"
            />

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="additionalDetails" className="text-xs font-semibold">פרטים נוספים (טקסט חופשי)</Label>
                <Textarea 
                  id="additionalDetails"
                  value={formData.additionalDetails} 
                  onChange={(e) => handleInputChange('additionalDetails', e.target.value)} 
                  placeholder="הוסיפו כל פרט רלוונטי נוסף שיעזור לנו לבנות את המצגת..." 
                  className="h-32 text-base md:text-xs resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold">העלאת קובץ (אופציונלי - אקסל, PDF, וכו')</Label>
                <div 
                  className={cn(
                    "border border-dashed rounded-xl p-4 transition-all text-center cursor-pointer relative",
                    formData.uploadedFileUrl ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                  )}
                >
                  <input 
                    type="file" 
                    onChange={handleAdditionalFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1 pointer-events-none">
                    {formData.uploadedFileUrl ? (
                      <>
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-xs font-bold text-green-700">הקובץ הועלה בהצלחה!</span>
                        <span className="text-[10px] text-green-600">{formData.uploadedFileName}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-700">לחץ להעלאת קובץ</span>
                        <span className="text-[10px] text-gray-500">אקסל, PDF, תמונה או כל קובץ אחר</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 9: // Design & Logo
         return (
           <div className="space-y-3">
             <StepHeader 
               icon={Paintbrush} 
               title="עיצוב ולוגו" 
               description="איך זה יראה?"
               colorClass="bg-pink-100 text-pink-600"
             />

             <div className="space-y-3">
 


              <div className="space-y-2">
                <Label className="block text-xs font-semibold">סגנון מועדף</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'professional', label: 'רציני / עסקי', color: 'bg-slate-100' },
                    { id: 'innovative', label: 'חדשני', color: 'bg-blue-50' },
                    { id: 'simple', label: 'נקי ופשוט', color: 'bg-white border' },
                    { id: 'premium', label: 'יוקרתי', color: 'bg-stone-900 text-white' }
                  ].map(option => (
                    <div 
                      key={option.id}
                      onClick={() => handleInputChange('style', option.id)}
                      className={cn(
                        "cursor-pointer p-2 rounded-xl border text-center transition-all",
                        formData.style === option.id
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

               <div className="space-y-1">
                <Label className="text-xs font-semibold">צבעים מועדפים</Label>
                <Input 
                  value={formData.colors} 
                  onChange={(e) => handleInputChange('colors', e.target.value)} 
                  placeholder="למשל: כחול וזהב" 
                  className="h-10 text-base md:h-9 md:text-xs"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100">
                <Label className="text-xs font-semibold">לוגו העסק</Label>
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
                          <span className="text-xs font-bold text-green-700">הלוגו נשמר!</span>
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
                    <button
                      type="button"
                      onClick={onSwitchToLogo}
                      className="flex-1 py-2 px-2 bg-pink-600 text-white rounded-lg text-xs font-bold hover:bg-pink-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Paintbrush className="w-3 h-3" />
                      עצב לוגו
                    </button>
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

      case 10: // Technical
        return (
          <div className="space-y-3">
             <StepHeader 
              icon={MonitorPlay} 
              title="פרטים טכניים" 
              description="הגדרות אחרונות"
              colorClass="bg-gray-100 text-gray-600"
            />

            <div className="space-y-4">
               <div className="space-y-2">
                <Label className="block text-xs font-semibold">שפת המצגת</Label>
                <div className="flex gap-2">
                   {[
                    { id: 'hebrew', label: 'עברית' },
                    { id: 'english', label: 'אנגלית' }
                  ].map(option => (
                    <div 
                      key={option.id}
                      onClick={() => handleInputChange('language', option.id)}
                      className={cn(
                        "flex-1 cursor-pointer p-2 rounded-xl border text-center transition-all",
                        formData.language === option.id 
                          ? "border-gray-500 bg-gray-50 text-gray-900 font-bold" 
                          : "border-gray-200 text-gray-500"
                      )}
                    >
                      <span className="text-xs">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

               <div className="space-y-2">
                <Label className="block text-xs font-semibold">אורך רצוי</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'short', label: 'קצר ולעניין', desc: '6-8 שקפים' },
                    { id: 'medium', label: 'סטנדרטי', desc: '10-12 שקפים' },
                    { id: 'full', label: 'מקיף ומלא', desc: '15-20 שקפים' }
                  ].map(option => (
                     <SelectionCard
                      key={option.id}
                      selected={formData.length === option.id}
                      onClick={() => handleInputChange('length', option.id)}
                      icon={Layers}
                      title={option.label}
                      description={option.desc}
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

  const handlePaymentSuccess = async (paymentId) => {
    try {
      const user = await base44.auth.me();
      
      // Save to PurchasedProduct - prefer PDF URL for download
      const finalDownloadUrl = pdfUrl || draftPreviewUrl;
      await base44.entities.PurchasedProduct.create({
        user_id: user.id,
        product_type: 'presentation',
        product_name: `מצגת עסקית: ${formData.businessName || 'ללא שם'}`,
        status: 'active',
        payment_id: paymentId,
        purchase_price: 199,
        download_url: finalDownloadUrl,
        published_url: draftPreviewUrl,
        metadata: {
          presentationUrl: draftPreviewUrl,
          pdfUrl: pdfUrl || null,
          businessName: formData.businessName,
          type: 'presentation'
        }
      });

      // Send email with the presentation link
      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `המצגת העסקית שלך מוכנה! - ${formData.businessName}`,
          body: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1E3A5F;">המצגת שלך מוכנה! 🎉</h2>
              <p>שלום ${user.full_name || ''},</p>
              <p>תודה על הרכישה! המצגת העסקית שלך עבור <strong>${formData.businessName}</strong> מוכנה.</p>
              <div style="background: #f0f7ff; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <a href="${pdfUrl || draftPreviewUrl}" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  הורד את המצגת
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">המצגת נשמרה גם באזור האישי שלך תחת "המוצרים שלי".</p>
              <p style="color: #999; font-size: 12px;">צוות Perfect One</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
      }

      setPaymentComplete(true);
      setShowCheckout(false);
    } catch (err) {
      console.error('Payment success handler error:', err);
      toast.error('שגיאה בשמירת המוצר');
    }
  };

  if (showDraftPreview && draftPreviewUrl) {
    const embedUrl = draftPreviewUrl.replace('gamma.app/docs/', 'gamma.app/embed/');
    
    // Thank You screen after payment
    if (paymentComplete) {
      return (
        <div className="flex flex-col h-full bg-white">
          <div className="flex-none px-4 py-3 border-b border-gray-100 bg-white z-10">
            <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
            <div className="text-center space-y-6 max-w-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-lg shadow-green-200 mx-auto"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900">תודה על הרכישה! 🎉</h2>
                <p className="text-gray-600 text-sm max-w-xs mx-auto">
                  המצגת נשלחה למייל שלך ונשמרה ב"המוצרים שלי"
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-3">הורד את המצגת:</p>
                <a 
                  href={pdfUrl || draftPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`מצגת-${formData.businessName || 'עסקית'}.pdf`}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  הורד מצגת
                  <Download className="w-4 h-4" />
                </a>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Button 
                  onClick={() => onComplete(formData)}
                  className="bg-[#1E3A5F] hover:bg-[#2C5282] text-white font-bold h-11"
                >
                  חזרה למרכז השליטה
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Preview Header */}
        <div className="flex-none px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">תצוגה מקדימה - טיוטה</h3>
            <p className="text-xs text-gray-500">לאחר תשלום תקבל את המצגת המלאה</p>
          </div>
          <button 
            onClick={() => {
              setShowDraftPreview(false);
              setShowSuccess(false);
              setPresentationUrl(null);
              setDraftPreviewUrl(null);
            }}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content - scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-5xl mx-auto">
            {/* Iframe Preview with Watermark Overlay */}
            <div className="bg-white md:m-4 md:rounded-xl md:shadow-lg overflow-hidden md:border-2 border-gray-200 relative group">
              
              {/* Maximize Button */}
              <button
                onClick={() => setIsFullPreviewOpen(true)}
                className="absolute top-4 right-4 z-30 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 p-2 rounded-full shadow-md border border-gray-200 transition-all transform hover:scale-110 flex items-center gap-2 group/btn"
                title="הגדל לתצוגה מלאה"
              >
                <Maximize2 className="w-5 h-5" />
                <span className="text-xs font-bold max-w-0 overflow-hidden group-hover/btn:max-w-[100px] transition-all duration-300 whitespace-nowrap">הגדל</span>
              </button>

              {/* Desktop View */}
              <div className="hidden md:block relative w-full aspect-video overflow-hidden bg-gray-50">
                <div 
                  className="absolute top-0 left-0 origin-top-left"
                  style={{ width: '150%', height: '150%', transform: 'scale(0.66667)' }}
                >
                  <iframe src={embedUrl} className="w-full h-full border-0" title="Presentation Preview Desktop" allow="fullscreen" loading="lazy" />
                  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                    {[20, 50, 80].map((top) => (
                      <div key={top} className="absolute text-red-500/15 font-black text-9xl whitespace-nowrap select-none" style={{ top: `${top}%`, left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)' }}>טיוטה</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile View */}
              <div className="md:hidden relative w-full bg-gray-50" style={{ paddingTop: '56.25%' }}>
                <div className="absolute top-0 left-0 origin-top-left overflow-hidden" style={{ width: '300%', height: '300%', transform: 'scale(0.33333)' }}>
                  <iframe src={embedUrl} className="w-full h-full border-0" title="Presentation Preview Mobile" allow="fullscreen" loading="lazy" />
                  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                    {[20, 50, 80].map((top) => (
                      <div key={top} className="absolute text-red-500/15 font-black text-9xl whitespace-nowrap select-none" style={{ top: `${top}%`, left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)' }}>טיוטה</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - always visible, scrolls into view */}
            <div className="p-4 md:p-6 md:mx-4 md:mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 md:rounded-xl md:shadow-md space-y-4 border-t md:border-2 border-blue-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-2">אהבת? קבל את המצגת המלאה!</h4>
                <p className="text-sm text-gray-600 mb-1">לאחר התשלום תקבל:</p>
                <div className="text-xs text-right bg-white/60 rounded-lg p-3 space-y-1 inline-block">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">קישור למצגת המלאה ללא סימני מים</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">שליחה למייל + שמירה באזור האישי</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => addToCart({
                    type: 'presentation',
                    data: { presentationUrl: draftPreviewUrl, pdfUrl: pdfUrl || null, businessName: formData.businessName },
                    price: 199,
                    title: `מצגת: ${formData.businessName}`,
                    preview_image: '',
                    openCart: false
                  })}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold h-14"
                >
                  הוסף לסל
                </Button>
                <Button
                  onClick={() => setShowCheckout(true)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black text-lg h-14 shadow-lg"
                >
                  <Wallet className="w-5 h-5 ml-2" />
                  ₪199 - קנה עכשיו
                </Button>
              </div>
              
              <p className="text-xs text-center text-gray-500">
                תשלום חד-פעמי • קבלה מיידית למייל
              </p>
            </div>
          </div>
        </div>

        {/* Checkout Dialog */}
        <CheckoutDialog
          open={showCheckout}
          onClose={() => setShowCheckout(false)}
          product={{
            name: `מצגת עסקית: ${formData.businessName || 'ללא שם'}`,
            description: 'מצגת עסקית מעוצבת - כוללת קישור למצגת המלאה ושליחה למייל',
            price: 199,
            isRecurring: false,
            product_type: 'one-time',
            metadata: {
              type: 'presentation',
              presentationUrl: draftPreviewUrl,
              pdfUrl: pdfUrl || null,
              businessName: formData.businessName
            }
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />

        {/* Full Preview Dialog */}
        <Dialog open={isFullPreviewOpen} onOpenChange={setIsFullPreviewOpen}>
            <DialogContent className="max-w-[98vw] w-[1600px] h-[95vh] p-0 flex flex-col gap-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-gray-100">
                <div className="bg-white border-b px-4 py-3 flex justify-between items-center shrink-0 z-50">
                      <div className="flex gap-3 items-center">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                            <Presentation className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 leading-tight">{formData.businessName}</span>
                            <span className="text-xs text-slate-500 dir-ltr font-mono">Gamma Preview</span>
                          </div>
                      </div>
                      <DialogClose asChild>
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></Button>
                      </DialogClose>
                </div>
                <div className="flex-1 overflow-hidden bg-gray-100 relative">
                    <iframe src={embedUrl} className="w-full h-full border-0" title="Full Presentation Preview" allow="fullscreen" />
                    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                      {[15, 35, 55, 75, 95].map((top) => (
                        <div key={top} className="absolute text-red-500/10 font-black text-[10rem] whitespace-nowrap select-none" style={{ top: `${top}%`, left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)' }}>טיוטה</div>
                      ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Note: presentationUrl success screen is now handled inside the showDraftPreview + paymentComplete flow above

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex-none px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          {/* Close button removed if this is a standalone page or modal, added back for modal usage */}
           <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-blue-600">בניית מצגת עסקית</span>
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
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-50 to-white relative overflow-hidden rounded-xl">
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
                  מייצר את המצגת... ✨
                </h3>
                <p className="text-slate-600 text-sm md:text-base max-w-xs mx-auto">
                  בונים לך את המצגת!
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
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> מעבד את המידע שלך
                </motion.div>
                <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> בונה מבנה שקפים
                </motion.div>
                <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="flex items-center gap-2 text-slate-700">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" /> מעצב סופי
                </motion.div>
              </motion.div>
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
      {!isBuilding && (
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
                disabled={isBuilding}
                className="bg-green-600 hover:bg-green-700 text-white min-w-[100px] shadow-lg shadow-green-100 h-9 text-xs disabled:opacity-50"
              >
                {isBuilding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    בעדכון...
                  </>
                ) : (
                  <>
                    צור מצגת
                    <Sparkles className="w-4 h-4 mr-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}