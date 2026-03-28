// Migrated from Base44: uploadFile
// Upload a file to Supabase Storage — replaces base44.integrations.Core.UploadFile

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) return errorResponse('No file provided', 400);

    const fileName = `${crypto.randomUUID()}_${file.name}`;

    const { data, error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(fileName, file, { contentType: file.type });

    if (error) return errorResponse(error.message);

    const { data: urlData } = supabaseAdmin.storage.from('uploads').getPublicUrl(fileName);

    return jsonResponse({ file_url: urlData.publicUrl });
  } catch (error) {
    console.error('uploadFile error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
