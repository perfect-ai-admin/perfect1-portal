import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PORTAL_CTA } from '../config/navigation';

const DEFAULT_PLANS = [
  {
    id: 'diy',
    name: 'עושים לבד',
    price: '~4,000₪',
    priceNote: 'עלות ממוצעת',
    description: 'למי שרוצה לחסוך ויודע להתמודד עם בירוקרטיה',
    features: [
      'מדריך שלב-אחר-שלב (המדריך הזה)',
      'תקנון מצוי (ברירת מחדל)',
      'אימות חתימות אצל עו"ד',
      'הגשה עצמאית לרשם החברות',
    ],
    missing: [
      'ליווי מקצועי',
      'בדיקת מסמכים לפני הגשה',
      'פתיחת תיקים ברשויות',
    ],
    cta: 'המשך לקרוא את המדריך',
    ctaLink: '#registration-steps',
    variant: 'outline',
  },
  {
    id: 'standard',
    name: 'פתיחה אונליין',
    price: '450₪',
    priceNote: '+ אגרות רשם',
    description: 'הדרך המהירה — מלאו שאלון, שלמו, ואנחנו מטפלים בכל השאר',
    badge: 'הכי פופולרי',
    features: [
      'הכנת כל המסמכים על ידי עו"ד',
      'אימות חתימות + הגשה מקוונת',
      'מעקב סטטוס עד תעודת התאגדות',
      'תמיכה טלפונית לאורך התהליך',
    ],
    missing: [],
    cta: 'התחילו עכשיו — 450₪',
    ctaLink: '/open-hevra-bam-online',
    variant: 'primary',
  },
  {
    id: 'vip',
    name: 'VIP — חבילה מלאה',
    price: '4,990₪',
    priceNote: '+ אגרות רשם',
    description: 'הכל כלול — כולל הסכם מייסדים, מיתוג ראשוני ותמיכה שוטפת',
    features: [
      'כל מה שבליווי מקצועי',
      'הסכם מייסדים (עד 3 שותפים)',
      'ייעוץ מבנה מס אופטימלי',
      'לוגו + חותמת חברה מעוצבת',
      'הנהלת חשבונות — 3 חודשים חינם',
      'תמיכה טלפונית ישירה',
    ],
    missing: [],
    cta: 'דברו איתנו',
    ctaLink: PORTAL_CTA.whatsapp,
    variant: 'gold',
  },
];

export default function PricingCards({ section }) {
  const plans = section?.plans || DEFAULT_PLANS;

  return (
    <div id={section?.id} className="scroll-mt-24">
      {section?.title && <h2 className="portal-h2 mb-2 text-center">{section.title}</h2>}
      {section?.description && <p className="portal-body text-center mb-8 max-w-2xl mx-auto">{section.description}</p>}

      <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan }) {
  const navigate = useNavigate();
  const isPrimary = plan.variant === 'primary';
  const isGold = plan.variant === 'gold';

  const scrollToOrNavigate = (link) => {
    if (link?.startsWith('#')) {
      const el = document.getElementById(link.slice(1));
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (link?.startsWith('/')) {
      navigate(link);
    } else if (link?.startsWith('http') || link?.startsWith('https')) {
      window.open(link, '_blank', 'noopener');
    }
  };

  return (
    <div className={`relative rounded-2xl border-2 p-5 sm:p-6 flex flex-col transition-shadow hover:shadow-lg ${
      isPrimary ? 'border-portal-teal bg-portal-teal/[0.02] shadow-md' :
      isGold ? 'border-amber-400 bg-amber-50/30' :
      'border-gray-200 bg-white'
    }`}>
      {/* Badge */}
      {plan.badge && (
        <div className={`absolute -top-3 right-4 px-3 py-0.5 rounded-full text-xs font-bold text-white ${
          isPrimary ? 'bg-portal-teal' : 'bg-amber-500'
        }`}>
          <Star className="w-3 h-3 inline ml-1" />{plan.badge}
        </div>
      )}

      {/* Header */}
      <h3 className={`text-lg font-bold mb-1 ${isPrimary ? 'text-portal-teal' : isGold ? 'text-amber-700' : 'text-portal-navy'}`}>
        {plan.name}
      </h3>
      <p className="text-sm text-gray-500 mb-4 min-h-[40px]">{plan.description}</p>

      {/* Price */}
      <div className="mb-5">
        <span className={`text-3xl font-extrabold ${isPrimary ? 'text-portal-teal' : isGold ? 'text-amber-600' : 'text-portal-navy'}`}>
          {plan.price}
        </span>
        {plan.priceNote && <span className="text-sm text-gray-400 mr-1">{plan.priceNote}</span>}
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isPrimary ? 'text-portal-teal' : isGold ? 'text-amber-500' : 'text-green-500'}`} />
            <span className="text-gray-700">{f}</span>
          </li>
        ))}
        {(plan.missing || []).map((f, i) => (
          <li key={`m-${i}`} className="flex items-start gap-2 text-sm opacity-40">
            <span className="w-4 h-4 mt-0.5 shrink-0 text-center leading-4">—</span>
            <span className="text-gray-400 line-through">{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={() => scrollToOrNavigate(plan.ctaLink)}
        className={`w-full h-11 rounded-xl font-bold text-sm transition-all ${
          isPrimary
            ? 'bg-portal-teal hover:bg-portal-teal-dark text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
            : isGold
            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
            : 'bg-white border-2 border-gray-200 text-portal-navy hover:border-portal-teal hover:text-portal-teal'
        }`}
      >
        {plan.cta}
        {isPrimary && <ArrowLeft className="mr-1.5 w-4 h-4" />}
      </Button>
    </div>
  );
}
