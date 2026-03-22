import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formData } = await req.json();

    // Analyze uploaded file if present
    let fileAnalysis = '';
    if (formData.uploadedFileUrl) {
      console.log('🔍 Analyzing uploaded file...');
      try {
        const analysisResponse = await base44.integrations.Core.InvokeLLM({
          prompt: "Analyze this file and extract key business insights, financial data, value propositions, and relevant information for a business presentation. Summarize the findings clearly.",
          file_urls: [formData.uploadedFileUrl],
          add_context_from_internet: false
        });
        
        fileAnalysis = typeof analysisResponse === 'string' ? analysisResponse : JSON.stringify(analysisResponse);
        console.log('✅ File analysis complete');
      } catch (err) {
        console.error('❌ File analysis failed:', err);
      }
    }

    // Build prompt for presentation
    let additionalInfo = '';
    if (formData.additionalDetails) {
        additionalInfo += `\nAdditional Details: ${formData.additionalDetails}\n`;
    }
    if (fileAnalysis) {
        additionalInfo += `\nInsights from uploaded file: ${fileAnalysis}\n`;
    }

    const inputText = `Create a professional ${formData.language === 'hebrew' ? 'Hebrew' : 'English'} business presentation for ${formData.businessName}.

Business: ${formData.businessName || ''}
Industry: ${formData.businessField || ''}
Description: ${formData.businessDescription || ''}

Problem: ${formData.painPoint || ''}
Solution: ${formData.solution || ''}

Unique advantages: ${(formData.uniqueAdvantage || []).join(', ')}
Why: ${formData.advantageExplanation || ''}

Value: ${formData.valueProposition || ''}

${additionalInfo}

Call to action: Contact Us`;

    console.log('🔵 Calling Gamma API...');

    const numCards = {
      'short': 7,
      'medium': 11,
      'full': 17
    }[formData.length || 'medium'];

    const payload = {
      inputText,
      textMode: 'generate',
      format: 'presentation',
      numCards,
      cardSplit: 'auto',
      exportAs: 'pdf',
      textOptions: {
        amount: 'detailed',
        tone: 'professional, persuasive',
        audience: 'business professionals',
        language: formData.language === 'hebrew' ? 'he' : 'en'
      },
      imageOptions: {
        source: 'aiGenerated',
        model: 'imagen-4-pro',
        style: 'photorealistic'
      }
    };

    const gammaResponse = await fetch('https://public-api.gamma.app/v1.0/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': Deno.env.get('GAMMA_API_KEY')
      },
      body: JSON.stringify(payload)
    });

    if (!gammaResponse.ok) {
      const errorText = await gammaResponse.text();
      console.error('❌ Gamma API Error:', gammaResponse.status, errorText);
      
      let errorMsg = `Gamma API Error ${gammaResponse.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const gammaData = await gammaResponse.json();
    console.log('✅ Gamma response:', JSON.stringify(gammaData));

    const generationId = gammaData.generationId;
    if (!generationId) {
      throw new Error('No generationId returned from Gamma API');
    }

    // Poll for completion - use 5 second intervals as recommended by Gamma docs
    let presentationUrl = null;
    let pdfExportUrl = null;
    let attempts = 0;
    const maxAttempts = 60; // 60 * 5 seconds = 5 minutes max
    const pollInterval = 5000; // 5 seconds as recommended

    console.log(`⏳ Starting polling for generation ${generationId}...`);

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;

      try {
        const statusResponse = await fetch(`https://public-api.gamma.app/v1.0/generations/${generationId}`, {
          method: 'GET',
          headers: {
            'X-API-KEY': Deno.env.get('GAMMA_API_KEY')
          }
        });

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.error(`❌ Status check failed (${statusResponse.status}):`, errorText);
          continue;
        }

        const statusData = await statusResponse.json();
        console.log(`📊 Poll #${attempts}: status=${statusData.status}, keys=${Object.keys(statusData).join(',')}`);

        if (statusData.status === 'completed') {
          presentationUrl = statusData.gammaUrl || statusData.url || statusData.presentationUrl || statusData.outputUrl;
          pdfExportUrl = statusData.exportUrl || null;
          
          console.log('✅ gammaUrl:', presentationUrl);
          console.log('✅ exportUrl (PDF):', pdfExportUrl);
          
          // If exportAs was requested but exportUrl isn't ready yet, poll a few more times
          if (!pdfExportUrl && presentationUrl) {
            console.log('⏳ PDF export not ready yet, polling a few more times...');
            for (let extraPoll = 0; extraPoll < 6; extraPoll++) {
              await new Promise(resolve => setTimeout(resolve, 5000));
              try {
                const extraResponse = await fetch(`https://public-api.gamma.app/v1.0/generations/${generationId}`, {
                  method: 'GET',
                  headers: { 'X-API-KEY': Deno.env.get('GAMMA_API_KEY') }
                });
                if (extraResponse.ok) {
                  const extraData = await extraResponse.json();
                  console.log(`📊 Extra poll #${extraPoll + 1}: exportUrl=${extraData.exportUrl || 'null'}`);
                  if (extraData.exportUrl) {
                    pdfExportUrl = extraData.exportUrl;
                    break;
                  }
                }
              } catch (e) {
                console.error('Extra poll error:', e.message);
              }
            }
          }
          
          break;
        }

        if (statusData.status === 'failed') {
          throw new Error(`Gamma generation failed: ${statusData.error || 'Unknown error'}`);
        }
      } catch (pollError) {
        console.error(`❌ Poll error at attempt ${attempts}:`, pollError.message);
        if (attempts >= maxAttempts) throw pollError;
      }
    }

    if (!presentationUrl) {
      throw new Error(`Gamma generation timed out after ${maxAttempts * 5} seconds`);
    }

    console.log('📤 Final response:', { presentationUrl, pdfUrl: pdfExportUrl, generationId });

    return Response.json({
      success: true,
      presentationUrl,
      pdfUrl: pdfExportUrl,
      generationId,
      message: 'המצגה שלך נוצרה בהצלחה!'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({
      error: error.message,
      details: 'Failed to generate presentation'
    }, { status: 500 });
  }
});