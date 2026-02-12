/**
 * Accounting Providers Registry
 * כל מערכות הנהלת החשבונות הנתמכות מוגדרות כאן.
 * כדי להוסיף ספק חדש: הוסף רשומה למערך עם הקונפיגורציה שלו.
 */

export const ACCOUNTING_PROVIDERS = [
  {
    id: 'morning',
    name: 'Morning (חשבונית ירוקה)',
    logo: null,
    logoText: 'morning',
    logoColors: { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' },
    description: 'מערכת חשבוניות וניהול מסמכים פיננסיים',
    status: 'coming_soon',
    authStrategy: 'api_key',
    authFields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'הדבק כאן את ה-API Key שלך' },
    ],
    syncResources: ['customers', 'documents', 'expenses'],
    features: ['חשבוניות', 'קבלות', 'לקוחות', 'הוצאות', 'דוחות'],
    supportedDocTypes: ['invoice', 'invoice_receipt', 'receipt', 'credit_note', 'quote'],
    capabilities: {
      canCreateDocuments: true,
      canCreateCustomers: true,
      canListExpenses: true,
      canFetchReports: true,
      canDownloadPdf: true,
    },
  },
  {
    id: 'finbot',
    name: 'Finbot',
    logo: null,
    logoText: 'FINBOT',
    logoColors: { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
    description: 'ניהול מסמכים, הוצאות ודוחות עם AI',
    status: 'available',
    authStrategy: 'api_key',
    authFields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'הדבק כאן את ה-API Key שלך' },
    ],
    syncResources: ['customers', 'documents', 'expenses'],
    features: ['מסמכים', 'לקוחות', 'הוצאות', 'דוחות'],
    supportedDocTypes: ['invoice', 'invoice_receipt', 'receipt', 'credit_note'],
    capabilities: {
      canCreateDocuments: true,
      canCreateCustomers: true,
      canListExpenses: true,
      canFetchReports: true,
      canDownloadPdf: true,
    },
  },
  {
    id: 'icount',
    name: 'iCount',
    logo: null,
    logoText: 'iCount',
    logoColors: { bg: '#eef2ff', text: '#3730a3', border: '#a5b4fc' },
    description: 'תוכנת הנהלת חשבונות מתקדמת',
    status: 'available',
    authStrategy: 'session',
    authFields: [
      { name: 'cid', label: 'מספר חברה (CID)', type: 'text', placeholder: '' },
      { name: 'username', label: 'שם משתמש', type: 'text', placeholder: '' },
      { name: 'password', label: 'סיסמה', type: 'password', placeholder: '' },
    ],
    syncResources: ['customers', 'documents', 'expenses'],
    features: ['חשבוניות', 'קבלות', 'לקוחות', 'הוצאות', 'דוחות'],
    supportedDocTypes: ['invoice', 'invoice_receipt', 'receipt', 'credit_note', 'quote'],
    capabilities: {
      canCreateDocuments: true,
      canCreateCustomers: true,
      canListExpenses: true,
      canFetchReports: true,
      canDownloadPdf: true,
    },
  },
  {
    id: 'sumit',
    name: 'Sumit',
    logo: null,
    logoText: 'SUMIT',
    logoColors: { bg: '#f0fdf4', text: '#065f46', border: '#6ee7b7' },
    description: 'הנהלת חשבונות וחשבוניות אונליין',
    status: 'coming_soon',
    authStrategy: 'api_key',
    authFields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: '' },
    ],
    syncResources: ['customers', 'documents', 'expenses'],
    features: ['חשבוניות', 'הצעות מחיר', 'לקוחות'],
    supportedDocTypes: ['invoice', 'invoice_receipt', 'receipt', 'credit_note', 'quote'],
    capabilities: {
      canCreateDocuments: true,
      canCreateCustomers: true,
      canListExpenses: true,
      canFetchReports: false,
      canDownloadPdf: true,
    },
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

export const AUTH_STRATEGY_LABELS = {
  api_key: 'API Key',
  session: 'שם משתמש וסיסמה',
  oauth: 'OAuth',
};

/**
 * Provider-agnostic function map.
 * All providers use the SAME unified backend functions.
 * The backend function reads the user's connection to determine which provider API to call.
 */
export const UNIFIED_FUNCTIONS = {
  connect: 'acctConnectProvider',
  disconnect: 'acctDisconnectProvider',
  getStatus: 'acctGetConnectionStatus',
  createCustomer: 'acctCreateCustomer',
  createDocument: 'acctCreateDocument',
  syncPull: 'acctSyncPull',
  fetchReports: 'acctFetchReports',
  downloadDocument: 'acctDownloadDocument',
};