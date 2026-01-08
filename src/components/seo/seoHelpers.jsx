/**
 * SEO Helpers - פונקציות עזר ל-SEO
 */

/**
 * generateMetaDescription - יצירת תיאור META אוטומטית
 * @param {string} content - תוכן הדף
 * @param {number} maxLength - אורך מקסימלי (ברירת מחדל: 160)
 */
export function generateMetaDescription(content, maxLength = 160) {
  if (!content) return '';
  
  const plainText = content.replace(/<[^>]*>/g, ' ');
  const cleaned = plainText.replace(/\s+/g, ' ').trim();
  
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * generateSlug - יצירת slug מכותרת עברית
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0590-\u05FF\w-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * formatIsraeliDate - פורמט תאריך ישראלי
 */
export function formatIsraeliDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * formatIsraeliPrice - פורמט מחיר ישראלי
 */
export function formatIsraeliPrice(amount) {
  return `${amount.toLocaleString('he-IL')}₪`;
}

/**
 * generateCanonicalUrl - יצירת URL קנוניקלי
 */
export function generateCanonicalUrl(path) {
  const baseUrl = 'https://perfect1.co.il';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  const url = new URL(cleanPath, baseUrl);
  const allowedParams = ['slug', 'service', 'category'];
  const params = new URLSearchParams(url.search);
  
  const filteredParams = new URLSearchParams();
  allowedParams.forEach(param => {
    if (params.has(param)) {
      filteredParams.set(param, params.get(param));
    }
  });
  
  return filteredParams.toString() 
    ? `${baseUrl}${url.pathname}?${filteredParams}`
    : `${baseUrl}${url.pathname}`;
}

/**
 * calculateReadingTime - חישוב זמן קריאה
 */
export function calculateReadingTime(content) {
  if (!content) return 0;
  
  const plainText = content.replace(/<[^>]*>/g, ' ');
  const words = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const wordsPerMinute = 200;
  
  return Math.ceil(words / wordsPerMinute);
}

/**
 * isHebrewContent - בדיקה אם התוכן בעברית
 */
export function isHebrewContent(text) {
  if (!text) return false;
  const hebrewChars = text.match(/[\u0590-\u05FF]/g);
  return hebrewChars && hebrewChars.length > text.length * 0.3;
}