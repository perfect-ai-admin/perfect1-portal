import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const { project, variation_mode } = await req.json();
        
        if (!project) {
            return Response.json({ error: 'Project required' }, { status: 400 });
        }

        const {
            brand_name,
            business_type,
            style,
            slogan,
            icon_hint,
            colors
        } = project;

        let prompt = `Create a clean professional vector-style logo for ${brand_name}, a ${business_type}. Style: ${style}. Minimal, modern, flat design, centered composition. No mockups, no background texture, no 3D effects. Include a simple icon + wordmark layout.`;

        if (colors && colors.length > 0) {
            prompt += ` Use these brand colors: ${colors.join(', ')}.`;
        }

        if (slogan) {
            prompt += ` Include the slogan '${slogan}' small and readable below the logo.`;
        }

        if (icon_hint) {
            prompt += ` The icon should reflect: ${icon_hint}.`;
        }

        if (variation_mode) {
            prompt += ` Create a different logo concept while keeping the brand identity consistent.`;
        }

        prompt += ` High quality, professional, suitable for business cards and digital use.`;

        return Response.json({
            prompt,
            variation_mode
        });
    } catch (error) {
        console.error('buildLogoPrompt error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});