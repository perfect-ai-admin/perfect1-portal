/**
 * Internal Links Mapping - רשת קישורים סמנטיים בין מאמרים
 * Semantic relationships between blog posts and profession pages
 * 
 * Structure:
 * slug -> { related: [{ slug, title, reason }] }
 */

export const INTERNAL_LINKS_MAPPING = {
  // כתיבה וקופירייטינג
  'copywriter': {
    related: [
      { 
        slug: 'meatzev-grafi', 
        title: 'מעצב גרפי',
        reason: 'שניהם עצמאים שעובדים עם לקוחות עסקיים ודורשים חשבונית'
      },
      { 
        slug: 'kotev-tochen', 
        title: 'כותב תוכן',
        reason: 'משפחה דומה - שניהם כתיבה וקריאייטיב'
      },
      { 
        slug: 'mefateach-atarim', 
        title: 'מפתח אתרים',
        reason: 'קופירייטרים עובדים לעתים קרובות עם מפתחים על פרויקטים משותפים'
      },
      { 
        slug: 'menahel-social', 
        title: 'מנהל מדיה חברתית',
        reason: 'שניהם מטפלים בתוכן דיגיטלי ויצירת דיוור'
      }
    ]
  },
  
  'kotev-tochen': {
    related: [
      { 
        slug: 'copywriter', 
        title: 'קופירייטר',
        reason: 'משפחה דומה - שניהם כתיבה דיגיטלית'
      },
      { 
        slug: 'blogger', 
        title: 'בלוגר',
        reason: 'שניהם יוצרי תוכן עם דגש על SEO וקריאה'
      },
      { 
        slug: 'menahel-social', 
        title: 'מנהל מדיה חברתית',
        reason: 'שניהם עובדים בתוכן למנועי חיפוש ורשתות חברתיות'
      }
    ]
  },

  'meatzev-grafi': {
    related: [
      { 
        slug: 'tzalam', 
        title: 'צלם',
        reason: 'שניהם קריאייטיביים שעובדים עם לקוחות על פרויקטים ויזואליים'
      },
      { 
        slug: 'meatzev-ux-ui', 
        title: 'מעצב UX/UI',
        reason: 'שניהם עיצוביים וטכנולוגיים, עובדים עם צוותי דיגיטל'
      },
      { 
        slug: 'copywriter', 
        title: 'קופירייטר',
        reason: 'שניהם עצמאים שעובדים עם סוכנויות ולקוחות עסקיים'
      },
      { 
        slug: 'orech-video', 
        title: 'עורך וידאו',
        reason: 'שניהם עובדים בתוכן מדיה וקריאייטיב'
      }
    ]
  },

  'tzalam': {
    related: [
      { 
        slug: 'meatzev-grafi', 
        title: 'מעצב גרפי',
        reason: 'שניהם יוצרי תוכן ויזואלי עובדים עם מצלמות'
      },
      { 
        slug: 'tzalam-mutzarim', 
        title: 'צלם מוצרים',
        reason: 'תיוג מקצועי דומה אך בתחום ספציפי יותר'
      },
      { 
        slug: 'orech-video', 
        title: 'עורך וידאו',
        reason: 'שניהם עובדים בתוכן מדיה עם ציוד דיגיטלי'
      },
      { 
        slug: 'animator', 
        title: 'אנימטור',
        reason: 'שניהם יוצרי תוכן וויזואליים'
      }
    ]
  },

  'mefateach-atarim': {
    related: [
      { 
        slug: 'meatzev-ux-ui', 
        title: 'מעצב UX/UI',
        reason: 'עובדים בצוותים - קוד ועיצוב'
      },
      { 
        slug: 'momche-seo', 
        title: 'מומחה SEO',
        reason: 'מפתחים וSEO מומחים עובדים ביחד על אתרים'
      },
      { 
        slug: 'mefateach-apps', 
        title: 'מפתח אפליקציות',
        reason: 'משפחה דומה - פיתוח דיגיטלי'
      },
      { 
        slug: 'momche-automation', 
        title: 'מומחה אוטומציה',
        reason: 'שניהם עובדים בטכנולוגיה ואוטומציה'
      }
    ]
  },

  'meamen-kosher': {
    related: [
      { 
        slug: 'more-yoga', 
        title: 'מורה יוגה',
        reason: 'שניהם מטפלים בבריאות וכושר גוף'
      },
      { 
        slug: 'metapel-alternativy', 
        title: 'מטפל אלטרנטיבי',
        reason: 'שניהם מקצועות בריאות ותוכן גוף'
      },
      { 
        slug: 'yoetz-tzona', 
        title: 'יועץ תזונה',
        reason: 'מאמנים וייעוצי תזונה עובדים בשיתוף פעולה לעתים קרובות'
      },
      { 
        slug: 'meamen-ishi', 
        title: 'מאמן אישי',
        reason: 'משפחה דומה מאוד - שניהם אימון וכושר'
      }
    ]
  },

  'shaliach-wolt': {
    related: [
      { 
        slug: 'shaliach-tenbis', 
        title: 'שליח טנדר',
        reason: 'שניהם שליחים בפלטפורמות דומות עם הוצאות דומות'
      },
      { 
        slug: 'shaliach-porter', 
        title: 'שליח פורטר',
        reason: 'אותו מקצוע בפלטפורמה אחרת'
      },
      { 
        slug: 'shaliach-mital', 
        title: 'שליח מיטל',
        reason: 'שליח משלוחים בפלטפורמה דומה'
      },
      { 
        slug: 'shaliach-atzmay', 
        title: 'שליח עצמאי',
        reason: 'שליח שעובד עם מנהל נמוך של כללים'
      }
    ]
  },

  'technay-mizug': {
    related: [
      { 
        slug: 'chashmlay', 
        title: 'חשמלאי',
        reason: 'שניהם טכנאים שעובדים על בתים וציוד'
      },
      { 
        slug: 'instalator', 
        title: 'אינסטלטור',
        reason: 'משפחה דומה - שירותים טכניים לבתים'
      },
      { 
        slug: 'ish-tachzuka', 
        title: 'איש תחזוקה',
        reason: 'שניהם עובדים בתחזוקה וטיקונים'
      },
      { 
        slug: 'nahag-hovalot', 
        title: 'נהג הובלות',
        reason: 'שניהם עצמאים עם הוצאות רכב גבוהות'
      }
    ]
  },

  'more-prati': {
    related: [
      { 
        slug: 'more-lesfatot', 
        title: 'מורה לשפות',
        reason: 'שניהם מורים פרטיים'
      },
      { 
        slug: 'coach', 
        title: 'קואוצ\'ר',
        reason: 'שניהם מטפלים בהתפתחות אישית'
      },
      { 
        slug: 'madrich-yeladim', 
        title: 'מדריך ילדים',
        reason: 'שניהם מחנכים וחינוך'
      }
    ]
  },

  'chef-prati': {
    related: [
      { 
        slug: 'konditor', 
        title: 'קונדיטור',
        reason: 'שניהם מקצועות מזון'
      },
      { 
        slug: 'catering', 
        title: 'קייטרינג',
        reason: 'שניהם מעבדים וקדימה אוכל'
      },
      { 
        slug: 'meragen-eruim', 
        title: 'מארגן אירועים',
        reason: 'שפים וקייטרים עובדים עם מארגני אירועים'
      },
      { 
        slug: 'afiya-betit', 
        title: 'אפייה ביתית',
        reason: 'משפחה דומה - מקצועות מזון'
      }
    ]
  }
};

/**
 * Get related posts for a specific post
 * @param {string} slug - The slug of the current post
 * @returns {array} Array of related posts (max 5)
 */
export function getRelatedPosts(slug) {
  if (!INTERNAL_LINKS_MAPPING[slug]) {
    return [];
  }
  
  return INTERNAL_LINKS_MAPPING[slug].related.slice(0, 5);
}