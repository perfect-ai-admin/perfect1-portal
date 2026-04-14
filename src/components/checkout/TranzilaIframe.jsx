import React, { useEffect, useRef } from 'react';
import { invokeFunction } from '@/api/supabaseClient';

/**
 * TranzilaIframe — form POST to iframenew.php (correct Tranzila integration).
 * Parses iframeUrl (newiframe.php?...) into hidden fields, submits via POST to iframenew.php.
 * Also handles payment detection via postMessage, navigation, and DB polling.
 */
export default function TranzilaIframe({ iframeUrl, paymentId, onPaymentDetected, confirmedRef, id = 'tranzila-iframe' }) {
  const iframeRef = useRef(null);
  const formRef = useRef(null);

  // Auto-submit form into iframe once URL is ready
  useEffect(() => {
    if (!iframeUrl || !formRef.current) return;
    // Small delay to ensure iframe is mounted
    const t = setTimeout(() => {
      if (formRef.current) formRef.current.submit();
    }, 100);
    return () => clearTimeout(t);
  }, [iframeUrl]);

  // Payment detection: postMessage + iframe navigation + DB polling
  useEffect(() => {
    if (!iframeUrl || !paymentId) return;
    const cleanups = [];

    // Method 1: postMessage from Tranzila
    const handleMessage = (event) => {
      if (confirmedRef?.current || !event.data || typeof event.data !== 'string') return;
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.Response === '000' || parsed.Response === 0) {
          onPaymentDetected(parsed.ConfirmationCode || '');
        }
      } catch (_) {
        if (event.data.includes('Response=000')) {
          const params = new URLSearchParams(event.data);
          onPaymentDetected(params.get('ConfirmationCode') || '');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    cleanups.push(() => window.removeEventListener('message', handleMessage));

    // Method 2: iframe navigation detection
    const iframe = iframeRef.current;
    if (iframe) {
      let loadCount = 0;
      const handleLoad = () => {
        loadCount++;
        if (loadCount <= 1 || confirmedRef?.current) return;
        try {
          const url = iframe?.contentWindow?.location?.href || '';
          if (url.includes('Response=000')) {
            const p = new URLSearchParams(url.split('?')[1] || '');
            onPaymentDetected(p.get('ConfirmationCode') || '');
          }
        } catch (_) {
          onPaymentDetected('iframe-navigation');
        }
      };
      iframe.addEventListener('load', handleLoad);
      cleanups.push(() => iframe.removeEventListener('load', handleLoad));
    }

    // Method 3: DB polling every 3s
    let pollCount = 0;
    const pollInterval = setInterval(async () => {
      if (confirmedRef?.current) { clearInterval(pollInterval); return; }
      pollCount++;
      if (pollCount > 40) { clearInterval(pollInterval); return; }
      try {
        const res = await invokeFunction('getPaymentStatus', { payment_id: paymentId });
        const payments = res?.payments || [];
        if (payments?.length > 0 && payments[0].status === 'completed') {
          onPaymentDetected('polling');
          clearInterval(pollInterval);
        }
      } catch (_) {}
    }, 3000);
    cleanups.push(() => clearInterval(pollInterval));

    return () => cleanups.forEach(fn => fn());
  }, [iframeUrl, paymentId, onPaymentDetected, confirmedRef]);

  if (!iframeUrl) return null;

  // Parse URL into action + hidden fields for form POST
  let formAction = '';
  let formFields = {};
  try {
    const urlObj = new URL(iframeUrl);
    // Use iframenew.php (correct POST endpoint) instead of newiframe.php (GET legacy)
    formAction = `${urlObj.origin}${urlObj.pathname.replace('newiframe.php', 'iframenew.php')}`;
    urlObj.searchParams.forEach((value, key) => {
      formFields[key] = value;
    });
    // Remove supplier from query — it's already in the path
    delete formFields['supplier'];
  } catch (_) {
    formAction = iframeUrl;
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-white" style={{ minHeight: '460px' }}>
      {/* Hidden form — POSTs params into the iframe */}
      <form
        ref={formRef}
        action={formAction}
        target={id}
        method="POST"
        style={{ display: 'none' }}
      >
        {Object.entries(formFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      </form>

      <iframe
        ref={iframeRef}
        id={id}
        name={id}
        allowpaymentrequest="true"
        allow="payment"
        style={{ width: '100%', height: '460px', border: 'none' }}
        title="טופס תשלום מאובטח"
      />
    </div>
  );
}
