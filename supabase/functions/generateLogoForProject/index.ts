// Migrated from Base44: generateLogoForProject
// Generate a new logo using AI (DALL-E 3) for a project

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { variation_mode, businessName, industry, style, tagline, vibe, colorScheme } = body;
    let { project_id } = body;

    let project: Record<string, unknown>;

    if (!project_id) {
      // No project_id provided — create a new project first
      if (!businessName) return errorResponse('businessName is required when project_id is not provided', 400);

      const projectName = businessName;
      const description = [industry, style, tagline, vibe].filter(Boolean).join(', ');

      const { data: newProject, error: createErr } = await supabaseAdmin
        .from('logo_projects')
        .insert({
          customer_id: customer.id,
          name: projectName,
          description: description || projectName,
          style: style || 'modern',
          color_scheme: colorScheme ? JSON.stringify(colorScheme) : null,
          status: 'active'
        })
        .select()
        .single();

      if (createErr || !newProject) {
        return errorResponse(createErr?.message || 'Failed to create project');
      }

      project = newProject;
      project_id = newProject.id;
    } else {
      // project_id provided — verify ownership
      const { data: existingProject, error: projectErr } = await supabaseAdmin
        .from('logo_projects')
        .select('*')
        .eq('id', project_id)
        .eq('customer_id', customer.id)
        .single();

      if (projectErr || !existingProject) {
        return errorResponse('Project not found or access denied', 404);
      }

      project = existingProject;
    }

    // Check customer has enough credits
    if ((customer.credits_balance || 0) < 1) {
      return errorResponse('Insufficient credits', 402);
    }

    // Generate image via DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Create a professional business logo: ${project.description || project.name}. Style: modern, clean, professional.`,
      n: 1,
      size: '1024x1024'
    });

    const imageUrl = response.data[0].url;
    if (!imageUrl) return errorResponse('Image generation failed — no URL returned');

    // Insert generation record
    const { data: generation, error: insertErr } = await supabaseAdmin
      .from('logo_generations')
      .insert({
        project_id,
        image_url: imageUrl,
        status: 'generated',
        is_variation: variation_mode || false
      })
      .select()
      .single();

    if (insertErr) return errorResponse(insertErr.message);

    // Deduct 1 credit from customer
    const { error: creditErr } = await supabaseAdmin
      .from('customers')
      .update({ credits_balance: (customer.credits_balance || 0) - 1 })
      .eq('id', customer.id);

    if (creditErr) {
      console.error('generateLogoForProject: credit deduction failed:', creditErr.message);
    }

    // Log credit usage
    await supabaseAdmin.from('credit_ledger').insert({
      customer_id: customer.id,
      event_type: 'usage',
      amount: -1,
      reason: 'logo_generation',
      reference_id: generation.id
    }).catch((e: Error) => console.warn('credit_ledger insert failed:', e.message));

    return jsonResponse({ ok: true, project_id, generation, image_url: imageUrl });
  } catch (error) {
    console.error('generateLogoForProject error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
