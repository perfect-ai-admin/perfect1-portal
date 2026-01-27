import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        const {
            businessName,
            industry,
            style,
            tagline,
            vibe,
            colorScheme
        } = payload;

        if (!businessName || !industry || !style) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Extract hex colors from color scheme
        const colors = colorScheme?.colors || [];

        // Create LogoProject
        const project = await base44.entities.LogoProject.create({
            user_id: user.id,
            source_form: 'LogoCreator',
            brand_name: businessName,
            business_type: industry,
            style: style,
            slogan: tagline || null,
            icon_hint: vibe || null,
            colors: colors,
            image_width: 1024,
            image_height: 1024,
            status: 'draft'
        });

        return Response.json({
            ok: true,
            project_id: project.id,
            message: 'Project created successfully'
        });
    } catch (error) {
        console.error('createLogoProjectFromLogoCreator error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});