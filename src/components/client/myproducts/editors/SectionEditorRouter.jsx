import React from 'react';
import HeroEditor from './HeroEditor';
import FeaturesEditor from './FeaturesEditor';
import TestimonialsEditor from './TestimonialsEditor';
import FAQEditor from './FAQEditor';
import ContactEditor from './ContactEditor';
import StatsEditor from './StatsEditor';
import HowItWorksEditor from './HowItWorksEditor';
import WhyUsEditor from './WhyUsEditor';
import HumanVoiceEditor from './HumanVoiceEditor';
import SuitedForEditor from './SuitedForEditor';
import PainExpansionEditor from './PainExpansionEditor';

const EDITOR_MAP = {
  hero: HeroEditor,
  features: FeaturesEditor,
  pain_points: FeaturesEditor,
  testimonials: TestimonialsEditor,
  faq: FAQEditor,
  contact: ContactEditor,
  stats: StatsEditor,
  how_it_works: HowItWorksEditor,
  process: HowItWorksEditor,
  why_us: WhyUsEditor,
  human_voice: HumanVoiceEditor,
  suited_for: SuitedForEditor,
  pain_expansion: PainExpansionEditor,
};

export default function SectionEditorRouter({ section, sectionIndex, onChange }) {
  const Editor = EDITOR_MAP[section.type];

  if (!Editor) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        סוג סקציה <strong>{section.type}</strong> עדיין לא נתמך לעריכה.
      </div>
    );
  }

  return <Editor section={section} onChange={(updated) => onChange(sectionIndex, updated)} />;
}