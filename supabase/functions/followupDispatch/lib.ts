// Pure functions extracted from index.ts so they can be unit-tested
// without a Supabase client, network, or env vars.

export interface LeadLike {
  id?: string;
  name?: string | null;
  phone?: string | null;
  [k: string]: unknown;
}

export interface Condition {
  field: string;
  op: 'eq' | 'neq' | 'in' | 'exists';
  value: unknown;
}

// ============================================================
// Deterministic hash for event_key (idempotency)
// ============================================================
export async function eventKey(parts: (string | number | null | undefined)[]): Promise<string> {
  const raw = parts.map((p) => (p == null ? '' : String(p))).join('|');
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const hex = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return 'fu_' + hex.slice(0, 32);
}

// ============================================================
// Template rendering — {{field}} from lead
// ============================================================
export function renderTemplate(tpl: unknown, lead: LeadLike): string {
  return String(tpl || '').replace(/\{\{(\w+)(?:\|([^}]+))?\}\}/g, (_, k: string, fallback?: string) => {
    const v = (lead as Record<string, unknown>)[k];
    if (v != null && String(v).trim() !== '') return String(v);
    return fallback ?? '';
  });
}

// ============================================================
// Date expression resolver: "+1d" / "+3h" / "null" / ISO string
// ============================================================
export function resolveDate(expr: unknown, now: Date = new Date()): string | null {
  if (expr == null || expr === 'null') return null;
  const s = String(expr);
  const md = s.match(/^\+(\d+)d$/);
  if (md) return new Date(now.getTime() + parseInt(md[1], 10) * 86400000).toISOString();
  const mh = s.match(/^\+(\d+)h$/);
  if (mh) return new Date(now.getTime() + parseInt(mh[1], 10) * 3600000).toISOString();
  return s;
}

// ============================================================
// Build a lead patch from action_config.then_update
// ============================================================
export function buildLeadPatch(thenUpdate: unknown, now: Date = new Date()): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (!thenUpdate || typeof thenUpdate !== 'object') return patch;
  for (const [k, v] of Object.entries(thenUpdate as Record<string, unknown>)) {
    if (k === 'next_followup_date') patch[k] = resolveDate(v, now);
    else patch[k] = v;
  }
  return patch;
}

// ============================================================
// Quiet hours check (Asia/Jerusalem 21:00-08:00)
// ============================================================
export function inQuietHours(at: Date = new Date()): boolean {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit',
    hour12: false,
  });
  const hour = parseInt(fmt.format(at), 10);
  return hour >= 21 || hour < 8;
}

// ============================================================
// Evaluate rule conditions against lead
// ============================================================
export function evaluateConditions(conditions: unknown, lead: LeadLike): boolean {
  if (!Array.isArray(conditions) || conditions.length === 0) return true;
  for (const c of conditions as Condition[]) {
    const val = (lead as Record<string, unknown>)[c.field];
    switch (c.op) {
      case 'eq':
        if (val !== c.value) return false;
        break;
      case 'neq':
        if (val === c.value) return false;
        break;
      case 'in':
        if (!Array.isArray(c.value) || !(c.value as unknown[]).includes(val)) return false;
        break;
      case 'exists':
        if (val == null) return false;
        break;
      default:
        return false;
    }
  }
  return true;
}

// ============================================================
// Inbound message classification (Hebrew, keyword-based)
// Returns one of 6 categories + routing hints.
// ============================================================
export interface InboundClassification {
  category:
    | 'interested'
    | 'objection_price'
    | 'asked_for_human'
    | 'sent_documents'
    | 'not_relevant'
    | 'general_reply';
  needs_human: boolean;
  sub_status?: string;
  suggested_next_status?: string;
}

export function classifyInbound(text: string): InboundClassification {
  const t = (text || '').toLowerCase();

  // not_relevant is strongest signal — check first so "לא מעוניין" doesn't match "מעוניין"
  if (/(לא מעוניי|לא רלוונט|תודה לא|עזבו|לא רוצה|לא צריך)/.test(t)) {
    return { category: 'not_relevant', needs_human: false, suggested_next_status: 'not_relevant' };
  }
  if (/(יקר|מחיר|עלות|כמה זה עולה|זול|הנחה|תקציב)/.test(t)) {
    return {
      category: 'objection_price',
      needs_human: true,
      sub_status: 'price_objection',
    };
  }
  if (/(נציג|בנאדם|אדם אמיתי|לדבר עם|שיחה|להתקשר אליי|תתקשרו)/.test(t)) {
    return { category: 'asked_for_human', needs_human: true };
  }
  if (/(שלחתי|העליתי|צירפתי|מצורף|הנה המסמכים|המסמכים מצורפים)/.test(t)) {
    return {
      category: 'sent_documents',
      needs_human: false,
      sub_status: 'docs_received',
      suggested_next_status: 'in_process',
    };
  }
  if (/(כן מעוניין|אני מעוניין|מתאים לי|סגור|מסכים|בסדר גמור|אוקיי סגור|בוא נתקדם)/.test(t)) {
    return {
      category: 'interested',
      needs_human: true,
      sub_status: 'interested',
      suggested_next_status: 'interested',
    };
  }
  return { category: 'general_reply', needs_human: true };
}

// ============================================================
// Build a short lead summary from memory fields
// ============================================================
export function buildLeadSummary(lead: LeadLike): string {
  const parts: string[] = [];
  const cur = lead.pipeline_stage as string | undefined;
  const prev = lead.previous_status as string | undefined;
  const step = lead.followup_sequence_step as number | undefined;
  const seq = lead.followup_sequence_name as string | undefined;
  const lastIn = lead.last_inbound_message as string | undefined;
  const attempts = lead.no_answer_attempts as number | undefined;

  if (cur) parts.push(`סטטוס: ${cur}${prev ? ` (קודם ${prev})` : ''}`);
  if (seq) parts.push(`רצף: ${seq}#${step ?? 0}`);
  if (attempts && attempts > 0) parts.push(`${attempts} ניסיונות no-answer`);
  if (lastIn) parts.push(`הודעה אחרונה: "${String(lastIn).slice(0, 60)}"`);
  return parts.join(' · ') || 'ליד חדש';
}
