import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { formData } = body;
    if (!formData || !formData.fullName) {
      return Response.json({ error: 'Missing form data' }, { status: 400 });
    }

    // Build slug - use only ASCII-safe chars
    const baseName = (formData.fullName || 'card')
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Simple slug - add timestamp for uniqueness
    const slugBase = baseName || 'card';
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    // Clean phone
    const cleanPhone = (formData.phone || '').replace(/[^0-9+]/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') 
      ? '972' + cleanPhone.slice(1) 
      : cleanPhone;

    // Build services array
    const services = [formData.service1, formData.service2, formData.service3].filter(Boolean);

    // Upload logo if provided
    let logoUrl = null;
    if (formData.logoDataUrl) {
      try {
        const logoRes = await fetch(formData.logoDataUrl);
        const logoBlob = await logoRes.blob();
        const uploadResult = await base44.integrations.Core.UploadFile({ file: logoBlob });
        logoUrl = uploadResult.file_url;
      } catch (e) {
        console.log('Logo upload failed, continuing without:', e.message);
      }
    }

    // Upload cover if provided
    let coverUrl = null;
    if (formData.coverDataUrl) {
      try {
        const coverRes = await fetch(formData.coverDataUrl);
        const coverBlob = await coverRes.blob();
        const coverUpload = await base44.integrations.Core.UploadFile({ file: coverBlob });
        coverUrl = coverUpload.file_url;
      } catch (e) {
        console.log('Cover upload failed, continuing without:', e.message);
      }
    }

    // Build VCF content
    const vcfContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${formData.fullName}`,
      formData.profession ? `TITLE:${formData.profession}` : '',
      cleanPhone ? `TEL;TYPE=CELL:${cleanPhone}` : '',
      formData.email ? `EMAIL:${formData.email}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\r\n');

    // Upload VCF from memory
    const vcfEncoder = new TextEncoder();
    const vcfBytes = vcfEncoder.encode(vcfContent);
    const vcfFile = new File([vcfBytes], `${slug}.vcf`, { type: 'text/vcard' });
    const vcfUpload = await base44.integrations.Core.UploadFile({ file: vcfFile });
    const vcfUrl = vcfUpload.file_url;

    // Generate QR Code using external API
    const domain = 'one-pai.com';
    const publicUrl = `https://${domain}/DigitalCard?slug=${slug}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicUrl)}&format=png`;
    
    let qrImageUrl = qrApiUrl; // fallback: use the API URL directly
    try {
      const qrRes = await fetch(qrApiUrl);
      if (qrRes.ok) {
        const qrBlob = await qrRes.blob();
        const qrFile = new File([qrBlob], `qr_${slug}.png`, { type: 'image/png' });
        const qrUpload = await base44.integrations.Core.UploadFile({ file: qrFile });
        qrImageUrl = qrUpload.file_url;
      }
    } catch (e) {
      console.log('QR upload failed, using API URL:', e.message);
    }

    // Create DigitalCard entity
    const cardData = {
      user_id: user.id,
      full_name: formData.fullName,
      profession: formData.profession || '',
      presentation_style: formData.presentationStyle || 'name_role',
      services,
      phone: cleanPhone,
      whatsapp: whatsappPhone,
      email: formData.email || '',
      social_networks: formData.socialNetworks || [],
      logo_url: logoUrl || '',
      cover_image_url: coverUrl || '',
      preferred_style: formData.preferredStyle || 'professional',
      primary_color: '#1E3A5F',
      primary_usage: formData.primaryUsage || '',
      slug,
      public_url: publicUrl,
      qr_image_url: qrImageUrl,
      vcf_url: vcfUrl,
      status: 'draft',
    };

    const card = await base44.entities.DigitalCard.create(cardData);

    return Response.json({
      success: true,
      card_id: card.id,
      slug,
      public_url: publicUrl,
      qr_image_url: qrImageUrl,
      vcf_url: vcfUrl,
    });
  } catch (error) {
    console.error('createDigitalCard error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});