import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function PresentationQuestionnaire({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // שלב 1
    presentationType: [],
    targetAudience: [],
    // שלב 2
    businessName: '',
    businessField: '',
    businessDescription: '',
    // שלב 3
    painPoint: '',
    whyPainful: [],
    currentSolutions: '',
    // שלב 4
    solution: '',
    solutionSteps: { step1: '', step2: '', step3: '' },
    // שלב 5
    uniqueAdvantage: [],
    advantageExplanation: '',
    // שלב 6
    proofs: [],
    strongMetric: '',
    // שלב 7
    valueProposition: '',
    afterPicture: '',
    // שלב 8
    cta: [],
    ctaText: '',
    // שלב 9
    style: '',
    colors: '',
    hasLogo: '',
    // שלב 10
    language: 'hebrew',
    length: ''
  });

  const steps = [
    { title: 'סוג המצגת', subtitle: 'לאיזה מטרה?' },
    { title: 'פרטי העסק', subtitle: 'ספרו לנו על עצמכם' },
    { title: 'הבעיה', subtitle: 'מה הכאב של הקהל?' },
    { title: 'הפתרון', subtitle: 'איך אתם פותרים את זה?' },
    { title: 'היתרון שלכם', subtitle: 'מה מבדיל אתכם?' },
    { title: 'הוכחות ואמון', subtitle: 'מה הנתון החזק שלכם?' },
    { title: 'הצעת הערך', subtitle: 'מה קהל היעד מקבל?' },
    { title: 'קריאה לפעולה', subtitle: 'מה אתם רוצים שיקרה?' },
    { title: 'עיצוב ושפה גרפית', subtitle: 'המראה החזותי' },
    { title: 'פרטים טכניים', subtitle: 'הגדרות סופיות' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // כאן תהיה קריאה לשירות ליצירת המצגת
    setTimeout(() => {
      console.log('Form Data:', formData);
      onComplete();
    }, 500);
  };

  const toggleCheckbox = (field, value) => {
    const current = formData[field] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const stepContent = () => {
    switch (currentStep) {
      case 0: // סוג המצגת
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">לאיזה מטרה המצגת מיועדת?</h3>
              <div className="space-y-3">
                {[
                  { id: 'customers', label: 'הצגת שירות/מוצר ללקוחות' },
                  { id: 'investors', label: 'משקיעים / שותפים' },
                  { id: 'both', label: 'גם וגם' }
                ].map(option => (
                  <label key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.presentationType.includes(option.id)}
                      onChange={() => toggleCheckbox('presentationType', option.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">מי קהל היעד העיקרי?</h3>
              <div className="space-y-3">
                {[
                  { id: 'individuals', label: 'לקוחות פרטיים' },
                  { id: 'smb', label: 'עסקים קטנים' },
                  { id: 'companies', label: 'חברות' },
                  { id: 'investors', label: 'משקיעים' },
                  { id: 'other', label: 'אחר' }
                ].map(option => (
                  <label key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.targetAudience.includes(option.id)}
                      onChange={() => toggleCheckbox('targetAudience', option.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 1: // פרטי העסק
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">שם העסק / המיזם</label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="למשל: Perfect One"
                className="h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">תחום פעילות</label>
              <Input
                value={formData.businessField}
                onChange={(e) => setFormData({ ...formData, businessField: e.target.value })}
                placeholder="למשל: ייעוץ וליווי עסקי"
                className="h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">מה אתם עושים במשפט אחד פשוט?</label>
              <Textarea
                value={formData.businessDescription}
                onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                placeholder="אנחנו עוזרים ל־__ לעשות ___ בצורה __"
                className="min-h-20"
              />
            </div>
          </div>
        );

      case 2: // הבעיה
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">איזה בעיה כואבת יש היום לקהל היעד שלכם?</label>
              <Textarea
                value={formData.painPoint}
                onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
                placeholder="תארו את הבעיה בפרטים"
                className="min-h-20"
              />
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">למה הבעיה הזו קריטית?</h3>
              <div className="space-y-3">
                {[
                  { id: 'money', label: 'כסף' },
                  { id: 'time', label: 'זמן' },
                  { id: 'frustration', label: 'תסכול' },
                  { id: 'uncertainty', label: 'חוסר ודאות' },
                  { id: 'regulation', label: 'רגולציה / מורכבות' }
                ].map(option => (
                  <label key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.whyPainful.includes(option.id)}
                      onChange={() => toggleCheckbox('whyPainful', option.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">איך הקהל מתמודד עם זה היום?</label>
              <Textarea
                value={formData.currentSolutions}
                onChange={(e) => setFormData({ ...formData, currentSolutions: e.target.value })}
                placeholder="מה הפתרונות / אלטרנטיבות הקיימות?"
                className="min-h-20"
              />
            </div>
          </div>
        );

      case 3: // הפתרון
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">מה הפתרון שאתם מציעים?</label>
              <Textarea
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                placeholder="תארו את הפתרון בקצרה"
                className="min-h-20"
              />
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">איך זה עובד בפשטות? (3 שלבים)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שלב 1</label>
                  <Input
                    value={formData.solutionSteps.step1}
                    onChange={(e) => setFormData({
                      ...formData,
                      solutionSteps: { ...formData.solutionSteps, step1: e.target.value }
                    })}
                    placeholder=""
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שלב 2</label>
                  <Input
                    value={formData.solutionSteps.step2}
                    onChange={(e) => setFormData({
                      ...formData,
                      solutionSteps: { ...formData.solutionSteps, step2: e.target.value }
                    })}
                    placeholder=""
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שלב 3</label>
                  <Input
                    value={formData.solutionSteps.step3}
                    onChange={(e) => setFormData({
                      ...formData,
                      solutionSteps: { ...formData.solutionSteps, step3: e.target.value }
                    })}
                    placeholder=""
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // היתרון
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">מה מבדיל אתכם מאחרים?</h3>
              <div className="space-y-3">
                {[
                  { id: 'simplicity', label: 'פשטות' },
                  { id: 'price', label: 'מחיר' },
                  { id: 'speed', label: 'מהירות' },
                  { id: 'experience', label: 'ניסיון' },
                  { id: 'technology', label: 'טכנולוגיה' },
                  { id: 'service', label: 'שירות אישי' },
                  { id: 'other', label: 'אחר' }
                ].map(option => (
                  <label key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.uniqueAdvantage.includes(option.id)}
                      onChange={() => toggleCheckbox('uniqueAdvantage', option.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">למה זה עדיף על האלטרנטיבה הקיימת?</label>
              <Textarea
                value={formData.advantageExplanation}
                onChange={(e) => setFormData({ ...formData, advantageExplanation: e.target.value })}
                placeholder="הסבירו את היתרון המשכנע"
                className="min-h-20"
              />
            </div>
          </div>
        );

      case 5: // הוכחות
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">האם יש:</h3>
              <div className="space-y-3">
                {[
                  { id: 'customers', label: 'לקוחות קיימים' },
                  { id: 'experience', label: 'ניסיון / ותק' },
                  { id: 'metrics', label: 'מספרים / תוצאות' },
                  { id: 'testimonials', label: 'המלצה / ציטוט' },
                  { id: 'partnerships', label: 'שיתופי פעולה' }
                ].map(option => (
                  <label key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.proofs.includes(option.id)}
                      onChange={() => toggleCheckbox('proofs', option.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">אם יש נתון אחד חזק – מה הוא?</label>
              <Input
                value={formData.strongMetric}
                onChange={(e) => setFormData({ ...formData, strongMetric: e.target.value })}
                placeholder="למשל: 5000+ לקוחות, 98% הצלחה"
                className="h-10"
              />
            </div>
          </div>
        );

      case 6: // הצעת הערך
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">מה קהל היעד מקבל בפועל?</label>
              <Textarea
                value={formData.valueProposition}
                onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
                placeholder="תוצאה ברורה ולא 'שירות'"
                className="min-h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">איך החיים של הלקוח נראים אחרי שהוא עובד איתכם?</label>
              <Textarea
                value={formData.afterPicture}
                onChange={(e) => setFormData({ ...formData, afterPicture: e.target.value })}
                placeholder="תארו את התמונה אחרי - המצב החדש"
                className="min-h-20"
              />
            </div>
          </div>
        );

      case 7: // קריאה לפעולה
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">מה אתם רוצים שיקרה אחרי המצגת?</h3>
              <div className="space-y-3">
                {[
                  { id: 'meeting', label: 'שיחת היכרות' },
                  { id: 'contact', label: 'השארת פרטים' },
                  { id: 'appointment', label: 'פגישה' },
                  { id: 'investment', label: 'השקעה / המשך תהליך' }
                ].map(option => (
                  <label key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cta.includes(option.id)}
                      onChange={() => toggleCheckbox('cta', option.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">ניסוח CTA מועדף (או השאר ריק)</label>
              <Input
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="למשל: בואו נתחיל"
                className="h-10"
              />
            </div>
          </div>
        );

      case 8: // עיצוב
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">סגנון מועדף:</h3>
              <div className="space-y-3">
                {[
                  { id: 'professional', label: 'רציני / עסקי' },
                  { id: 'innovative', label: 'חדשני / טכנולוגי' },
                  { id: 'simple', label: 'פשוט / בגובה העיניים' },
                  { id: 'premium', label: 'יוקרתי / פרימיום' }
                ].map(option => (
                  <label key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="style"
                      checked={formData.style === option.id}
                      onChange={() => setFormData({ ...formData, style: option.id })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">צבעים מועדפים / מיתוג קיים</label>
              <Input
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                placeholder="למשל: כחול וזהב"
                className="h-10"
              />
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">האם יש לוגו?</h3>
              <div className="space-y-3">
                {[
                  { id: 'yes', label: 'כן' },
                  { id: 'no', label: 'לא (צריך ליצור)' }
                ].map(option => (
                  <label key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="hasLogo"
                      checked={formData.hasLogo === option.id}
                      onChange={() => setFormData({ ...formData, hasLogo: option.id })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 9: // פרטים טכניים
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">שפת המצגת:</h3>
              <div className="space-y-3">
                {[
                  { id: 'hebrew', label: 'עברית' },
                  { id: 'english', label: 'אנגלית' }
                ].map(option => (
                  <label key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="language"
                      checked={formData.language === option.id}
                      onChange={() => setFormData({ ...formData, language: option.id })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">אורך רצוי:</h3>
              <div className="space-y-3">
                {[
                  { id: 'short', label: 'קצר (6–8 שקפים)' },
                  { id: 'medium', label: 'בינוני (10–12 שקפים)' },
                  { id: 'full', label: 'מלא (15–20 שקפים)' }
                ].map(option => (
                  <label key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="length"
                      checked={formData.length === option.id}
                      onChange={() => setFormData({ ...formData, length: option.id })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">בנייה של מצגת עסקית</h2>
        <p className="text-gray-600">שלב {currentStep + 1} מתוך {steps.length}</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Title */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-8"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-1">{steps[currentStep].title}</h3>
        <p className="text-gray-600 text-sm">{steps[currentStep].subtitle}</p>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {stepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-8 justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          חזור
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? 'יוצר את המצגת...' : 'השלם וצור מצגת'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            הבא
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}