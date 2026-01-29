/**
 * Webhook Error Handler
 * Provides standardized error messages and handling for API interactions
 */

export const WEBHOOK_ERRORS = {
  INVALID_CUSTOMER: {
    code: 'INVALID_CUSTOMER',
    message_he: 'לא נמצא משתמש, נסה להתחבר מחדש',
    action: 'redirect_login'
  },
  INVALID_GOAL: {
    code: 'INVALID_GOAL',
    message_he: 'המטרה לא נמצאה',
    action: 'redirect_journey'
  },
  AGENT_ERROR: {
    code: 'AGENT_ERROR',
    message_he: 'המנטור לא זמין כרגע, נסה שוב',
    action: 'retry'
  },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    message_he: 'בעיה בשרת, נסה שוב',
    action: 'retry'
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message_he: 'יותר מדי בקשות, המתן רגע',
    action: 'wait'
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message_he: 'בעיית חיבור, בדוק את האינטרנט',
    action: 'retry'
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    message_he: 'הבקשה לקחה יותר מדי זמן, נסה שוב',
    action: 'retry'
  }
};

export function handleWebhookError(error) {
  if (!navigator.onLine) {
    return {
      ...WEBHOOK_ERRORS.NETWORK_ERROR,
      isNetworkError: true
    };
  }

  if (error.name === 'AbortError') {
    return {
      ...WEBHOOK_ERRORS.TIMEOUT,
      isTimeout: true
    };
  }

  if (error.code && WEBHOOK_ERRORS[error.code]) {
    return WEBHOOK_ERRORS[error.code];
  }

  return {
    code: 'UNKNOWN_ERROR',
    message_he: 'שגיאה לא צפויה, נסה שוב',
    action: 'retry'
  };
}

export function getErrorMessage(errorCode) {
  return WEBHOOK_ERRORS[errorCode]?.message_he || 'שגיאה לא צפויה';
}

export function shouldRetry(errorCode) {
  const error = WEBHOOK_ERRORS[errorCode];
  return error && (error.action === 'retry' || error.action === 'wait');
}

export function getErrorAction(errorCode) {
  return WEBHOOK_ERRORS[errorCode]?.action || 'retry';
}