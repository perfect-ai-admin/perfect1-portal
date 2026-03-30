import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { invokeFunction } from '@/api/supabaseClient';

// Preconnect to Tranzila — saves ~300ms DNS+TLS
if (typeof document !== 'undefined') {
  const existing = document.querySelector('link[href="https://direct.tranzila.com"]');
  if (!existing) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://direct.tranzila.com';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
}

/**
 * useTranzilaPayment — shared hook for all Tranzila checkout flows.
 *
 * @param {Object} options
 * @param {Function} options.onSuccess - (paymentId) => void
 * @param {Function} [options.onTimeout] - () => void
 */
export default function useTranzilaPayment({ onSuccess, onTimeout } = {}) {
  const [iframeUrl, setIframeUrl] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const confirmedRef = useRef(false);

  /**
   * Create payment and build iframe URL.
   * @param {Object} params
   * @param {string} params.product_type - 'plan' | 'one-time' | 'cart' | 'logo' etc.
   * @param {string} params.product_name
   * @param {number} params.amount
   * @param {string} [params.product_id]
   * @param {Array} [params.items] - for cart
   * @param {Object} [params.metadata]
   * @param {Object} [params.user] - { full_name, email }
   * @param {Object} [params.iframeParams] - extra params for iframe URL (recurring, wallets, invoice, etc.)
   */
  const createPayment = useCallback(async (params) => {
    setIsCreating(true);
    confirmedRef.current = false;
    try {
      const data = await invokeFunction('tranzilaCreatePayment', {
        product_type: params.product_type,
        product_name: params.product_name,
        amount: params.amount,
        product_id: params.product_id || '',
        items: params.items,
        metadata: params.metadata,
      });

      if (!data?.success || !data?.supplier) {
        toast.error('שגיאה בהתחלת התשלום');
        setIsCreating(false);
        return null;
      }

      const urlParams = new URLSearchParams({
        supplier: data.supplier,
        sum: String(params.amount),
        currency: '1',
        cred_type: '1',
        tranmode: 'A',
        TranzilaPW: data.tranzilaPW || '',
        o_cred_oid: data.paymentId || '',
        notify_url_address: data.notifyUrl || '',
        lang: 'il',
        nologo: '1',
        trBgColor: 'FFFFFF',
        trTextColor: '1E3A5F',
        trButtonColor: '27AE60',
        buttonLabel: 'לתשלום',
      });

      if (params.user) {
        urlParams.set('contact', params.user.full_name || '');
        urlParams.set('email', params.user.email || '');
      }
      if (params.product_name) {
        urlParams.set('pdesc', params.product_name);
      }

      if (params.iframeParams) {
        for (const [key, value] of Object.entries(params.iframeParams)) {
          if (value !== undefined && value !== null) {
            urlParams.set(key, String(value));
          }
        }
      }

      const url = `https://direct.tranzila.com/${data.supplier}/newiframe.php?${urlParams.toString()}`;
      setIframeUrl(url);
      setPaymentId(data.paymentId);
      setIsCreating(false);
      return { paymentId: data.paymentId, iframeUrl: url };
    } catch (error) {
      toast.error('שגיאה בהתחלת תהליך התשלום');
      setIsCreating(false);
      return null;
    }
  }, []);

  /**
   * Build iframe URL from existing payment data (for cart flow with pre-created payment).
   */
  const buildIframeUrlFromExisting = useCallback((existingPayment, params = {}) => {
    const supplier = existingPayment.supplier || 'fxperfectone';
    const urlParams = new URLSearchParams({
      supplier,
      sum: String(existingPayment.amount || params.amount || 0),
      currency: '1',
      cred_type: '1',
      tranmode: 'A',
      TranzilaPW: existingPayment.tranzilaPW || existingPayment.tranzila_pw || '',
      o_cred_oid: existingPayment.id || params.paymentId || '',
      notify_url_address: existingPayment.notify_url || '',
      lang: 'il',
      nologo: '1',
      trBgColor: 'FFFFFF',
      trTextColor: '1E3A5F',
      trButtonColor: '27AE60',
      buttonLabel: 'לתשלום',
    });

    if (params.iframeParams) {
      for (const [key, value] of Object.entries(params.iframeParams)) {
        if (value !== undefined && value !== null) {
          urlParams.set(key, String(value));
        }
      }
    }

    const url = `https://direct.tranzila.com/${supplier}/newiframe.php?${urlParams.toString()}`;
    setIframeUrl(url);
    setPaymentId(params.paymentId || existingPayment.id || '');
    confirmedRef.current = false;
    return url;
  }, []);

  /**
   * Confirm payment with backend.
   */
  const confirmPayment = useCallback(async (transactionId) => {
    if (confirmedRef.current || !paymentId) return;
    confirmedRef.current = true;
    try {
      await invokeFunction('tranzilaConfirmPayment', {
        payment_id: paymentId,
        transaction_id: transactionId || '',
        tranzila_response: '000'
      });
      if (onSuccess) await onSuccess(paymentId);
    } catch (err) {
      confirmedRef.current = false;
      toast.error('שגיאה באישור התשלום');
    }
  }, [paymentId, onSuccess]);

  /**
   * Manual check — user claims they paid but screen didn't advance.
   */
  const manualCheck = useCallback(async () => {
    if (!paymentId) return;
    try {
      const res = await invokeFunction('getPaymentStatus', { payment_id: paymentId });
      const payments = res?.payments || [];
      if (payments?.length > 0 && payments[0].status === 'completed') {
        await confirmPayment('manual-check');
      } else {
        await confirmPayment('manual');
      }
    } catch (e) {
      toast.error('לא הצלחנו לאמת את התשלום. נסה שוב בעוד רגע.');
    }
  }, [paymentId, confirmPayment]);

  const reset = useCallback(() => {
    setIframeUrl(null);
    setPaymentId(null);
    setIsCreating(false);
    confirmedRef.current = false;
  }, []);

  return {
    iframeUrl,
    paymentId,
    isCreating,
    isConfirmed: confirmedRef.current,
    createPayment,
    buildIframeUrlFromExisting,
    confirmPayment,
    manualCheck,
    reset,
    confirmedRef,
  };
}
