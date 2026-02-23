import { base44 } from '@/api/base44Client';

// Track phone clicks - saves lead to CRM
export const trackPhoneClick = async (phoneNumber, sourcePage = window.location.pathname) => {
  try {
    await base44.entities.Lead.create({
      name: 'לקוח שחייג (לא מילא טופס)',
      phone: phoneNumber,
      source_page: sourcePage,
      interaction_type: 'phone_click',
      status: 'new',
      notes: 'לקוח לחץ על כפתור חיוג'
    });
  } catch (err) {
    console.error('Failed to track phone click:', err);
  }
};

// Track WhatsApp clicks - analytics only, NO lead creation
// Lead creation happens only when the user actually sends a WhatsApp message
// (handled by greenApiWebhook on the server side)
export const trackWhatsAppClick = async (phoneNumber, sourcePage = window.location.pathname) => {
  console.log('WhatsApp click tracked (analytics only):', sourcePage);
};

// Helper to add tracking to phone links
export const addPhoneTracking = (phoneNumber) => {
  return {
    onClick: () => trackPhoneClick(phoneNumber),
    href: `tel:${phoneNumber}`
  };
};

// Helper for WhatsApp links - NO lead creation
export const addWhatsAppTracking = (phoneNumber, message = '') => {
  return {
    onClick: () => trackWhatsAppClick(phoneNumber),
    href: `https://wa.me/972${phoneNumber.replace(/^0/, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`,
    target: '_blank',
    rel: 'noopener noreferrer'
  };
};