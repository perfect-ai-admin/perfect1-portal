// FINBOT Webhook Handler (section 5.1.3)
// Handles real-time events from FINBOT API

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // Verify webhook signature (security)
    const signature = req.headers.get('X-FINBOT-Signature');
    const webhookSecret = Deno.env.get('FINBOT_WEBHOOK_SECRET');
    
    if (!signature || !webhookSecret) {
      return Response.json({ error: 'Missing signature' }, { status: 401 });
    }

    const body = await req.text();
    
    // Verify signature using crypto
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureValid = await crypto.subtle.verify(
      'HMAC',
      key,
      hexToBuffer(signature),
      encoder.encode(body)
    );

    if (!signatureValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const base44 = createClientFromRequest(req);

    // Handle different webhook events
    switch (event.event_type) {
      case 'invoice.paid':
        await handleInvoicePaid(base44, event.payload);
        break;
      
      case 'document.processed':
        await handleDocumentProcessed(base44, event.payload);
        break;
      
      case 'bank.synced':
        await handleBankSynced(base44, event.payload);
        break;
      
      case 'vat.submitted':
        await handleVATSubmitted(base44, event.payload);
        break;
      
      case 'error.occurred':
        await handleError(base44, event.payload);
        break;
      
      default:
        console.log('Unknown event type:', event.event_type);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleInvoicePaid(base44, payload) {
  const { invoice_id, amount, payment_date, payment_method } = payload;
  
  // Update invoice status in database
  // Trigger celebration if goal met
  // Send notification to user
  
  console.log(`Invoice ${invoice_id} paid: ₪${amount} via ${payment_method}`);
  
  // Example: Create notification
  // await base44.asServiceRole.entities.Notification.create({
  //   type: 'invoice_paid',
  //   message: `חשבונית ${invoice_id} שולמה בסך ₪${amount}`,
  //   data: payload
  // });
}

async function handleDocumentProcessed(base44, payload) {
  const { document_id, ocr_result, confidence_score } = payload;
  
  console.log(`Document ${document_id} processed with ${confidence_score}% confidence`);
  
  // Store OCR results
  // Display to user for review
}

async function handleBankSynced(base44, payload) {
  const { account_id, new_transactions_count } = payload;
  
  console.log(`Bank account ${account_id} synced: ${new_transactions_count} new transactions`);
  
  // Refresh transaction list
  // Update cash flow calculations
}

async function handleVATSubmitted(base44, payload) {
  const { period, submission_id, status } = payload;
  
  console.log(`VAT report for ${period} submitted: ${status}`);
  
  // Update compliance status
  // Confirm submission to user
}

async function handleError(base44, payload) {
  const { error_code, error_message, affected_resource } = payload;
  
  console.error(`FINBOT Error ${error_code}: ${error_message}`);
  
  // Display error notification
  // Trigger support flow if critical
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}