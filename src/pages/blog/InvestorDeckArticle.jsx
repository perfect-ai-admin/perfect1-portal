import React from 'react';
import ArticleLayout from './ArticleLayout';

const articleSchema = {
  "@context": "https://schema.org", "@type": "Article",
  "headline": "מצגת משקיעים: המדריך המלא ליצירת Pitch Deck מנצח 2026",
  "author": { "@type": "Organization", "name": "ClientDashboard" },
  "publisher": { "@type": "Organization", "name": "ClientDashboard", "url": "https://perfect-dashboard.com" },
  "datePublished": "2026-03-01", "dateModified": "2026-03-28",
  "mainEntityOfPage": "https://perfect-dashboard.com/blog/matzget-mashkiim", "inLanguage": "he"
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "מה כוללת מצגת משקיעים?", "acceptedAnswer": { "@type": "Answer", "text": "מצגת משקיעים טיפוסית כוללת: בעיה, פתרון, שוק יעד, מודל עסקי, מוצר, traction, צוות, תכנון פיננסי, סכום הגיוס, ושימוש בכספים." } },
    { "@type": "Question", "name": "כמה שקפים צריכה מצגת משקיעים?", "acceptedAnswer": { "@type": "Answer", "text": "מצגת משקיעים צריכה להיות 10-12 שקפים. משקיעים מוצפים במצגות וצריכים להבין את הסיפור שלך תוך דקות ספורות." } },
    { "@type": "Question", "name": "כמה עולה מצגת משקיעים?", "acceptedAnswer": { "@type": "Answer", "text": "מצגת משקיעים עם AI עולה 149 שקל. מעצב מקצועי גובה 5,000-15,000 שקל. יועץ אסטרטגי עם עיצוב 10,000-30,000 שקל." } },
    { "@type": "Question", "name": "מה ההבדל בין Pitch Deck ל-Investor Deck?", "acceptedAnswer": { "@type": "Answer", "text": "Pitch Deck הוא מצגת קצרה להצגה חיה (5-10 דקות). Investor Deck הוא גרסה מפורטת יותר שנשלחת בדוא\"ל ומיועדת לקריאה עצמאית על ידי המשקיע." } }
  ]
};

export default function InvestorDeckArticle() {
  return (
    <ArticleLayout
      seoTitle="מצגת משקיעים | המדריך המלא ליצירת Pitch Deck מנצח 2026"
      seoDescription="איך ליצור מצגת משקיעים שמגייסת כסף. מבנה, טיפים, דוגמאות, וכלי AI ליצירת Pitch Deck מקצועי ב-149 שקל."
      canonical="/blog/matzget-mashkiim"
      keywords="מצגת משקיעים, Pitch Deck, מצגת משקיעים לדוגמא, מצגת גיוס הון, Investor Deck, מצגת סטארטאפ, מצגת משקיעים בעברית"
      schema={[articleSchema, faqSchema]}
      heroTitle="מצגת משקיעים: המדריך המלא ליצירת Pitch Deck"
      heroSubtitle="איך ליצור מצגת שתגרום למשקיעים לרצות להשקיע בך"
      heroColor="from-emerald-600 to-teal-700"
      ctaText="מוכנים ליצור מצגת משקיעים?"
      relatedProducts={[
        { title: 'מצגת עסקית/משקיעים', desc: 'Pitch Deck תוך 30 שניות', price: '149 שקל', href: '/BusinessPresentation' },
        { title: 'דף נחיתה', desc: 'דף מקצועי למוצר שלך', price: '299 שקל', href: '/BrandedLandingPage' },
        { title: 'לוגו לעסק', desc: 'מיתוג מקצועי לסטארטאפ', price: '39 שקל', href: '/SmartLogo' },
      ]}
      relatedArticles={[
        { title: 'מצגת עסקית: המדריך המלא', desc: 'כל מה שצריך לדעת על מצגות עסקיות', href: '/blog/matzget-iskit' },
        { title: 'לוגו לעסק', desc: 'הלוגו שיופיע על ה-Deck', href: '/blog/logo-leasek' },
        { title: 'דף נחיתה לעסק', desc: 'דף ממיר למוצר שלך', href: '/blog/daf-nchita' },
        { title: 'כרטיס ביקור דיגיטלי', desc: 'כרטיס לחלק אחרי הפגישה', href: '/blog/kartis-bikur-digitali' },
      ]}
    >
      <h2>מה זה מצגת משקיעים (Pitch Deck)?</h2>
      <p>
        <strong>מצגת משקיעים</strong> (Pitch Deck) היא מצגת קצרה וממוקדת שמציגה את העסק או הסטארטאפ שלך בפני משקיעים פוטנציאליים. המטרה: לשכנע אותם שכדאי להשקיע בך.
      </p>
      <p>
        משקיע ממוצע רואה עשרות מצגות בשבוע. יש לך 3-5 דקות ליצור רושם. מצגת טובה מספרת סיפור משכנע, מציגה מספרים אמיתיים, ומשאירה את המשקיע רעב לעוד.
      </p>

      <h2>מבנה מצגת משקיעים - 12 שקפים</h2>
      <ol>
        <li><strong>שער:</strong> שם החברה, לוגו, וסלוגן קצר</li>
        <li><strong>הבעיה:</strong> איזה כאב אתה פותר? למה זה דחוף?</li>
        <li><strong>הפתרון:</strong> מה המוצר שלך עושה? איך הוא פותר את הבעיה?</li>
        <li><strong>שוק יעד:</strong> כמה גדול השוק? TAM, SAM, SOM</li>
        <li><strong>מוצר / טכנולוגיה:</strong> סקירה של המוצר עם צילומי מסך</li>
        <li><strong>מודל עסקי:</strong> איך אתה מרוויח כסף?</li>
        <li><strong>Traction:</strong> מה כבר השגת? לקוחות, הכנסות, צמיחה</li>
        <li><strong>תחרות:</strong> מי המתחרים? מה היתרון שלך?</li>
        <li><strong>צוות:</strong> מי אתם? למה אתם הצוות הנכון?</li>
        <li><strong>תכנית פיננסית:</strong> תחזית הכנסות ל-3 שנים</li>
        <li><strong>הגיוס:</strong> כמה מגייסים ולמה ישמש?</li>
        <li><strong>סיכום / CTA:</strong> קריאה לפעולה ופרטי קשר</li>
      </ol>

      <h2>כמה עולה מצגת משקיעים?</h2>
      <ul>
        <li><strong>AI (ClientDashboard):</strong> 149 שקל - מצגת מוכנה תוך 30 שניות</li>
        <li><strong>מעצב מצגות:</strong> 5,000-15,000 שקל</li>
        <li><strong>יועץ אסטרטגי + עיצוב:</strong> 10,000-30,000 שקל</li>
      </ul>

      <h2>7 טעויות נפוצות במצגת משקיעים</h2>
      <ol>
        <li><strong>יותר מדי שקפים:</strong> שמרו על 10-12 שקפים</li>
        <li><strong>יותר מדי טקסט:</strong> המשקיע לא קורא מסמכים - הוא רוצה לראות נקודות עיקריות</li>
        <li><strong>הגזמה:</strong> מספרים לא ריאליסטיים פוגעים באמינות</li>
        <li><strong>התעלמות מתחרות:</strong> כל שוק יש תחרות. הראו שאתם מכירים אותה</li>
        <li><strong>בלי Traction:</strong> משקיעים רוצים לראות ראיות לביקוש</li>
        <li><strong>עיצוב חובבני:</strong> מצגת לא מעוצבת משדרת חוסר רצינות</li>
        <li><strong>בלי Ask:</strong> תמיד ציינו כמה אתם מגייסים ולמה</li>
      </ol>

      <h2>שאלות נפוצות</h2>
      <h3>מה ההבדל בין Pitch Deck ל-Investor Deck?</h3>
      <p>Pitch Deck להצגה חיה (5-10 דקות), Investor Deck לשליחה בדואל (מפורט יותר).</p>

      <h3>באיזה פורמט לשלוח מצגת למשקיע?</h3>
      <p>PDF הוא הפורמט המומלץ - נפתח בכל מכשיר ושומר על העיצוב.</p>

      <h2>סיכום</h2>
      <p>
        <strong>מצגת משקיעים</strong> טובה יכולה להיות ההבדל בין גיוס מוצלח לבין "נחזור אליך". עם <a href="/BusinessPresentation">ClientDashboard</a>, כל יזם יכול ליצור Pitch Deck מקצועי ב-149 שקל ותוך 30 שניות - בלי להוציא אלפים על מעצב.
      </p>
    </ArticleLayout>
  );
}
