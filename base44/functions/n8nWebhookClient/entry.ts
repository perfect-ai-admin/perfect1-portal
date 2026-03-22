/**
 * N8N Webhook Integration - Centralized system for sending all platform events to n8n
 */

const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL') || '';

export const n8nWebhookClient = {
  async sendEvent(eventType, data, userId = null) {
    if (!N8N_WEBHOOK_URL) {
      console.warn('N8N_WEBHOOK_URL not configured');
      return null;
    }

    try {
      const payload = {
        timestamp: new Date().toISOString(),
        eventType,
        userId,
        data,
        source: 'perfect-one-app'
      };

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`N8N webhook error: ${response.status}`);
        return null;
      }

      console.log(`✅ Event sent to n8n: ${eventType}`);
      return await response.json();
    } catch (error) {
      console.error('N8N webhook error:', error.message);
      return null;
    }
  },

  async presentationCreated(userId, presentationData) {
    return this.sendEvent('presentation.created', presentationData, userId);
  },

  async presentationCompleted(userId, presentationData) {
    return this.sendEvent('presentation.completed', presentationData, userId);
  },

  async landingPageCreated(userId, landingPageData) {
    return this.sendEvent('landing_page.created', landingPageData, userId);
  },

  async landingPagePublished(userId, landingPageData) {
    return this.sendEvent('landing_page.published', landingPageData, userId);
  },

  async logoCreated(userId, logoData) {
    return this.sendEvent('logo.created', logoData, userId);
  },

  async leadSubmitted(userEmail, leadData) {
    return this.sendEvent('lead.submitted', leadData, userEmail);
  },

  async userAction(userId, action, metadata) {
    return this.sendEvent('user.action', { action, metadata }, userId);
  }
};