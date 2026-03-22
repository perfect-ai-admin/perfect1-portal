import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    // Don't add theme/folder - let Gamma use defaults

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
      console.error('📤 Payload sent:', JSON.stringify(payload, null, 2));
      
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

    // Poll for completion (Gamma API is async)
    let presentationUrl = null;
    let attempts = 0;
    const maxAttempts = 120; // 120 * 1 second = 2 minutes max

    console.log(`⏳ Starting polling for generation ${generationId}...`);

    while (attempts < maxAttempts && !presentationUrl) {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
        console.log(`📊 Poll #${attempts}:`, JSON.stringify(statusData, null, 2));

        if (statusData.status === 'completed') {
          // Try different URL field names that Gamma might use
          presentationUrl = statusData.gammaUrl || statusData.url || statusData.presentationUrl || statusData.outputUrl;
          
          // Get the PDF export URL if available
          const exportUrl = statusData.exportUrl || null;
          
          console.log('✅ Full status object:', JSON.stringify(statusData, null, 2));
          console.log('✅ All available fields:', Object.keys(statusData));
          console.log('✅ gammaUrl field:', statusData.gammaUrl);
          console.log('✅ exportUrl (PDF):', exportUrl);
          console.log('✅ Final URL extracted:', presentationUrl);
          
          if (!presentationUrl) {
            console.warn('⚠️ No URL found in response. Full object:', statusData);
          }

          // Store exportUrl for later use
          if (exportUrl) {
            presentationUrl = presentationUrl; // keep gamma URL too
            // We'll return both URLs
            return Response.json({
              success: true,
              presentationUrl,
              pdfUrl: exportUrl,
              generationId,
              message: 'המצגה שלך נוצרה בהצלחה!'
            });
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
      throw new Error(`Gamma generation timed out after ${maxAttempts} attempts (${maxAttempts}s)`);
    }

    console.log('📤 Final response:', {
      success: true,
      presentationUrl,
      presentationUrlType: typeof presentationUrl,
      generationId,
      message: 'המצגה שלך נוצרה בהצלחה!'
    });

    return Response.json({
      success: true,
      presentationUrl,
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