import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }

        const payload = await req.json();
        const base44 = createClientFromRequest(req);

        // Validate required fields
        if (!payload.name || !payload.phone) {
            return Response.json({ error: 'Name and phone are required' }, { status: 400 });
        }

        // Create lead using service role to bypass RLS (Row Level Security)
        const lead = await base44.asServiceRole.entities.Lead.create({
            name: payload.name,
            phone: payload.phone,
            email: payload.email,
            profession: payload.profession,
            source_page: payload.source_page || 'דף נחיתה - פתיחת עוסק פטור',
            status: 'new',
            interaction_type: payload.interaction_type || 'form',
            priority: 'medium',
            created_date: new Date().toISOString()
        });

        return Response.json({ success: true, lead });
    } catch (error) {
        console.error('Error submitting lead:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});