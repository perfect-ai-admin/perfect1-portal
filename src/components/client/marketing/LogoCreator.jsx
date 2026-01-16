import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Wand2, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
          style: 'elegant with texture',
          description: 'אלגנטי עם קוואם'
        },
        {
          style: 'playful and dynamic',
          description: 'שובב ודינמי'
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
    const downloadLogo = (format) => {
      const logo = selectedLogo || logos[0];
      const link = document.createElement('a');
      link.href = logo;
      link.download = `${formData.businessName}-logo.${format}`;
      link.click();
    };

    const saveLogo = () => {
      const logo = selectedLogo || logos[0];
      localStorage.setItem(`logo_${formData.businessName}`, logo);
      alert('הלוגו נשמר בהצלחה!');
    };

    return (
      <div className="text-center space-y-4">
        {/* Logo Display - Minimal */}
        <h2 className="text-2xl font-bold text-gray-900">הלוגו שלך מוכן! 🎨</h2>
        
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
          >
            <img 
              src={selectedLogo || logos[0]} 
              alt="Your logo" 
              className="h-24 sm:h-32 w-auto object-contain"
            />
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 max-w-xs mx-auto">
          <Button 
            onClick={saveLogo}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Palette className="w-4 h-4 ml-2" />
            שמור לוגו
          </Button>

          <Button 
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                יוצר...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 ml-2" />
                עוד וריאציה
              </>
            )}
          </Button>

          <Button 
            onClick={() => {
              setStep(1);
              setLogos([]);
              setSelectedLogo(null);
            }}
            variant="outline"
            className="w-full"
          >
            לוגו חדש
          </Button>
        </div>

        {/* Download Links */}
        <div className="flex justify-center gap-2 text-sm">
          <button 
            onClick={() => downloadLogo('png')}
            className="text-blue-600 hover:underline"
          >
            PNG
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={() => downloadLogo('svg')}
            className="text-blue-600 hover:underline"
          >
            SVG
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={() => downloadLogo('pdf')}
            className="text-blue-600 hover:underline"
          >
            PDF
          </button>
        </div>
      </div>
    );
  }

  return null;
}