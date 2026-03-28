import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/seo/SEOHead';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import PortalLeadForm from '../components/PortalLeadForm';
import WhatsAppButton from '../components/WhatsAppButton';
import StickyMobileCTA from '../components/StickyMobileCTA';
import SchemaMarkup from '../components/SchemaMarkup';
import ContentRenderer from '../components/ContentRenderer';
import { usePortalContent } from '../hooks/usePortalContent';

export default function ComparisonPage() {
  const { slug } = useParams();
  const { content, loading, error } = usePortalContent('comparisons', slug);

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
            <Link to="/guides" className="text-portal-teal font-medium hover:underline">חזרה למדריכים</Link>
          </div>
        </div>
        <PortalFooter />
      </>
    );
  }

  const faqSection = content.sections?.find(s => s.type === 'faq');
  const faqItems = faqSection?.items || [];

  return (
    <>
      <SEOHead
        title={content.metaTitle || `${content.title} | פרפקט וואן`}
        description={content.metaDescription}
        canonical={`/compare/${slug}`}
        keywords={content.keywords?.join(', ')}
      />
      <SchemaMarkup
        type="article"
        data={{ ...content, canonical: `https://perfect-dashboard.com/compare/${slug}`, title: content.heroTitle || content.title }}
        faqItems={faqItems}
        breadcrumbs={[{ label: 'מדריכים', href: '/guides' }, { label: content.title }]}
      />
      <PortalHeader />

      <main className="pt-16 md:pt-[72px] bg-white">
        {/* Hero */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4">
            <Breadcrumbs items={[{ label: 'מדריכים', href: '/guides' }, { label: content.title }]} />
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mt-4 mb-4">
              {content.heroTitle || content.title}
            </h1>
            {content.heroSubtitle && (
              <p className="text-xl text-white/80">{content.heroSubtitle}</p>
            )}
          </div>
        </section>

        {/* Comparison Table */}
        {content.comparisonTable && (
          <section className="py-12 bg-white">
            <div className="max-w-4xl mx-auto px-4 overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-2xl overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-portal-navy text-white">
                    {content.comparisonTable.headers.map((h, i) => (
                      <th key={i} className="px-6 py-4 text-right font-bold text-base">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.comparisonTable.rows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-6 py-4 text-base text-gray-700 border-t border-gray-100">
                          {cell === true ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                           cell === false ? <XCircle className="w-5 h-5 text-red-400" /> :
                           cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pros/Cons & Content */}
        <article className="py-10">
          <div className="max-w-3xl mx-auto px-4">
            <ContentRenderer sections={content.sections || []} />
          </div>
        </article>

        {/* Recommendation */}
        {content.recommendation && (
          <section className="py-12 bg-portal-teal/5">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <h2 className="portal-h2 mb-4">ההמלצה שלנו</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">{content.recommendation}</p>
              <a href="#portal-lead-form">
                <Button className="h-14 px-8 text-lg rounded-2xl bg-portal-teal hover:bg-portal-teal-dark text-white font-bold shadow-lg">
                  בדוק מה מתאים לך
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </section>
        )}

        {/* Lead Form */}
        <section id="portal-lead-form" className="py-16 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            <PortalLeadForm
              sourcePage={`comparison-${slug}`}
              title="לא בטוח מה מתאים לך?"
              subtitle="השאר פרטים ונציג יחזור אליך עם המלצה אישית"
              ctaText="קבל המלצה אישית"
            />
          </div>
        </section>
      </main>

      <PortalFooter />
      <WhatsAppButton />
      <StickyMobileCTA />
    </>
  );
}
