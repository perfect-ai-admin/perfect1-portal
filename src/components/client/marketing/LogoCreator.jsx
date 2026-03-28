import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Wand2, RefreshCw, CheckCircle2, ChevronRight, LayoutGrid, Type, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { invokeFunction } from '@/api/supabaseClient';
import LogoCheckout from './LogoCheckout';
import LogoPreview from './LogoPreview';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const COLOR_SCHEMES = [
  { name: 'כחול מקצועי', colors: ['#1E3A5F', '#3B82F6', '#FFFFFF'] },
  { name: 'ירוק טבעי', colors: ['#22C55E', '#10B981', '#FFFFFF'] },
  { name: 'סגול יצירתי', colors: ['#8B5CF6', '#A855F7', '#FFFFFF'] },
  { name: 'כתום אנרגטי', colors: ['#F59E0B', '#FB923C', '#FFFFFF'] },
  { name: 'ורוד מודרני', colors: ['#EC4899', '#F472B6', '#FFFFFF'] }
];

const STYLES = [
  { id: 'minimal', label: 'מינימליסטי', description: 'פשוט ונקי', icon: '⬜' },
  { id: 'modern', label: 'מודרני', description: 'טרנדי', icon: '✨' },
  { id: 'abstract', label: 'מופשט', description: 'גיאומטרי', icon: '◆' },
  { id: 'playful', label: 'שובב', description: 'צעיר', icon: '🎨' },
  { id: 'elegant', label: 'אלגנטי', description: 'יוקרתי', icon: '👑' },
  { id: 'bold', label: 'נועז', description: 'חזק', icon: '⚡' }
];

const ICON_STYLES = [
  { id: 'geometric', label: 'גיאומטרי', example: '⬡' },
  { id: 'organic', label: 'אורגני', example: '🌿' },
  { id: 'letter', label: 'אות', example: 'A' },
  { id: 'symbol', label: 'סמל', example: '★' },
  { id: 'illustration', label: 'איור', example: '🎨' }
];

const MobileWizardStep = ({ children, title, subtitle, onBack, onClose, currentStep, totalSteps }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className="flex flex-col h-full lg:hidden w-full bg-white" 
    >
      {/* Header */}
      <div className="flex-none px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button onClick={onBack} className="p-1 -mr-2 text-gray-500 hover:text-gray-900">
              <ChevronRight className="w-6 h-6" />
            </button>
          ) : onClose ? (
            <button onClick={onClose} className="p-1 -mr-2 text-gray-500 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
          ) : null}
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-none">{title}</h2>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
          <span className="text-xs font-bold text-blue-600">{currentStep}</span>
          <span className="text-[10px] text-gray-400">/</span>
          <span className="text-[10px] text-gray-400">{totalSteps}</span>
        </div>
      </div>

      {/* Content Area - Flexible but no scroll if possible */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default function LogoCreator({ businessName, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: businessName || '',
    tagline: '',
    industry: '',
    vibe: '',
    colorScheme: COLOR_SCHEMES[0],
    style: 'minimal',
    iconStyle: 'geometric'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogoUrl, setGeneratedLogoUrl] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!isGenerating) {
      setCountdown(30);
      return;
    }
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGenerating]);

    const handleGenerate = async () => {
    if (!formData.businessName || !formData.industry) {
      alert('אנא מלא את שם העסק ותחום העיסוק');
      return;
    }

    setIsGenerating(true);
    try {
      // Check user has credits
      const creditRes = await invokeFunction('checkAndReserveCredit', { action: 'logo_generate' });
      if (!creditRes?.ok && !creditRes?.success) {
        alert('אין לך מספיק קרדיטים');
        return;
      }

      // Create project via generateLogoForProject
      const projectRes = await invokeFunction('generateLogoForProject', {
        businessName: formData.businessName,
        industry: formData.industry,
        style: formData.style,
        tagline: formData.tagline,
        vibe: formData.vibe,
        colorScheme: formData.colorScheme
      });

      if (!projectRes?.ok) {
        alert(projectRes?.message || 'שגיאה ביצירת הפרויקט');
        return;
      }

      const projectId = projectRes.project_id;
      
      // Now generate logo from project
      const genRes = await invokeFunction('generateLogoForProject', {
        project_id: projectId,
        variation_mode: false
      });

      console.log('[GENERATE] Full Response:', genRes);
            console.log('[GENERATE] Data:', genRes);
            if (genRes?.ok && genRes?.image_url) {
              console.log('[GENERATE] Moving to step 4 with URL:', genRes.image_url);
              setGeneratedLogoUrl(genRes.image_url);
              setStep(4);
            } else {
              const errorMsg = genRes?.message || JSON.stringify(genRes) || 'שגיאה ביצירת הלוגו';
              console.error('[GENERATE] Error:', errorMsg);
              alert('שגיאה: ' + errorMsg);
            }
    } catch (error) {
      alert('שגיאה: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting:', formData);
      const res = await invokeFunction('generateLogoForProject', {
          businessName: formData.businessName,
          industry: formData.industry,
          style: formData.style,
          tagline: formData.tagline,
          vibe: formData.vibe,
          colorScheme: formData.colorScheme
        });
        if (res?.ok && res?.project_id) {
          navigate(createPageUrl('LogoProjectPage', `?project_id=${res.project_id}`));
          onClose();
        } else {
          alert(res?.message || 'שגיאה ביצירת הפרויקט');
        }
    } catch (err) {
      console.error('Error:', err);
      alert('שגיאה: ' + err.message);
    }
  };

  if (step === 1) {
    return (
      <>
        <div className="hidden lg:block space-y-6">
          <div className="text-center">
            <Palette className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">צור לוגו מקצועי</h2>
            <p className="text-gray-600">בואו ניצור לך זהות ויזואלית ייחודית</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div>
              <Label>שם העסק</Label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="הכנס את שם העסק"
              />
            </div>
            <div>
              <Label>סלוגן (אופציונלי)</Label>
              <Input
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder="למשל: 'הפתרון המושלם לעסק שלך'"
              />
            </div>
            <div>
              <Label>תחום עיסוק</Label>
              <Input
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="למשל: גרפיקאי, יועץ, מאפר"
              />
            </div>
            <div>
              <Label>האווירה שאתה רוצה להעביר (אופציונלי)</Label>
              <Input
                value={formData.vibe}
                onChange={(e) => setFormData(prev => ({ ...prev, vibe: e.target.value }))}
                placeholder="למשל: מקצועי, צעיר, יוקרתי, ידידותי"
              />
            </div>
            <Button 
              onClick={() => setStep(2)} 
              className="w-full"
              disabled={!formData.businessName || !formData.industry}
            >
              המשך לבחירת צבעים
            </Button>
          </div>
        </div>

        <MobileWizardStep 
          title="פרטי העסק" 
          subtitle="שלב 1 מתוך 3"
          currentStep={1}
          totalSteps={3}
          onClose={onClose}
        >
          <div className="flex-1 flex flex-col gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">שם העסק</Label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="שם העסק..."
                className="h-10 text-base"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">תחום עיסוק</Label>
              <Input
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="למשל: יועץ מס, גרפיקאי..."
                className="h-10 text-base"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">סלוגן (אופציונלי)</Label>
              <Input
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder="המסר המרכזי שלך..."
                className="h-10 text-base"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-700">אווירה (אופציונלי)</Label>
              <Input
                value={formData.vibe}
                onChange={(e) => setFormData(prev => ({ ...prev, vibe: e.target.value }))}
                placeholder="איזו תחושה הלוגו צריך לשדר?"
                className="h-10 text-base"
              />
            </div>
          </div>

          <div className="flex-none pt-4 mt-auto">
            <Button 
              onClick={() => setStep(2)} 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100"
              disabled={!formData.businessName || !formData.industry}
            >
              המשך לשלב הבא
            </Button>
          </div>
        </MobileWizardStep>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <div className="hidden lg:block space-y-6">
          <Button variant="ghost" onClick={() => setStep(1)}>← חזור</Button>
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">שלב 2: בחר צבעים</h3>
              <p className="text-gray-600 text-sm">צבעים יוצרים את ההרגשה הראשונית</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {COLOR_SCHEMES.map((scheme, index) => (
                <button
                  key={index}
                  onClick={() => setFormData(prev => ({ ...prev, colorScheme: scheme }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.colorScheme.name === scheme.name
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex gap-2 mb-2">
                    {scheme.colors.map((color, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-200" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{scheme.name}</p>
                </button>
              ))}
            </div>
            <Button onClick={() => setStep(3)} className="w-full">המשך לבחירת סגנון</Button>
          </div>
        </div>

        <MobileWizardStep 
          title="בחירת צבעים" 
          subtitle="שלב 2 מתוך 3"
          currentStep={2}
          totalSteps={3}
          onBack={() => setStep(1)}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-3">
              {COLOR_SCHEMES.map((scheme, index) => (
                <button
                  key={index}
                  onClick={() => setFormData(prev => ({ ...prev, colorScheme: scheme }))}
                  className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                    formData.colorScheme.name === scheme.name
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex -space-x-2 space-x-reverse">
                    {scheme.colors.map((color, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <div className="text-right flex-1">
                    <p className={`font-bold text-sm ${formData.colorScheme.name === scheme.name ? 'text-blue-700' : 'text-gray-900'}`}>{scheme.name}</p>
                  </div>
                  {formData.colorScheme.name === scheme.name && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-none pt-4 mt-auto">
            <Button 
              onClick={() => setStep(3)} 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100"
            >
              המשך לשלב הבא
            </Button>
          </div>
        </MobileWizardStep>
      </>
    );
  }

  if (step === 3) {
    if (isGenerating) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[500px] h-full bg-gradient-to-b from-blue-50 to-white relative overflow-hidden rounded-xl py-10 w-full">
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
                מעצב את הלוגו שלך... ✨
              </h3>
              <p className="text-slate-600 text-sm md:text-base max-w-xs mx-auto">
                בונה את הזהות הויזואלית החדשה שלך
              </p>
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
                    strokeDasharray={`${(countdown / 30) * 283} 283`}
                    animate={{ strokeDasharray: [`${(countdown / 30) * 283} 283`] }}
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
                <CheckCircle2 className="w-4 h-4 text-green-600" /> מנתח את נתוני העסק
              </motion.div>
              <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> יוצר סקיצות ראשוניות
              </motion.div>
              <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="flex items-center gap-2 text-slate-700">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" /> מחדד צבעים וקומפוזיציה
              </motion.div>
            </motion.div>
          </div>
        );
    }

    return (
      <>
        <div className="hidden lg:block space-y-6">
          <Button variant="ghost" onClick={() => setStep(2)}>← חזור</Button>
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">שלב 3: בחר סגנון</h3>
              <p className="text-gray-600 text-sm">איזה אופי מתאים לעסק שלך?</p>
            </div>
            <Tabs defaultValue="style" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="style">סגנון כללי</TabsTrigger>
                <TabsTrigger value="icon">סגנון אייקון</TabsTrigger>
              </TabsList>
              <TabsContent value="style" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setFormData(prev => ({ ...prev, style: style.id }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.style === style.id
                          ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{style.icon}</div>
                      <p className="font-semibold text-sm">{style.label}</p>
                      <p className="text-xs text-gray-600">{style.description}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="icon" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ICON_STYLES.map(iconStyle => (
                    <button
                      key={iconStyle.id}
                      onClick={() => setFormData(prev => ({ ...prev, iconStyle: iconStyle.id }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.iconStyle === iconStyle.id
                          ? 'border-purple-500 ring-2 ring-purple-200 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{iconStyle.example}</div>
                      <p className="font-semibold text-sm">{iconStyle.label}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50"
            >
              {isGenerating ? '⏳ יוצר לוגוים...' : '🎨 צור וריאציות'}
            </Button>
          </div>
        </div>

        <MobileWizardStep 
          title="סגנון עיצובי" 
          subtitle="שלב 3 מתוך 3"
          currentStep={3}
          totalSteps={3}
          onBack={() => setStep(2)}
        >
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="style" className="flex-1 flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl flex-none mb-4">
                <TabsTrigger value="style" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  סגנון
                </TabsTrigger>
                <TabsTrigger value="icon" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Type className="w-4 h-4 mr-2" />
                  אייקון
                </TabsTrigger>
              </TabsList>

              <TabsContent value="style" className="flex-1 overflow-y-auto mt-0 min-h-0">
                <div className="grid grid-cols-2 gap-3 pb-2">
                  {STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setFormData(prev => ({ ...prev, style: style.id }))}
                      className={`p-3 border-2 rounded-xl text-center transition-all ${
                        formData.style === style.id
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="text-2xl mb-1">{style.icon}</div>
                      <p className="font-bold text-sm text-gray-900">{style.label}</p>
                      <p className="text-[10px] text-gray-500">{style.description}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="icon" className="flex-1 overflow-y-auto mt-0 min-h-0">
                <div className="grid grid-cols-2 gap-3 pb-2">
                  {ICON_STYLES.map(iconStyle => (
                    <button
                      key={iconStyle.id}
                      onClick={() => setFormData(prev => ({ ...prev, iconStyle: iconStyle.id }))}
                      className={`p-3 border-2 rounded-xl text-center transition-all ${
                        formData.iconStyle === iconStyle.id
                          ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="text-2xl mb-1">{iconStyle.example}</div>
                      <p className="font-bold text-sm text-gray-900">{iconStyle.label}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex-none pt-2 mt-auto">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-purple-100 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  יוצר...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 ml-2" />
                  צור וריאציות
                </>
              )}
            </Button>
          </div>
        </MobileWizardStep>
      </>
    );
  }

  if (step === 4) {
    // Preview step - show logo with options
    if (!showCheckout) {
      return (
        <>
          <div className="hidden lg:block">
            <LogoPreview 
              businessName={formData.businessName}
              slogan={formData.tagline}
              logoUrl={generatedLogoUrl}
              onBack={() => setStep(3)}
              onSaveToCart={() => {
                alert('לוגו נשמר בסל! 🎉');
              }}
              onProceedToCheckout={() => setShowCheckout(true)}
            />
          </div>
          
          <div className="lg:hidden h-full">
            <LogoPreview 
              businessName={formData.businessName}
              slogan={formData.tagline}
              logoUrl={generatedLogoUrl}
              onBack={() => setStep(3)}
              onSaveToCart={() => {
                alert('לוגו נשמר בסל! 🎉');
              }}
              onProceedToCheckout={() => setShowCheckout(true)}
            />
          </div>
        </>
      );
    }

    // Checkout step
    return (
      <>
        <div className="hidden lg:block lg:space-y-6 lg:py-6">
          {generatedLogoUrl && (
            <LogoCheckout 
              businessName={formData.businessName}
              slogan={formData.tagline}
              logoUrl={generatedLogoUrl}
              onBack={() => setShowCheckout(false)}
              onClose={onClose}
              onSuccess={(data) => {
                onClose();
                navigate(createPageUrl('LogoThankYou'), { 
                  state: { 
                    businessName: formData.businessName,
                    email: data?.email 
                  } 
                });
              }}
            />
          )}
        </div>
        
        <div className="lg:hidden h-full">
          {generatedLogoUrl && (
            <LogoCheckout 
              businessName={formData.businessName}
              slogan={formData.tagline}
              logoUrl={generatedLogoUrl}
              onBack={() => setShowCheckout(false)}
              onClose={onClose}
              onSuccess={(data) => {
                onClose();
                navigate(createPageUrl('LogoThankYou'), { 
                  state: { 
                    businessName: formData.businessName,
                    email: data?.email 
                  } 
                });
              }}
            />
          )}
        </div>
      </>
    );
  }

  return null;
}