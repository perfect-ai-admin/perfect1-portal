/**
 * Accounting Providers Registry
 * כל מערכות הנהלת החשבונות הנתמכות מוגדרות כאן.
 * כדי להוסיף ספק חדש: הוסף רשומה למערך עם הקונפיגורציה שלו.
 */

export const ACCOUNTING_PROVIDERS = [
  {
    id: 'finbot',
    name: 'Finbot',
    logo: null, // will use text logo
    logoText: 'FINBOT',
    logoColors: { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
    description: 'ניהול מסמכים, הוצאות ודוחות עם AI',
    status: 'available', // available | coming_soon
    authMethods: ['apikey', 'credentials'],
    syncResources: ['customers', 'documents', 'expenses'],
    features: ['מסמכים', 'לקוחות', 'הוצאות', 'דוחות'],
    connectFunction: 'finbotStartConnect',
    completeFunction: 'finbotCompleteConnect',
    disconnectFunction: 'finbotDisconnect',
    statusFunction: 'finbotGetConnectionStatus',
    syncFunction: 'finbotSyncPull',
  },
  {
    id: 'morning',
    name: 'Morning (חשבונית ירוקה)',
    logo: null,
    logoText: 'morning',
    logoColors: { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' },
    description: 'מערכת חשבוניות וניהול מסמכים פיננסיים',
    status: 'coming_soon',
    authMethods: ['apikey'],
    syncResources: ['customers', 'documents', 'expenses'],
    features: ['חשבוניות', 'קבלות', 'לקוחות'],
    connectFunction: null,
    completeFunction: null,
    disconnectFunction: null,
    statusFunction: null,
    syncFunction: null,
  },
  {
    id: 'sumit',
    name: 'Sumit',
    logo: null,
    logoText: 'SUMIT',
    logoColors: { bg: '#f0fdf4', text: '#065f46', border: '#6ee7b7' },
    description: 'הנהלת חשבונות וחשבוניות אונליין',
    status: 'coming_soon',
    authMethods: ['apikey', 'credentials'],
    syncResources: ['customers', 'documents', 'expenses'],
    features: ['חשבוניות', 'הצעות מחיר', 'לקוחות'],
    connectFunction: null,
    completeFunction: null,
    disconnectFunction: null,
    statusFunction: null,
    syncFunction: null,
  },
  {
    id: 'icount',
    name: 'iCount',
    logo: null,
    logoText: 'iCount',
    logoColors: { bg: '#eef2ff', text: '#3730a3', border: '#a5b4fc' },
    description: 'תוכנת הנהלת חשבונות מתקדמת',
    status: 'coming_soon',
    authMethods: ['apikey', 'credentials'],
    syncResources: ['customers', 'documents', 'expenses'],
    features: ['חשבוניות', 'הנהלת חשבונות', 'דוחות'],
    connectFunction: null,
    completeFunction: null,
    disconnectFunction: null,
    statusFunction: null,
    syncFunction: null,
  },
];

export function getProvider(providerId) {
  return ACCOUNTING_PROVIDERS.find(p => p.id === providerId);
}

export function getAvailableProviders() {
  return ACCOUNTING_PROVIDERS.filter(p => p.status === 'available');
}

export function getComingSoonProviders() {
  return ACCOUNTING_PROVIDERS.filter(p => p.status === 'coming_soon');
}

export const RESOURCE_LABELS = {
  customers: 'לקוחות',
  documents: 'מסמכים',
  expenses: 'הוצאות',
};

export const AUTH_METHOD_LABELS = {
  apikey: 'API Key',
  credentials: 'שם משתמש וסיסמה',
  oauth: 'OAuth',
};