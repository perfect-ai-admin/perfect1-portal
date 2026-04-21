import { createClient } from '@supabase/supabase-js';

// Prefer env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) but fall back
// to hardcoded values pointing at the real production project. These are the
// ANON key (public by design — it's the role=anon JWT that every browser sees
// anyway) and the public URL, so there's no secret here. The fallback exists
// because:
//   1. If env vars are missing in Vercel, `createClient(undefined, undefined)`
//      throws synchronously at module load and white-screens the whole app.
//   2. A placeholder URL (e.g. placeholder.supabase.co) looks safer but
//      silently breaks every edge-function call with a DNS "Failed to fetch"
//      that is much harder to diagnose than an obvious 401.
// Real service-role keys MUST NEVER live in frontend code — those stay in
// edge-function env vars only.
const PROD_SUPABASE_URL = 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
const PROD_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Njc0NjMsImV4cCI6MjA5MDQ0MzQ2M30.NceenXJ43_B3NN9MVz4b5wR4t1Si0hRfYedfmtoujXQ';

const ENV_URL = import.meta.env.VITE_SUPABASE_URL;
const ENV_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = ENV_URL || PROD_SUPABASE_URL;
const supabaseAnonKey = ENV_KEY || PROD_SUPABASE_ANON_KEY;

if (!ENV_URL || !ENV_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabaseClient] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — ' +
      'using hardcoded production fallback. Set these in Vercel for clarity.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SECURITY: Service role key removed from frontend — all admin operations go through Edge Functions
// Use invokeFunction() to call server-side functions that use the service role key

// Invoke a Supabase Edge Function by name.
// Uses direct fetch with anon key to avoid 401 when user has expired session in localStorage.
// NOTE: Supabase's gateway requires BOTH `apikey` and `Authorization` headers
// on public edge function calls. Omitting `apikey` causes the gateway to
// reject the request before it reaches Deno, which surfaces in the browser
// as a generic `TypeError: Failed to fetch` rather than an HTTP error.
export async function invokeFunction(name, payload = {}) {
  // Get valid user session token for edge function auth
  let authToken = supabaseAnonKey;
  try {
    let { data: { session } } = await supabase.auth.getSession();

    // Check if token is expired or about to expire (within 60s)
    if (session?.expires_at) {
      const expiresAt = session.expires_at * 1000; // convert to ms
      if (Date.now() > expiresAt - 60000) {
        // Token expired or expiring soon — refresh it
        const { data, error } = await supabase.auth.refreshSession();
        if (!error && data?.session) {
          session = data.session;
        }
      }
    }

    if (session?.access_token) {
      authToken = session.access_token;
    }
  } catch { /* use anon key */ }

  // Guard: warn if no auth session for protected functions
  if (authToken === supabaseAnonKey && (name.startsWith('crm') || name.startsWith('outreach'))) {
    console.warn(`[invokeFunction] No auth session for protected function ${name} — will get 401`);
  }

  let resp;
  try {
    resp = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    // fetch itself threw — network, CORS, DNS, offline, or extension blocker.
    console.error(`[invokeFunction] ${name} network error:`, networkErr);
    throw new Error(`Network error calling ${name}: ${networkErr.message || 'Failed to fetch'}`);
  }
  if (!resp.ok) {
    // Handle 401 specifically — session expired
    if (resp.status === 401) {
      console.error(`[invokeFunction] ${name}: 401 — session expired, attempting refresh`);
      // Try to refresh and retry once
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (!error && data?.session?.access_token) {
          // Retry with fresh token
          const retryResp = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`,
              'apikey': supabaseAnonKey,
            },
            body: JSON.stringify(payload),
          });
          if (retryResp.ok) {
            let result = null;
            try { result = await retryResp.json(); } catch {}
            return result;
          }
        }
      } catch {}
      throw new Error('פג תוקף ההתחברות — יש לרענן את הדף ולנסות שוב');
    }
    let msg = `Edge function ${name} returned ${resp.status}`;
    try { const body = await resp.json(); msg = body?.error || body?.message || msg; } catch {}
    console.error(`[invokeFunction] ${name} failed:`, msg);
    throw new Error(msg);
  }
  let result = null;
  try { result = await resp.json(); } catch {}

  return result;
}

// --- Multi-tenancy: project source identifier ---
const PROJECT_SOURCE = 'main';

// Tables that are shared reference data — no source filtering needed
const SHARED_TABLES = new Set([
  'plans',
  'services',
  'professions',
]);

// --- Entity name → Supabase table mapping ---
const entityTableMap = {
  Payment: 'payments', Plan: 'plans', Goal: 'goals', UserGoal: 'customer_goals',
  Lead: 'leads', CartItem: 'cart_items', BillingDocument: 'billing_documents',
  ActivityLog: 'activity_log', SystemComponent: 'system_components',
  AccountingDocument: 'accounting_documents', AccountingExpense: 'accounting_expenses',
  AccountingCustomer: 'accounting_customers', AccountingConnection: 'accounting_connections',
  FinbotDocument: 'accounting_documents', FinbotExpense: 'accounting_expenses',
  FinbotCustomer: 'accounting_customers', DailyFocus: 'daily_focus',
  Profession: 'professions', LandingPage: 'landing_pages', BlogPost: 'blog_posts',
  Customer: 'customers', DigitalCard: 'digital_cards', CardClick: 'card_clicks',
  LogoProject: 'logo_projects', LogoGeneration: 'logo_generations',
  CreditLedger: 'credit_ledger', UserAccount: 'user_accounts',
  Conversation: 'conversations', ConversationMessage: 'conversation_messages',
  GoalStep: 'goal_steps', BusinessJourney: 'business_state',
  GoalInteraction: 'goal_interactions', AiAgent: 'ai_agents',
  AgentPromptTemplate: 'agent_prompt_templates', EscalationAlert: 'escalation_alerts',
  WeeklyReport: 'weekly_reports', FollowupLead: 'followup_leads',
  FollowupSequence: 'followup_sequences', PageSnapshot: 'page_snapshots',
  BusinessJourneyRecord: 'business_journeys', PurchasedProduct: 'purchased_products',
  CRMLead: 'crm_leads', Agent: 'ai_agents', Campaign: 'campaigns',
  Client: 'clients', Communication: 'communications', Task: 'tasks',
  Document: 'documents', StatusHistory: 'status_history',
  ServiceCatalog: 'service_catalog', LostReason: 'lost_reasons',
  Notification: 'notifications',
  CloseOsekPaturCRM: 'close_osek_patur_crm', CompetitorData: 'competitor_data',
  ContentSuggestion: 'content_suggestions', FinbotAuditLog: 'finbot_audit_log',
  LinkReport: 'link_reports', MentorMessage: 'conversation_messages',
  PageQualityAnalysis: 'page_quality_analyses', Partnership: 'partnerships',
  SEOConfig: 'seo_config', SEOLog: 'seo_logs', SalesInsight: 'sales_insights',
  SalesInteraction: 'sales_interactions', SalesMetric: 'sales_metrics',
  SalesScript: 'sales_scripts', SavedWork: 'saved_works', Service: 'services',
  SitemapURL: 'sitemap_urls', Presentation: 'presentations', Sticker: 'stickers',
  OAuthToken: 'oauth_tokens',
};

function parseOrderBy(orderBy) {
  if (!orderBy) return null;
  const ascending = !orderBy.startsWith('-');
  const column = orderBy.replace(/^-/, '');
  return { column, ascending };
}

function createEntityHelper(tableName) {
  const needsSourceFilter = !SHARED_TABLES.has(tableName);

  return {
    async list(orderBy, limit) {
      let query = supabase.from(tableName).select('*');
      if (needsSourceFilter) query = query.eq('source', PROJECT_SOURCE);
      const order = parseOrderBy(orderBy);
      if (order) query = query.order(order.column, { ascending: order.ascending });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async filter(filters = {}, orderBy, limit) {
      let query = supabase.from(tableName).select('*');
      if (needsSourceFilter) query = query.eq('source', PROJECT_SOURCE);
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
      const order = parseOrderBy(orderBy);
      if (order) query = query.order(order.column, { ascending: order.ascending });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      let query = supabase.from(tableName).select('*').eq('id', id);
      if (needsSourceFilter) query = query.eq('source', PROJECT_SOURCE);
      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    },

    async create(record) {
      const recordWithSource = needsSourceFilter
        ? { ...record, source: PROJECT_SOURCE }
        : record;
      const { data, error } = await supabase.from(tableName).insert(recordWithSource).select().single();
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      let query = supabase
        .from(tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (needsSourceFilter) query = query.eq('source', PROJECT_SOURCE);
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      let query = supabase.from(tableName).delete().eq('id', id);
      if (needsSourceFilter) query = query.eq('source', PROJECT_SOURCE);
      const { error } = await query;
      if (error) throw error;
      return { success: true };
    },

    subscribe(callback) {
      const channel = supabase
        .channel(`${tableName}_changes`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
          callback();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    },
  };
}

// Lazy-created entity helpers cache
const _entityCache = {};
function getEntity(name) {
  if (_entityCache[name]) return _entityCache[name];
  const tableName = entityTableMap[name] || name.toLowerCase() + 's';
  _entityCache[name] = createEntityHelper(tableName);
  return _entityCache[name];
}

// --- Exported entity helpers (direct Supabase, no proxy) ---
export const entities = {
  Payment: getEntity('Payment'), Plan: getEntity('Plan'),
  Goal: getEntity('Goal'), UserGoal: getEntity('UserGoal'),
  Lead: getEntity('Lead'), CartItem: getEntity('CartItem'),
  BillingDocument: getEntity('BillingDocument'), ActivityLog: getEntity('ActivityLog'),
  SystemComponent: getEntity('SystemComponent'),
  AccountingDocument: getEntity('AccountingDocument'),
  AccountingExpense: getEntity('AccountingExpense'),
  AccountingCustomer: getEntity('AccountingCustomer'),
  AccountingConnection: getEntity('AccountingConnection'),
  FinbotDocument: getEntity('FinbotDocument'),
  FinbotExpense: getEntity('FinbotExpense'),
  FinbotCustomer: getEntity('FinbotCustomer'),
  DailyFocus: getEntity('DailyFocus'), Profession: getEntity('Profession'),
  LandingPage: getEntity('LandingPage'), BlogPost: getEntity('BlogPost'),
  Customer: getEntity('Customer'), DigitalCard: getEntity('DigitalCard'),
  CardClick: getEntity('CardClick'), LogoProject: getEntity('LogoProject'),
  LogoGeneration: getEntity('LogoGeneration'), CreditLedger: getEntity('CreditLedger'),
  UserAccount: getEntity('UserAccount'), Conversation: getEntity('Conversation'),
  ConversationMessage: getEntity('ConversationMessage'),
  GoalStep: getEntity('GoalStep'), BusinessJourney: getEntity('BusinessJourney'),
  GoalInteraction: getEntity('GoalInteraction'), AiAgent: getEntity('AiAgent'),
  AgentPromptTemplate: getEntity('AgentPromptTemplate'),
  EscalationAlert: getEntity('EscalationAlert'), WeeklyReport: getEntity('WeeklyReport'),
  FollowupLead: getEntity('FollowupLead'), FollowupSequence: getEntity('FollowupSequence'),
  PageSnapshot: getEntity('PageSnapshot'),
  BusinessJourneyRecord: getEntity('BusinessJourneyRecord'),
  PurchasedProduct: getEntity('PurchasedProduct'), CRMLead: getEntity('CRMLead'),
  Agent: getEntity('Agent'), Campaign: getEntity('Campaign'),
  CloseOsekPaturCRM: getEntity('CloseOsekPaturCRM'),
  CompetitorData: getEntity('CompetitorData'),
  ContentSuggestion: getEntity('ContentSuggestion'),
  FinbotAuditLog: getEntity('FinbotAuditLog'), LinkReport: getEntity('LinkReport'),
  MentorMessage: getEntity('MentorMessage'),
  PageQualityAnalysis: getEntity('PageQualityAnalysis'),
  Partnership: getEntity('Partnership'), SEOConfig: getEntity('SEOConfig'),
  SEOLog: getEntity('SEOLog'), SalesInsight: getEntity('SalesInsight'),
  SalesInteraction: getEntity('SalesInteraction'),
  SalesMetric: getEntity('SalesMetric'), SalesScript: getEntity('SalesScript'),
  SavedWork: getEntity('SavedWork'), Service: getEntity('Service'),
  SitemapURL: getEntity('SitemapURL'), Presentation: getEntity('Presentation'),
  Sticker: getEntity('Sticker'), OAuthToken: getEntity('OAuthToken'),
  Client: getEntity('Client'), Communication: getEntity('Communication'),
  Task: getEntity('Task'), Document: getEntity('Document'),
  StatusHistory: getEntity('StatusHistory'), ServiceCatalog: getEntity('ServiceCatalog'),
  LostReason: getEntity('LostReason'), Notification: getEntity('Notification'),
};

// --- Auth helpers (direct Supabase, no proxy) ---
export const auth = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return { id: user.id, email: user.email, ...user.user_metadata };
  },

  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  redirectToLogin(returnUrl) {
    const url = returnUrl ? `/login?returnTo=${encodeURIComponent(returnUrl)}` : '/login?returnTo=%2FAPP';
    window.location.href = url;
  },

  logout(returnUrl) {
    supabase.auth.signOut().then(() => {
      window.location.href = returnUrl || '/';
    });
  },

  async updateMe(updates) {
    const { data, error } = await supabase.auth.updateUser({ data: updates });
    if (error) throw error;
    return data.user;
  },
};

// --- Integration helpers (direct Supabase Edge Functions) ---
export async function invokeLLM(params) {
  return invokeFunction('invokeLLM', params);
}

export async function sendEmail(params) {
  return invokeFunction('sendEmail', params);
}

export async function uploadFile({ file }) {
  const fileName = `${crypto.randomUUID()}_${file.name || 'file'}`;
  const { data, error } = await supabase.storage.from('uploads').upload(fileName, file, {
    contentType: file.type || 'application/octet-stream',
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
  return { file_url: urlData.publicUrl };
}