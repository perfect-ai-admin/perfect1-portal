import { base44 } from '@/api/base44Client';

// Track phone clicks
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

// Track WhatsApp clicks
export const trackWhatsAppClick = async (phoneNumber, sourcePage = window.location.pathname) => {
  try {
    await base44.entities.Lead.create({
      name: 'לקוח שפתח וואטסאפ (לא מילא טופס)',
      phone: phoneNumber,
      source_page: sourcePage,
      interaction_type: 'whatsapp_click',
      status: 'new',
      notes: 'לקוח לחץ על כפתור וואטסאפ'
    });
  } catch (err) {
    console.error('Failed to track WhatsApp click:', err);
  }
};

// Helper to add tracking to links
export const addPhoneTracking = (phoneNumber) => {
  return {
    onClick: () => trackPhoneClick(phoneNumber),
    href: `tel:${phoneNumber}`
  };
};

export const addWhatsAppTracking = (phoneNumber, message = '') => {
  return {
    onClick: () => trackWhatsAppClick(phoneNumber),
    href: `https://wa.me/972${phoneNumber.replace(/^0/, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`,
    target: '_blank',
    rel: 'noopener noreferrer'
  };
};