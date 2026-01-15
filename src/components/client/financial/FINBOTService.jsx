// FINBOT API Service Wrapper
// Integration with fin-bot.co.il according to specification section 5.1

const FINBOT_BASE_URL = 'https://api.fin-bot.co.il/api/v1';
const OAUTH_BASE_URL = 'https://api.fin-bot.co.il/oauth';

class FINBOTService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  // OAuth 2.0 Authentication (section 5.1.1)
  initiateOAuth() {
    const clientId = import.meta.env.VITE_FINBOT_CLIENT_ID;
    const redirectUri = `${window.location.origin}/finbot-callback`;
    const state = Math.random().toString(36).substring(7);
    
    sessionStorage.setItem('finbot_oauth_state', state);
    
    const authUrl = `${OAUTH_BASE_URL}/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `state=${state}`;
    
    window.location.href = authUrl;
  }

  async exchangeCodeForToken(code) {
    const response = await fetch(`${OAUTH_BASE_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: import.meta.env.VITE_FINBOT_CLIENT_ID,
        client_secret: import.meta.env.VITE_FINBOT_CLIENT_SECRET,
        redirect_uri: `${window.location.origin}/finbot-callback`
      })
    });

    const data = await response.json();
    this.setTokens(data.access_token, data.refresh_token, data.expires_in);
    return data;
  }

  async refreshAccessToken() {
    const response = await fetch(`${OAUTH_BASE_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: import.meta.env.VITE_FINBOT_CLIENT_ID,
        client_secret: import.meta.env.VITE_FINBOT_CLIENT_SECRET
      })
    });

    const data = await response.json();
    this.setTokens(data.access_token, data.refresh_token, data.expires_in);
    return data;
  }

  async revokeAccess() {
    await fetch(`${OAUTH_BASE_URL}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    
    this.clearTokens();
  }

  setTokens(accessToken, refreshToken, expiresIn) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem('finbot_access_token', accessToken);
    localStorage.setItem('finbot_refresh_token', refreshToken);
    localStorage.setItem('finbot_token_expiry', this.tokenExpiry.toString());
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    localStorage.removeItem('finbot_access_token');
    localStorage.removeItem('finbot_refresh_token');
    localStorage.removeItem('finbot_token_expiry');
  }

  loadTokens() {
    this.accessToken = localStorage.getItem('finbot_access_token');
    this.refreshToken = localStorage.getItem('finbot_refresh_token');
    this.tokenExpiry = parseInt(localStorage.getItem('finbot_token_expiry') || '0');
  }

  isAuthenticated() {
    this.loadTokens();
    return this.accessToken && this.tokenExpiry > Date.now();
  }

  async ensureValidToken() {
    if (!this.accessToken) {
      throw new Error('Not authenticated with FINBOT');
    }
    
    if (this.tokenExpiry <= Date.now() + 60000) { // Refresh if expires in < 1 min
      await this.refreshAccessToken();
    }
  }

  async apiRequest(endpoint, options = {}) {
    await this.ensureValidToken();
    
    const response = await fetch(`${FINBOT_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      await this.refreshAccessToken();
      return this.apiRequest(endpoint, options);
    }

    if (!response.ok) {
      throw new Error(`FINBOT API Error: ${response.status}`);
    }

    return response.json();
  }

  // Core API Endpoints (section 5.1.2)
  
  // Create Invoice
  async createInvoice(invoiceData) {
    return this.apiRequest('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  // List Invoices
  async listInvoices(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.apiRequest(`/invoices?${query}`);
  }

  // Get Invoice Status
  async getInvoiceStatus(invoiceId) {
    return this.apiRequest(`/invoices/${invoiceId}/status`);
  }

  // Upload Document for OCR
  async uploadDocument(file) {
    await this.ensureValidToken();
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${FINBOT_BASE_URL}/documents/scan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: formData
    });

    return response.json();
  }

  // Get VAT Report
  async getVATReport(period) {
    return this.apiRequest(`/reports/vat?period=${period}`);
  }

  // Submit VAT Report
  async submitVATReport(reportData) {
    return this.apiRequest('/reports/vat', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  }

  // Get Bank Transactions
  async getBankTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.apiRequest(`/banking/transactions?${query}`);
  }

  // Create Payment Link
  async createPaymentLink(invoiceId, amount) {
    return this.apiRequest('/payments/link', {
      method: 'POST',
      body: JSON.stringify({ invoice_id: invoiceId, amount })
    });
  }
}

export const finbotService = new FINBOTService();