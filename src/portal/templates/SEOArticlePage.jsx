import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SEOHead from '@/components/seo/SEOHead';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import TableOfContents from '../components/TableOfContents';
import ContentRenderer from '../components/ContentRenderer';
import AuthorBlock from '../components/AuthorBlock';
import ArticleCard from '../components/ArticleCard';
import PortalLeadForm from '../components/PortalLeadForm';
import WhatsAppButton from '../components/WhatsAppButton';
import StickyMobileCTA from '../components/StickyMobileCTA';
import SchemaMarkup from '../components/SchemaMarkup';
import { usePortalContent } from '../hooks/usePortalContent';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';

export default function SEOArticlePage({ category }) {
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

  // Extract ALL FAQ items from all faq-type sections for schema (not just the first one)
  const faqItems = (content.sections || [])
    .filter(s => s.type === 'faq')
    .flatMap(s => s.items || []);

  // Extract HowTo steps from steps-type sections for schema
  const stepsSection = content.sections?.find(s => s.type === 'steps');
  const howToSteps = stepsSection ? (stepsSection.steps || stepsSection.items || []) : [];

  // Related articles — construct href from category + slug
  const relatedArticles = (content.relatedArticles || []).map(article => ({
    ...article,
    href: article.href || (article.category === 'comparisons'
      ? `/compare/${article.slug}`
      : `/${article.category}/${article.slug}`),
  }));

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
        {/* Hero */}
        <section className="py-8 sm:py-12 md:py-16 bg-portal-bg border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4">
            <Breadcrumbs items={breadcrumbs} />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-portal-navy leading-tight mt-3 sm:mt-4 mb-3 sm:mb-4">
              {content.heroTitle || content.title}
            </h1>
            {content.heroSubtitle && (
              <p className="hero-subtitle text-xl text-gray-600 leading-relaxed">{content.heroSubtitle}</p>
            )}
            <AuthorBlock
              author={content.author}
              publishDate={content.publishDate}
              updatedDate={content.updatedDate}
              readTime={content.readTime}
            />
            {/* Hero Banner — service offer with price + CTA button */}
            {content.heroBanner && (
              <div className="mt-6 sm:mt-8 max-w-xl bg-gradient-to-l from-indigo-900 to-indigo-800 rounded-2xl p-5 sm:p-6 shadow-xl text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white_1px,transparent_1px)] bg-[length:20px_20px]" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl sm:text-5xl font-black text-amber-400">{content.heroBanner.price}<span className="text-lg font-bold">{content.heroBanner.priceLabel}</span></span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1">{content.heroBanner.title}</h3>
                  <p className="text-white/70 text-sm mb-4">{content.heroBanner.subtitle}</p>
                  <Link
                    to={content.heroBanner.buttonLink}
                    className="inline-flex items-center justify-center w-full h-12 sm:h-13 rounded-xl bg-amber-500 hover:bg-amber-400 text-indigo-950 font-extrabold text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    {content.heroBanner.buttonText}
                  </Link>
                  {content.heroBanner.badges && (
                    <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
                      {content.heroBanner.badges.map((b, i) => (
                        <span key={i} className="text-xs text-white/60 flex items-center gap-1">
                          <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Hero Lead Form — shown when article has heroForm: true (and no heroBanner) */}
            {content.heroForm && !content.heroBanner && (
              <div className="mt-6 sm:mt-8 max-w-xl bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-lg">
                <PortalLeadForm
                  sourcePage={`hero-${category}-${slug}`}
                  variant="compact"
                  ctaText={content.heroFormCta || "לייעוץ חינם — התחילו עכשיו"}
                />
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span className="text-xs text-gray-500">או:</span>
                  <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-green-600 hover:underline text-sm font-medium">
                    WhatsApp
                  </a>
                  <a href="tel:050-227-7087" className="inline-flex items-center gap-1.5 text-portal-teal hover:underline text-sm font-medium">
                    050-227-7087
                  </a>
                </div>
              </div>
            )}

            {/* Trust Signals — shown when article has trustSignals array */}
            {Array.isArray(content.trustSignals) && content.trustSignals.length > 0 && (
              <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl">
                {content.trustSignals.map((s, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 px-3 py-3 sm:px-4 sm:py-3.5 flex items-center gap-2.5 shadow-sm">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg bg-portal-teal/10 text-portal-teal flex items-center justify-center">
                      {s.icon === 'clock' && (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                      {s.icon === 'shield' && (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      )}
                      {s.icon === 'users' && (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      )}
                      {s.icon === 'star' && (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" /></svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-portal-navy text-xs sm:text-sm leading-tight truncate">{s.title}</div>
                      <div className="text-[11px] sm:text-xs text-gray-500 leading-tight truncate">{s.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Calculator Result Card — prominent calc-style visual at top of article */}
        {content.resultCard && (
          <section className="py-8 sm:py-12 bg-gradient-to-b from-portal-bg to-white border-b border-gray-100">
            <div className="max-w-3xl mx-auto px-4">
              <div className="bg-white rounded-3xl border-2 border-portal-teal/20 shadow-2xl overflow-hidden">
                {/* Header bar */}
                <div className="bg-gradient-to-l from-portal-navy to-indigo-900 px-6 py-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-portal-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span className="text-sm font-medium">תוצאת חישוב</span>
                  </div>
                  <span className="text-xs bg-portal-teal text-portal-navy px-2 py-0.5 rounded-full font-bold">2026</span>
                </div>

                {/* Input row */}
                <div className="px-6 py-5 bg-portal-bg/30 border-b border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">הכנסה חודשית</div>
                  <div className="text-3xl sm:text-4xl font-black text-portal-navy">{content.resultCard.input}</div>
                </div>

                {/* Breakdown grid */}
                <div className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-100">
                  <div className="px-4 py-5 text-center">
                    <div className="text-xs text-gray-500 mb-1">מס הכנסה</div>
                    <div className="text-xl sm:text-2xl font-bold text-red-600">-{content.resultCard.incomeTax}</div>
                  </div>
                  <div className="px-4 py-5 text-center">
                    <div className="text-xs text-gray-500 mb-1">ביטוח לאומי</div>
                    <div className="text-xl sm:text-2xl font-bold text-red-600">-{content.resultCard.bituachLeumi}</div>
                  </div>
                  <div className="px-4 py-5 text-center">
                    <div className="text-xs text-gray-500 mb-1">ביטוח בריאות</div>
                    <div className="text-xl sm:text-2xl font-bold text-red-600">-{content.resultCard.bituachBriut}</div>
                  </div>
                </div>

                {/* Net result */}
                <div className="px-6 py-6 bg-gradient-to-l from-portal-teal/10 to-emerald-50 border-t-2 border-portal-teal/30 text-center">
                  <div className="text-xs text-portal-navy/60 mb-1 font-medium">נשאר נטו בחודש</div>
                  <div className="text-4xl sm:text-5xl font-black text-portal-teal">{content.resultCard.net}</div>
                  {content.resultCard.percent && (
                    <div className="text-sm text-gray-500 mt-1">{content.resultCard.percent} מההכנסה</div>
                  )}
                </div>

                {/* CTA */}
                <div className="px-6 py-4 bg-white border-t border-gray-100">
                  <Link
                    to="/calculators/net-income"
                    className="block w-full text-center py-3 rounded-xl bg-portal-navy hover:bg-indigo-900 text-white font-bold transition-colors"
                  >
                    לחישוב מותאם אישית — השתמשו במחשבון →
                  </Link>
                </div>
              </div>

              {/* Quick links to other income levels */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <span className="text-sm text-gray-500 w-full text-center mb-2">חישוב לסכום אחר:</span>
                {['10000', '20000', '30000', '50000'].filter(s => !slug?.includes(s)).map(amount => (
                  <Link
                    key={amount}
                    to={`/misui/tax-${amount}`}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-portal-navy hover:border-portal-teal hover:text-portal-teal transition-colors"
                  >
                    {Number(amount).toLocaleString('he-IL')} ₪
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Article Body */}
        <article className="py-10 md:py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex gap-8">
              {/* Main Content */}
              <div className="flex-1 max-w-3xl">
                {/* Table of Contents */}
                {content.toc && content.toc.length > 0 && (
                  <TableOfContents items={content.toc} />
                )}

                {/* Content Sections */}
                <ContentRenderer sections={content.sections || []} sourcePage={`article-${category}-${slug}`} />
              </div>

              {/* Sidebar - Desktop Only */}
              <aside className="hidden lg:block w-[300px] flex-shrink-0">
                <div className="sticky top-24">
                  {content.heroBanner ? (
                    <div className="bg-gradient-to-b from-indigo-900 to-indigo-800 rounded-2xl p-5 text-white">
                      <p className="text-3xl font-black text-amber-400 mb-1">{content.heroBanner.price}<span className="text-sm font-bold">{content.heroBanner.priceLabel}</span></p>
                      <p className="font-bold text-sm mb-1">{content.heroBanner.title}</p>
                      <p className="text-white/60 text-xs mb-4">{content.heroBanner.subtitle}</p>
                      <Link
                        to={content.heroBanner.buttonLink}
                        className="flex items-center justify-center w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-indigo-950 font-extrabold text-sm shadow-lg hover:scale-[1.02] transition-all"
                      >
                        {content.heroBanner.buttonText}
                      </Link>
                      {content.heroBanner.badges && (
                        <div className="mt-3 space-y-1.5">
                          {content.heroBanner.badges.map((b, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-white/60 text-xs">
                              <svg className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              {b}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-portal-bg rounded-2xl border border-gray-200 p-5">
                      <PortalLeadForm
                        sourcePage={`sidebar-${category}-${slug}`}
                        variant="compact"
                        ctaText="לייעוץ חינם עם רו״ח"
                      />
                      <p className="text-xs text-gray-500 text-center mt-2">ללא התחייבות</p>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="py-12 bg-portal-bg">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="portal-h2 text-center mb-8">מאמרים קשורים</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {relatedArticles.map((article, i) => (
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

        {/* Lead Form */}
        <section id="portal-lead-form" className="py-16 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            <PortalLeadForm
              sourcePage={`article-${category}-${slug}`}
              title={content.leadForm?.title || "ייעוץ מקצועי חינם עם רואה חשבון"}
              subtitle="השאר שם וטלפון — רו״ח מוסמך יחזור אליך תוך 30 דקות"
            />
          </div>
        </section>
      </main>

      <PortalFooter />
      <WhatsAppButton />
      {content.heroBanner ? (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-indigo-900/95 backdrop-blur border-t border-indigo-700 px-4 py-2.5 safe-area-pb">
          <Link
            to={content.heroBanner.buttonLink}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-indigo-950 font-extrabold text-base shadow-lg"
          >
            {content.heroBanner.buttonText}
          </Link>
        </div>
      ) : (
        <StickyMobileCTA />
      )}
    </>
  );
}
