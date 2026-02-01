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
  Lightbulb, Trophy, Presentation, Calendar, Loader2, ExternalLink
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

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
    cta: [],
    ctaText: '',
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
  }, [currentStep]);

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
           console.log('✅ Setting presentation URL:', url);
           setPresentationUrl(url);
           setDraftPreviewUrl(url);
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
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="businessField" className="text-xs font-semibold">תחום פעילות</Label>
                <Input 
                  id="businessField" 
                  value={formData.businessField} 
                  onChange={(e) => handleInputChange('businessField', e.target.value)} 
                  placeholder="למשל: ייעוץ עסקי" 
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="businessDescription" className="text-xs font-semibold">במשפט אחד - מה אתם עושים?</Label>
                <Textarea 
                  id="businessDescription"
                  value={formData.businessDescription} 
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)} 
                  placeholder="אנחנו עוזרים ל... לעשות... כדי ש..." 
                  className="h-20 text-xs resize-none"
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
                  className="h-20 text-xs resize-none"
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
                  className="h-16 text-xs resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-semibold">איך זה עובד? (3 שלבים)</Label>
                <div className="space-y-2">
                  <Input 
                    value={formData.solutionSteps.step1} 
                    onChange={(e) => handleNestedInputChange('solutionSteps', 'step1', e.target.value)} 
                    placeholder="שלב 1" 
                    className="h-8 text-xs"
                  />
                  <Input 
                    value={formData.solutionSteps.step2} 
                    onChange={(e) => handleNestedInputChange('solutionSteps', 'step2', e.target.value)} 
                    placeholder="שלב 2" 
                    className="h-8 text-xs"
                  />
                  <Input 
                    value={formData.solutionSteps.step3} 
                    onChange={(e) => handleNestedInputChange('solutionSteps', 'step3', e.target.value)} 
                    placeholder="שלב 3" 
                    className="h-8 text-xs"
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
                  className="h-14 text-xs resize-none"
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
                  className="h-9 text-xs"
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
                  className="h-20 text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">איך החיים יראו אחרי?</Label>
                <Textarea 
                  value={formData.afterPicture} 
                  onChange={(e) => handleInputChange('afterPicture', e.target.value)} 
                  placeholder="תארו את המצב החדש והטוב יותר..." 
                  className="h-20 text-xs resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 8: // CTA
        return (
          <div className="space-y-3">
            <StepHeader 
              icon={Send} 
              title="קריאה לפעולה" 
              description="מה הצעד הבא?"
              colorClass="bg-purple-100 text-purple-600"
            />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="block text-xs font-semibold">מה אתם רוצים שיקרה?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'meeting', label: 'שיחת היכרות', icon: Users },
                    { id: 'contact', label: 'השארת פרטים', icon: FileText },
                    { id: 'appointment', label: 'פגישה', icon: Calendar },
                    { id: 'investment', label: 'השקעה', icon: Wallet }
                  ].map(option => (
                    <SelectionCard
                      key={option.id}
                      selected={formData.cta.includes(option.id)}
                      onClick={() => handleCheckboxChange('cta', option.id, !formData.cta.includes(option.id))}
                      icon={option.icon}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">טקסט לכפתור (אופציונלי)</Label>
                <Input 
                  value={formData.ctaText} 
                  onChange={(e) => handleInputChange('ctaText', e.target.value)} 
                  placeholder="למשל: בואו נתחיל" 
                  className="h-9 text-xs"
                />
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
                  className="h-9 text-xs"
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

  if (showDraftPreview && draftPreviewUrl) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Preview Header */}
        <div className="flex-none px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-gray-900">טיוטת המצגה</h3>
            <p className="text-xs text-gray-500">בדוק את המצגה לפני קבלה</p>
          </div>
          <button 
            onClick={() => setShowDraftPreview(false)}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-2xl space-y-4">
            {/* Thumbnail Preview */}
            <div 
              onClick={() => setFullscreenPreview(true)}
              className="cursor-pointer group relative bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
            >
              <iframe
                src={draftPreviewUrl}
                className="w-full h-96 border-0"
                title="Draft Preview"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <div className="bg-white/90 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-900 font-semibold">
                  <MonitorPlay className="w-4 h-4" />
                  הגדל לתצוגה מלאה
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  window.open(draftPreviewUrl, '_blank');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                פתח במחשב
              </Button>
              <Button
                onClick={() => {
                  setShowDraftPreview(false);
                  setShowSuccess(true);
                  setPresentationUrl(draftPreviewUrl);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 ml-2" />
                קבל את המצגה
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500 pt-2">
              אתה יכול לערוך את המצגה עוד יותר בעורך של Gamma
            </p>
          </div>
        </div>

        {/* Fullscreen Preview Modal */}
        {fullscreenPreview && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-6xl">
              <button
                onClick={() => setFullscreenPreview(false)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <iframe
                src={draftPreviewUrl}
                className="w-full h-full rounded-lg border-0"
                title="Full Preview"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (presentationUrl) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-green-50 to-emerald-50">
        {/* Success Header */}
        <div className="flex-none px-4 py-3 border-b border-green-100 bg-white/80 backdrop-blur-md z-10">
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-6 max-w-sm">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg mx-auto"
            >
              <Check className="w-8 h-8" />
            </motion.div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">המצגה שלך אושרה! ✨</h2>
              <p className="text-gray-600">המצגה העסקית שלך מוכנה לשימוש</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-3">הקישור למצגת:</p>
              <a 
                href={presentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm break-all flex items-center justify-center gap-2"
              >
                פתח את המצגה
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <Button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              סגור
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
             <div className="flex flex-col items-center justify-center text-center space-y-6 mt-10">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-blue-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">מייצר את המצגת...</h3>
                <p className="text-gray-500 text-sm">Gamma בונה את השקפים עבורך</p>
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