import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  CheckCircle2, AlertCircle, Info, Lightbulb, ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import InlineCTA from './InlineCTA';

const SectionText = ({ section }) => {
  const Tag = section.heading === 'h3' ? 'h3' : 'h2';
  const className = section.heading === 'h3' ? 'portal-h3' : 'portal-h2';
  return (
    <div id={section.id} className="scroll-mt-24">
      {section.title && <Tag className={`${className} mb-4`}>{section.title}</Tag>}
      <div className="portal-body">
        <ReactMarkdown>{section.content}</ReactMarkdown>
      </div>
    </div>
  );
};

const SectionList = ({ section }) => (
  <div id={section.id} className="scroll-mt-24">
    {section.title && <h2 className="portal-h2 mb-4">{section.title}</h2>}
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
      {section.title && <h2 className="portal-h2 mb-6">{section.title}</h2>}
      <div className="space-y-6">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-portal-teal text-white flex items-center justify-center font-bold text-lg">
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
        <ReactMarkdown>{bodyText}</ReactMarkdown>
      </div>
    </div>
  );
};

const SectionFAQ = ({ section }) => (
  <div id={section.id} className="scroll-mt-24">
    {section.title && <h2 className="portal-h2 mb-6">{section.title || 'שאלות נפוצות'}</h2>}
    <Accordion type="single" collapsible className="space-y-3">
      {section.items.map((item, i) => (
        <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-xl border border-gray-200 px-6 overflow-hidden">
          <AccordionTrigger className="text-right font-bold text-lg text-portal-navy hover:no-underline py-5">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="portal-body pb-5 text-gray-600">
            <ReactMarkdown>{item.answer}</ReactMarkdown>
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

const SectionComparison = ({ section }) => (
  <div id={section.id} className="scroll-mt-24 overflow-x-auto">
    {section.title && <h2 className="portal-h2 mb-6">{section.title}</h2>}
    <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
      <thead>
        <tr className="bg-portal-navy text-white">
          {section.headers.map((h, i) => (
            <th key={i} className="px-6 py-4 text-right font-bold text-base">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {section.rows.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
            {row.map((cell, j) => (
              <td key={j} className="px-6 py-4 text-base text-gray-700 border-t border-gray-100">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SectionCTAInline = ({ section }) => (
  <InlineCTA title={section.title} buttonText={section.buttonText || section.button} variant={section.variant} />
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

export default function ContentRenderer({ sections = [] }) {
  return (
    <div className="space-y-8">
      {sections.map((section, index) => {
        const Component = SECTION_MAP[section.type];
        if (!Component) return null;
        return <Component key={index} section={section} />;
      })}
    </div>
  );
}
