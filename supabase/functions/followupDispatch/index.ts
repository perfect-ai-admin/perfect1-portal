// followupDispatch — FollowUp Bot brain.
// Receives events from n8n webhook / pg_cron / DB triggers / manual button.
// Owns ALL rule evaluation, guards, cooldown, idempotency, action execution.
//
// Event shapes:
//   { event_type: 'status_change',  lead_id, from_status, to_status, changed_at }
//   { event_type: 'cron_tick',      ts }
//   { event_type: 'inbound_message', lead_id?, phone, message_text, greenapi_message_id? }
//   { event_type: 'manual',         lead_id, rule_name, triggered_by }
//
// Invoked by service-role only (pg_net from triggers/cron OR authenticated users via triggerManualFollowup).

import { supabaseAdmin, jsonResponse, errorResponse, getCorsHeaders } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage, sendAndStoreFile, storeInboundMessage, formatPhone } from '../_shared/whatsappHelper.ts';
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
// TYPES
// ============================================================
interface Lead {
  id: string;
  name?: string | null;
  phone?: string | null;
  agent_id?: string | null;
  pipeline_stage?: string | null;
  status?: string | null;
  sub_status?: string | null;
  followup_sequence_name?: string | null;
  followup_sequence_step?: number | null;
  followup_paused?: boolean;
  do_not_contact?: boolean;
  needs_human?: boolean;
  whatsapp_opt_in?: boolean;
  last_contact_at?: string | null;
  next_followup_date?: string | null;
  service_type?: string | null;
  tags?: string[] | null;
  [k: string]: unknown;
}

interface Rule {
  id: string;
  name: string;
  trigger_type: 'status_change' | 'cron_tick' | 'inbound_message' | 'manual';
  trigger_config: Record<string, unknown>;
  conditions: Array<{ field: string; op: string; value: unknown }>;
  action_type: 'send_whatsapp' | 'create_task' | 'update_lead' | 'start_sequence' | 'stop_sequence';
  action_config: Record<string, unknown>;
  cooldown_hours: number;
  max_per_lead: number | null;
  is_active: boolean;
}

type EventBody =
  | { event_type: 'status_change'; lead_id: string; from_status?: string; to_status?: string; changed_at?: string }
  | { event_type: 'cron_tick'; ts?: string }
  | { event_type: 'inbound_message'; lead_id?: string; phone?: string; message_text?: string; greenapi_message_id?: string; already_stored?: boolean; raw_payload?: Record<string, unknown> }
  | { event_type: 'manual'; lead_id: string; rule_name: string; rule_id?: string; triggered_by?: string };

interface ExecutionResult {
  rule_name: string;
  result: string;
  error?: string | null;
  log_id?: string | null;
}

// Pure helpers (eventKey, renderTemplate, resolveDate, buildLeadPatch,
// inQuietHours, evaluateConditions, classifyInbound, buildLeadSummary)
// live in ./lib.ts so they can be unit-tested without Supabase/env.

// ============================================================
// CORE: execute one rule against one lead
// ============================================================
async function executeRule(lead: Lead, rule: Rule, event: EventBody): Promise<ExecutionResult> {
  const evKey = await eventKey([
    lead.id,
    rule.id,
    event.event_type,
    (event as { to_status?: string }).to_status,
    (event as { from_status?: string }).from_status,
    (rule.trigger_config?.step as string | number | undefined) ?? '',
    event.event_type === 'cron_tick' ? new Date().toISOString().slice(0, 10) : (event as { changed_at?: string }).changed_at,
  ]);

  // Guards
  let skip: string | null = null;
  if (lead.do_not_contact === true) skip = 'skipped_dnc';
  else if (!evaluateConditions(rule.conditions, lead)) skip = 'skipped_stop';
  else if (lead.followup_paused === true && rule.action_type !== 'stop_sequence' && event.event_type !== 'status_change') skip = 'skipped_stop';
  else if (lead.whatsapp_opt_in === false && rule.action_type === 'send_whatsapp') skip = 'skipped_stop';
  else if (inQuietHours() && rule.action_type === 'send_whatsapp' && event.event_type !== 'manual') skip = 'skipped_quiet_hours';

  // Cooldown + max_per_lead
  if (!skip && rule.cooldown_hours > 0) {
    const since = new Date(Date.now() - rule.cooldown_hours * 3600 * 1000).toISOString();
    const { data: recent } = await supabaseAdmin
      .from('automation_logs')
      .select('id')
      .eq('rule_id', rule.id)
      .eq('lead_id', lead.id)
      .eq('result', 'sent')
      .gte('created_at', since)
      .limit(1);
    if (recent && recent.length > 0) skip = 'skipped_cooldown';
  }

  if (!skip && rule.max_per_lead) {
    const { count } = await supabaseAdmin
      .from('automation_logs')
      .select('id', { count: 'exact', head: true })
      .eq('rule_id', rule.id)
      .eq('lead_id', lead.id)
      .eq('result', 'sent');
    if ((count ?? 0) >= rule.max_per_lead) skip = 'skipped_max';
  }

  // Idempotent log insert (UNIQUE event_key)
  const insertPayload = {
    lead_id: lead.id,
    rule_id: rule.id,
    rule_name: rule.name,
    event_key: evKey,
    trigger_type: event.event_type,
    action_type: rule.action_type,
    action_payload: rule.action_config as Record<string, unknown>,
    result: skip || 'pending',
  };

  const { data: logRow, error: logErr } = await supabaseAdmin
    .from('automation_logs')
    .insert(insertPayload)
    .select('id')
    .single();

  if (logErr) {
    // Unique violation → duplicate event
    if (logErr.code === '23505' || String(logErr.message || '').toLowerCase().includes('duplicate')) {
      console.log(`[dispatch] dedup rule=${rule.name} lead=${lead.id}`);
      return { rule_name: rule.name, result: 'dedup' };
    }
    console.error(`[dispatch] log insert failed:`, logErr);
    return { rule_name: rule.name, result: 'failed', error: logErr.message };
  }

  if (skip) {
    console.log(`[dispatch] ${skip} rule=${rule.name} lead=${lead.id}`);
    return { rule_name: rule.name, result: skip, log_id: logRow.id };
  }

  // ============ Execute action ============
  const cfg = rule.action_config || {};
  let result: string = 'sent';
  let errorMsg: string | null = null;
  let sentBody: string | null = null;

  try {
    switch (rule.action_type) {
      case 'send_whatsapp': {
        if (!lead.phone) throw new Error('lead has no phone');
        const body = renderTemplate(cfg.body, lead);
        sentBody = body;

        // If rule has media_url, send media (image/PDF) with body as caption.
        // Otherwise send plain text.
        const mediaUrl = (cfg.media_url || cfg.image_url) as string | undefined;
        const sendResult = mediaUrl
          ? await sendAndStoreFile(supabaseAdmin, {
              phone: lead.phone,
              message: body,
              caption: body,
              media_url: mediaUrl,
              filename: cfg.media_filename as string | undefined,
              lead_id: lead.id,
              sender_type: 'bot',
              raw_payload: { rule_name: rule.name, rule_id: rule.id },
            })
          : await sendAndStoreMessage(supabaseAdmin, {
              phone: lead.phone,
              message: body,
              lead_id: lead.id,
              sender_type: 'bot',
              message_type: 'text',
              raw_payload: { rule_name: rule.name, rule_id: rule.id },
            });

        if (!sendResult.success) {
          // Fallback: create task for agent to handle manually
          await supabaseAdmin.from('tasks').insert({
            title: `WhatsApp אוטומטי נכשל (${rule.name})`,
            description: `שליחת WhatsApp אוטומטית נכשלה (rule=${rule.name}). יש לפנות ידנית לליד ${lead.name || lead.phone}.`,
            task_type: 'whatsapp_send_failed',
            assigned_to: lead.agent_id,
            priority: 'high',
            status: 'pending',
            is_automated: true,
            lead_id: lead.id,
          });
          throw new Error('greenapi_send_failed');
        }
        break;
      }

      case 'create_task': {
        const desc = renderTemplate(cfg.notes || cfg.description, lead);
        await supabaseAdmin.from('tasks').insert({
          title: (cfg.title as string) || (cfg.task_type as string) || 'followup',
          description: desc,
          task_type: (cfg.task_type as string) || 'followup',
          assigned_to: lead.agent_id,
          priority: (cfg.priority as string) || 'normal',
          status: 'pending',
          is_automated: true,
          lead_id: lead.id,
        });
        break;
      }

      case 'update_lead': {
        const patch = buildLeadPatch(cfg.patch || cfg.then_update);
        if (Object.keys(patch).length > 0) {
          await supabaseAdmin.from('leads').update(patch).eq('id', lead.id);
        }
        break;
      }

      case 'start_sequence': {
        await supabaseAdmin.from('leads').update({
          followup_sequence_name: cfg.sequence,
          followup_sequence_step: 1,
          next_followup_date: resolveDate(cfg.next || '+1d'),
          followup_paused: false,
        }).eq('id', lead.id);
        break;
      }

      case 'stop_sequence': {
        await supabaseAdmin.from('leads').update({
          followup_sequence_name: null,
          followup_sequence_step: 0,
          next_followup_date: null,
          followup_paused: true,
        }).eq('id', lead.id);
        break;
      }

      default:
        throw new Error(`unknown action_type: ${rule.action_type}`);
    }

    // Apply then_update side-effects + memory fields (last_outbound, summary, next_action)
    const nowIso = new Date().toISOString();
    const basePatch: Record<string, unknown> = cfg.then_update && rule.action_type !== 'update_lead'
      ? buildLeadPatch(cfg.then_update)
      : {};
    basePatch.last_contact_at = nowIso;
    // If a status_change rule ran despite followup_paused, clear the pause
    // so the new sequence (set via then_update) can proceed with cron_tick.
    if (event.event_type === 'status_change' && lead.followup_paused === true) {
      basePatch.followup_paused = false;
    }
    if (rule.action_type === 'send_whatsapp' && sentBody) {
      basePatch.last_outbound_message = sentBody.slice(0, 500);
      basePatch.last_outbound_at = nowIso;
    }
    // Compute summary + next_action from the updated state the lead will have
    const projectedLead: Lead = { ...lead, ...basePatch } as Lead;
    basePatch.lead_summary = buildLeadSummary(projectedLead).slice(0, 500);
    basePatch.next_action = rule.name;
    if (Object.keys(basePatch).length > 0) {
      await supabaseAdmin.from('leads').update(basePatch).eq('id', lead.id);
    }
  } catch (err) {
    result = 'failed';
    errorMsg = (err as Error).message?.slice(0, 500) || 'unknown error';
    console.error(`[dispatch] action failed rule=${rule.name} lead=${lead.id}:`, errorMsg);
  }

  // Finalize log
  await supabaseAdmin
    .from('automation_logs')
    .update({ result, error: errorMsg })
    .eq('id', logRow.id);

  console.log(`[dispatch] ${result} rule=${rule.name} lead=${lead.id}`);
  return { rule_name: rule.name, result, error: errorMsg, log_id: logRow.id };
}

// ============================================================
// EVENT HANDLERS
// ============================================================

async function handleStatusChange(event: Extract<EventBody, { event_type: 'status_change' }>): Promise<ExecutionResult[]> {
  const { data: lead } = await supabaseAdmin.from('leads').select('*').eq('id', event.lead_id).single();
  if (!lead) return [{ rule_name: '-', result: 'failed', error: 'lead not found' }];

  const { data: rules } = await supabaseAdmin
    .from('automation_rules')
    .select('*')
    .eq('trigger_type', 'status_change')
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (!rules) return [];

  const matched = rules.filter((r) => {
    const tc = r.trigger_config || {};
    if (tc.to_status && tc.to_status !== event.to_status) return false;
    if (tc.from_status && tc.from_status !== event.from_status) return false;
    return true;
  });

  const results: ExecutionResult[] = [];
  for (const rule of matched) {
    results.push(await executeRule(lead, rule, event));
  }
  return results;
}

async function handleCronTick(event: Extract<EventBody, { event_type: 'cron_tick' }>): Promise<ExecutionResult[]> {
  const nowIso = new Date().toISOString();
  const { data: leads } = await supabaseAdmin
    .from('leads')
    .select('*')
    .lte('next_followup_date', nowIso)
    .eq('followup_paused', false)
    .eq('do_not_contact', false)
    .not('followup_sequence_name', 'is', null)
    .limit(50);

  if (!leads || leads.length === 0) {
    console.log('[dispatch] cron_tick: no due leads');
    return [];
  }

  const { data: rules } = await supabaseAdmin
    .from('automation_rules')
    .select('*')
    .eq('trigger_type', 'cron_tick')
    .eq('is_active', true);

  if (!rules) return [];

  const results: ExecutionResult[] = [];
  for (const lead of leads) {
    for (const rule of rules) {
      const tc = rule.trigger_config || {};
      if (tc.sequence !== lead.followup_sequence_name) continue;
      if (tc.step != null && tc.step !== lead.followup_sequence_step) continue;
      results.push(await executeRule(lead, rule, event));
    }
  }
  return results;
}

async function handleInboundMessage(event: Extract<EventBody, { event_type: 'inbound_message' }>): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = [];
  let lead: Lead | null = null;

  // Resolve lead: by id or by phone lookup
  if (event.lead_id) {
    const { data } = await supabaseAdmin.from('leads').select('*').eq('id', event.lead_id).single();
    lead = data;
  } else if (event.phone) {
    const fullPhone = formatPhone(event.phone);
    const { data } = await supabaseAdmin
      .from('leads')
      .select('*')
      .or(`phone.eq.${event.phone},phone.eq.${fullPhone},phone.eq.0${fullPhone.slice(3)}`)
      .limit(1)
      .maybeSingle();
    lead = data;
  }

  if (!lead) {
    console.log('[dispatch] inbound_message: no matching lead', event.phone);
    return [{ rule_name: '-', result: 'skipped_stop', error: 'no lead matched' }];
  }

  // Store message (dedup by greenapi_message_id).
  // Skip if already_stored=true (event came from our own DB trigger — the row already exists).
  if (!event.already_stored && event.phone && event.message_text) {
    await storeInboundMessage(supabaseAdmin, {
      phone: event.phone,
      message_text: event.message_text,
      greenapi_message_id: event.greenapi_message_id || null,
      lead_id: lead.id,
      raw_payload: event.raw_payload || {},
    });
  }

  // Classify
  const cls = classifyInbound(event.message_text || '');

  // Build lead patch: pause sequence, touch last_contact, set flags, remember message
  const nowIso = new Date().toISOString();
  const patch: Record<string, unknown> = {
    followup_paused: true,
    last_contact_at: nowIso,
    last_inbound_message: (event.message_text || '').slice(0, 500),
    last_inbound_at: nowIso,
  };
  if (cls.needs_human) patch.needs_human = true;
  if (cls.sub_status) patch.sub_status = cls.sub_status;
  // Never auto-change pipeline_stage on an inbound — agents do that after reviewing.
  // We only store a suggestion for the agent in lead_summary.
  const projectedLead: Lead = { ...lead, ...patch } as Lead;
  patch.lead_summary = buildLeadSummary(projectedLead).slice(0, 500);
  patch.next_action = cls.suggested_next_status
    ? `review_reply -> suggest ${cls.suggested_next_status}`
    : `review_reply (${cls.category})`;
  await supabaseAdmin.from('leads').update(patch).eq('id', lead.id);

  // Log the inbound as an automation event.
  // Idempotency: use greenapi_message_id when available (truly unique per WA msg),
  // otherwise bucket by lead + message_text + minute (prevents accidental loops).
  const minuteBucket = new Date().toISOString().slice(0, 16);
  const logEvKey = await eventKey([
    'inbound',
    lead.id,
    event.greenapi_message_id || `${event.message_text}|${minuteBucket}`,
  ]);
  const { error: dupErr } = await supabaseAdmin.from('automation_logs').insert({
    lead_id: lead.id,
    rule_id: null,
    rule_name: `inbound_${cls.category}`,
    event_key: logEvKey,
    trigger_type: 'inbound_message',
    action_type: 'update_lead',
    action_payload: { classification: cls, preview: (event.message_text || '').slice(0, 200) },
    result: 'sent',
  });

  // If UNIQUE violation → we've already processed this inbound. Exit without creating duplicate task.
  if (dupErr) {
    if (dupErr.code === '23505' || String(dupErr.message || '').toLowerCase().includes('duplicate')) {
      console.log(`[dispatch] inbound dedup — already processed for lead=${lead.id}`);
      return [{ rule_name: `inbound_${cls.category}`, result: 'dedup' }];
    }
    console.error('[dispatch] inbound log insert failed:', dupErr);
  }

  results.push({ rule_name: `inbound_${cls.category}`, result: 'sent' });

  // Task creation if needs_human
  if (cls.needs_human) {
    await supabaseAdmin.from('tasks').insert({
      title: `תגובה נכנסת: ${cls.category}`,
      description: `לקוח ענה בוואטסאפ (${cls.category}): ${(event.message_text || '').slice(0, 300)}`,
      task_type: `inbound_${cls.category}`,
      assigned_to: lead.agent_id,
      priority: cls.category === 'asked_for_human' || cls.category === 'objection_price' ? 'high' : 'normal',
      status: 'pending',
      is_automated: true,
      lead_id: lead.id,
    });
    results.push({ rule_name: 'inbound_task_created', result: 'sent' });
  }

  console.log(`[dispatch] inbound classified=${cls.category} lead=${lead.id}`);
  return results;
}

async function handleManual(event: Extract<EventBody, { event_type: 'manual' }>): Promise<ExecutionResult[]> {
  const { data: lead } = await supabaseAdmin.from('leads').select('*').eq('id', event.lead_id).single();
  if (!lead) return [{ rule_name: event.rule_name, result: 'failed', error: 'lead not found' }];

  const { data: rule } = await supabaseAdmin
    .from('automation_rules')
    .select('*')
    .eq('name', event.rule_name)
    .eq('is_active', true)
    .single();
  if (!rule) return [{ rule_name: event.rule_name, result: 'failed', error: 'rule not found or inactive' }];

  return [await executeRule(lead, rule, event)];
}

// ============================================================
// HTTP ENTRY
// ============================================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });
  if (req.method !== 'POST') return errorResponse('POST required', 405, req);

  let body: EventBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse('invalid JSON', 400, req);
  }

  if (!body || !body.event_type) {
    return errorResponse('event_type is required', 400, req);
  }

  console.log(`[dispatch] received event_type=${body.event_type}`);

  try {
    let results: ExecutionResult[] = [];
    switch (body.event_type) {
      case 'status_change':
        results = await handleStatusChange(body);
        break;
      case 'cron_tick':
        results = await handleCronTick(body);
        break;
      case 'inbound_message':
        results = await handleInboundMessage(body);
        break;
      case 'manual':
        results = await handleManual(body);
        break;
      default:
        return errorResponse(`unknown event_type: ${(body as { event_type: string }).event_type}`, 400, req);
    }

    return jsonResponse({
      success: true,
      event_type: body.event_type,
      executions: results.length,
      results,
    }, 200, req);
  } catch (err) {
    console.error('[dispatch] unhandled error:', err);
    return errorResponse((err as Error).message || 'internal error', 500, req);
  }
});
