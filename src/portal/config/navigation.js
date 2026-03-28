export const PORTAL_CATEGORIES = [
  {
    id: 'osek-patur',
    title: 'עוסק פטור',
    href: '/osek-patur',
    icon: 'FileText',
    description: 'מדריכים לפתיחה, ניהול ומיסוי עוסק פטור',
    color: 'teal',
    subcategories: [
      { title: 'פתיחת עוסק פטור', href: '/osek-patur/how-to-open' },
      { title: 'ניהול עוסק פטור', href: '/osek-patur/management' },
      { title: 'מיסים ודיווחים', href: '/osek-patur/taxes' },
      { title: 'זכויות וחובות', href: '/osek-patur/rights' },
      { title: 'שינוי סטטוס', href: '/osek-patur/status-change' },
      { title: 'שאלות נפוצות', href: '/osek-patur/faq' },
    ]
  },
  {
    id: 'osek-murshe',
    title: 'עוסק מורשה',
    href: '/osek-murshe',
    icon: 'Briefcase',
    description: 'כל מה שצריך לדעת על עוסק מורשה',
    color: 'blue',
    subcategories: [
      { title: 'פתיחת עוסק מורשה', href: '/osek-murshe/how-to-open' },
      { title: 'ניהול שוטף', href: '/osek-murshe/management' },
      { title: 'מע"מ ומסים', href: '/osek-murshe/taxes' },
      { title: 'דוחות וחשבוניות', href: '/osek-murshe/reports' },
      { title: 'מעבר בין סטטוסים', href: '/osek-murshe/status-change' },
      { title: 'שאלות נפוצות', href: '/osek-murshe/faq' },
    ]
  },
  {
    id: 'hevra-bam',
    title: 'חברה בע"מ',
    href: '/hevra-bam',
    icon: 'Building2',
    description: 'הקמה וניהול חברה בע"מ',
    color: 'indigo',
    subcategories: [
      { title: 'פתיחת חברה בע"מ', href: '/hevra-bam/how-to-open' },
      { title: 'ניהול חברה', href: '/hevra-bam/management' },
      { title: 'דוחות והנה"ח', href: '/hevra-bam/reports' },
      { title: 'בעלי מניות ושכר', href: '/hevra-bam/shareholders' },
      { title: 'מעבר לחברה', href: '/hevra-bam/transition' },
      { title: 'שאלות נפוצות', href: '/hevra-bam/faq' },
    ]
  },
  {
    id: 'sgirat-tikim',
    title: 'סגירת תיקים',
    href: '/sgirat-tikim',
    icon: 'FolderX',
    description: 'סגירת עסק, תיקים ומול רשויות',
    color: 'red',
    subcategories: [
      { title: 'סגירת עוסק פטור', href: '/sgirat-tikim/close-osek-patur' },
      { title: 'סגירת עוסק מורשה', href: '/sgirat-tikim/close-osek-murshe' },
      { title: 'סגירת חברה', href: '/sgirat-tikim/close-company' },
      { title: 'סגירה מול רשויות', href: '/sgirat-tikim/authorities' },
      { title: 'חובות והשלכות', href: '/sgirat-tikim/consequences' },
      { title: 'שאלות נפוצות', href: '/sgirat-tikim/faq' },
    ]
  },
  {
    id: 'guides',
    title: 'מידע ומדריכים',
    href: '/guides',
    icon: 'BookOpen',
    description: 'מדריכים, השוואות וכלים לעסקים',
    color: 'amber',
    subcategories: [
      { title: 'מדריכים לפתיחת עסק', href: '/guides/opening-business' },
      { title: 'השוואות', href: '/guides/comparisons' },
      { title: 'מיסוי וחשבונאות', href: '/guides/taxation' },
      { title: 'מדריכים לעצמאים', href: '/guides/freelancers' },
      { title: 'כלים ומחשבונים', href: '/guides/tools' },
      { title: 'שאלות נפוצות', href: '/guides/faq' },
    ]
  }
];

export const PORTAL_CTA = {
  phone: '072-XXX-XXXX',
  whatsapp: 'https://wa.me/972XXXXXXXXX',
  email: 'info@example.com',
};

export const PORTAL_BRAND = {
  name: 'פרפקט וואן',
  tagline: 'פתיחת עסק בישראל — מדריכים, מידע וליווי אישי',
  logo: '/logo.png',
};
