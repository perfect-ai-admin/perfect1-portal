import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, ChevronRight, X, Sparkles, User, Briefcase, 
  Layout, Phone, Mail, Globe, Instagram, Facebook, Linkedin, Music,
  Image, Share2, Check, Smartphone, Link as LinkIcon, Users, Navigation,
  CheckCircle2, Copy, ExternalLink
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import BusinessCardPreview from './BusinessCardPreview';
import BusinessCardResult from '@/components/client/marketing/BusinessCardResult';
import BusinessCardSummary from '@/components/client/marketing/BusinessCardSummary';
import CheckoutDialog from '@/components/checkout/CheckoutDialog';

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
    website_url: '',
    instagram_url: '',
    facebook_url: '',
    waze_url: '',
    // Step 4
    hasLogo: '',
    logoFile: null,
    hasCover: '',
    coverFile: null,
    preferredStyle: '',
    // Step 5
    primaryUsage: ''
  });

  const [errors, setErrors] = useState({});
  const [isBuilding, setIsBuilding] = useState(false);
  const [viewState, setViewState] = useState('questionnaire'); // 'questionnaire', 'summary', 'result', 'building', 'paid'
  const [cardResult, setCardResult] = useState(null);
  const [buildError, setBuildError] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

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

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverFile: file, hasCover: 'yes' }));
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

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateStep(currentStep)) return;
    setViewState('summary');
  };

  const handleGenerateCard = async () => {
    setViewState('building');
    setIsBuilding(true);
    setBuildError(null);
    
    try {
      // Convert logo file to data URL if exists
      let logoDataUrl = null;
      if (formData.logoFile) {
        logoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(formData.logoFile);
        });
      }

      // Convert cover file to data URL if exists
      let coverDataUrl = null;
      if (formData.coverFile) {
        coverDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(formData.coverFile);
        });
      }

      // Ensure we pass the updated formData with data URLs if needed, 
      // but actually createDigitalCard expects "formData" which might contain files, 
      // wait, the original code converted them. 
      // We need to store these data URLs in state if we want to pass them to Result without re-reading
      
      // Update state with dataUrls so Result component can use them for preview
      if (logoDataUrl || coverDataUrl) {
          setFormData(prev => ({...prev, logoDataUrl, coverDataUrl}));
      }

      const res = await base44.functions.invoke('createDigitalCard', {
        formData: { ...formData, logoFile: undefined, logoDataUrl, coverFile: undefined, coverDataUrl }
      });
      
      if (res.data?.success) {
        setCardResult({ ...res.data, cardId: res.data.card_id });
        setViewState('result');
      } else {
        setBuildError('אירעה שגיאה ביצירת הכרטיס');
        setViewState('questionnaire'); // Or stay in building but show error
      }
    } catch (err) {
      console.error('Card creation error:', err);
      setBuildError('אירעה שגיאה ביצירת הכרטיס. נסה שוב.');
      setViewState('questionnaire');
    } finally {
      setIsBuilding(false);
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
                            {id: 'tiktok', label: 'טיקטוק', icon: Music},
                            {id: 'linkedin', label: 'לינקדאין', icon: Linkedin},
                            {id: 'website', label: 'אתר', icon: Globe},
                            {id: 'waze', label: 'Waze', icon: Navigation},
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

                {/* Info Message */}
                {formData.socialNetworks.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-center animate-in fade-in slide-in-from-top-2">
                        <p className="text-xs text-blue-700 font-medium">
                            לאחר אישור הכרטיס ביקור ניתן יהיה לקשר את הרשתות שבחרת.
                        </p>
                    </div>
                )}
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
                 <Label className="block text-xs font-semibold">האם תרצה להוסיף תמונת נושא (Cover)?</Label>
                  <div className="grid grid-cols-2 gap-2">
                     <SelectionCard
                      selected={formData.hasCover === 'yes'}
                      onClick={() => handleInputChange('hasCover', 'yes')}
                      icon={Image}
                      title="כן, הוסף תמונה"
                      description="תמונה בחלק העליון"
                    />
                     <SelectionCard
                      selected={formData.hasCover === 'no'}
                      onClick={() => handleInputChange('hasCover', 'no')}
                      icon={X}
                      title="לא, ללא תמונה"
                      description="עיצוב נקי עם צבע"
                    />
                  </div>

                  {formData.hasCover === 'yes' && (
                      <div className="mt-2 p-4 border border-blue-100 rounded-xl bg-blue-50/50 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-top-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                              <Image className="w-4 h-4 text-blue-600" />
                          </div>
                          <p className="text-xs font-medium text-blue-900">
                              מעולה! לאחר בחירת הכרטיס תהיה אפשרות להעלות תמונת נושא (Cover) אישית ומותאמת.
                          </p>
                      </div>
                  )}
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

  // Render Logic based on viewState
  if (viewState === 'summary') {
      return (
          <BusinessCardSummary 
              formData={formData}
              onConfirm={handleGenerateCard}
              onEdit={() => setViewState('questionnaire')}
          />
      );
  }

  if (viewState === 'paid' && cardResult) {
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-6 p-6 w-full animate-in fade-in zoom-in duration-500">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-lg shadow-green-200"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">הכרטיס שלך פעיל! 🎉</h2>
            <p className="text-gray-600 text-sm max-w-xs mx-auto">
              הכרטיס נשלח למייל שלך ונשמר ב"המוצרים שלי"
            </p>
          </div>

          {cardResult.public_url && (
            <div className="w-full max-w-sm bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <p className="text-xs text-gray-500 font-medium">הקישור האישי שלך:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white p-2 rounded-lg border border-gray-200 truncate text-blue-600" dir="ltr">
                  {cardResult.public_url}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cardResult.public_url);
                    toast.success('הקישור הועתק!');
                  }}
                  className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <Button 
                onClick={() => window.open(cardResult.public_url, '_blank')}
                variant="outline"
                className="w-full gap-2 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                צפה בכרטיס
              </Button>
            </div>
          )}

          <Button 
            onClick={() => onComplete(formData)}
            className="bg-[#1E3A5F] hover:bg-[#2C5282] text-white font-bold h-11 w-full max-w-xs"
          >
            חזרה למרכז השליטה
          </Button>

          <CheckoutDialog
            open={showCheckout}
            onClose={() => setShowCheckout(false)}
            product={checkoutProduct}
          />
        </div>
      );
  }

  if (viewState === 'result' && cardResult) {
      const handlePurchaseClick = () => {
        setCheckoutProduct({
          name: `כרטיס ביקור דיגיטלי: ${formData.fullName || 'ממותג'}`,
          description: 'כרטיס ביקור דיגיטלי עם QR, קישור שיתוף וכפתורי יצירת קשר',
          price: 149,
          isRecurring: false,
          product_type: 'one-time',
          metadata: {
            type: 'digital_card',
            cardId: cardResult.cardId,
            public_url: cardResult.public_url,
            fullName: formData.fullName,
            profession: formData.profession
          }
        });
        setShowCheckout(true);
      };

      return (
        <>
          <BusinessCardResult
              formData={formData}
              cardResult={cardResult}
              onPurchase={handlePurchaseClick}
              onBack={() => setViewState('questionnaire')}
              isPurchased={false}
          />
          <CheckoutDialog
            open={showCheckout}
            onClose={() => setShowCheckout(false)}
            product={checkoutProduct}
            onPaymentSuccess={async (paymentId) => {
              try {
                const user = await base44.auth.me();
                
                // Save to PurchasedProduct
                await base44.entities.PurchasedProduct.create({
                  user_id: user.id,
                  product_type: 'service',
                  product_name: `כרטיס ביקור: ${formData.fullName || 'דיגיטלי'}`,
                  preview_image: cardResult.qr_image_url || '',
                  download_url: cardResult.public_url || '',
                  published_url: cardResult.public_url || '',
                  purchase_price: 149,
                  payment_id: paymentId,
                  status: 'active',
                  metadata: {
                    type: 'digital_card',
                    cardId: cardResult.cardId,
                    fullName: formData.fullName,
                    profession: formData.profession
                  }
                });

                // Send email with card link
                await base44.integrations.Core.SendEmail({
                  to: user.email,
                  subject: '🎴 כרטיס הביקור הדיגיטלי שלך מוכן! – Perfect One',
                  body: `
                    <div style="direction: rtl; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #1E3A5F;">כרטיס הביקור שלך מוכן! 🎉</h2>
                      <p>שלום ${user.full_name || formData.fullName || ''},</p>
                      <p>תודה על הרכישה! הכרטיס הדיגיטלי שלך פעיל ומוכן לשיתוף:</p>
                      <div style="text-align: center; margin: 20px 0;">
                        <a href="${cardResult.public_url}" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                          צפה בכרטיס שלך
                        </a>
                      </div>
                      <p><strong>קישור ישיר:</strong> <a href="${cardResult.public_url}" style="color: #1E3A5F;">${cardResult.public_url}</a></p>
                      <p style="margin-top: 20px;">ניתן לגשת לכרטיס גם מ<a href="https://one-pai.com/MyProducts" style="color: #1E3A5F;">המוצרים שלי</a>.</p>
                      <p style="color: #888; font-size: 12px; margin-top: 30px;">צוות Perfect One</p>
                    </div>
                  `
                });

                setViewState('paid');
                toast.success('הכרטיס נשמר ונשלח למייל שלך! 🎉');
              } catch (err) {
                console.error('Post-payment error:', err);
                setViewState('paid');
                toast.success('התשלום בוצע! הכרטיס זמין במוצרים שלך.');
              }
            }}
          />
        </>
      );
  }

  // Loading Screen
  if (viewState === 'building' || isBuilding) {
    return (
        <div className="flex flex-col h-full bg-white items-center justify-center p-4">
            <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-gray-900 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-gray-900 animate-pulse w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">יוצר את הכרטיס שלך...</h3>
            <p className="text-gray-500 text-sm text-center max-w-xs">
                מייצר QR Code ייחודי, קובץ איש קשר חכם ומעצב את הכרטיס
            </p>
        </div>
    );
  }

  // Default: Questionnaire
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
          
          {buildError ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 mt-10">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{buildError}</h3>
              <Button onClick={() => { setBuildError(null); setCurrentStep(totalSteps); }} variant="outline" className="text-sm">
                חזור ונסה שוב
              </Button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="w-full">
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
      {!isBuilding && !buildError && (
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
                onClick={handleFormSubmit}
                className="bg-green-600 hover:bg-green-700 text-white min-w-[100px] shadow-lg shadow-green-100 h-9 text-xs"
              >
                סיכום וסיום
                <Sparkles className="w-4 h-4 mr-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}