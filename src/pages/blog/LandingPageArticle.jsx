import React from 'react';
import ArticleLayout from './ArticleLayout';

const articleSchema = {
  "@context": "https://schema.org", "@type": "Article",
  "headline": "דף נחיתה לעסק: המדריך המלא לבניית דף נחיתה ממיר 2026",
  "author": { "@type": "Organization", "name": "ClientDashboard" },
  "publisher": { "@type": "Organization", "name": "ClientDashboard", "url": "https://perfect-dashboard.com" },
  "datePublished": "2026-03-01", "dateModified": "2026-03-28",
  "mainEntityOfPage": "https://perfect-dashboard.com/blog/daf-nchita", "inLanguage": "he"
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "מה זה דף נחיתה?", "acceptedAnswer": { "@type": "Answer", "text": "דף נחיתה הוא עמוד אינטרנט בודד שנבנה למטרה אחת - להמיר מבקרים ללידים או לקוחות. בניגוד לאתר שלם, דף נחיתה מתמקד במסר אחד ובקריאה לפעולה אחת." } },
    { "@type": "Question", "name": "כמה עולה דף נחיתה?", "acceptedAnswer": { "@type": "Answer", "text": "מחירי דפי נחיתה נעים בין 299 שקל (AI) ל-5,000 שקל (סוכנות). ב-ClientDashboard דף נחיתה עם דומיין ואירוח עולה 299 שקל בתשלום חד פעמי." } },
    { "@type": "Question", "name": "כמה זמן לוקח לבנות דף נחיתה?", "acceptedAnswer": { "@type": "Answer", "text": "עם AI של ClientDashboard - 30 שניות. עם פרילנסר - שבוע עד שבועיים. עם סוכנות - 2-4 שבועות." } },
    { "@type": "Question", "name": "מה ההבדל בין דף נחיתה לאתר?", "acceptedAnswer": { "@type": "Answer", "text": "דף נחיתה הוא עמוד בודד עם מטרה אחת (לידים/מכירות). אתר הוא מערכת שלמה עם דפים רבים. דף נחיתה ממיר טוב יותר כי הוא ממוקד." } }
  ]
};

export default function LandingPageArticle() {
  return (
    <ArticleLayout
      seoTitle="דף נחיתה לעסק | המדריך המלא לבניית דף נחיתה ממיר 2026"
      seoDescription="כל מה שצריך לדעת על דפי נחיתה: מה זה, כמה עולה, איך בונים דף נחיתה ממיר, ואיך לחסוך אלפי שקלים עם AI."
      canonical="/blog/daf-nchita"
      keywords="דף נחיתה, דף נחיתה לעסק, בניית דף נחיתה, דפי נחיתה, דף נחיתה ממיר, דף נחיתה מקצועי, כמה עולה דף נחיתה"
      schema={[articleSchema, faqSchema]}
      heroTitle="דף נחיתה לעסק: המדריך המלא"
      heroSubtitle="איך בונים דף נחיתה ממיר שמביא לידים ומכירות"
      heroColor="from-violet-600 to-fuchsia-600"
      ctaText="מוכנים לבנות דף נחיתה שמוכר?"
      relatedProducts={[
        { title: 'דף נחיתה עם AI', desc: 'דומיין, אירוח ועיצוב מקצועי', price: '299 שקל', href: '/BrandedLandingPage' },
        { title: 'לוגו לעסק', desc: 'הלוגו שיופיע על הדף', price: '39 שקל', href: '/SmartLogo' },
        { title: 'כרטיס ביקור דיגיטלי', desc: 'משלים את הנוכחות הדיגיטלית', price: '149 שקל', href: '/DigitalBusinessCard' },
      ]}
      relatedArticles={[
        { title: 'לוגו לעסק: המדריך המלא', desc: 'עיצוב לוגו מקצועי לדף הנחיתה שלך', href: '/blog/logo-leasek' },
        { title: 'כרטיס ביקור דיגיטלי', desc: 'כרטיס חכם שמשלים את הנוכחות שלך', href: '/blog/kartis-bikur-digitali' },
        { title: 'מצגת עסקית', desc: 'מצגת שתשכנע את הלקוחות', href: '/blog/matzget-iskit' },
        { title: 'סטיקר לעסק', desc: 'סטיקרים ממותגים לוואטסאפ', href: '/blog/sticker-leasek' },
      ]}
    >
      <h2>מה זה דף נחיתה?</h2>
      <p>
        <strong>דף נחיתה</strong> (Landing Page) הוא עמוד אינטרנט בודד שנבנה למטרה אחת ויחידה - להמיר מבקרים ללידים או לקוחות. בניגוד לאתר שלם עם תפריטים ודפים רבים, דף נחיתה מתמקד במסר אחד ובקריאה לפעולה אחת.
      </p>
      <p>
        דף נחיתה הוא הכלי המרכזי בקמפיינים ממומנים (פייסבוק, גוגל, אינסטגרם), ושיעור ההמרה שלו גבוה יותר מאתר רגיל כי הוא ממוקד ומונע הסחות דעת.
      </p>

      <h2>למה עסק צריך דף נחיתה?</h2>
      <ul>
        <li><strong>המרה גבוהה:</strong> דף ממוקד ממיר פי 2-5 מאתר רגיל</li>
        <li><strong>קמפיינים ממומנים:</strong> הכלי המושלם לפרסום בפייסבוק, גוגל ואינסטגרם</li>
        <li><strong>מסר ברור:</strong> הלקוח מבין מיד מה ההצעה ולמה כדאי לו</li>
        <li><strong>איסוף לידים:</strong> טופס קצר שמייצר פניות חמות</li>
        <li><strong>מהירות:</strong> אפשר לעלות דף נחיתה תוך שעות (או 30 שניות עם AI)</li>
      </ul>

      <h2>כמה עולה דף נחיתה?</h2>
      <ul>
        <li><strong>AI (ClientDashboard):</strong> 299 שקל חד פעמי - כולל דומיין ואירוח</li>
        <li><strong>פרילנסר:</strong> 750-2,000 שקל</li>
        <li><strong>סוכנות דיגיטל:</strong> 2,000-5,000 שקל</li>
        <li><strong>DIY (לבד):</strong> תשלום חודשי של 50-150 שקל + שעות עבודה</li>
      </ul>

      <h2>מה כולל דף נחיתה מקצועי?</h2>
      <ol>
        <li><strong>כותרת חזקה (Hero)</strong> - מסר ברור שתופס תשומת לב</li>
        <li><strong>הצעת ערך</strong> - למה הלקוח צריך את המוצר/שירות</li>
        <li><strong>הוכחה חברתית</strong> - המלצות, ביקורות, מספרים</li>
        <li><strong>תיאור יתרונות</strong> - מה הלקוח מקבל</li>
        <li><strong>קריאה לפעולה (CTA)</strong> - כפתור בולט שמניע לפעולה</li>
        <li><strong>טופס לידים</strong> - קצר, 2-3 שדות מקסימום</li>
      </ol>

      <h2>5 טיפים לדף נחיתה ממיר</h2>
      <ol>
        <li><strong>כותרת ממוקדת:</strong> הלקוח חייב להבין תוך 3 שניות מה ההצעה</li>
        <li><strong>CTA בולט:</strong> כפתור גדול, בצבע בולט, עם טקסט פעולה</li>
        <li><strong>מהירות טעינה:</strong> דף שנטען מעל 3 שניות מאבד 50% מהמבקרים</li>
        <li><strong>מובייל פרסט:</strong> 80% מהתנועה מגיעה ממובייל - הדף חייב להיראות מושלם</li>
        <li><strong>אמינות:</strong> הוסיפו עדויות, לוגואים של לקוחות, ומספרים</li>
      </ol>

      <h2>דף נחיתה עם AI - איך זה עובד?</h2>
      <p>
        ב-<a href="/BrandedLandingPage">ClientDashboard</a>, בניית דף נחיתה לוקחת 30 שניות:
      </p>
      <ol>
        <li>ממלאים שאלון קצר על העסק</li>
        <li>ה-AI כותב את הטקסטים ומעצב את הדף</li>
        <li>מקבלים לינק מוכן עם דומיין - מוכן לפרסום</li>
      </ol>

      <h2>שאלות נפוצות</h2>
      <h3>מה ההבדל בין דף נחיתה לאתר?</h3>
      <p>דף נחיתה הוא עמוד בודד עם מטרה אחת. אתר הוא מערכת שלמה. דף נחיתה ממיר טוב יותר כי הוא ממוקד.</p>

      <h3>האם דף נחיתה מתאים לקידום ממומן?</h3>
      <p>בהחלט, דף נחיתה הוא הכלי המושלם לקמפיינים בפייסבוק, גוגל ואינסטגרם.</p>

      <h2>סיכום</h2>
      <p>
        <strong>דף נחיתה לעסק</strong> הוא הכלי החיוני ביותר לכל קמפיין שיווקי. עם <a href="/BrandedLandingPage">ClientDashboard</a>, אפשר ליצור דף מקצועי ב-299 שקל (חד פעמי) ותוך 30 שניות - כולל דומיין, אירוח וקופירייטינג AI.
      </p>
    </ArticleLayout>
  );
}
