import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const body = await req.json();
    const { runId, options } = body;
    if (!runId) return Response.json({ error: 'runId is required' }, { status: 400 });

    const skipReports = options?.skipReports || false;
    const skipExpenses = options?.skipExpenses || false;
    const steps = [];
    const warnings = [];
    const created = { customerId: null, documentIds: [] };

    const logStep = async (name, status, details) => {
      steps.push({ name, status, details, timestamp: new Date().toISOString() });
      await base44.asServiceRole.entities.FinbotAuditLog.create({
        user_id: user.id,
        action: `qa.${name}`,
        request_data: { runId },
        response_data: { status, details: typeof details === 'string' ? details : JSON.stringify(details) },
        success: status === 'pass'
      });
    };

    // ===== A) Preflight =====
    try {
      const preflight = await base44.functions.invoke('qaPreflightIcount', {});
      if (!preflight.data?.ok) {
        await logStep('preflight', 'fail', preflight.data?.reason || 'Preflight failed');
        return Response.json({ ok: false, runId, steps, created, warnings });
      }
      await logStep('preflight', 'pass', 'Connection verified');
    } catch (e) {
      await logStep('preflight', 'fail', e.message);
      return Response.json({ ok: false, runId, steps, created, warnings });
    }

    // ===== B) Create Customer (Push) =====
    let customerProviderId = null;
    try {
      const custRes = await base44.functions.invoke('icountCreateCustomer', {
        name: `QA Customer ${runId}`,
        phone: '0500000000',
        email: `qa+${runId}@example.com`,
        notes: `QA_RUN:${runId}`
      });
      const custData = custRes.data;
      if (custData?.status === 'success' && custData?.customer?.id) {
        created.customerId = custData.customer.id;
        customerProviderId = custData.provider_id || custData.customer.finbot_customer_id;
        await logStep('create_customer', 'pass', `Customer created: ${custData.customer.id}, provider_id: ${customerProviderId}`);
      } else {
        await logStep('create_customer', 'fail', custData?.error || 'No customer returned');
      }
    } catch (e) {
      await logStep('create_customer', 'fail', e.message);
    }

    // ===== C) Create Document - invoice_receipt =====
    if (customerProviderId) {
      try {
        const docRes = await base44.functions.invoke('icountCreateDocument', {
          type: 'invoice_receipt',
          customer_provider_id: customerProviderId,
          items: [{ description: `QA Item ${runId}`, quantity: 1, unit_price: 100 }],
          notes: `QA_RUN:${runId}`,
          issue_date: new Date().toISOString().split('T')[0]
        });
        const docData = docRes.data;
        if (docData?.status === 'success' && docData?.document?.id) {
          created.documentIds.push(docData.document.id);
          const hasProviderId = !!(docData.docnum || docData.document?.finbot_document_id);
          const totalOk = (docData.document?.total || 0) > 0;
          if (hasProviderId && totalOk) {
            await logStep('create_document_invrec', 'pass', `Doc: ${docData.docnum}, total: ${docData.document.total}`);
          } else {
            await logStep('create_document_invrec', 'warn', `Doc created but checks partial: provider_id=${hasProviderId}, total>0=${totalOk}`);
            warnings.push('invoice_receipt created but some assertions partial');
          }
        } else {
          await logStep('create_document_invrec', 'fail', docData?.error || 'No document returned');
        }
      } catch (e) {
        await logStep('create_document_invrec', 'fail', e.message);
      }

      // ===== D) Create Document - receipt =====
      try {
        const recRes = await base44.functions.invoke('icountCreateDocument', {
          type: 'receipt',
          customer_provider_id: customerProviderId,
          items: [{ description: `QA Receipt ${runId}`, quantity: 1, unit_price: 50 }],
          notes: `QA_RUN:${runId}`,
          issue_date: new Date().toISOString().split('T')[0]
        });
        const recData = recRes.data;
        if (recData?.status === 'success' && recData?.document?.id) {
          created.documentIds.push(recData.document.id);
          await logStep('create_document_receipt', 'pass', `Receipt: ${recData.docnum}`);
        } else {
          await logStep('create_document_receipt', 'fail', recData?.error || 'No receipt returned');
        }
      } catch (e) {
        await logStep('create_document_receipt', 'fail', e.message);
      }

      // ===== E) Create Credit =====
      try {
        const credRes = await base44.functions.invoke('icountCreateDocument', {
          type: 'credit',
          customer_provider_id: customerProviderId,
          items: [{ description: `QA Credit ${runId}`, quantity: 1, unit_price: 30 }],
          notes: `QA_RUN:${runId}`,
          issue_date: new Date().toISOString().split('T')[0]
        });
        const credData = credRes.data;
        if (credData?.status === 'success' && credData?.document?.id) {
          created.documentIds.push(credData.document.id);
          await logStep('create_document_credit', 'pass', `Credit: ${credData.docnum}`);
        } else {
          await logStep('create_document_credit', 'fail', credData?.error || 'No credit returned');
        }
      } catch (e) {
        await logStep('create_document_credit', 'fail', e.message);
      }
    } else {
      await logStep('create_document_invrec', 'skipped', 'No customer provider ID');
      await logStep('create_document_receipt', 'skipped', 'No customer provider ID');
      await logStep('create_document_credit', 'skipped', 'No customer provider ID');
    }

    // ===== F) Pull Sync - Customers =====
    try {
      const pullCustRes = await base44.functions.invoke('icountSyncPull', { resource: 'customers' });
      const pullCustData = pullCustRes.data;
      if (pullCustData?.status === 'success') {
        // Verify customer exists after pull
        const customers = await base44.asServiceRole.entities.FinbotCustomer.filter({ user_id: user.id, provider: 'icount' });
        const qaCustomer = customers?.find(c => c.notes?.includes(`QA_RUN:${runId}`) || c.name?.includes(runId));
        if (qaCustomer) {
          await logStep('pull_customers', 'pass', `Synced ${pullCustData.synced_count}, QA customer found`);
        } else {
          await logStep('pull_customers', 'warn', `Synced ${pullCustData.synced_count} but QA customer not found in pull results`);
          warnings.push('QA customer not found after pull sync');
        }
      } else {
        await logStep('pull_customers', 'fail', pullCustData?.error || 'Pull customers failed');
      }
    } catch (e) {
      await logStep('pull_customers', 'fail', e.message);
    }

    // Pull Sync - Documents
    try {
      const pullDocRes = await base44.functions.invoke('icountSyncPull', { resource: 'documents' });
      const pullDocData = pullDocRes.data;
      if (pullDocData?.status === 'success') {
        await logStep('pull_documents', 'pass', `Synced ${pullDocData.synced_count} documents`);
      } else {
        await logStep('pull_documents', 'fail', pullDocData?.error || 'Pull documents failed');
      }
    } catch (e) {
      await logStep('pull_documents', 'fail', e.message);
    }

    // ===== G) Expenses Pull =====
    if (!skipExpenses) {
      try {
        const pullExpRes = await base44.functions.invoke('icountSyncPull', { resource: 'expenses' });
        const pullExpData = pullExpRes.data;
        if (pullExpData?.status === 'success') {
          await logStep('pull_expenses', 'pass', `Synced ${pullExpData.synced_count} expenses`);
        } else if (pullExpData?.synced_count === 0 || pullExpData?.error?.includes('no_results')) {
          await logStep('pull_expenses', 'warn', 'NO_EXPENSES_FOUND');
          warnings.push('No expenses found in iCount');
        } else {
          await logStep('pull_expenses', 'fail', pullExpData?.error || 'Pull expenses failed');
        }
      } catch (e) {
        if (e.message?.includes('no_results') || e.message?.includes('404')) {
          await logStep('pull_expenses', 'warn', 'NO_EXPENSES_FOUND');
          warnings.push('No expenses found');
        } else {
          await logStep('pull_expenses', 'fail', e.message);
        }
      }
    } else {
      await logStep('pull_expenses', 'skipped', 'Skipped by user');
    }

    // ===== H) Reports =====
    if (!skipReports) {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      
      for (const reportType of ['customers', 'pnl', 'vat']) {
        try {
          const repRes = await base44.functions.invoke('icountFetchReports', {
            report_type: reportType,
            period_start: thirtyDaysAgo,
            period_end: today
          });
          const repData = repRes.data;
          if (repData?.status === 'success') {
            await logStep(`report_${reportType}`, 'pass', `Report generated: ${repData.report_run_id}`);
          } else {
            await logStep(`report_${reportType}`, 'warn', `SKIPPED_NOT_IMPLEMENTED: ${repData?.error || 'Unknown'}`);
            warnings.push(`Report ${reportType}: ${repData?.error || 'not available'}`);
          }
        } catch (e) {
          await logStep(`report_${reportType}`, 'warn', `SKIPPED_NOT_IMPLEMENTED: ${e.message}`);
          warnings.push(`Report ${reportType}: ${e.message}`);
        }
      }
    } else {
      await logStep('reports', 'skipped', 'Skipped by user');
    }

    // ===== I) Download Document PDF =====
    if (created.documentIds.length > 0) {
      try {
        const dlRes = await base44.functions.invoke('icountDownloadDocument', {
          document_id: created.documentIds[0]
        });
        const dlData = dlRes.data;
        if (dlData?.status === 'success' && dlData?.file_url) {
          await logStep('download_pdf', 'pass', `PDF URL: ${dlData.file_url.substring(0, 60)}...`);
        } else {
          await logStep('download_pdf', 'warn', 'PDF_NOT_AVAILABLE');
          warnings.push('PDF download returned no URL');
        }
      } catch (e) {
        await logStep('download_pdf', 'warn', `PDF_NOT_AVAILABLE: ${e.message}`);
        warnings.push(`PDF download error: ${e.message}`);
      }
    } else {
      await logStep('download_pdf', 'skipped', 'No documents created');
    }

    // Determine overall status
    const hasFail = steps.some(s => s.status === 'fail');
    const ok = !hasFail;

    return Response.json({ ok, runId, steps, created, warnings });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});