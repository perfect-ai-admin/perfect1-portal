import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function AnswerBlock({ question, answer, className = '' }) {
  // Answer should be 40-80 words for optimal AEO

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": answer
      }
    }]
  };

  React.useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(faqSchema);
    script.id = `answer-block-${question.slice(0, 20)}`;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(`answer-block-${question.slice(0, 20)}`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [question, answer]);

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-r-4 border-[#1E3A5F] ${className}`}>
      <div className="flex items-start gap-4">
        <div className="bg-[#1E3A5F] rounded-full p-3 flex-shrink-0">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">
            {question}
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}