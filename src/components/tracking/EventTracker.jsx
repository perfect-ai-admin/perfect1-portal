// Event Tracker - שולח אירועים ל-Google Tag Manager ו-Facebook Pixel

export const trackEvent = (eventName, eventParams = {}) => {
  // Google Tag Manager
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventParams
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    // המרת שם האירוע לפורמט FB
    const fbEventMap = {
      'lead_submitted': 'Lead',
      'phone_click': 'Contact',
      'whatsapp_click': 'Contact',
      'cta_click': 'InitiateCheckout',
      'form_view': 'ViewContent',
      'purchase': 'Purchase',
      'begin_checkout': 'InitiateCheckout',
      'subscription_purchase': 'Subscribe'
    };

    const fbEvent = fbEventMap[eventName] || 'CustomEvent';
    window.fbq('track', fbEvent, eventParams);
  }

  console.log('📊 Event tracked:', eventName, eventParams);
};

// אירועים ספציפיים
export const trackLeadSubmit = (leadData) => {
  trackEvent('lead_submitted', {
    source_page: leadData.source_page,
    profession: leadData.profession || 'not_specified',
    value: 1,
    currency: 'ILS'
  });
};

export const trackPhoneClick = (source) => {
  trackEvent('phone_click', {
    source: source,
    contact_method: 'phone'
  });
};

export const trackWhatsAppClick = (source, message) => {
  trackEvent('whatsapp_click', {
    source: source,
    contact_method: 'whatsapp',
    message_template: message ? 'custom' : 'default'
  });
};

export const trackCTAClick = (ctaName, location) => {
  trackEvent('cta_click', {
    cta_name: ctaName,
    location: location
  });
};

export const trackFormView = (formType, pageName) => {
  trackEvent('form_view', {
    form_type: formType,
    page_name: pageName
  });
};

// === אירועי סליקה והמרה ===

// התחלת תהליך תשלום (לחיצה על "המשך לתשלום")
export const trackBeginCheckout = (product) => {
  trackEvent('begin_checkout', {
    product_name: product.name || '',
    product_type: product.product_type || product.type || 'one-time',
    value: product.price || 0,
    currency: 'ILS'
  });
};

// רכישה חד-פעמית שהושלמה בהצלחה
export const trackPurchase = (paymentData) => {
  trackEvent('purchase', {
    transaction_id: paymentData.paymentId || paymentData.transaction_id || '',
    product_name: paymentData.product_name || '',
    product_type: paymentData.product_type || 'one-time',
    value: paymentData.amount || 0,
    currency: 'ILS',
    payment_method: paymentData.payment_method || 'tranzila'
  });
};

// רכישת מנוי חודשי שהושלמה בהצלחה
export const trackSubscriptionPurchase = (paymentData) => {
  trackEvent('subscription_purchase', {
    transaction_id: paymentData.paymentId || paymentData.transaction_id || '',
    product_name: paymentData.product_name || '',
    tier_name: paymentData.tier_name || '',
    billing_cycle: paymentData.billing_cycle || 'monthly',
    value: paymentData.amount || 0,
    currency: 'ILS',
    is_recurring: paymentData.is_recurring || false,
    payment_method: paymentData.payment_method || 'tranzila'
  });
};