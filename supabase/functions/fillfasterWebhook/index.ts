// fillfasterWebhook — Receives FillFaster webhook events and updates agreement status
// Public endpoint (no auth) — validates by matching submission_id in DB
// Events: submission_first_opened, submission_opened, submission_saved, submitted
// Idempotent: safe to receive same event multiple times
// Logs: every event saved to agreement_events table + status_history

import { supabaseAdmin, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const PDF_DOWNLOAD_TIMEOUT_MS = 15_000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { status: 200 });
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405);

  try {
    const body = await req.json();
    const eventName = body.event?.event_name;
    const eventTimestamp = body.event?.event_timestamp;
    const submissionId = body.submission_id;
    const formId = body.form_id;
    const formName = body.form_name;
    const userData = body.user_data || {};
    const inputData = body.inputData || {};
    const fileLink = body.submission_file_link;

    console.log('[fillfasterWebhook] Received |', JSON.stringify({
      event: eventName, submission_id: submissionId, form_id: formId,
      form_name: formName, timestamp: eventTimestamp, has_file_link: !!fileLink,
    }));

    if (!submissionId || !eventName) {
      console.warn('[AGREEMENT_ERROR] Missing required fields in webhook payload');
      return jsonResponse({ received: true, error: 'missing submission_id or event_name' }, 200);
    }

    // --- Find agreement by submission_id ---
    const { data: agreement, error: agErr } = await supabaseAdmin
      .from('agreements')
      .select('id, lead_id, status, signed_at')
      .eq('fillfaster_submission_id', submissionId)
      .single();

    if (agErr || !agreement) {
      console.warn('[fillfasterWebhook] No agreement found for submission:', submissionId);
      return jsonResponse({ received: true, matched: false });
    }

    const now = new Date().toISOString();

    // --- Save to agreement_events (audit trail, non-blocking) ---
    saveAgreementEvent(agreement.id, eventName, body);

    // --- Idempotency: skip if already in terminal state ---
    if (agreement.status === 'signed' && eventName !== 'submitted') {
      console.log('[fillfasterWebhook] Skipped — agreement already signed, event:', eventName);
      await logStatusHistory(agreement, submissionId, formId, eventName, 'skipped_already_signed');
      return jsonResponse({ received: true, matched: true, skipped: true });
    }
    if (agreement.status === 'signed' && eventName === 'submitted' && agreement.signed_at) {
      console.log('[fillfasterWebhook] Skipped — duplicate submitted event');
      await logStatusHistory(agreement, submissionId, formId, eventName, 'skipped_duplicate');
      return jsonResponse({ received: true, matched: true, skipped: true });
    }

    // --- Handle each event type ---
    switch (eventName) {
      case 'submission_first_opened': {
        console.log('[fillfasterWebhook] First opened | agreement:', agreement.id);
        await supabaseAdmin.from('agreements').update({
          status: 'opened',
          first_opened_at: now,
          webhook_data: body,
          updated_at: now,
        }).eq('id', agreement.id);

        if (agreement.lead_id) {
          await supabaseAdmin.from('leads').update({
            agreement_status: 'opened',
            updated_at: now,
          }).eq('id', agreement.lead_id);
        }
        break;
      }

      case 'submission_opened': {
        console.log('[fillfasterWebhook] Opened again | agreement:', agreement.id);
        await supabaseAdmin.from('agreements').update({
          last_opened_at: now,
          updated_at: now,
        }).eq('id', agreement.id);
        break;
      }

      case 'submission_saved': {
        console.log('[fillfasterWebhook] Draft saved | agreement:', agreement.id);
        break;
      }

      case 'submitted': {
        console.log('[fillfasterWebhook] SIGNED | agreement:', agreement.id);

        const updateData: Record<string, unknown> = {
          status: 'signed',
          signed_at: now,
          webhook_data: body,
          updated_at: now,
        };

        // --- Download and store signed PDF ---
        if (fileLink) {
          console.log('[fillfasterWebhook] Downloading PDF from:', fileLink);
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), PDF_DOWNLOAD_TIMEOUT_MS);

            const pdfRes = await fetch(fileLink, { signal: controller.signal });
            clearTimeout(timeout);

            if (pdfRes.ok) {
              const pdfBuffer = await pdfRes.arrayBuffer();
              const storagePath = `${agreement.lead_id || 'unknown'}/${submissionId}.pdf`;

              console.log('[fillfasterWebhook] Uploading PDF to storage:', storagePath, '| size:', pdfBuffer.byteLength);

              const { error: uploadErr } = await supabaseAdmin.storage
                .from('agreements')
                .upload(storagePath, pdfBuffer, {
                  contentType: 'application/pdf',
                  upsert: true,
                });

              if (!uploadErr) {
                const { data: urlData } = supabaseAdmin.storage
                  .from('agreements')
                  .getPublicUrl(storagePath);
                updateData.signed_pdf_url = urlData?.publicUrl || fileLink;
                console.log('[fillfasterWebhook] PDF stored successfully:', updateData.signed_pdf_url);
              } else {
                console.error('[AGREEMENT_ERROR] Storage upload failed:', uploadErr);
                updateData.signed_pdf_url = fileLink;
              }
            } else {
              console.error('[AGREEMENT_ERROR] PDF download HTTP error:', pdfRes.status);
              updateData.signed_pdf_url = fileLink;
            }
          } catch (pdfErr) {
            const errMsg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
            console.error('[AGREEMENT_ERROR] PDF processing error:', errMsg);
            updateData.signed_pdf_url = fileLink;
          }
        } else {
          console.warn('[AGREEMENT_ERROR] No file_link in submitted event');
        }

        await supabaseAdmin.from('agreements').update(updateData).eq('id', agreement.id);

        if (agreement.lead_id) {
          await supabaseAdmin.from('leads').update({
            agreement_status: 'signed',
            updated_at: now,
          }).eq('id', agreement.lead_id);
        }
        break;
      }

      default:
        console.log('[fillfasterWebhook] Unknown event:', eventName);
    }

    // --- Log to status_history ---
    await logStatusHistory(agreement, submissionId, formId, eventName, 'processed');

    return jsonResponse({ received: true, matched: true, event: eventName });

  } catch (error) {
    console.error('[AGREEMENT_ERROR] Webhook unhandled error:', error);
    return jsonResponse({ received: true, error: (error as Error).message }, 200);
  }
});

// Save every webhook event to agreement_events table
async function saveAgreementEvent(agreementId: string, eventName: string, payload: unknown) {
  try {
    await supabaseAdmin.from('agreement_events').insert({
      agreement_id: agreementId,
      event_name: eventName,
      payload,
      source: 'fillfaster',
    });
  } catch (err) {
    console.error('[AGREEMENT_ERROR] Failed to save agreement_event:', err);
  }
}

// Log to status_history for CRM timeline
async function logStatusHistory(
  agreement: { id: string; lead_id: string | null },
  submissionId: string,
  formId: string | undefined,
  eventName: string,
  result: string,
) {
  if (!agreement.lead_id) return;
  try {
    await supabaseAdmin.from('status_history').insert({
      entity_type: 'lead',
      entity_id: agreement.lead_id,
      new_status: `agreement_${eventName}`,
      change_reason: 'fillfaster_webhook',
      source: 'fillfaster',
      metadata: {
        agreement_id: agreement.id,
        submission_id: submissionId,
        form_id: formId,
        event_name: eventName,
        result,
      },
    });
  } catch (logErr) {
    console.error('[AGREEMENT_ERROR] Failed to log status_history:', logErr);
  }
}
