import React, { useEffect } from 'react';

export default function FAQSchema({ faqs }) {
  useEffect(() => {
    if (!faqs || faqs.length === 0) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    let script = document.querySelector('script[data-schema="faq"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-schema', 'faq');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      if (script && script.parentNode) {
        script.remove();
      }
    };
  }, [faqs]);

  return null;
}