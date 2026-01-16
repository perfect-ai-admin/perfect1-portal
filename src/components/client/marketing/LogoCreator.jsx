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
      const prompt = `Professional business logo design. 
Business: "${formData.businessName}"
Industry: ${formData.industry}
Style: ${formData.style} ${formData.vibe ? `with ${formData.vibe} vibe` : ''}
Icon style: ${formData.iconStyle}
Color palette: ${formData.colorScheme.colors.join(', ')}
Requirements: Clean, scalable, modern, suitable for business cards and digital use. White or transparent background. Vector-style appearance.`;

      const result = await base44.integrations.Core.GenerateImage({
        prompt: prompt
      });

      setLogos(prev => [...prev, result.url]);
      setStep(4);
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

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">הלוגו שלך מוכן! 🎨</h2>
          <p className="text-gray-600">בחר את הגרסה המועדפת עליך והורד בפורמטים שונים</p>
        </div>

        {/* Logo Preview Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedLogo(logo)}
              className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all ${
                selectedLogo === logo ? 'ring-4 ring-blue-500 scale-105' : 'hover:shadow-xl'
              }`}
            >
              <div className="aspect-square bg-gray-50 flex items-center justify-center p-8">
                <img src={logo} alt="Generated logo" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="p-4 text-center">
                {selectedLogo === logo && (
                  <p className="text-sm text-blue-600 font-semibold">✓ נבחר</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions Section - All in One */}
        {(selectedLogo || logos.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 space-y-6 border border-blue-100"
          >
            {/* Download Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">הורד בפורמטים שונים</h3>
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="outline"
                  onClick={() => downloadLogo('png')}
                  className="flex-col h-auto py-3"
                >
                  <Download className="w-5 h-5 mb-1" />
                  <span className="font-semibold text-sm">PNG</span>
                  <span className="text-xs text-gray-500">חברתית</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => downloadLogo('svg')}
                  className="flex-col h-auto py-3"
                >
                  <Download className="w-5 h-5 mb-1" />
                  <span className="font-semibold text-sm">SVG</span>
                  <span className="text-xs text-gray-500">אתר</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => downloadLogo('pdf')}
                  className="flex-col h-auto py-3"
                >
                  <Download className="w-5 h-5 mb-1" />
                  <span className="font-semibold text-sm">PDF</span>
                  <span className="text-xs text-gray-500">הדפסה</span>
                </Button>
              </div>
            </div>

            {/* Continue Actions */}
            <div className="border-t pt-4 space-y-3">
              <Button 
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    יוצר וריאציות נוספות...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 ml-2" />
                    צור עוד וריאציות
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
                <RefreshCw className="w-4 h-4 ml-2" />
                התחל מחדש
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return null;
}