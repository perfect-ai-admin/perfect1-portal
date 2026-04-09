import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, AlertCircle, Info, Lightbulb, ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import InlineCTA from './InlineCTA';

// Custom link renderer: internal links use React Router, external links open in new tab
const markdownComponents = {
  a: ({ href, children, ...props }) => {
    const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
    if (isInternal) {
      return <Link to={href} className="text-portal-teal font-medium hover:underline">{children}</Link>;
    }
    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-portal-teal font-medium hover:underline" {...props}>{children}</a>;
  },
};

const SectionText = ({ section }) => {
  const Tag = section.heading === 'h3' ? 'h3' : 'h2';
  const className = section.heading === 'h3' ? 'portal-h3' : 'portal-h2';
  return (
    <div id={section.id} className="scroll-mt-24">
      {section.title && <Tag className={`${className} mb-4`}>{section.title}</Tag>}
      {/* answerBlock: direct answer paragraph for featured snippets (40-60 words) */}
      {section.answerBlock && (
        <p className="answer-block portal-body font-medium text-portal-navy bg-portal-bg border-r-4 border-portal-teal px-4 py-3 rounded-lg mb-4">
          {section.answerBlock}
        </p>
      )}
      <div className="portal-body">
        <ReactMarkdown components={markdownComponents}>{section.content}</ReactMarkdown>
      </div>
    </div>
  );
};

const SectionList = ({ section }) => (
  <div id={section.id} className="scroll-mt-24">
    {section.title && <h2 className="portal-h2 mb-4">{section.title}</h2>}
    {section.answerBlock && (
      <p className="portal-body font-medium text-portal-navy bg-portal-bg border-r-4 border-portal-teal px-4 py-3 rounded-lg mb-4">
        {section.answerBlock}
      </p>
    )}
    {section.description && (
      <p className="portal-body mb-4">{section.description}</p>
    )}
    <ul className="space-y-3">
      {(section.items || []).map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-portal-teal mt-1 shrink-0" />
          {typeof item === 'string' ? (
            <span className="portal-body">{item}</span>
          ) : (
            <div className="portal-body">
              <strong>{item.title}</strong>
              {item.description && <span> — {item.description}</span>}
            </div>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const SectionSteps = ({ section }) => {
  // JSON uses "steps" array, but fall back to "items" for compatibility
  const steps = section.steps || section.items || [];
  return (
    <div id={section.id} className="scroll-mt-24">
      {section.title && <h2 className="portal-h2 mb-4 sm:mb-6">{section.title}</h2>}
      {section.answerBlock && (
        <p className="answer-block portal-body font-medium text-portal-navy bg-portal-bg border-r-4 border-portal-teal px-4 py-3 rounded-lg mb-4">
          {section.answerBlock}
        </p>
      )}
      <div className="space-y-4 sm:space-y-6">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-portal-teal text-white flex items-center justify-center font-bold text-base sm:text-lg">
              {step.number || i + 1}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-bold text-lg text-portal-navy mb-1">{step.title}</h3>
              <p className="portal-body">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionCallout = ({ section }) => {
  const icons = { info: Info, warning: AlertCircle, tip: Lightbulb };
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    tip: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  };
  const Icon = icons[section.variant] || Info;
  const colorClass = colors[section.variant] || colors.info;
  // JSON uses "content" field, but support "text" for backward compatibility
  const bodyText = section.text || section.content || '';

  return (
    <div className={`rounded-xl border-2 p-5 flex gap-3 ${colorClass}`}>
      <Icon className="w-6 h-6 shrink-0 mt-0.5" />
      <div className="portal-body text-current">
        {section.title && <strong className="block mb-1">{section.title}</strong>}
        <ReactMarkdown components={markdownComponents}>{bodyText}</ReactMarkdown>
      </div>
    </div>
  );
};

const SectionFAQ = ({ section }) => (
  <div id={section.id} className="scroll-mt-24">
    {section.title && <h2 className="portal-h2 mb-6">{section.title || 'שאלות נפוצות'}</h2>}
    {section.answerBlock && (
      <p className="portal-body font-medium text-portal-navy bg-portal-bg border-r-4 border-portal-teal px-4 py-3 rounded-lg mb-4">
        {section.answerBlock}
      </p>
    )}
    <Accordion type="single" collapsible className="space-y-3">
      {(section.items || []).map((item, i) => (
        <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 overflow-hidden">
          <AccordionTrigger className="text-right font-bold text-base sm:text-lg text-portal-navy hover:no-underline py-4 sm:py-5">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="portal-body pb-5 text-gray-600">
            <ReactMarkdown components={markdownComponents}>{item.answer}</ReactMarkdown>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

const SectionQuote = ({ section }) => (
  <blockquote className="border-r-4 border-portal-gold pr-6 py-2 my-6">
    <p className="text-xl font-medium text-portal-navy italic">{section.text}</p>
    {section.author && <cite className="text-sm text-portal-text-light mt-2 block">— {section.author}</cite>}
  </blockquote>
);

const SectionComparison = ({ section }) => {
  // Support three formats:
  // 1. Simple table: headers[] + rows[][] (flat arrays)
  // 2. Card format: items[] with title + features[]
  // 3. Labeled table: columns[] + rows[] with { label, values[] }
  const hasSimpleTable = section.headers && Array.isArray(section.rows) && Array.isArray(section.rows[0]);
  const hasLabeledTable = section.columns && Array.isArray(section.rows) && section.rows[0]?.label;
  const hasCards = Array.isArray(section.items);

  return (
    <div id={section.id} className="scroll-mt-24">
      {section.title && <h2 className="portal-h2 mb-6">{section.title}</h2>}
      {section.description && <p className="portal-body mb-6">{section.description}</p>}

      {/* Format 1: Simple table with headers + rows[][] */}
      {hasSimpleTable && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-portal-navy text-white">
                {(section.headers || []).map((h, i) => (
                  <th key={i} className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-sm sm:text-base whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(section.rows || []).map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  {(row || []).map((cell, j) => (
                    <td key={j} className="px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-gray-700 border-t border-gray-100">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Format 3: Labeled table with columns[] + rows[]{label, values[]} */}
      {hasLabeledTable && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-portal-navy text-white">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-sm sm:text-base whitespace-nowrap"></th>
                {(section.columns || []).map((col, i) => (
                  <th key={i} className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-sm sm:text-base whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(section.rows || []).map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium text-portal-navy border-t border-gray-100">{row.label}</td>
                  {(row.values || []).map((val, j) => (
                    <td key={j} className="px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-gray-700 border-t border-gray-100">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Format 2: Card format with items[]{title, features[]} */}
      {!hasSimpleTable && !hasLabeledTable && hasCards && (
        <div className="grid sm:grid-cols-2 gap-4">
          {(section.items || []).map((item, i) => (
            <div key={i} className="bg-portal-bg rounded-xl border border-gray-200 p-5 sm:p-6">
              <h3 className="font-bold text-lg text-portal-navy mb-3">{item.title}</h3>
              {item.description && <p className="portal-body mb-3">{item.description}</p>}
              {item.features && (
                <ul className="space-y-2">
                  {(item.features || []).map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-portal-teal mt-1 shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SectionCTAInline = ({ section, sourcePage }) => (
  <InlineCTA
    title={section.title}
    buttonText={section.buttonText || section.button}
    variant={section.variant}
    sourcePage={sourcePage}
  />
);

const SECTION_MAP = {
  text: SectionText,
  list: SectionList,
  steps: SectionSteps,
  callout: SectionCallout,
  faq: SectionFAQ,
  quote: SectionQuote,
  comparison: SectionComparison,
  'cta-inline': SectionCTAInline,
};

export default function ContentRenderer({ sections = [], sourcePage = 'article' }) {
  return (
    <div className="space-y-8">
      {sections.map((section, index) => {
        const Component = SECTION_MAP[section.type];
        if (!Component) return null;
        return <Component key={index} section={section} sourcePage={sourcePage} />;
      })}
    </div>
  );
}
