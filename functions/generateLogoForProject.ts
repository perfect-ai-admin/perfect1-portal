import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { project_id, variation_mode } = await req.json();

        if (!project_id) {
            return Response.json({ error: 'project_id required' }, { status: 400 });
        }

        // Load project
        const project = await base44.entities.LogoProject.get(project_id);
        if (!project) {
            return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
        }

        if (project.user_id !== user.id) {
            return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
        }

        // Check if already generating
        if (project.status === 'generating') {
            return Response.json({ error: 'ALREADY_GENERATING' }, { status: 400 });
        }

        // Set generating state
        await base44.entities.LogoProject.update(project_id, { status: 'generating' });

        // Reserve credit
        const creditRes = await base44.functions.invoke('reserveCredit', { project_id });
        if (!creditRes.ok) {
            await base44.entities.LogoProject.update(project_id, { status: 'failed' });
            return Response.json({ error: creditRes.error || 'NO_CREDITS' }, { status: 400 });
        }

        // Build prompt
        const promptRes = await base44.functions.invoke('buildLogoPrompt', {
            project,
            variation_mode: variation_mode || false
        });
        const prompt = promptRes.prompt;

        // Call Stockimg API
        const apiRes = await base44.functions.invoke('callStockimgLogo', {
            prompt: prompt,
            colors: project.colors,
            width: project.image_width || 1024,
            height: project.image_height || 1024
        });

        // Handle NSFW
        if (apiRes.error === 'NSFW') {
            await base44.entities.LogoGeneration.create({
                project_id: project_id,
                user_id: user.id,
                prompt_used: prompt,
                colors_used: project.colors,
                nsfw_flag: true,
                status: 'failed',
                error_message: 'NSFW flagged by safety checker'
            });

            await base44.functions.invoke('refundCredit', {
                project_id: project_id,
                reason: 'nsfw_flagged'
            });

            await base44.entities.LogoProject.update(project_id, { status: 'ready' });

            return Response.json({ 
                error: 'NSFW',
                message: 'Could not generate this concept. Try different wording.'
            }, { status: 400 });
        }

        // Handle API errors
        if (!apiRes.ok || apiRes.error) {
            const errorMsg = apiRes.error || 'API call failed';
            
            await base44.entities.LogoGeneration.create({
                project_id: project_id,
                user_id: user.id,
                prompt_used: prompt,
                colors_used: project.colors,
                nsfw_flag: false,
                status: 'failed',
                error_message: `API Error: ${errorMsg}`
            });

            await base44.functions.invoke('refundCredit', {
                project_id: project_id,
                reason: errorMsg === 'MISSING_URL' ? 'missing_url' : 'api_failed'
            });

            await base44.entities.LogoProject.update(project_id, { status: 'ready' });

            return Response.json({ 
                error: 'GENERATION_FAILED',
                message: `Generation failed: ${errorMsg}`
            }, { status: 400 });
        }

        // Success: create generation record
        const generation = await base44.entities.LogoGeneration.create({
            project_id: project_id,
            user_id: user.id,
            prompt_used: prompt,
            colors_used: project.colors,
            seed: apiRes.seed || null,
            external_url: apiRes.image_url,
            content_type: apiRes.content_type,
            width: apiRes.width,
            height: apiRes.height,
            timings: apiRes.timings || null,
            nsfw_flag: false,
            status: 'generated'
        });

        // Update project to ready
        await base44.entities.LogoProject.update(project_id, { status: 'ready' });

        // Get updated credits
        const accountRes = await base44.functions.invoke('getCredits', {});

        return Response.json({
            ok: true,
            generation_id: generation.id,
            image_url: apiRes.image_url,
            seed: apiRes.seed,
            credits_left: accountRes.logo_credits,
            project_status: 'ready'
        });
    } catch (error) {
        console.error('generateLogoForProject error:', error);
        try {
            const projectId = (await req.json()).project_id;
            if (projectId) {
                await base44.entities.LogoProject.update(projectId, { status: 'failed' });
            }
        } catch {}
        return Response.json({ error: error.message }, { status: 500 });
    }
});