import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const { card_id, action } = await req.json();
    // Silent tracking - just log for now
    console.log(`Card click: card=${card_id}, action=${action}`);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: true }); // Always return success for tracking
  }
});