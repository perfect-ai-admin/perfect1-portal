// dailyOperationsReport — daily unified operations report for perfect1.co.il
// Sends one HTML email covering: SEO data, content ideas, published article, site status, issues
// GET/POST ?date=YYYY-MM-DD (optional, defaults to today Israel time)

import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

const RESEND_KEY = Deno.env.get('RESEND_API_KEY') || '';
const RECIPIENT = 'yosi5919@gmail.com';
const FROM = 'perfect1 Operations <no-reply@perfect1.co.il>';

// Israel time offset (+3 in winter, +3 in summer = UTC+3)
function israelDate(d?: string): string {
  if (d) return d;
  const now = new Date();
  now.setHours(now.getHours() + 3);
  return now.toISOString().split('T')[0];
}

function israelDateLabel(iso: string): string {
  const [y, m, day] = iso.split('-');
  const months = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  return `${parseInt(day)} ב${months[parseInt(m) - 1]} ${y}`;
}

function sec(title: string, body: string): string {
  return `
  <div style="margin-bottom:28px;">
    <h2 style="font-size:16px;font-weight:700;color:#1e3a5f;border-bottom:2px solid #dbeafe;padding-bottom:8px;margin:0 0 14px;">${title}</h2>
    ${body}
  </div>`;
}

function pill(text: string, color: string): string {
  return `<span style="display:inline-block;background:${color};color:white;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;">${text}</span>`;
}

async function getGSCData(date: string) {
  const { data } = await supabaseAdmin
    .from('seo_queries_daily')
    .select('query,clicks,impressions,ctr,avg_position')
    .eq('date', date)
    .order('impressions', { ascending: false })
    .limit(10);
  return data || [];
}

async function getGSCTotals(date: string) {
  const { data } = await supabaseAdmin
    .from('seo_pages_daily')
    .select('clicks,impressions,ctr,avg_position')
    .eq('date', date);
  if (!data || data.length === 0) return null;
  const tot = data.reduce((a, r) => ({
    clicks: a.clicks + (r.clicks || 0),
    impressions: a.impressions + (r.impressions || 0),
    ctr: a.ctr + (r.ctr || 0),
    avg_position: a.avg_position + (r.avg_position || 0),
  }), { clicks: 0, impressions: 0, ctr: 0, avg_position: 0 });
  const n = data.length;
  return { clicks: tot.clicks, impressions: tot.impressions, ctr: (tot.ctr / n * 100).toFixed(1), avg_position: (tot.avg_position / n).toFixed(1), pages: n };
}

async function getGSCYesterday(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  const yesterday = d.toISOString().split('T')[0];
  return getGSCTotals(yesterday);
}

async function getContentIdeas(date: string) {
  const { data: todayIdeas } = await supabaseAdmin
    .from('seo_content_ideas')
    .select('target_query,suggested_article_title,priority_score,status')
    .gte('created_at', date + 'T00:00:00')
    .order('priority_score', { ascending: false })
    .limit(5);

  const { count: totalPending } = await supabaseAdmin
    .from('seo_content_ideas')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');

  // Top 5 pending ideas by priority — next articles F33 will publish
  const { data: topPending } = await supabaseAdmin
    .from('seo_content_ideas')
    .select('target_query,suggested_article_title,priority_score,parent_page_url')
    .eq('status', 'new')
    .order('priority_score', { ascending: false })
    .limit(5);

  return { todayIdeas: todayIdeas || [], totalPending: totalPending || 0, topPending: topPending || [] };
}

async function getTodayArticle(date: string) {
  const { data } = await supabaseAdmin
    .from('seo_published_articles')
    .select('*')
    .gte('created_at', date + 'T00:00:00')
    .order('created_at', { ascending: false })
    .limit(1);
  return data?.[0] || null;
}

async function getWeeklyStats(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() - 6);
  const weekStart = d.toISOString().split('T')[0];

  const { data: weekArticles } = await supabaseAdmin
    .from('seo_published_articles')
    .select('category,created_at')
    .gte('created_at', weekStart + 'T00:00:00');

  const byCat: Record<string, number> = {};
  (weekArticles || []).forEach(a => {
    byCat[a.category] = (byCat[a.category] || 0) + 1;
  });
  return { weekTotal: (weekArticles || []).length, byCat };
}

async function getF33Runs(date: string) {
  const { data } = await supabaseAdmin
    .from('seo_runs')
    .select('*')
    .gte('started_at', date + 'T00:00:00')
    .order('started_at', { ascending: false })
    .limit(10);
  return data || [];
}

// === Phase 5 additions ===
// Top 10 queries by clicks over the last 7 days (week-level GSC summary).
async function getGSCTop10Week(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() - 6);
  const weekStart = d.toISOString().split('T')[0];

  // Aggregate in code — supabase-js doesn't expose SUM/GROUP without RPC.
  const { data } = await supabaseAdmin
    .from('seo_queries_daily')
    .select('query,clicks,impressions,ctr,avg_position')
    .gte('date', weekStart)
    .lte('date', date);
  if (!data || data.length === 0) return [];

  const map = new Map<string, { query: string; clicks: number; impressions: number; ctrs: number[]; positions: number[] }>();
  for (const row of data) {
    const key = row.query as string;
    const e = map.get(key) || { query: key, clicks: 0, impressions: 0, ctrs: [], positions: [] };
    e.clicks += row.clicks || 0;
    e.impressions += row.impressions || 0;
    if (row.avg_position) e.positions.push(row.avg_position as number);
    if (row.ctr) e.ctrs.push(row.ctr as number);
    map.set(key, e);
  }
  const list = [...map.values()].map((e) => ({
    query: e.query,
    clicks: e.clicks,
    impressions: e.impressions,
    ctr: e.ctrs.length ? (e.ctrs.reduce((a, b) => a + b, 0) / e.ctrs.length * 100).toFixed(1) : '-',
    avg_position: e.positions.length ? e.positions.reduce((a, b) => a + b, 0) / e.positions.length : null,
  }));
  list.sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);
  return list.slice(0, 10);
}

// Workflow status badges — fetch last execution of each tracked n8n workflow.
async function getWorkflowBadges() {
  const N8N_API_KEY = Deno.env.get('N8N_API_KEY') || '';
  const N8N_BASE = 'https://n8n.perfect-1.one';
  const ids: Array<{ id: string; label: string }> = [
    { id: 'dNUIrmd7OfKzU50B', label: 'WF1 GSC Sync' },
    { id: 'tbARxAxCmB1PFhzi', label: 'WF2 Opportunities' },
    { id: 'mcuHdVaje5WfjU1C', label: 'WF3 Content Ideas' },
    { id: 'F33CbVflx4aApT71', label: 'F33 Auto Publisher' },
  ];
  if (!N8N_API_KEY) return ids.map((i) => ({ ...i, status: 'unknown' as const, detail: 'N8N_API_KEY missing' }));

  const out: Array<{ id: string; label: string; status: 'ok' | 'fail' | 'unknown'; detail: string }> = [];
  for (const w of ids) {
    try {
      const res = await fetch(`${N8N_BASE}/api/v1/executions?workflowId=${w.id}&limit=1`, {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY },
      });
      if (!res.ok) {
        out.push({ ...w, status: 'unknown', detail: `n8n ${res.status}` });
        continue;
      }
      const body = await res.json();
      const last = body.data?.[0];
      if (!last) {
        out.push({ ...w, status: 'unknown', detail: 'no executions' });
      } else if (last.status === 'success') {
        out.push({ ...w, status: 'ok', detail: `last ${last.startedAt?.slice(5, 16) || ''}` });
      } else {
        out.push({ ...w, status: 'fail', detail: `${last.status} @ ${last.startedAt?.slice(5, 16) || ''}` });
      }
    } catch (e) {
      out.push({ ...w, status: 'unknown', detail: (e as Error).message });
    }
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const url = new URL(req.url);
    const date = israelDate(url.searchParams.get('date') || undefined);
    const dateLabel = israelDateLabel(date);

    // Gather all data concurrently
    const [gscQueries, gscTotals, gscYesterday, ideas, todayArticle, weekStats, runs, gscTop10Week, wfBadges] = await Promise.all([
      getGSCData(date),
      getGSCTotals(date),
      getGSCYesterday(date),
      getContentIdeas(date),
      getTodayArticle(date),
      getWeeklyStats(date),
      getF33Runs(date),
      getGSCTop10Week(date),
      getWorkflowBadges(),
    ]);

    // =========== BUILD EMAIL HTML ===========
    let html = `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
    <div style="max-width:700px;margin:0 auto;padding:20px;">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#1a56db 0%,#1e3a5f 100%);border-radius:12px;padding:24px 28px;margin-bottom:24px;">
      <div style="color:#93c5fd;font-size:12px;font-weight:600;letter-spacing:1px;margin-bottom:6px;">PERFECT1.CO.IL</div>
      <h1 style="color:white;margin:0 0 6px;font-size:22px;">דוח תפעולי יומי</h1>
      <div style="color:#bfdbfe;font-size:14px;">${dateLabel}</div>
    </div>`;

    // === Phase 5: Workflow status badges (right under the header) ===
    if (wfBadges && wfBadges.length > 0) {
      const badge = (b: { label: string; status: string; detail: string }) => {
        const colors: Record<string, { bg: string; fg: string; icon: string }> = {
          ok:      { bg: '#dcfce7', fg: '#166534', icon: '[OK]' },
          fail:    { bg: '#fee2e2', fg: '#991b1b', icon: '[FAIL]' },
          unknown: { bg: '#f3f4f6', fg: '#4b5563', icon: '[?]' },
        };
        const c = colors[b.status] || colors.unknown;
        return `<span style="display:inline-block;background:${c.bg};color:${c.fg};border-radius:6px;padding:5px 10px;font-size:12px;font-weight:600;margin:2px;white-space:nowrap;" title="${b.detail}">${c.icon} ${b.label}</span>`;
      };
      html += `<div style="background:white;border-radius:10px;padding:14px 18px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
        <div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.5px;margin-bottom:8px;">סטטוס Workflows</div>
        <div>${wfBadges.map(badge).join(' ')}</div>
      </div>`;
    }

    // =========== 1. GSC SUMMARY ===========
    if (gscTotals) {
      const deltaClicks = gscYesterday ? gscTotals.clicks - gscYesterday.clicks : null;
      const deltaImp = gscYesterday ? gscTotals.impressions - gscYesterday.impressions : null;
      const deltaCtr = gscYesterday ? (parseFloat(gscTotals.ctr) - parseFloat(gscYesterday.ctr)).toFixed(1) : null;
      const deltaPos = gscYesterday ? (parseFloat(gscTotals.avg_position) - parseFloat(gscYesterday.avg_position)).toFixed(1) : null;

      const fmt = (n: number | null, prefix = '') => {
        if (n === null) return '';
        const sign = n > 0 ? '+' : '';
        const color = n > 0 ? '#059669' : n < 0 ? '#dc2626' : '#6b7280';
        return ` <span style="color:${color};font-size:11px;">(${sign}${prefix}${n})</span>`;
      };

      html += `<div style="background:white;border-radius:10px;padding:20px 24px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">`;
      html += `<h2 style="font-size:15px;font-weight:700;color:#1e3a5f;border-bottom:2px solid #dbeafe;padding-bottom:8px;margin:0 0 16px;">ניתוח GSC — Search Console</h2>`;
      html += `<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:16px;">`;
      const kpi = (label: string, val: string | number, delta: string) =>
        `<div style="text-align:center;background:#f8fafc;border-radius:8px;padding:12px 8px;">
          <div style="font-size:22px;font-weight:700;color:#1a56db;">${val}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:2px;">${label}</div>
          <div style="font-size:11px;margin-top:4px;">${delta}</div>
        </div>`;
      html += kpi('קליקים', gscTotals.clicks, fmt(deltaClicks));
      html += kpi('חשיפות', gscTotals.impressions, fmt(deltaImp));
      html += kpi('CTR', gscTotals.ctr + '%', fmt(deltaCtr ? parseFloat(deltaCtr) : null, ''));
      html += kpi('מיקום ממוצע', gscTotals.avg_position, fmt(deltaPos ? -parseFloat(deltaPos) : null)); // negative = improvement
      html += `</div>`;

      if (gscQueries.length > 0) {
        html += `<table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr style="background:#f1f5f9;"><th style="padding:7px 10px;text-align:right;color:#374151;">ביטוי</th><th style="padding:7px 10px;color:#374151;text-align:center;">מיקום</th><th style="padding:7px 10px;color:#374151;text-align:center;">חשיפות</th><th style="padding:7px 10px;color:#374151;text-align:center;">קליקים</th></tr>`;
        gscQueries.slice(0, 10).forEach((q: any, i: number) => {
          const bg = i % 2 === 0 ? '#fff' : '#f9fafb';
          const posColor = q.avg_position <= 3 ? '#059669' : q.avg_position <= 10 ? '#d97706' : '#6b7280';
          html += `<tr style="background:${bg};">
            <td style="padding:6px 10px;">${q.query}</td>
            <td style="padding:6px 10px;text-align:center;color:${posColor};font-weight:600;">${parseFloat(q.avg_position).toFixed(1)}</td>
            <td style="padding:6px 10px;text-align:center;">${q.impressions}</td>
            <td style="padding:6px 10px;text-align:center;font-weight:600;">${q.clicks}</td>
          </tr>`;
        });
        html += `</table>`;
      } else {
        html += `<p style="color:#9ca3af;font-size:13px;margin:0;">נתוני GSC עדיין לא סונכרנו להיום.</p>`;
      }
      html += `</div>`;
    } else {
      html += `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:16px;font-size:13px;color:#92400e;">
        נתוני Search Console לתאריך ${date} עדיין לא הגיעו — GSC sync רץ ב-08:00.
      </div>`;
    }

    // =========== 2. TODAY'S ARTICLE ===========
    html += `<div style="background:white;border-radius:10px;padding:20px 24px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">`;
    html += `<h2 style="font-size:15px;font-weight:700;color:#1e3a5f;border-bottom:2px solid #dbeafe;padding-bottom:8px;margin:0 0 16px;">המאמר שעלה היום — F33 Auto Publisher</h2>`;
    if (todayArticle) {
      const liveUrl = `https://www.perfect1.co.il/${todayArticle.category}/${todayArticle.slug}`;
      const ghUrl = `https://github.com/perfect-ai-admin/perfect1-portal/blob/main/${todayArticle.file_path}`;
      const qualityRun = runs.find((r: any) => r.passed_gate > 0);
      const score = qualityRun?.notes?.match(/score[:\s]+(\d+)/i)?.[1];

      html += `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;">
        <div style="font-size:11px;font-weight:700;color:#15803d;margin-bottom:8px;">פורסם בהצלחה</div>
        <h3 style="margin:0 0 10px;font-size:18px;color:#1a1a1a;">${todayArticle.title}</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
          <span style="background:#dbeafe;color:#1d4ed8;border-radius:4px;padding:3px 9px;font-size:12px;">${todayArticle.category}</span>
          <span style="background:#f3f4f6;color:#374151;border-radius:4px;padding:3px 9px;font-size:12px;">${todayArticle.word_count || 0} מילים</span>
          ${score ? `<span style="background:#dcfce7;color:#15803d;border-radius:4px;padding:3px 9px;font-size:12px;">Quality Gate: ${score}/100</span>` : ''}
        </div>
        <a href="${liveUrl}" style="display:inline-block;background:#1a56db;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:700;margin-left:8px;">צפה באתר</a>
        <a href="${ghUrl}" style="display:inline-block;color:#6b7280;padding:10px 12px;font-size:12px;text-decoration:none;">GitHub commit</a>
      </div>`;
    } else {
      const failedRun = runs.find((r: any) => r.failed_gate > 0 || r.status === 'failed');
      if (failedRun) {
        html += `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;font-size:13px;color:#991b1b;">
          F33 רץ היום אך לא פרסם מאמר — Quality Gate נכשל (${failedRun.failed_gate || 0} ניסיונות).
          <br><small>${failedRun.error_log || failedRun.notes || ''}</small>
        </div>`;
      } else {
        html += `<p style="color:#9ca3af;font-size:13px;margin:0;">F33 עדיין לא רץ היום, או שלא היו ideas לפרסם.</p>`;
      }
    }
    html += `</div>`;

    // =========== 3. CONTENT IDEAS ===========
    html += `<div style="background:white;border-radius:10px;padding:20px 24px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">`;
    html += `<h2 style="font-size:15px;font-weight:700;color:#1e3a5f;border-bottom:2px solid #dbeafe;padding-bottom:8px;margin:0 0 16px;">רעיונות תוכן — WF3 Content Ideas</h2>`;
    html += `<div style="display:flex;gap:12px;margin-bottom:16px;">
      <div style="flex:1;background:#f0f9ff;border-radius:8px;padding:12px;text-align:center;">
        <div style="font-size:26px;font-weight:700;color:#0369a1;">${ideas.totalPending}</div>
        <div style="font-size:12px;color:#6b7280;">ideas ממתינים לפרסום</div>
        ${ideas.totalPending < 10 ? `<div style="font-size:11px;color:#dc2626;font-weight:600;margin-top:4px;">מתחת ל-10 — שקול הפעלת WF3</div>` : ''}
      </div>
      <div style="flex:1;background:#f0fdf4;border-radius:8px;padding:12px;text-align:center;">
        <div style="font-size:26px;font-weight:700;color:#15803d;">${ideas.todayIdeas.length}</div>
        <div style="font-size:12px;color:#6b7280;">ideas נוצרו היום</div>
      </div>
    </div>`;

    if (ideas.todayIdeas.length > 0) {
      html += `<div style="font-size:12px;font-weight:700;color:#6b7280;margin-bottom:6px;">נוצרו היום:</div>`;
      html += `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
        <tr style="background:#f1f5f9;"><th style="padding:7px 10px;text-align:right;color:#374151;">ביטוי מטרה</th><th style="padding:7px 10px;text-align:right;color:#374151;">כותרת מוצעת</th><th style="padding:7px 10px;text-align:center;color:#374151;">ציון</th></tr>`;
      ideas.todayIdeas.forEach((idea: any, i: number) => {
        const bg = i % 2 === 0 ? '#fff' : '#f9fafb';
        html += `<tr style="background:${bg};">
          <td style="padding:6px 10px;color:#1d4ed8;font-weight:600;">${idea.target_query}</td>
          <td style="padding:6px 10px;color:#374151;">${idea.suggested_article_title}</td>
          <td style="padding:6px 10px;text-align:center;font-weight:600;">${idea.priority_score}</td>
        </tr>`;
      });
      html += `</table>`;
    } else {
      html += `<p style="color:#9ca3af;font-size:13px;margin:0 0 16px;">לא נוצרו ideas חדשים היום.</p>`;
    }

    // Top 5 pending ideas — next in queue for F33
    if (ideas.topPending.length > 0) {
      html += `<div style="font-size:12px;font-weight:700;color:#6b7280;margin-bottom:6px;">5 הבאים בתור לפרסום:</div>`;
      html += `<table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr style="background:#f1f5f9;">
          <th style="padding:7px 10px;text-align:right;color:#374151;">ביטוי מטרה</th>
          <th style="padding:7px 10px;text-align:right;color:#374151;">כותרת מוצעת</th>
          <th style="padding:7px 10px;text-align:center;color:#374151;">ציון</th>
          <th style="padding:7px 10px;text-align:right;color:#374151;">עמוד אב</th>
        </tr>`;
      ideas.topPending.forEach((idea: any, i: number) => {
        const bg = i % 2 === 0 ? '#fff' : '#f9fafb';
        const parentLink = idea.parent_page_url
          ? `<a href="${idea.parent_page_url}" target="_blank" style="color:#6b7280;font-size:11px;text-decoration:none;">${idea.parent_page_url.replace('https://www.perfect1.co.il','')}</a>`
          : '<span style="color:#d1d5db;font-size:11px;">—</span>';
        html += `<tr style="background:${bg};">
          <td style="padding:6px 10px;color:#1d4ed8;font-weight:600;">${idea.target_query}</td>
          <td style="padding:6px 10px;color:#374151;">${idea.suggested_article_title}</td>
          <td style="padding:6px 10px;text-align:center;font-weight:700;color:#059669;">${idea.priority_score}</td>
          <td style="padding:6px 10px;">${parentLink}</td>
        </tr>`;
      });
      html += `</table>`;
    }
    html += `</div>`;

    // Top 10 keywords this week
    if (gscTop10Week && gscTop10Week.length > 0) {
      html += `<div style="background:white;border-radius:10px;padding:20px 24px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">`;
      html += `<h2 style="font-size:15px;font-weight:700;color:#1e3a5f;border-bottom:2px solid #dbeafe;padding-bottom:8px;margin:0 0 14px;">דירוגים בגוגל — Top 10 ביטויים (7 ימים אחרונים)</h2>`;
      html += `<table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr style="background:#f1f5f9;">
          <th style="padding:7px 10px;text-align:right;color:#374151;">#</th>
          <th style="padding:7px 10px;text-align:right;color:#374151;">ביטוי</th>
          <th style="padding:7px 10px;text-align:center;color:#374151;">מיקום</th>
          <th style="padding:7px 10px;text-align:center;color:#374151;">קליקים</th>
          <th style="padding:7px 10px;text-align:center;color:#374151;">חשיפות</th>
          <th style="padding:7px 10px;text-align:center;color:#374151;">CTR</th>
        </tr>`;
      gscTop10Week.forEach((q, i) => {
        const bg = i % 2 === 0 ? '#fff' : '#f9fafb';
        const pos = q.avg_position !== null ? q.avg_position.toFixed(1) : '-';
        const posColor = q.avg_position !== null && q.avg_position <= 3 ? '#059669' : q.avg_position !== null && q.avg_position <= 10 ? '#d97706' : '#6b7280';
        html += `<tr style="background:${bg};">
          <td style="padding:6px 10px;text-align:right;color:#9ca3af;font-size:11px;">${i + 1}</td>
          <td style="padding:6px 10px;font-weight:600;color:#1d4ed8;">${q.query}</td>
          <td style="padding:6px 10px;text-align:center;font-weight:700;color:${posColor};">${pos}</td>
          <td style="padding:6px 10px;text-align:center;font-weight:700;">${q.clicks}</td>
          <td style="padding:6px 10px;text-align:center;">${q.impressions}</td>
          <td style="padding:6px 10px;text-align:center;color:#6b7280;">${q.ctr}%</td>
        </tr>`;
      });
      html += `</table></div>`;
    }

    if (ideas.totalPending < 10) {
      html += `<div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
        <div style="font-size:14px;font-weight:700;color:#92400e;margin-bottom:6px;">[WARNING] מחסור ב-Content Ideas</div>
        <div style="font-size:13px;color:#78350f;">רק <b>${ideas.totalPending}</b> ideas ממתינים — F33 צפוי לרוץ ביבש בעוד ימים ספורים. הפעל את WF3 ידנית או חכה ל-08:00 הבא.</div>
      </div>`;
    }

    // =========== 4. SITE STATUS ===========
    html += `<div style="background:white;border-radius:10px;padding:20px 24px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">`;
    html += `<h2 style="font-size:15px;font-weight:700;color:#1e3a5f;border-bottom:2px solid #dbeafe;padding-bottom:8px;margin:0 0 14px;">מצב תוכן האתר</h2>`;

    // Count active articles by category
    const { data: catCounts } = await supabaseAdmin
      .from('seo_published_articles')
      .select('category');

    const byCat: Record<string, number> = {};
    (catCounts || []).forEach((r: any) => { byCat[r.category] = (byCat[r.category] || 0) + 1; });
    const totalArticles = (catCounts || []).length;

    html += `<div style="margin-bottom:14px;">
      <span style="font-size:28px;font-weight:700;color:#1a56db;">${totalArticles}</span>
      <span style="color:#6b7280;font-size:13px;margin-right:8px;">מאמרים פורסמו דרך F33</span>
      <span style="color:#374151;font-size:13px;"> | ${weekStats.weekTotal} השבוע</span>
    </div>`;

    if (Object.keys(weekStats.byCat).length > 0) {
      html += `<div style="font-size:12px;color:#6b7280;margin-bottom:10px;">קטגוריות שצמחו השבוע:</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">`;
      Object.entries(weekStats.byCat).forEach(([cat, count]) => {
        html += `<span style="background:#dbeafe;color:#1d4ed8;border-radius:4px;padding:4px 10px;font-size:12px;">${cat} +${count}</span>`;
      });
      html += `</div>`;
    }
    html += `</div>`;

    // =========== 5. ISSUES ===========
    const issues: string[] = [];
    if (ideas.totalPending < 10) issues.push(`מחסור ב-ideas: רק ${ideas.totalPending} ממתינים — הפעל WF3 ידנית`);
    const failedRuns = runs.filter((r: any) => r.status === 'failed' || r.errors > 0);
    if (failedRuns.length > 0) issues.push(`${failedRuns.length} workflows נכשלו היום — בדוק n8n executions`);
    const gateFailures = runs.reduce((s: number, r: any) => s + (r.failed_gate || 0), 0);
    if (gateFailures > 0 && !todayArticle) issues.push(`Quality Gate נכשל ${gateFailures} פעמים ולא פורסם מאמר — בדוק ב-n8n`);

    if (issues.length > 0) {
      html += `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
        <h2 style="font-size:14px;font-weight:700;color:#991b1b;margin:0 0 10px;">בעיות שזוהו</h2>`;
      issues.forEach(issue => {
        html += `<div style="font-size:13px;color:#7f1d1d;padding:4px 0;">${issue}</div>`;
      });
      html += `</div>`;
    }

    // FOOTER
    html += `<div style="text-align:center;color:#9ca3af;font-size:11px;padding:16px 0;">
      דוח זה נשלח אוטומטית ב-11:45 כל יום | perfect1.co.il
    </div>

    </div></body></html>`;

    // =========== SEND EMAIL ===========
    if (!RESEND_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured', html_preview: html.slice(0, 500) }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const subject = `דוח יומי — perfect1.co.il — ${dateLabel}`;
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({ from: FROM, to: RECIPIENT, subject, html }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      return new Response(JSON.stringify({ error: `Resend error: ${errBody}` }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailData = await emailRes.json();
    return new Response(JSON.stringify({ success: true, message_id: emailData.id, date, issues, todayArticle: todayArticle?.slug || null }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('dailyOperationsReport error:', (err as Error).message);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
});
