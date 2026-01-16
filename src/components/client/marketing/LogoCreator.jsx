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
  const [activeLogoIndex, setActiveLogoIndex] = useState(0);

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
    const downloadLogo = (logoUrl, format) => {
      const link = document.createElement('a');
      link.href = logoUrl;
      link.download = `${formData.businessName}-logo.${format === 'png' ? 'png' : 'svg'}`;
      link.click();
      setSelectedLogo(null);
    };

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

    const currentLogo = logos[activeLogoIndex];

    return (
      <div className="fixed inset-0 bg-white overflow-y-auto pb-20 md:pb-0 md:static md:space-y-8">
        {/* Header - Sticky on Mobile */}
        <div className="sticky top-0 bg-white z-10 md:relative md:bg-transparent px-4 py-4 md:py-0 md:px-0 text-center border-b md:border-0">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">בחר את הלוגו המושלם שלך 🎨</h2>
          <p className="text-gray-500 text-sm mt-1">4 וריאציות מעוצבות בעבורך</p>
        </div>

        {/* Main Carousel - Mobile Optimized */}
        <div className="md:py-8">
          {/* Large Preview - Fullscreen on Mobile */}
          <motion.div
            key={activeLogoIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="px-4 md:px-0"
          >
            <div className="bg-white md:bg-gradient-to-br md:from-gray-50 md:to-gray-100 rounded-none md:rounded-2xl p-6 md:p-12 flex items-center justify-center min-h-64 md:min-h-96 shadow-none md:shadow-lg">
              <img 
                src={currentLogo.url} 
                alt={`Logo variant ${activeLogoIndex + 1}`} 
                className="h-32 sm:h-40 md:h-56 w-auto object-contain"
              />
            </div>
          </motion.div>

          {/* Variant Name */}
          <div className="px-4 md:px-0 mt-4 text-center">
            <p className="text-lg font-semibold text-gray-900">{currentLogo.variant}</p>
            <p className="text-sm text-gray-500 mt-1">
              {activeLogoIndex + 1} מתוך {logos.length}
            </p>
          </div>
        </div>

        {/* Thumbnail Carousel - Horizontal Scroll on Mobile */}
        <div className="px-4 md:px-0">
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide justify-start md:justify-center">
            {logos.map((logo, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveLogoIndex(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg border-2 transition-all ${
                  activeLogoIndex === index
                    ? 'border-blue-500 ring-2 ring-blue-300 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden rounded-lg">
                  <img 
                    src={logo.url} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="h-14 md:h-16 w-auto object-contain"
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action Buttons - Sticky on Mobile */}
        <div className="fixed bottom-0 left-0 right-0 md:static bg-white border-t md:border-0 px-4 py-3 md:py-0 md:bg-transparent md:py-6 space-y-3 md:space-y-3">
          <Button 
            onClick={() => {
              setSelectedLogo(currentLogo);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 md:h-11 text-base md:text-sm font-semibold rounded-lg"
          >
            <Download className="w-4 h-4 ml-2" />
            הורדת הלוגו
          </Button>
          
          <Button 
            onClick={() => saveLogo(currentLogo.url, currentLogo.variant)}
            variant="outline"
            className="w-full h-12 md:h-11 text-base md:text-sm font-semibold rounded-lg border-2"
          >
            <Palette className="w-4 h-4 ml-2" />
            שמור
          </Button>

          {/* Bottom Navigation */}
          <div className="flex gap-2 md:hidden">
            <Button 
              onClick={() => {
                setStep(1);
                setLogos([]);
                setSelectedLogo(null);
              }}
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
            >
              ⚡ חדש
            </Button>
            <Button 
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              size="sm"
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs"
            >
              {isGenerating ? 'יוצר...' : '+ וריאציות'}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-3 justify-center pt-4">
            <Button 
              onClick={() => {
                setStep(1);
                setLogos([]);
                setSelectedLogo(null);
              }}
              variant="outline"
              className="border-2 border-gray-300"
            >
              ⚡ לוגו חדש
            </Button>
            <Button 
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
                  window.location.href = '/checkout';
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

  return null;
}