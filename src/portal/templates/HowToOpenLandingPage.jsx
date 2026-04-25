import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, Clock, Shield, Users, Star, ChevronDown, ArrowLeft,
  FileText, Phone, Sparkles, Award, Zap, Heart, TrendingUp, BookOpen,
} from 'lucide-react';

import SEOHead from '@/components/seo/SEOHead';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import ContentRenderer from '../components/ContentRenderer';
import AuthorBlock from '../components/AuthorBlock';
import ArticleCard from '../components/ArticleCard';
import PortalLeadForm from '../components/PortalLeadForm';
import WhatsAppButton from '../components/WhatsAppButton';
import SchemaMarkup from '../components/SchemaMarkup';
import { usePortalContent } from '../hooks/usePortalContent';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';

// ----- Icon resolver for content-driven sections -----
const ICONS = {
  clock: Clock,
  shield: Shield,
  users: Users,
  star: Star,
  check: CheckCircle2,
  file: FileText,
  phone: Phone,
  sparkles: Sparkles,
  award: Award,
  zap: Zap,
  heart: Heart,
  trending: TrendingUp,
  book: BookOpen,
};
const Icon = ({ name, className = 'w-5 h-5' }) => {
  const Cmp = ICONS[name] || CheckCircle2;
  return <Cmp className={className} aria-hidden="true" />;
};

// ----- QuickSteps: 3 steps with icons (above-the-fold value) -----
function QuickSteps({ data }) {
  if (!data || !Array.isArray(data.items) || data.items.length === 0) return null;
  return (
    <section className="py-10 sm:py-14 bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        {data.title && (
          <h2 className="text-2xl sm:text-3xl font-extrabold text-portal-navy text-center mb-8">{data.title}</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {data.items.map((step, i) => (
            <div key={i} className="relative bg-portal-bg rounded-2xl p-5 sm:p-6 border border-gray-100">
              <div className="absolute -top-3 right-4 bg-portal-teal text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-md">
                {i + 1}
              </div>
              <div className="w-11 h-11 rounded-xl bg-portal-teal/10 text-portal-teal flex items-center justify-center mb-3">
                <Icon name={step.icon} className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-portal-navy text-base sm:text-lg mb-1.5">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----- WhyUs: 3 value cards -----
function WhyUs({ data }) {
  if (!data || !Array.isArray(data.items) || data.items.length === 0) return null;
  return (
    <section className="py-10 sm:py-14 bg-portal-bg border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        {data.title && (
          <h2 className="text-2xl sm:text-3xl font-extrabold text-portal-navy text-center mb-2">{data.title}</h2>
        )}
        {data.subtitle && (
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">{data.subtitle}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {data.items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-portal-teal to-emerald-500 text-white flex items-center justify-center mb-4">
                <Icon name={item.icon} className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-portal-navy text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----- ProcessSummary: clear, simple summary -----
function ProcessSummary({ data }) {
  if (!data) return null;
  return (
    <section className="py-10 sm:py-14 bg-white border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-portal-navy text-center mb-3">{data.title}</h2>
        {data.subtitle && (
          <p className="text-gray-600 text-center mb-8">{data.subtitle}</p>
        )}
        <div className="bg-gradient-to-br from-portal-bg to-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          {Array.isArray(data.points) && (
            <ul className="space-y-4">
              {data.points.map((pt, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-portal-teal text-white flex items-center justify-center mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    {pt.title && <span className="font-bold text-portal-navy">{pt.title}: </span>}
                    <span className="text-gray-700">{pt.text || pt.description || pt}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {data.pricing && (
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">{data.pricing.label || 'מחיר השירות'}</div>
                <div className="text-3xl font-black text-portal-teal">{data.pricing.amount}<span className="text-base font-bold text-gray-500"> {data.pricing.unit || ''}</span></div>
              </div>
              {data.pricing.note && (
                <div className="text-sm text-gray-600 max-w-xs">{data.pricing.note}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ----- FAQ Accordion: collapsed by default -----
function FAQAccordion({ items, title = 'שאלות נפוצות' }) {
  const [open, setOpen] = useState(null);
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className="py-12 sm:py-16 bg-portal-bg border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-portal-navy text-center mb-8">{title}</h2>
        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right hover:bg-gray-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-portal-navy text-base sm:text-lg flex-1">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-portal-teal shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-gray-700 text-sm sm:text-base leading-relaxed border-t border-gray-100">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ----- FinalCTA: hero-style closing block -----
function FinalCTA({ data, sourcePage }) {
  if (!data) return null;
  return (
    <section className="py-14 sm:py-20 bg-gradient-to-br from-portal-navy via-indigo-900 to-portal-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white_1px,transparent_1px)] bg-[length:32px_32px]" />
      <div className="relative max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-3">{data.heading}</h2>
        {data.subheading && (
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">{data.subheading}</p>
        )}
        <div className="bg-white rounded-2xl p-5 sm:p-7 max-w-xl mx-auto shadow-2xl">
          <PortalLeadForm
            sourcePage={sourcePage}
            variant="compact"
            ctaText={data.ctaText || 'התחילו עכשיו — ייעוץ חינם'}
          />
          <div className="flex items-center justify-center gap-4 mt-3 text-sm">
            <span className="text-gray-500">או:</span>
            <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">WhatsApp</a>
            <a href="tel:050-227-7087" className="text-portal-teal hover:underline font-medium">050-227-7087</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----- Sticky mobile CTA: subtle, scroll-to-form -----
function LandingStickyCTA({ ctaText = 'התחילו עכשיו' }) {
  const handleClick = () => {
    const el = document.getElementById('landing-final-cta') || document.getElementById('landing-hero-form');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-2.5 safe-area-pb shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-portal-teal hover:bg-emerald-600 text-white font-bold text-base transition-colors"
      >
        {ctaText}
        <ArrowLeft className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================
//  Main page component
// ============================================================
export default function HowToOpenLandingPage({ category }) {
  const { slug } = useParams();
  const { content, loading, error } = usePortalContent(category, slug);
  const breadcrumbs = useBreadcrumbs(content?.title);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-portal-teal/20 border-t-portal-teal rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <>
        <PortalHeader />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-portal-navy mb-2">הדף לא נמצא</h1>
            <p className="text-gray-500 mb-4">המאמר שחיפשת לא קיים</p>
            <Link to={`/${category}`} className="text-portal-teal font-medium hover:underline">חזרה לקטגוריה</Link>
          </div>
        </div>
        <PortalFooter />
      </>
    );
  }

  // Schema items — same as SEOArticlePage so we keep equity
  const faqItems = (content.sections || [])
    .filter(s => s.type === 'faq')
    .flatMap(s => s.items || []);
  const stepsSection = content.sections?.find(s => s.type === 'steps');
  const howToSteps = stepsSection ? (stepsSection.steps || stepsSection.items || []) : [];

  // Filter out FAQ sections from in-flow renderer — we render them in dedicated accordion below
  const bodySections = (content.sections || []).filter(s => s.type !== 'faq');

  // Related articles
  const relatedArticles = (content.relatedArticles || []).map(article => ({
    ...article,
    href: article.href || (article.category === 'comparisons'
      ? `/compare/${article.slug}`
      : `/${article.category}/${article.slug}`),
  }));

  const trust = Array.isArray(content.trustSignals) ? content.trustSignals : [];

  return (
    <>
      <SEOHead
        title={content.metaTitle || `${content.title} | פרפקט וואן`}
        description={content.metaDescription}
        canonical={`/${category}/${slug}`}
        keywords={content.keywords?.join(', ')}
        type="article"
        publishDate={content.publishDate}
        updatedDate={content.updatedDate}
      />
      <SchemaMarkup
        type="article"
        data={{ ...content, canonical: `https://www.perfect1.co.il/${category}/${slug}` }}
        faqItems={faqItems}
        howToSteps={howToSteps}
        breadcrumbs={breadcrumbs}
      />
      <PortalHeader />

      <main className="pt-14 sm:pt-16 md:pt-[72px] bg-white">
        {/* ===== HERO — focused, single dominant form ===== */}
        <section className="relative py-10 sm:py-14 md:py-20 bg-gradient-to-b from-portal-bg to-white border-b border-gray-100 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_70%_30%,#0EA5A5_1px,transparent_1px)] bg-[length:24px_24px]" />
          <div className="relative max-w-6xl mx-auto px-4">
            <Breadcrumbs items={breadcrumbs} />
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-start mt-4">
              {/* LEFT: title + sub + trust strip */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-portal-navy leading-[1.1] mb-4 sm:mb-5">
                  {content.heroTitle || content.title}
                </h1>
                {content.heroSubtitle && (
                  <p className="hero-subtitle text-lg sm:text-xl text-gray-600 leading-relaxed mb-5 sm:mb-7 max-w-xl">
                    {content.heroSubtitle}
                  </p>
                )}
                {/* One-line trust strip — replaces the 4 cards */}
                {trust.length > 0 && (
                  <div className="flex items-center flex-wrap gap-x-5 gap-y-2 text-sm">
                    {trust.slice(0, 4).map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-portal-teal/10 text-portal-teal flex items-center justify-center">
                          <Icon name={s.icon} className="w-3 h-3" />
                        </span>
                        <span className="font-medium">{s.title}</span>
                        {s.description && <span className="text-gray-400 hidden sm:inline">— {s.description}</span>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-5">
                  <AuthorBlock
                    author={content.author}
                    publishDate={content.publishDate}
                    updatedDate={content.updatedDate}
                    readTime={content.readTime}
                  />
                </div>
              </div>

              {/* RIGHT: dominant lead form */}
              <div id="landing-hero-form" className="lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 shadow-xl">
                  <h2 className="text-lg sm:text-xl font-extrabold text-portal-navy mb-1">
                    {content.heroFormTitle || 'התחילו את התהליך עכשיו'}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {content.heroFormSubtitle || 'מלאו פרטים — רואה חשבון יחזור אליכם תוך דקות'}
                  </p>
                  <PortalLeadForm
                    sourcePage={`hero-${category}-${slug}`}
                    variant="compact"
                    ctaText={content.heroFormCta || 'לייעוץ חינם — התחילו'}
                  />
                  <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm">
                    <span className="text-gray-400">או:</span>
                    <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">WhatsApp</a>
                    <a href="tel:050-227-7087" className="text-portal-teal hover:underline font-medium">050-227-7087</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== QUICK STEPS — 3 icons ===== */}
        <QuickSteps data={content.quickSteps} />

        {/* ===== ARTICLE BODY — existing sections (without FAQ) ===== */}
        {bodySections.length > 0 && (
          <article className="py-10 sm:py-14 bg-white">
            <div className="max-w-3xl mx-auto px-4">
              <ContentRenderer sections={bodySections} sourcePage={`landing-${category}-${slug}`} />
            </div>
          </article>
        )}

        {/* ===== WHY US — 3 value cards ===== */}
        <WhyUs data={content.whyUs} />

        {/* ===== PROCESS SUMMARY ===== */}
        <ProcessSummary data={content.processSummary} />

        {/* ===== FAQ ACCORDION ===== */}
        <FAQAccordion items={faqItems} title={content.faqTitle || 'שאלות נפוצות'} />

        {/* ===== FINAL CTA ===== */}
        <div id="landing-final-cta">
          <FinalCTA data={content.finalCta} sourcePage={`final-${category}-${slug}`} />
        </div>

        {/* ===== RELATED ARTICLES ===== */}
        {relatedArticles.length > 0 && (
          <section className="py-12 sm:py-16 bg-white">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-portal-navy text-center mb-8">מאמרים קשורים</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {relatedArticles.slice(0, 4).map((article, i) => (
                  <ArticleCard
                    key={i}
                    title={article.title}
                    description={article.description}
                    href={article.href}
                    readTime={article.readTime}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <PortalFooter />
      <WhatsAppButton />
      <LandingStickyCTA ctaText={content.heroFormCta || 'התחילו עכשיו'} />
    </>
  );
}
