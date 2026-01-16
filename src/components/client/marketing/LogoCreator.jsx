import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Wand2, Download, RefreshCw, FileJson, Image, Code, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';

const COLOR_SCHEMES = [
  { name: 'כחול מקצועי', colors: ['#1E3A5F', '#3B82F6', '#FFFFFF'] },
  { name: 'ירוק טבעי', colors: ['#22C55E', '#10B981', '#FFFFFF'] },
  { name: 'סגול יצירתי', colors: ['#8B5CF6', '#A855F7', '#FFFFFF'] },
  { name: 'כתום אנרגטי', colors: ['#F59E0B', '#FB923C', '#FFFFFF'] },
  { name: 'ורוד מודרני', colors: ['#EC4899', '#F472B6', '#FFFFFF'] }
];

const STYLES = [
  { id: 'minimal', label: 'מינימליסטי', description: 'פשוט ונקי', icon: '⬜' },
  { id: 'modern', label: 'מודרני', description: 'טרנדי ועכשווי', icon: '✨' },
  { id: 'abstract', label: 'מופשט', description: 'צורות גיאומטריות', icon: '◆' },
  { id: 'playful', label: 'שובב', description: 'צעיר ומהנה', icon: '🎨' },
  { id: 'elegant', label: 'אלגנטי', description: 'מתוחכם ויוקרתי', icon: '👑' },
  { id: 'bold', label: 'נועז', description: 'חזק ובולט', icon: '⚡' }
];

const ICON_STYLES = [
  { id: 'geometric', label: 'גיאומטרי', example: '⬡⬢⬣' },
  { id: 'organic', label: 'אורגני', example: '🌿🍃' },
  { id: 'letter', label: 'אות ראשונה', example: 'A B C' },
  { id: 'symbol', label: 'סמל', example: '★ ● ■' },
  { id: 'illustration', label: 'איור', example: '🎨 ✏️' }
];

export default function LogoCreator({ businessName }) {
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
  const [logos, setLogos] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('bit');
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const variations = [
        {
          style: 'flat minimalist',
          description: 'מינימליסטי ונקי'
        },
        {
          style: 'modern gradient',
          description: 'מודרני עם גרדיאנט'
        },
        {
          style: 'bold and striking',
          description: 'נועז ובולט'
        },
        {
          style: 'elegant and sophisticated',
          description: 'אלגנטי ומתוחכם'
        }
      ];

      const generatedLogos = [];

      for (const variation of variations) {
        try {
          const prompt = `Professional business logo design - ${variation.description}. 
Business: "${formData.businessName}"
Industry: ${formData.industry}
Vibe: ${formData.vibe ? formData.vibe : 'professional'}
Icon style: ${formData.iconStyle}
Style: ${variation.style}
Color palette: ${formData.colorScheme.colors.join(', ')}
Requirements: Clean, scalable, modern, suitable for business cards and digital use. White or transparent background. Vector-style appearance. High quality.`;

          const result = await base44.integrations.Core.GenerateImage({
            prompt: prompt
          });

          generatedLogos.push({
            url: result.url,
            variant: variation.description
          });
        } catch (err) {
          console.error(`Failed to generate ${variation.description}:`, err);
        }
      }

      if (generatedLogos.length > 0) {
        setLogos(generatedLogos);
        setStep(4);
      } else {
        alert('שגיאה ביצירת הלוגוים. נסה שוב.');
      }
    } catch (error) {
      console.error('Logo generation failed:', error);
      alert('שגיאה ביצירת הלוגו. נסה שוב.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-6">
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
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setStep(1)}>
          ← חזור
        </Button>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">שלב 2: בחר צבעים</h3>
            <p className="text-gray-600 text-sm">צבעים יוצרים את ההרגשה הראשונית</p>
          </div>

          <div>
            <Label className="text-lg font-bold mb-4 block">בחר ערכת צבעים</Label>
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
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{scheme.name}</p>
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => setStep(3)} 
            className="w-full"
          >
            המשך לבחירת סגנון
          </Button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setStep(2)}>
          ← חזור
        </Button>

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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 ml-2 animate-spin" />
                יוצר לוגו...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 ml-2" />
                צור לוגו ב-AI
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    const saveLogo = (logoUrl, variant) => {
      const allSaved = JSON.parse(localStorage.getItem('saved_logos') || '{}');
      if (!allSaved[formData.businessName]) {
        allSaved[formData.businessName] = [];
      }
      allSaved[formData.businessName].push({
        url: logoUrl,
        variant: variant,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('saved_logos', JSON.stringify(allSaved));
      alert(`הלוגו נשמר בהצלחה! ✓`);
    };

    const currentLogo = logos[currentLogoIndex];
    const progressPercent = ((currentLogoIndex + 1) / logos.length) * 100;

    return (
      <div className="space-y-6 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">בחר את הלוגו המושלם שלך 🎨</h2>
          <p className="text-gray-500 text-sm md:text-base mt-1">4 וריאציות מעוצבות בעבורך</p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-4 gap-4 mb-8">
          {logos.map((logo, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentLogoIndex(index)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`flex flex-col rounded-xl overflow-hidden transition-all border-2 ${
                currentLogoIndex === index
                  ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <img 
                  src={logo.url} 
                  alt={`Logo variant ${index + 1}`} 
                  className="h-24 w-auto object-contain"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-xs font-semibold text-gray-700">{logo.variant}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Mobile Full-Screen Swipeable Card */}
        <div className="lg:hidden flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            key={currentLogoIndex}
            className="flex-1 flex flex-col"
          >
            {/* Large Logo Display */}
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl flex items-center justify-center p-8 mb-6 shadow-lg">
              <img 
                src={currentLogo.url} 
                alt={`Logo variant ${currentLogoIndex + 1}`} 
                className="max-h-64 w-auto object-contain"
              />
            </div>

            {/* Variant Name & Progress */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{currentLogo.variant}</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{currentLogoIndex + 1}</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                  />
                </div>
                <span className="font-medium">{logos.length}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              <Button 
                onClick={() => {
                  setSelectedLogo(currentLogo);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 text-base font-semibold rounded-xl shadow-lg"
              >
                <Download className="w-5 h-5 ml-2" />
                הורדת הלוגו
              </Button>
              
              <Button 
                onClick={() => saveLogo(currentLogo.url, currentLogo.variant)}
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 rounded-xl"
              >
                <Palette className="w-5 h-5 ml-2" />
                שמור לחיסכון
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentLogoIndex(Math.max(0, currentLogoIndex - 1))}
                disabled={currentLogoIndex === 0}
                className="flex-1 py-3 px-4 rounded-lg border-2 border-gray-300 text-gray-700 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
              >
                ← הקודם
              </button>
              <button
                onClick={() => setCurrentLogoIndex(Math.min(logos.length - 1, currentLogoIndex + 1))}
                disabled={currentLogoIndex === logos.length - 1}
                className="flex-1 py-3 px-4 rounded-lg border-2 border-blue-300 text-blue-700 font-medium disabled:opacity-30 disabled:cursor-not-allowed bg-blue-50 hover:bg-blue-100 transition-all"
              >
                הבא →
              </button>
            </div>
          </motion.div>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex gap-3 justify-center pt-6">
          <Button 
            onClick={() => {
              setStep(1);
              setLogos([]);
              setSelectedLogo(null);
            }}
            variant="outline"
            className="border-2 border-gray-300 h-11 px-6"
          >
            ⚡ לוגו חדש
          </Button>
          <Button 
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                יוצר...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 ml-2" />
                וריאציות נוספות
              </>
            )}
          </Button>
        </div>

        {/* Download Formats Dialog */}
        <Dialog open={!!selectedLogo} onOpenChange={(open) => !open && setSelectedLogo(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">הלוגו שלך מוכן להורדה</DialogTitle>
            </DialogHeader>

            <div className="space-y-2 py-2">
              {/* PNG Format */}
              <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Image className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">PNG</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>

              {/* SVG Format */}
              <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">SVG</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>

              {/* PDF Format */}
              <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileJson className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-900">PDF</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>

              {/* Purchase CTA */}
              <button
                onClick={() => {
                  setSelectedLogo(null);
                  setStep(5);
                }}
                className="w-full mt-3 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg hover:border-green-400 transition-all"
              >
                <span className="font-bold text-gray-900 text-sm">המשך לרכישה</span>
                <Wand2 className="w-5 h-5 text-green-600" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Checkout page
  if (step === 5) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 max-h-screen overflow-hidden"
      >
        {/* Header - Minimal */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">סיימו את הרכישה</h2>
          <p className="text-sm text-gray-600">אנחנו כמעט שם. נשאר רק להשלים את התשלום.</p>
        </div>

        {/* Main Card - Central */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Product Details */}
          <div className="p-6 space-y-4 border-b border-gray-100">
            {/* Brand Trust Anchor - Small Square */}
            <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs text-gray-600">
                <p className="font-medium text-gray-900">חשבון עבור:</p>
                <p className="text-gray-700 font-semibold">{formData.businessName}</p>
              </div>
            </div>

            {/* Service Name & Price */}
            <div>
              <h3 className="text-lg font-bold text-gray-900">חבילת לוגו מלאה</h3>
            </div>

            {/* What's Included - 3 Items */}
            <div className="space-y-2">
              {[
                'לוגו PNG באיכות גבוהה',
                'לוגו SVG להדפסה',
                'ייעוץ עיצוב אישי'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>

            {/* Price - Clear */}
            <div className="bg-gray-50 rounded-lg p-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">סכום כולל:</span>
                <p className="text-2xl font-bold text-gray-900">₪99</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">תשלום חד-פעמי, ללא חיובים נוספים</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="p-6 space-y-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 mb-3">בחר אמצעי תשלום</p>

            {[
              { id: 'bit', label: 'ביט', icon: '📱' },
              { id: 'card', label: 'כרטיס אשראי', icon: '💳' },
              { id: 'bank', label: 'העברה בנקאית', icon: '🏦' }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  selectedPayment === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-lg">{method.icon}</div>
                <span className={`text-sm font-medium ${
                  selectedPayment === method.id ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  {method.label}
                </span>
                {selectedPayment === method.id && (
                  <div className="ml-auto w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-blue-500">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="p-6">
            <Button 
              onClick={() => alert('תשלום בהצליחה! 🎉')}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all"
            >
              המשך לתשלום
            </Button>
          </div>

          {/* Micro Trust - Small */}
          <div className="px-6 pb-6 text-center">
            <p className="text-xs text-gray-600">
              🔒 התשלום מאובטח • ניתן לפנות אלינו בכל שלב
            </p>
          </div>
        </div>

        {/* Back Button - Bottom */}
        <button
          onClick={() => setStep(4)}
          className="mt-6 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← חזור לעמוד הקודם
        </button>
      </motion.div>
    );
  }

  return null;
}