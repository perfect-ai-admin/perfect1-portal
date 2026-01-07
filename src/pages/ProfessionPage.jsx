import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Lightbulb, AlertTriangle, ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import LeadForm from '../components/forms/LeadForm';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import AnswerBlock from '../components/seo/AnswerBlock';
import InternalLinker from '../components/seo/InternalLinker';
import SEOOptimized, { schemaTemplates } from './SEOOptimized';

const professionsData = {
  'meatzev-grafi': {
    name: 'מעצב גרפי',
    icon: '🎨',
    color: '#FF6B6B',
    fullContent: `
      <h2>למה מעצבים גרפיים צריכים עוסק פטור?</h2>
      <p>כמעצב גרפי עצמאי, אתה עובד עם לקוחות מגוונים - מעסקים קטנים ועד חברות גדולות. בלי עוסק פטור, אתה לא יכול להוציא חשבונית מס, מה שמקשה על לקוחות רבים לשלם לך. עם עוסק פטור, אתה הופך ללגיטימי מבחינת מס הכנסה, יכול לקבל תשלומים בהעברה בנקאית, ולהוציא חשבוניות כדין.</p>
      
      <h3>מה מיוחד במקצוע העיצוב מבחינת עוסק פטור?</h3>
      <p>מעצבים גרפיים מרוויחים בדרך כלל פרויקט אחרי פרויקט, והכנסה משתנה. מסלול עוסק פטור מושלם למי שמתחיל - אין דיווח חודשי למע"מ, וההוצאות המוכרות כוללות את כל מה שצריך: Adobe Creative Cloud, מחשב, טאבלט גרפי, קורסים ועוד.</p>
      
      <h3>דגשים ייחודיים למעצבים</h3>
      <ul>
        <li><strong>תקרת ההכנסה:</strong> עד 120,000₪ לשנה - רוב המעצבים המתחילים נכנסים בנוחות בתקרה</li>
        <li><strong>הוצאות מוכרות:</strong> תוכנות עיצוב, מחשב, מסך נוסף, טאבלט, קורסים - הכל מוכר</li>
        <li><strong>עבודה מהבית:</strong> חלק מחשבון החשמל והאינטרנט מוכרים</li>
      </ul>
      
      <h3>טעויות נפוצות של מעצבים גרפיים</h3>
      <ul>
        <li>❌ לא שומרים קבלות על רכישת פונטים וסטוקים</li>
        <li>❌ לא מדווחים על הכנסות ממקורות מקוונים (Fiverr, Upwork)</li>
        <li>❌ חושבים שכדאי לחכות עד שיהיו לקוחות - טעות! צריך לפתוח מראש</li>
        <li>❌ לא מנצלים זיכוי מס על קורסי Udemy ו-Skillshare</li>
      </ul>
      
      <h3>איך Perfect One עוזר למעצבים גרפיים?</h3>
      <p>אנחנו מבינים את המקצוע - יודעים מה מוכר כהוצאה ומה לא, עוזרים לך להבין איך לדווח נכון על הכנסות ממקורות שונים, ונותנים לך אפליקציה נוחה לניהול הכנסות והוצאות. כך תוכל להתמקד ביצירה ולא בבירוקרטיה.</p>
    `,
    services: [
      'עיצוב לוגואים ומיתוג',
      'עיצוב כרטיסי ביקור ונייר פירמה',
      'עיצוב ברושורים וקטלוגים',
      'עיצוב לרשתות חברתיות',
      'עיצוב אריזות מוצרים',
      'עיצוב אתרים ואפליקציות'
    ],
    tips: [
      'שמור קבלות על Adobe CC, פונטים ותמונות סטוק',
      'ציוד מחשוב - מחשב, מסך, טאבלט גרפי - מוכר',
      'קורסי Udemy, Skillshare והשתלמויות מקצועיות מוכרים',
      'חלק מחשבון חשמל ואינטרנט ביתי מוכר'
    ]
  },
  'tzalam': {
    name: 'צלם',
    icon: '📸',
    color: '#4ECDC4',
    fullContent: `
      <h2>למה צלמים צריכים עוסק פטור?</h2>
      <p>כצלם עצמאי, רוב הלקוחות שלך - בין אם זה אירועים פרטיים, עסקים או סטודיואים - דורשים חשבונית מס. בלי עוסק פטור, אתה מפסיד עבודות. עם עוסק פטור, אתה יכול לעבוד באופן חוקי, להוציא חשבוניות, ולקבל תשלומים בהעברה בנקאית.</p>
      
      <h3>מה מיוחד בצילום מבחינת עוסק פטור?</h3>
      <p>צלמים מוציאים סכומים גבוהים על ציוד - מצלמות, עדשות, פלאשים, חצובות. כל זה מוכר כהוצאה! בנוסף, נסיעות לאירועים, תוכנות עריכה, ואפילו אחסון בענן - הכל ניתן לזיכוי. מסלול עוסק פטור מושלם למי שמתחיל ומרוויח עד 120,000₪ בשנה.</p>
      
      <h3>דגשים ייחודיים לצלמים</h3>
      <ul>
        <li><strong>ציוד יקר:</strong> מצלמות ועדשות - שמור חשבוניות, זה מוכר במלואו</li>
        <li><strong>הוצאות נסיעה:</strong> נסיעות לאירועים מוכרות - תדלק או בנזין</li>
        <li><strong>תוכנות:</strong> Lightroom, Photoshop, Capture One - מוכרים</li>
        <li><strong>גיבויים:</strong> Dropbox, Google Drive - מוכר כהוצאה</li>
      </ul>
      
      <h3>טעויות נפוצות של צלמים</h3>
      <ul>
        <li>❌ לא שומרים קבלות על ציוד משומש שקונים</li>
        <li>❌ לא מדווחים על הכנסות ממכירת תמונות בסטוק</li>
        <li>❌ חושבים שצריך להמתין עד האירוע הראשון - טעות!</li>
        <li>❌ לא מדווחים על הוצאות נסיעה ותדלוק</li>
      </ul>
      
      <h3>איך Perfect One עוזר לצלמים?</h3>
      <p>אנחנו יודעים בדיוק מה מוכר במקצוע שלך - ציוד, תוכנות, נסיעות. נעזור לך להבין איך לרשום הוצאות נכון, ונספק אפליקציה נוחה לניהול ההכנסות וההוצאות שלך.</p>
    `,
    services: [
      'צילום אירועים (חתונות, בר מצוות)',
      'צילום עסקי ותדמית',
      'צילום מוצרים לחנויות אונליין',
      'צילום אוכל למסעדות',
      'צילום נדל"ן',
      'צילום פורטרטים'
    ],
    tips: [
      'שמור קבלות על כל ציוד - מצלמות, עדשות, פלאשים',
      'תוכנות עריכה - Lightroom, Photoshop - מוכרות',
      'הוצאות נסיעה ותדלוק לאירועים מוכרות',
      'אחסון בענן - Dropbox, Google Drive - מוכר'
    ]
  },
  'copywriter': {
    name: 'קופירייטר',
    icon: '✍️',
    color: '#F39C12',
    fullContent: `
      <h2>למה קופירייטרים צריכים עוסק פטור?</h2>
      <p>כקופירייטר עצמאי, אתה עובד עם לקוחות עסקיים שדורשים חשבונית מס. בלי עוסק פטור - אתה מפסיד פרויקטים. עם עוסק פטור, אתה הופך ללגיטימי, יכול להוציא חשבונית, ולקבל תשלומים בהעברה בנקאית באופן חוקי.</p>
      
      <h3>מה מיוחד בקופירייטינג מבחינת עוסק פטור?</h3>
      <p>קופירייטינג הוא אחד המקצועות הכי נוחים למסלול עוסק פטור - אין הוצאות גדולות על ציוד, אפשר לעבוד מהבית, וההכנסות בדרך כלל מתחת לתקרה של 120,000₪. כל הכלים הדיגיטליים - Grammarly, ספרי עזר, קורסים - מוכרים כהוצאה.</p>
      
      <h3>דגשים ייחודיים לקופירייטרים</h3>
      <ul>
        <li><strong>עבודה דיגיטלית:</strong> רוב הכלים הם מקוונים ומוכרים כהוצאה</li>
        <li><strong>עבודה מהבית:</strong> חלק מחשבון החשמל והאינטרנט מוכרים</li>
        <li><strong>קורסים:</strong> קורסי כתיבה ושיווק תוכן מוכרים במלואם</li>
        <li><strong>ספרות מקצועית:</strong> ספרים על קופירייטינג ושיווק מוכרים</li>
      </ul>
      
      <h3>טעויות נפוצות של קופירייטרים</h3>
      <ul>
        <li>❌ לא שומרים קבלות על מנויים לכלי כתיבה ו-SEO</li>
        <li>❌ לא מדווחים על הכנסות מפלטפורמות כמו Fiverr ו-Upwork</li>
        <li>❌ חושבים שצריך להמתין עד הלקוח הראשון - לא נכון!</li>
        <li>❌ לא מנצלים זיכוי מס על קורסים בקופירייטינג</li>
      </ul>
      
      <h3>איך Perfect One עוזר לקופירייטרים?</h3>
      <p>אנחנו מכירים את המקצוע - יודעים אילו הוצאות מוכרות, עוזרים לך לדווח נכון על הכנסות ממקורות מקוונים, ונותנים לך אפליקציה פשוטה לניהול. כך תוכל להתמקד בכתיבה ולא בביורוקרטיה.</p>
    `,
    services: [
      'כתיבת תוכן לאתרים',
      'ניהול תוכן לרשתות חברתיות',
      'כתיבת מיילים שיווקיים',
      'כתיבת מודעות פרסום',
      'כתיבת סלוגנים ומיתוג',
      'כתיבת תוכן SEO'
    ],
    tips: [
      'שמור קבלות על Grammarly, Hemingway ו-SEO tools',
      'ספרות מקצועית - ספרים על קופירייטינג - מוכרת',
      'קורסי כתיבה ו-Udemy מוכרים במלואם',
      'תוכנות ניהול פרויקטים - Notion, Asana - מוכרות'
    ]
  },
  'mefateach-atarim': {
    name: 'מפתח אתרים',
    icon: '💻',
    color: '#2ECC71',
    fullContent: `
      <h2>למה מפתחי אתרים צריכים עוסק פטור?</h2>
      <p>כמפתח אתרים עצמאי, אתה עובד עם לקוחות עסקיים שדורשים חשבונית מס. בלי עוסק פטור, אתה מפסיד פרויקטים. עם עוסק פטור, אתה יכול לעבוד באופן חוקי, להוציא חשבוניות, ולקבל תשלומים בהעברה בנקאית.</p>
      
      <h3>מה מיוחד בפיתוח אתרים מבחינת עוסק פטור?</h3>
      <p>מפתחי אתרים משקיעים בכלים ותשתיות - שרתים, דומיינים, רישיונות, כלי פיתוח. כל ההוצאות האלה מוכרות! מסלול עוסק פטור מושלם למי שמתחיל או עובד פרילנס עם הכנסות עד 120,000₪ לשנה.</p>
      
      <h3>דגשים ייחודיים למפתחי אתרים</h3>
      <ul>
        <li><strong>תשתיות ענן:</strong> AWS, Heroku, Netlify - מנויים חודשיים מוכרים</li>
        <li><strong>רישיונות:</strong> תוכנות, פלאגינים, תבניות - מוכר במלואו</li>
        <li><strong>קורסים:</strong> Udemy, Pluralsight - מוכרים במלואם</li>
        <li><strong>ציוד:</strong> מחשב, מסכים נוספים, מקלדת - מוכר</li>
      </ul>
      
      <h3>טעויות נפוצות של מפתחי אתרים</h3>
      <ul>
        <li>❌ לא שומרים קבלות על מנויים חודשיים לשרתים וכלים</li>
        <li>❌ לא מדווחים על הכנסות מפלטפורמות כמו Upwork ו-Fiverr</li>
        <li>❌ חושבים שצריך להמתין עד הפרויקט הראשון - טעות!</li>
        <li>❌ לא מנצלים זיכוי מס על קורסים ולמידה</li>
      </ul>
      
      <h3>איך Perfect One עוזר למפתחי אתרים?</h3>
      <p>אנחנו מבינים את המקצוע - יודעים מה מוכר כהוצאה, עוזרים לך לדווח נכון על הכנסות ממקורות שונים, ונותנים לך אפליקציה נוחה לניהול. כך תוכל להתמקד בפיתוח ולא בבירוקרטיה.</p>
    `,
    services: [
      'בניית אתרי תדמית',
      'בניית חנויות אונליין',
      'פיתוח אפליקציות ווב',
      'תחזוקת אתרים',
      'אופטימיזציה לביצועים',
      'אינטגרציות ו-APIs'
    ],
    tips: [
      'שמור קבלות על AWS, Heroku, Netlify ושירותי ענן',
      'רישיונות תוכנה ופלאגינים - מוכרים',
      'ציוד מחשוב ומסכים - מוכר במלואו',
      'קורסי Udemy, Pluralsight - מוכרים'
    ]
  },
  'meamen-kosher': {
    name: 'מאמן כושר',
    icon: '💪',
    color: '#E53935',
    fullContent: `
      <h2>למה מאמני כושר צריכים עוסק פטור?</h2>
      <p>כמאמן כושר עצמאי, אתה עובד עם לקוחות פרטיים וחדרי כושר שדורשים חשבונית מס. בלי עוסק פטור, אתה לא יכול לעבוד באופן חוקי. עם עוסק פטור, אתה יכול להוציא חשבוניות, לקבל תשלומים בהעברה, ולעבוד עם עסקים.</p>
      
      <h3>מה מיוחד באימון כושר מבחינת עוסק פטור?</h3>
      <p>מאמני כושר משקיעים בציוד אימון, קורסי הסמכה, ביטוח מקצועי ונסיעות ללקוחות. כל ההוצאות האלה מוכרות! מסלול עוסק פטור מושלם למי שמתחיל או עובד עם לקוחות פרטיים ומרוויח עד 120,000₪ לשנה.</p>
      
      <h3>דגשים ייחודיים למאמני כושר</h3>
      <ul>
        <li><strong>ציוד אימון:</strong> משקולות, רצועות, מזרנים - מוכר במלואו</li>
        <li><strong>קורסי הסמכה:</strong> ISSA, ACE, NASM - מוכרים במלואם</li>
        <li><strong>ביטוח מקצועי:</strong> חובה במקצוע ומוכר כהוצאה</li>
        <li><strong>נסיעות:</strong> נסיעות ללקוחות - מוכרות</li>
      </ul>
      
      <h3>טעויות נפוצות של מאמני כושר</h3>
      <ul>
        <li>❌ לא שומרים קבלות על ציוד אימון שקונים</li>
        <li>❌ לא מדווחים על ביטוח מקצועי כהוצאה</li>
        <li>❌ חושבים שצריך להמתין עד הלקוח הראשון - טעות!</li>
        <li>❌ לא מדווחים על הוצאות נסיעה ותדלוק</li>
      </ul>
      
      <h3>איך Perfect One עוזר למאמני כושר?</h3>
      <p>אנחנו מכירים את המקצוע - יודעים מה מוכר כהוצאה, עוזרים לך לדווח נכון, ונותנים לך אפליקציה נוחה לניהול לקוחות והכנסות.</p>
    `,
    services: [
      'אימון אישי 1 על 1',
      'אימונים קבוצתיים',
      'תוכניות אימון מותאמות אישית',
      'ייעוץ תזונתי בסיסי',
      'אימונים אונליין',
      'אימוני חוץ'
    ],
    tips: [
      'שמור קבלות על ציוד אימון - משקולות, רצועות, מזרנים',
      'קורסי הסמכה (ISSA, ACE) - מוכרים במלואם',
      'ביטוח מקצועי - חובה ומוכר כהוצאה',
      'הוצאות נסיעה ותדלוק ללקוחות - מוכרות'
    ]
  },
  'animator': { 
    name: 'אנימטור', 
    icon: '🎬', 
    color: '#9B59B6',
    fullContent: `
      <h2>למה אנימטורים צריכים עוסק פטור?</h2>
      <p>כאנימטור עצמאי, אתה עובד עם סטודיואים, חברות פרסום ולקוחות עסקיים שדורשים חשבונית מס. בלי עוסק פטור - אתה מפסיד פרויקטים. עם עוסק פטור, אתה יכול לעבוד באופן חוקי ולקבל תשלומים כדין.</p>
      
      <h3>מה מיוחד באנימציה מבחינת עוסק פטור?</h3>
      <p>אנימטורים משקיעים בתוכנות יקרות - After Effects, Cinema 4D, Blender. כל המנויים והתוכנות מוכרים כהוצאה! בנוסף, ציוד מחשוב חזק, טאבלט, קורסים - הכל מוכר במלואו.</p>
      
      <h3>דגשים ייחודיים לאנימטורים</h3>
      <ul>
        <li><strong>תוכנות:</strong> Adobe CC, Cinema 4D, Blender - מוכרים במלואם</li>
        <li><strong>ציוד מחשוב:</strong> מחשב חזק, כרטיס מסך, טאבלט - מוכר</li>
        <li><strong>קורסים:</strong> Udemy, Skillshare - מוכרים</li>
        <li><strong>רינדר פארם:</strong> שירותי רינדר - מוכרים</li>
      </ul>
      
      <h3>טעויות נפוצות של אנימטורים</h3>
      <ul>
        <li>❌ לא שומרים קבלות על פלאגינים ואסטים</li>
        <li>❌ לא מדווחים על שירותי רינדר פארם</li>
        <li>❌ חושבים שצריך להמתין עד הפרויקט הראשון</li>
        <li>❌ לא מנצלים זיכוי מס על קורסי אנימציה</li>
      </ul>
      
      <h3>איך Perfect One עוזר לאנימטורים?</h3>
      <p>אנחנו מבינים את ההוצאות הגבוהות במקצוע - תוכנות, ציוד, שירותי רינדר. נעזור לך לדווח נכון ולנצל את כל הזיכויים.</p>
    `
  },
  'mayer': { 
    name: 'מאייר', 
    icon: '🖌️', 
    color: '#E74C3C',
    fullContent: `
      <h2>למה מאיירים צריכים עוסק פטור?</h2>
      <p>כמאייר עצמאי, אתה עובד עם הוצאות לאור, סוכנויות פרסום ולקוחות פרטיים. כולם דורשים חשבונית מס. עם עוסק פטור, אתה יכול לעבוד באופן חוקי ולקבל תשלומים בהעברה בנקאית.</p>
      
      <h3>מה מיוחד באיור מבחינת עוסק פטור?</h3>
      <p>מאיירים משקיעים בטאבלטים גרפיים, תוכנות, ציוד ציור פיזי. כל זה מוכר כהוצאה! מסלול עוסק פטור מושלם למי שמתחיל עם הכנסות עד 120,000₪ לשנה.</p>
      
      <h3>דגשים ייחודיים למאיירים</h3>
      <ul>
        <li><strong>ציוד דיגיטלי:</strong> טאבלט גרפי (Wacom, iPad Pro) - מוכר</li>
        <li><strong>תוכנות:</strong> Procreate, Adobe Fresco, Clip Studio - מוכרים</li>
        <li><strong>ציוד פיזי:</strong> צבעים, עפרונות, נייר - מוכר</li>
        <li><strong>קורסים:</strong> קורסי איור - מוכרים במלואם</li>
      </ul>
      
      <h3>טעויות נפוצות של מאיירים</h3>
      <ul>
        <li>❌ לא שומרים קבלות על ציוד ציור</li>
        <li>❌ לא מדווחים על הכנסות ממכירת prints</li>
        <li>❌ חושבים שצריך להמתין עד העבודה הראשונה</li>
        <li>❌ לא מנצלים זיכוי מס על קורסים</li>
      </ul>
      
      <h3>איך Perfect One עוזר למאיירים?</h3>
      <p>אנחנו מכירים את הצרכים של מאיירים - דיגיטליים ופיזיים. נעזור לך לדווח נכון ולנצל את כל הזיכויים.</p>
    `
  },
  'orech-video': { 
    name: 'עורך וידאו', 
    icon: '🎥', 
    color: '#3498DB',
    fullContent: `
      <h2>למה עורכי וידאו צריכים עוסק פטור?</h2>
      <p>כעורך וידאו עצמאי, אתה עובד עם יוצרי תוכן, חברות פרסום וסטודיואים. כולם דורשים חשבונית מס. עם עוסק פטור, אתה יכול לעבוד באופן חוקי ומסודר.</p>
      
      <h3>מה מיוחד בעריכת וידאו מבחינת עוסק פטור?</h3>
      <p>עורכי וידאו משקיעים בתוכנות יקרות - Premiere Pro, Final Cut, DaVinci Resolve. כל המנויים מוכרים! בנוסף, ציוד מחשוב חזק, דיסקים חיצוניים, פלאגינים - הכל מוכר.</p>
      
      <h3>דגשים ייחודיים לעורכי וידאו</h3>
      <ul>
        <li><strong>תוכנות:</strong> Premiere Pro, After Effects, DaVinci - מוכרים</li>
        <li><strong>ציוד:</strong> מחשב חזק, מסכים, דיסקים חיצוניים - מוכר</li>
        <li><strong>פלאגינים:</strong> LUTs, אפקטים, מוזיקה - מוכר</li>
        <li><strong>אחסון:</strong> אחסון בענן ודיסקים - מוכר</li>
      </ul>
      
      <h3>טעויות נפוצות של עורכי וידאו</h3>
      <ul>
        <li>❌ לא שומרים קבלות על פלאגינים ופריסטים</li>
        <li>❌ לא מדווחים על הכנסות מיוטיוב</li>
        <li>❌ לא מדווחים על מנויי מוזיקה ואפקטים</li>
        <li>❌ לא מנצלים זיכוי מס על קורסים</li>
      </ul>
      
      <h3>איך Perfect One עוזר לעורכי וידאו?</h3>
      <p>אנחנו מבינים את ההוצאות הגבוהות במקצוע - תוכנות, ציוד, פלאגינים. נעזור לך לדווח נכון ולנצל את כל הזיכויים.</p>
    `
  },
  'meatzev-pnim': { 
    name: 'מעצב פנים', 
    icon: '🏠', 
    color: '#E67E22',
    fullContent: `
      <h2>למה מעצבי פנים צריכים עוסק פטור?</h2>
      <p>כמעצב פנים עצמאי, אתה עובד עם לקוחות פרטיים וקבלנים שדורשים חשבונית מס. בלי עוסק פטור - אתה מפסיד פרויקטים. עם עוסק פטור, אתה יכול לעבוד באופן חוקי ומסודר.</p>
      
      <h3>מה מיוחד בעיצוב פנים מבחינת עוסק פטור?</h3>
      <p>מעצבי פנים משקיעים בתוכנות (SketchUp, AutoCAD), ביקורי אתרים, חומרי דוגמה ודגמים. כל ההוצאות האלה מוכרות! מסלול עוסק פטור מושלם למי שמתחיל.</p>
      
      <h3>דגשים ייחודיים למעצבי פנים</h3>
      <ul>
        <li><strong>תוכנות:</strong> AutoCAD, SketchUp, 3ds Max - מוכרים</li>
        <li><strong>נסיעות:</strong> נסיעות לאתרים וספקים - מוכרות</li>
        <li><strong>חומרים:</strong> דוגמאות ודגמים - מוכר</li>
        <li><strong>ספרות:</strong> מגזיני עיצוב וספרים - מוכר</li>
      </ul>
      
      <h3>טעויות נפוצות של מעצבי פנים</h3>
      <ul>
        <li>❌ לא שומרים קבלות על תוכנות עיצוב</li>
        <li>❌ לא מדווחים על הוצאות נסיעה לאתרים</li>
        <li>❌ לא מדווחים על רכישת דוגמאות וחומרים</li>
        <li>❌ חושבים שצריך להמתין עד הפרויקט הראשון</li>
      </ul>
      
      <h3>איך Perfect One עוזר למעצבי פנים?</h3>
      <p>אנחנו מכירים את המקצוע - יודעים מה מוכר, עוזרים לך לדווח נכון, ונותנים לך אפליקציה נוחה לניהול.</p>
    `
  },
  'meatzev-ofna': { 
    name: 'מעצב אופנה', 
    icon: '👗', 
    color: '#FF69B4',
    fullContent: `
      <h2>למה מעצבי אופנה צריכים עוסק פטור?</h2>
      <p>כמעצב אופנה עצמאי, אתה עובד עם לקוחות פרטיים, בוטיקים וחנויות. כולם דורשים חשבונית מס. עם עוסק פטור, אתה יכול לעבוד באופן חוקי ולמכור את העיצובים שלך.</p>
      
      <h3>מה מיוחד בעיצוב אופנה מבחינת עוסק פטור?</h3>
      <p>מעצבי אופנה משקיעים בבדים, חומרי גלם, תוכנות עיצוב ומכונות תפירה. כל ההוצאות האלה מוכרות! מסלול עוסק פטור מושלם למי שמתחיל ומוכר עד 120,000₪ בשנה.</p>
      
      <h3>דגשים ייחודיים למעצבי אופנה</h3>
      <ul>
        <li><strong>חומרי גלם:</strong> בדים, חוטים, כפתורים - מוכר</li>
        <li><strong>ציוד:</strong> מכונת תפירה, מגהצים - מוכר</li>
        <li><strong>תוכנות:</strong> תוכנות עיצוב אופנה - מוכרות</li>
        <li><strong>תערוכות:</strong> השתתפות בתערוכות - מוכרת</li>
      </ul>
      
      <h3>טעויות נפוצות של מעצבי אופנה</h3>
      <ul>
        <li>❌ לא שומרים קבלות על בדים וחומרי גלם</li>
        <li>❌ לא מדווחים על השתתפות בתערוכות</li>
        <li>❌ לא מדווחים על רכישת מכונות וציוד</li>
        <li>❌ חושבים שצריך להמתין עד המכירה הראשונה</li>
      </ul>
      
      <h3>איך Perfect One עוזר למעצבי אופנה?</h3>
      <p>אנחנו מכירים את הצרכים שלך - חומרי גלם, ציוד, תערוכות. נעזור לך לדווח נכון ולנצל את כל הזיכויים.</p>
    `
  },
  'tzalam-mutzarim': { name: 'צלם מוצרים', icon: '📷', color: '#00CED1' },
  'meatzev-tachshitim': { name: 'מעצב תכשיטים', icon: '💎', color: '#FFD700' },
  'oman-kaakuim': { name: 'אומן קעקועים', icon: '🎭', color: '#8B0000' },
  'kotev-tochen': { name: 'כותב תוכן', icon: '📝', color: '#1ABC9C' },
  'metargem': { name: 'מתרגם', icon: '🌐', color: '#34495E' },
  'sofer': { name: 'סופר', icon: '📚', color: '#8E44AD' },
  'blogger': { name: 'בלוגר', icon: '💻', color: '#16A085' },
  'kotev-techni': { name: 'כותב טכני', icon: '📄', color: '#2C3E50' },
  'kotev-creative': { name: 'כותב קריאייטיב', icon: '✨', color: '#9B59B6' },
  'orech-sfarim': { name: 'עורך ספרים', icon: '📖', color: '#6C5CE7' },
  'meatzev-ux-ui': { name: 'מעצב חווית משתמש', icon: '🖼️', color: '#E91E63' },
  'menahel-social': { name: 'מנהל מדיה חברתית', icon: '📱', color: '#00BCD4' },
  'momche-seo': { name: 'מומחה קידום אתרים', icon: '📈', color: '#FF9800' },
  'momche-excel': { name: 'מומחה אקסל', icon: '📊', color: '#217346' },
  'mefateach-apps': { name: 'מפתח אפליקציות', icon: '📲', color: '#5C6BC0' },
  'momche-automation': { name: 'מומחה אוטומציה', icon: '⚙️', color: '#607D8B' },
  'menahel-google-ads': { name: 'מנהל גוגל', icon: '🎯', color: '#4285F4' },
  'menahel-facebook-ads': { name: 'מנהל פייסבוק', icon: '📘', color: '#1877F2' },
  'data-analyst': { name: 'אנליסט נתונים', icon: '📉', color: '#00BFA5' },
  'muzikai': { name: 'מוזיקאי', icon: '🎵', color: '#673AB7' },
  'mafik-muzikali': { name: 'מפיק מוזיקלי', icon: '🎧', color: '#FF5722' },
  'more-lemuzika': { name: 'מורה למוזיקה', icon: '🎹', color: '#9C27B0' },
  'dj': { name: 'תקליטן', icon: '🎛️', color: '#E040FB' },
  'zamar': { name: 'זמר', icon: '🎤', color: '#F44336' },
  'more-leomanut': { name: 'מורה לאומנות', icon: '🎭', color: '#795548' },
  'metapel-alternativy': { name: 'מטפל אלטרנטיבי', icon: '🧘', color: '#4CAF50' },
  'yoetz-tzona': { name: 'יועץ תזונה', icon: '🥗', color: '#8BC34A' },
  'more-yoga': { name: 'מורה יוגה', icon: '🧘‍♀️', color: '#9C27B0' },
  'more-pilates': { name: 'מורה פילאטיס', icon: '🤸', color: '#E91E63' },
  'masagist': { name: 'מסאז\'יסט', icon: '💆', color: '#00BCD4' },
  'reflexolog': { name: 'רפלקסולוג', icon: '🦶', color: '#009688' },
  'meamen-ishi': { name: 'מאמן אישי', icon: '🏋️', color: '#FF5722' },
  'makeup-artist': { name: 'מאפרת', icon: '💄', color: '#FF69B4' },
  'cosmetician': { name: 'קוסמטיקאית', icon: '✨', color: '#DDA0DD' },
  'manicurist': { name: 'מניקוריסטית', icon: '💅', color: '#FF1493' },
  'eyebrow-stylist': { name: 'מעצבת גבות', icon: '👁️', color: '#CD853F' },
  'lash-artist': { name: 'מעצבת ריסים', icon: '👀', color: '#8B4789' },
  'hair-stylist': { name: 'מעצבת שיער', icon: '💇', color: '#FF6347' },
  'ozer-virtuali': { name: 'עוזר וירטואלי', icon: '👩‍💼', color: '#607D8B' },
  'menahel-projects': { name: 'מנהל פרויקטים', icon: '📋', color: '#00BCD4' },
  'yoetz-iski': { name: 'יועץ עסקי', icon: '💼', color: '#455A64' },
  'nahag-hovalot': { name: 'נהג הובלות', icon: '🚚', color: '#795548' },
  'ish-tachzuka': { name: 'איש תחזוקה', icon: '🔧', color: '#78909C' },
  'menake-batim': { name: 'מנקה בתים', icon: '🧹', color: '#4DD0E1' },
  'ganan': { name: 'גנן', icon: '🌱', color: '#66BB6A' },
  'instalator': { name: 'אינסטלטור', icon: '🔧', color: '#1565C0' },
  'chashmlay': { name: 'חשמלאי', icon: '⚡', color: '#FFC107' },
  'technay-mizug': { name: 'טכנאי מיזוג', icon: '❄️', color: '#03A9F4' },
  'chef-prati': { name: 'שף פרטי', icon: '👨‍🍳', color: '#FF7043' },
  'konditor': { name: 'קונדיטור', icon: '🧁', color: '#FF80AB' },
  'barman': { name: 'ברמן', icon: '🍸', color: '#5D4037' },
  'catering': { name: 'קייטרינג', icon: '🍽️', color: '#FF5722' },
  'meragen-eruim': { name: 'מארגן אירועים', icon: '🎉', color: '#E91E63' },
  'afiya-betit': { name: 'אפייה ביתית', icon: '🥐', color: '#FFAB91' },
  'more-prati': { name: 'מורה פרטי', icon: '📖', color: '#3F51B5' },
  'madrich-yeladim': { name: 'מדריך ילדים', icon: '🎈', color: '#FF9800' },
  'coach': { name: 'קואוצ\'ר', icon: '🎯', color: '#009688' },
  'more-lesfatot': { name: 'מורה לשפות', icon: '🗣️', color: '#673AB7' },
  'madrich-tiyulim': { name: 'מדריך טיולים', icon: '🧭', color: '#4CAF50' },
  'madrich-sport': { name: 'מדריך ספורט', icon: '⚽', color: '#F44336' }
};

// Default data for professions not in the detailed list
const defaultProfessionData = {
  description: 'מקצוע זה מציע הזדמנויות רבות לעצמאים בישראל. עם פתיחת עוסק פטור תוכל להתחיל לעבוד בצורה חוקית ומסודרת.',
  services: [
    'שירותים מותאמים אישית ללקוחות',
    'עבודה עם עסקים קטנים ובינוניים',
    'פרויקטים מזדמנים',
    'שיתופי פעולה עם עצמאים אחרים'
  ],
  tips: [
    'שמור את כל הקבלות על הוצאות מקצועיות',
    'ציוד מקצועי מוכר כהוצאה עסקית',
    'קורסי השתלמות מוכרים',
    'הוצאות נסיעה לעבודה מוכרות'
  ]
};

export default function ProfessionPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || 'meatzev-grafi';
  
  const professionDetails = professionsData[slug];
  
  // Get basic profession info from the grid data or use defaults
  const professionBasic = professionDetails || {
    name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    icon: '💼',
    color: '#1E3A5F'
  };
  
  const profession = {
    ...defaultProfessionData,
    ...professionBasic,
    ...professionDetails
  };

  const whatsappMessage = `היי, אני ${profession.name} ומעוניין לפתוח עוסק פטור. אשמח לייעוץ`;

  const answerBlock = {
    question: `איך פותחים עוסק פטור ${profession.name}?`,
    answer: `פתיחת עוסק פטור ${profession.name} כוללת רישום במס הכנסה, פטור ממע"מ, ופתיחת תיק בביטוח לאומי. התהליך אורך 24-72 שעות ומאפשר לעבוד באופן חוקי ולהפיק קבלות. אנחנו מטפלים בכל הבירוקרטיה והמסמכים הנדרשים, כך שתוכל להתחיל לעבוד במהירות.`
  };

  const localBusinessSchema = {
    ...schemaTemplates.organization,
    "@type": "ProfessionalService",
    "name": `פתיחת עוסק פטור ${profession.name}`,
    "description": profession.description,
    "areaServed": {
      "@type": "Country",
      "name": "ישראל"
    }
  };

  return (
    <>
      <SEOOptimized
        title={`פתיחת עוסק פטור ${profession.name} - ליווי מקצועי | Perfect One`}
        description={`${profession.description} ליווי מלא לפתיחת עוסק פטור ${profession.name} בישראל. ${profession.services && profession.services[0] ? `${profession.services[0]}, ${profession.services[1]} ועוד.` : ''} התקשרו: 0502277087`}
        keywords={`עוסק פטור ${profession.name}, פתיחת עוסק ${profession.name}, ${profession.name} עצמאי${profession.services ? ', ' + profession.services.join(', ') : ''}`}
        canonical={`https://perfect1.co.il${window.location.pathname}${window.location.search}`}
        schema={localBusinessSchema}
      />
      <Breadcrumbs 
        items={[
          { label: 'פתיחת עוסק פטור', url: 'Home' },
          { label: 'לפי מקצוע', url: 'Professions' },
          { label: profession.name }
        ]}
      />
      <main className="pt-20">
        {/* Hero */}
        <section 
          className="py-20 relative overflow-hidden"
          style={{ backgroundColor: profession.color + '15' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div 
                className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-lg"
                style={{ backgroundColor: profession.color + '30' }}
              >
                {profession.icon}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-4">
                פתיחת עוסק פטור - {profession.name}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                ליווי מקצועי מהצעד הראשון ועד ניהול העסק השוטף
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={`https://wa.me/972502277087?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg font-bold rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                  >
                    <MessageCircle className="w-5 h-5 ml-2" />
                    דברו איתנו בוואטסאפ
                  </Button>
                </a>
                <a href="tel:0502277087">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-14 px-8 text-lg font-bold rounded-full border-[#1E3A5F] text-[#1E3A5F]"
                  >
                    <Phone className="w-5 h-5 ml-2" />
                    0502277087
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Answer Block */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <AnswerBlock 
                    question={answerBlock.question}
                    answer={answerBlock.answer}
                  />
                </motion.div>

                {/* About */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                    📌 על המקצוע
                  </h2>
                  <div className="text-gray-600 leading-relaxed text-lg">
                    <InternalLinker content={profession.description} currentPage="ProfessionPage" />
                  </div>
                </motion.div>

                {/* Services */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                    📌 שירותים נפוצים במקצוע
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {profession.services.map((service, index) => (
                      <li key={index} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                        <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                        <span className="text-gray-700">{service}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* What's Included */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                    📌 מה כולל תהליך הפתיחה
                  </h2>
                  <div className="bg-gradient-to-br from-[#E8F4FD] to-white rounded-2xl p-6 border border-[#1E3A5F]/10">
                    <ul className="space-y-3">
                      {[
                        'פתיחת תיק במס הכנסה',
                        'רישום כעוסק פטור במע"מ',
                        'פתיחת תיק בביטוח לאומי',
                        'הנפקת חשבוניות/קבלות',
                        'ליווי שוטף ודיווחים'
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#1E3A5F] flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                    📌 טיפים חשובים למקצוע
                  </h2>
                  <div className="space-y-3">
                    {profession.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 bg-[#D4AF37]/10 rounded-xl p-4">
                        <Lightbulb className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{tip}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Warning */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-amber-50 rounded-2xl p-6 border border-amber-200"
                >
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">חשוב לדעת</h3>
                      <p className="text-gray-600">
                        תקרת הכנסה לעוסק פטור: <strong>120,000₪ לשנה</strong> (נכון ל-2024). 
                        אם אתה צפוי להרוויח יותר, כדאי לשקול לפתוח עוסק מורשה.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Navigation Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200"
                >
                  <a 
                    href="/Professions" 
                    className="flex-1 text-center px-6 py-3 bg-white border-2 border-[#1E3A5F] text-[#1E3A5F] rounded-xl hover:bg-[#1E3A5F] hover:text-white transition-colors font-medium"
                  >
                    ← חזרה לכל המקצועות
                  </a>
                  <a 
                    href="/" 
                    className="flex-1 text-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-[#1E3A5F] hover:text-[#1E3A5F] transition-colors font-medium"
                  >
                    למדריך פתיחת עוסק פטור
                  </a>
                </motion.div>
              </div>

              {/* Sidebar - Form */}
              <div className="lg:col-span-1">
                <div className="sticky top-28">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                    <LeadForm 
                      title="רוצה לפתוח עוסק פטור?"
                      subtitle="השאר פרטים ונחזור אליך"
                      defaultProfession={profession.name}
                      sourcePage={`דף מקצוע - ${profession.name}`}
                      variant="card"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}