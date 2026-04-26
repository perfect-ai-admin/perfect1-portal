// webhookSyncArticle — receives push notifications from GitHub Action when
// src/content/**/*.json files change, fetches the JSON from raw.githubusercontent,
// and upserts a row in seo_published_articles.
//
// Auth: shared secret in header X-Webhook-Secret (compared against env SYNC_WEBHOOK_SECRET).
// Body (JSON): { filepath: "src/content/<category>/<slug>.json", ref: "<commit-sha>" }
//
// Returns 200 with { ok: true, action: "inserted"|"updated"|"skipped", ... } on success.

import { supabaseAdmin, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const SECRET = Deno.env.get('SYNC_WEBHOOK_SECRET') || '';
const REPO = 'perfect-ai-admin/perfect1-portal';

interface SyncBody {
  filepath: string;
  ref: string;
}

function parseSlugFromPath(filepath: string): { category: string; slug: string } | null {
  // expected: src/content/<category>/<slug>.json
  const m = filepath.match(/^src\/content\/([^/]+)\/([^/]+)\.json$/);
  if (!m) return null;
  return { category: m[1], slug: m[2] };
}

function countWords(article: Record<string, unknown>): number {
  // Concatenate all human-readable string fields and count whitespace-separated tokens
  const parts: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === 'string') parts.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v as Record<string, unknown>).forEach(walk);
  };
  walk(article);
  const joined = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (!joined) return 0;
  return joined.split(' ').length;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // 1) Auth via shared secret
  const provided = req.headers.get('X-Webhook-Secret') || '';
  if (!SECRET) {
    return errorResponse('SYNC_WEBHOOK_SECRET not configured', 500);
  }
  if (provided !== SECRET) {
    return errorResponse('Unauthorized', 401);
  }

  // 2) Parse body
  let body: SyncBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }
  const { filepath, ref } = body || ({} as SyncBody);
  if (!filepath || !ref) {
    return errorResponse('Missing filepath or ref', 400);
  }

  const slugInfo = parseSlugFromPath(filepath);
  if (!slugInfo) {
    return jsonResponse({ ok: true, action: 'skipped', reason: 'not_an_article_path', filepath }, 200);
  }

  // 3) Fetch JSON from GitHub raw
  const rawUrl = `https://raw.githubusercontent.com/${REPO}/${ref}/${filepath}`;
  let articleJson: Record<string, unknown>;
  try {
    const res = await fetch(rawUrl);
    if (!res.ok) {
      return errorResponse(`GitHub raw fetch failed: ${res.status} ${rawUrl}`, 502);
    }
    articleJson = await res.json();
  } catch (e) {
    return errorResponse(`Fetch error: ${(e as Error).message}`, 502);
  }

  // 4) Extract title (heroTitle | metaTitle | title)
  const title =
    (articleJson.heroTitle as string) ||
    (articleJson.metaTitle as string) ||
    (articleJson.title as string) ||
    `${slugInfo.category}/${slugInfo.slug}`;

  const wordCount = countWords(articleJson);

  // 5) Upsert into seo_published_articles by (category, slug)
  const row = {
    category: slugInfo.category,
    slug: slugInfo.slug,
    title,
    file_path: filepath,
    git_commit_sha: ref,
    word_count: wordCount,
  };

  // Check existing
  const { data: existing } = await supabaseAdmin
    .from('seo_published_articles')
    .select('id')
    .eq('category', row.category)
    .eq('slug', row.slug)
    .maybeSingle();

  if (existing && existing.id) {
    const { error } = await supabaseAdmin
      .from('seo_published_articles')
      .update({
        title: row.title,
        file_path: row.file_path,
        git_commit_sha: row.git_commit_sha,
        word_count: row.word_count,
      })
      .eq('id', existing.id);
    if (error) return errorResponse(`Update failed: ${error.message}`, 500);
    return jsonResponse({ ok: true, action: 'updated', id: existing.id, ...row }, 200);
  }

  const { data: inserted, error: insErr } = await supabaseAdmin
    .from('seo_published_articles')
    .insert(row)
    .select('id')
    .single();
  if (insErr) return errorResponse(`Insert failed: ${insErr.message}`, 500);

  return jsonResponse({ ok: true, action: 'inserted', id: inserted?.id, ...row }, 200);
});
