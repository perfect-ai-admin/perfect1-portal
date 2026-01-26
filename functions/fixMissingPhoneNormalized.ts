import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * תיקון חד-פעמי: מוסיף phone_normalized לכל ה-CRMLeads שחסר להם
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Admin only' }, { status: 403 });
        }

        // שליפת כל הלידים
        const allLeads = await base44.asServiceRole.entities.CRMLead.list();
        
        console.log('📊 Total leads:', allLeads.length);
        
        const needsFixing = allLeads.filter(lead => !lead.phone_normalized && lead.phone);
        
        console.log('🔧 Leads missing phone_normalized:', needsFixing.length);
        
        const results = {
            total: allLeads.length,
            fixed: 0,
            skipped: 0,
            errors: []
        };

        for (const lead of needsFixing) {
            try {
                const normalized = normalizePhoneNumber(lead.phone);
                
                if (normalized) {
                    await base44.asServiceRole.entities.CRMLead.update(lead.id, {
                        phone_normalized: normalized
                    });
                    results.fixed++;
                    console.log('✅ Fixed lead:', lead.id, normalized);
                } else {
                    results.skipped++;
                    console.warn('⚠️ Could not normalize:', lead.phone);
                }
            } catch (err) {
                results.errors.push({ lead_id: lead.id, error: err.message });
                console.error('❌ Error fixing lead:', lead.id, err.message);
            }
        }

        return Response.json(results);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function normalizePhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = phone.toString().replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '972' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('972')) {
        cleaned = '972' + cleaned;
    }
    return cleaned;
}