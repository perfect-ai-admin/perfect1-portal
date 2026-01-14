import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Wand2, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

const COLOR_SCHEMES = [
  { name: 'כחול מקצועי', colors: ['#1E3A5F', '#3B82F6', '#FFFFFF'] },
  { name: 'ירוק טבעי', colors: ['#22C55E', '#10B981', '#FFFFFF'] },
  { name: 'סגול יצירתי', colors: ['#8B5CF6', '#A855F7', '#FFFFFF'] },
  { name: 'כתום אנרגטי', colors: ['#F59E0B', '#FB923C', '#FFFFFF'] },
  { name: 'ורוד מודרני', colors: ['#EC4899', '#F472B6', '#FFFFFF'] }
];

const STYLES = [
  { id: 'abstract', label: 'מופשט', description: 'צורות גיאומטריות' },
  { id: 'literal', label: 'ליטרלי', description: 'ייצוג ישיר של העסק' },
  { id: 'text', label: 'טקסט בלבד', description: 'פונט מעוצב' },
  { id: 'minimal', label: 'מינימליסטי', description: 'פשוט ונקי' }
];

export default function LogoCreator({ businessName }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: businessName || '',
    tagline: '',
    industry: '',
    colorScheme: COLOR_SCHEMES[0],
    style: 'minimal'
  });
  const [logos, setLogos] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Professional business logo for "${formData.businessName}". 
Style: ${formData.style}. 
Industry: ${formData.industry}.
Colors: ${formData.colorScheme.colors.join(', ')}.
Modern, clean, suitable for business cards and website.`;

      const result = await base44.integrations.Core.GenerateImage({
        prompt: prompt
      });

      setLogos([result.url]);
      setStep(3);
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

          <Button 
            onClick={() => setStep(2)} 
            className="w-full"
            disabled={!formData.businessName || !formData.industry}
          >
            המשך
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
          {/* Color Scheme */}
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
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{scheme.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <Label className="text-lg font-bold mb-4 block">סגנון הלוגו</Label>
            <RadioGroup value={formData.style} onValueChange={(val) => setFormData(prev => ({ ...prev, style: val }))}>
              <div className="space-y-3">
                {STYLES.map(style => (
                  <div key={style.id} className="flex items-center space-x-2 space-x-reverse p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all cursor-pointer">
                    <RadioGroupItem value={style.id} id={style.id} />
                    <Label htmlFor={style.id} className="flex-1 cursor-pointer">
                      <p className="font-semibold">{style.label}</p>
                      <p className="text-sm text-gray-600">{style.description}</p>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

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

  if (step === 3) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">הלוגו שלך מוכן! 🎨</h2>
          <p className="text-gray-600">בחר את הגרסה המועדפת עליך</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {logos.map((logo, index) => (
            <div
              key={index}
              onClick={() => setSelectedLogo(logo)}
              className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all ${
                selectedLogo === logo ? 'ring-4 ring-blue-500' : 'hover:shadow-xl'
              }`}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center p-8">
                <img src={logo} alt="Generated logo" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="p-4 text-center">
                {selectedLogo === logo && (
                  <p className="text-sm text-blue-600 font-semibold">נבחר ✓</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            צור וריאציות
          </Button>
          <Button 
            onClick={() => {
              const link = document.createElement('a');
              link.href = selectedLogo || logos[0];
              link.download = `${formData.businessName}-logo.png`;
              link.click();
            }}
            disabled={!selectedLogo && logos.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 ml-2" />
            הורד לוגו
          </Button>
        </div>
      </div>
    );
  }

  return null;
}