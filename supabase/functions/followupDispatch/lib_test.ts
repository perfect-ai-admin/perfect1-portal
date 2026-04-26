// Run with: deno test --allow-none supabase/functions/followupDispatch/lib_test.ts
// These tests cover the pure logic of the FollowUp Bot brain.
// No network, no Supabase, no secrets — can run in CI.

import { assert, assertEquals, assertExists, assertMatch } from 'jsr:@std/assert@1';
import {
  eventKey,
  renderTemplate,
  resolveDate,
  buildLeadPatch,
  inQuietHours,
  evaluateConditions,
  classifyInbound,
  buildLeadSummary,
} from './lib.ts';

// ============================================================
// eventKey — idempotency guarantee
// ============================================================
Deno.test('eventKey: deterministic for same inputs', async () => {
  const a = await eventKey(['lead-1', 'rule-1', 'status_change', 'quote_sent', '', '', '2026-04-11T10:00:00Z']);
  const b = await eventKey(['lead-1', 'rule-1', 'status_change', 'quote_sent', '', '', '2026-04-11T10:00:00Z']);
  assertEquals(a, b);
});

Deno.test('eventKey: different inputs produce different keys', async () => {
  const a = await eventKey(['lead-1', 'rule-1', 'status_change', 'quote_sent']);
  const b = await eventKey(['lead-1', 'rule-1', 'status_change', 'paid']);
  assert(a !== b);
});

Deno.test('eventKey: null/undefined treated as empty', async () => {
  const a = await eventKey(['lead-1', null, 'x', undefined, 'y']);
  const b = await eventKey(['lead-1', '', 'x', '', 'y']);
  assertEquals(a, b);
});

Deno.test('eventKey: format is fu_ + 32 hex chars', async () => {
  const k = await eventKey(['a', 'b']);
  assertMatch(k, /^fu_[0-9a-f]{32}$/);
});

// ============================================================
// renderTemplate — {{field}} substitution
// ============================================================
Deno.test('renderTemplate: substitutes known fields', () => {
  const out = renderTemplate('שלום {{name}}, יש לך {{followup_sequence_step}} תזכורות', {
    name: 'רון',
    followup_sequence_step: 2,
  });
  assertEquals(out, 'שלום רון, יש לך 2 תזכורות');
});

Deno.test('renderTemplate: missing field becomes empty string', () => {
  const out = renderTemplate('שלום {{name}}, סטטוס: {{unknown}}', { name: 'רון' });
  assertEquals(out, 'שלום רון, סטטוס: ');
});

Deno.test('renderTemplate: null/undefined template is empty', () => {
  assertEquals(renderTemplate(null, { name: 'x' }), '');
  assertEquals(renderTemplate(undefined, { name: 'x' }), '');
});

// ============================================================
// resolveDate — "+1d" / "+3h" / ISO / null
// ============================================================
Deno.test('resolveDate: +1d adds 86400s from anchor', () => {
  const anchor = new Date('2026-04-11T12:00:00Z');
  const out = resolveDate('+1d', anchor);
  assertEquals(out, new Date('2026-04-12T12:00:00Z').toISOString());
});

Deno.test('resolveDate: +3h adds 3 hours from anchor', () => {
  const anchor = new Date('2026-04-11T12:00:00Z');
  const out = resolveDate('+3h', anchor);
  assertEquals(out, new Date('2026-04-11T15:00:00Z').toISOString());
});

Deno.test('resolveDate: null/"null"/undefined return null', () => {
  assertEquals(resolveDate(null), null);
  assertEquals(resolveDate('null'), null);
  assertEquals(resolveDate(undefined), null);
});

Deno.test('resolveDate: passthrough ISO string', () => {
  assertEquals(resolveDate('2026-04-11T12:00:00Z'), '2026-04-11T12:00:00Z');
});

// ============================================================
// buildLeadPatch — wraps resolveDate only for next_followup_date
// ============================================================
Deno.test('buildLeadPatch: resolves next_followup_date but keeps other fields', () => {
  const anchor = new Date('2026-04-11T12:00:00Z');
  const out = buildLeadPatch({ next_followup_date: '+2d', followup_sequence_step: 3, followup_paused: false }, anchor);
  assertEquals(out.next_followup_date, new Date('2026-04-13T12:00:00Z').toISOString());
  assertEquals(out.followup_sequence_step, 3);
  assertEquals(out.followup_paused, false);
});

Deno.test('buildLeadPatch: null for then_update returns empty patch', () => {
  assertEquals(buildLeadPatch(null), {});
  assertEquals(buildLeadPatch(undefined), {});
  assertEquals(buildLeadPatch('not an object'), {});
});

// ============================================================
// inQuietHours — not tested against live time; boundary check only
// ============================================================
Deno.test('inQuietHours: returns a boolean', () => {
  const r = inQuietHours();
  assert(typeof r === 'boolean');
});

Deno.test('inQuietHours: a concrete night-time date is quiet (IL 23:00 local)', () => {
  // 2026-04-11T20:00:00Z = 23:00 Asia/Jerusalem (UTC+3, DST)
  const night = new Date('2026-04-11T20:00:00Z');
  assertEquals(inQuietHours(night), true);
});

Deno.test('inQuietHours: a concrete day-time date is not quiet (IL 13:00 local)', () => {
  // 2026-04-11T10:00:00Z = 13:00 Asia/Jerusalem
  const day = new Date('2026-04-11T10:00:00Z');
  assertEquals(inQuietHours(day), false);
});

// ============================================================
// evaluateConditions
// ============================================================
Deno.test('evaluateConditions: empty/no conditions returns true', () => {
  assertEquals(evaluateConditions([], { x: 1 }), true);
  assertEquals(evaluateConditions(null, { x: 1 }), true);
});

Deno.test('evaluateConditions: eq match', () => {
  const ok = evaluateConditions([{ field: 'pipeline_stage', op: 'eq', value: 'quote_sent' }], {
    pipeline_stage: 'quote_sent',
  });
  assertEquals(ok, true);
});

Deno.test('evaluateConditions: eq mismatch', () => {
  const ok = evaluateConditions([{ field: 'pipeline_stage', op: 'eq', value: 'quote_sent' }], {
    pipeline_stage: 'paid',
  });
  assertEquals(ok, false);
});

Deno.test('evaluateConditions: in match', () => {
  const ok = evaluateConditions([{ field: 'service_type', op: 'in', value: ['osek_patur', 'osek_murshe'] }], {
    service_type: 'osek_patur',
  });
  assertEquals(ok, true);
});

Deno.test('evaluateConditions: exists check', () => {
  assertEquals(
    evaluateConditions([{ field: 'phone', op: 'exists', value: null }], { phone: '+972501234567' }),
    true,
  );
  assertEquals(
    evaluateConditions([{ field: 'phone', op: 'exists', value: null }], { phone: null }),
    false,
  );
});

// ============================================================
// classifyInbound — 6 categories, Hebrew
// ============================================================
Deno.test('classifyInbound: interested', () => {
  const r = classifyInbound('כן אני מעוניין תתקשרו אליי');
  // "תתקשרו" matches asked_for_human; Hebrew phrase is ambiguous.
  // Must be either interested or asked_for_human — both require human.
  assert(['interested', 'asked_for_human'].includes(r.category));
  assertEquals(r.needs_human, true);
});

Deno.test('classifyInbound: pure interested without call-me', () => {
  const r = classifyInbound('כן מעוניין מתאים לי');
  assertEquals(r.category, 'interested');
  assertEquals(r.suggested_next_status, 'interested');
});

Deno.test('classifyInbound: price objection', () => {
  const r = classifyInbound('זה נשמע יקר, יש הנחה?');
  assertEquals(r.category, 'objection_price');
  assertEquals(r.needs_human, true);
  assertEquals(r.sub_status, 'price_objection');
});

Deno.test('classifyInbound: asked for human', () => {
  const r = classifyInbound('אפשר שמישהו יתקשר אליי? רוצה לדבר עם נציג');
  assertEquals(r.category, 'asked_for_human');
  assertEquals(r.needs_human, true);
});

Deno.test('classifyInbound: sent documents', () => {
  const r = classifyInbound('העליתי את המסמכים, הכל מצורף');
  assertEquals(r.category, 'sent_documents');
  assertEquals(r.sub_status, 'docs_received');
  assertEquals(r.suggested_next_status, 'in_process');
});

Deno.test('classifyInbound: not relevant (hard stop)', () => {
  const r = classifyInbound('תודה לא, לא מעוניין');
  assertEquals(r.category, 'not_relevant');
  assertEquals(r.needs_human, false);
  assertEquals(r.suggested_next_status, 'not_relevant');
});

Deno.test('classifyInbound: general reply when nothing matches', () => {
  const r = classifyInbound('מה שלומך');
  assertEquals(r.category, 'general_reply');
  assertEquals(r.needs_human, true);
});

Deno.test('classifyInbound: "לא מעוניין" must NOT match interested', () => {
  // Critical: "מעוניין" is a substring of "לא מעוניין". Ensure ordering is correct.
  const r = classifyInbound('לא מעוניין תודה');
  assertEquals(r.category, 'not_relevant');
});

// ============================================================
// buildLeadSummary
// ============================================================
Deno.test('buildLeadSummary: includes status + previous_status', () => {
  const s = buildLeadSummary({
    pipeline_stage: 'quote_sent',
    previous_status: 'interested',
    followup_sequence_name: 'quote_followup',
    followup_sequence_step: 1,
  });
  assert(s.includes('quote_sent'));
  assert(s.includes('interested'));
  assert(s.includes('quote_followup'));
});

Deno.test('buildLeadSummary: empty lead falls back to default', () => {
  const s = buildLeadSummary({});
  assertEquals(s, 'ליד חדש');
});

Deno.test('buildLeadSummary: no_answer attempts included', () => {
  const s = buildLeadSummary({
    pipeline_stage: 'no_answer',
    no_answer_attempts: 2,
  });
  assert(s.includes('2 ניסיונות'));
});

Deno.test('buildLeadSummary: truncates long inbound message preview', () => {
  const s = buildLeadSummary({
    pipeline_stage: 'contacted',
    last_inbound_message: 'א'.repeat(200),
  });
  assert(s.length < 250); // 60 chars + metadata
  assert(s.includes('הודעה אחרונה'));
});
