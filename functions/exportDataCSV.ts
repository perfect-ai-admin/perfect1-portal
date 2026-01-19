import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all entities related to the user
    const [leads, goals, userGoals, salesInteractions, salesMetrics, payments] = await Promise.all([
      base44.entities.Lead.filter({ created_by: user.email }).catch(() => []),
      base44.entities.Goal.list().catch(() => []),
      base44.entities.UserGoal.filter({ created_by: user.email }).catch(() => []),
      base44.entities.SalesInteraction.filter({ created_by: user.email }).catch(() => []),
      base44.entities.SalesMetric.filter({ created_by: user.email }).catch(() => []),
      base44.entities.Payment.filter({ created_by: user.email }).catch(() => [])
    ]);

    // Create CSV content
    let csv = '';

    // Leads section
    if (leads.length > 0) {
      csv += 'LEADS\n';
      csv += 'ID,Name,Phone,Email,Status,Created Date\n';
      leads.forEach(lead => {
        csv += `"${lead.id}","${lead.name || ''}","${lead.phone || ''}","${lead.email || ''}","${lead.status || ''}","${lead.created_date || ''}"\n`;
      });
      csv += '\n\n';
    }

    // Goals section
    if (userGoals.length > 0) {
      csv += 'GOALS\n';
      csv += 'ID,Title,Description,Status,Created Date\n';
      userGoals.forEach(goal => {
        csv += `"${goal.id}","${goal.title || ''}","${(goal.description || '').replace(/"/g, '""')}","${goal.status || ''}","${goal.created_date || ''}"\n`;
      });
      csv += '\n\n';
    }

    // Sales Interactions section
    if (salesInteractions.length > 0) {
      csv += 'SALES INTERACTIONS\n';
      csv += 'ID,Date,Channel,Outcome,Notes,Created Date\n';
      salesInteractions.forEach(interaction => {
        csv += `"${interaction.id}","${interaction.date || ''}","${interaction.channel || ''}","${interaction.outcome || ''}","${(interaction.notes || '').replace(/"/g, '""')}","${interaction.created_date || ''}"\n`;
      });
      csv += '\n\n';
    }

    // Sales Metrics section
    if (salesMetrics.length > 0) {
      csv += 'SALES METRICS\n';
      csv += 'ID,Period,Period Date,Total Interactions,Close Rate,Created Date\n';
      salesMetrics.forEach(metric => {
        csv += `"${metric.id}","${metric.period || ''}","${metric.period_date || ''}","${metric.total_interactions || 0}","${metric.close_rate || 0}","${metric.created_date || ''}"\n`;
      });
      csv += '\n\n';
    }

    // Payments section
    if (payments.length > 0) {
      csv += 'PAYMENTS\n';
      csv += 'ID,Amount,Status,Created Date\n';
      payments.forEach(payment => {
        csv += `"${payment.id}","${payment.amount || 0}","${payment.status || ''}","${payment.created_date || ''}"\n`;
      });
    }

    // Create blob and return as file
    const encoder = new TextEncoder();
    const csvBytes = encoder.encode(csv);
    
    return new Response(csvBytes, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=export.csv'
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: 'Export failed' }, { status: 500 });
  }
});