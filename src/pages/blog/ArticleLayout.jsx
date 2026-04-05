import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import SEOHead from '@/components/seo/SEOHead';
import PortalLeadForm from '@/portal/components/PortalLeadForm';
import WhatsAppButton from '@/portal/components/WhatsAppButton';
import { getSignupUrl } from '@/components/utils/tracking';
import { ArrowLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PORTAL_CTA } from '@/portal/config/navigation';

/**
 * ArticleLayout - Shared layout for SEO blog articles
 * Includes SEO head, header, footer, internal links, and CTA
 */
export default function ArticleLayout({
  seoTitle,
  seoDescription,
  canonical,
  keywords,
  schema,
  heroTitle,
  heroSubtitle,
  heroColor = 'from-violet-600 to-indigo-600',
  ctaText,
  ctaLink,
  children,
  relatedArticles = [],
  relatedProducts = [],
}) {
  const SIGNUP_URL = ctaLink || getSignupUrl();

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        keywords={keywords}
        schema={schema}
      />
      <Header />
      <main className="pt-20 bg-white font-sans overflow-x-hidden">
        {/* Hero */}
        <section className={`py-16 md:py-24 bg-gradient-to-br ${heroColor} text-white`}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">{heroTitle}</h1>
            {heroSubtitle && <p className="text-xl text-white/80 max-w-2xl mx-auto">{heroSubtitle}</p>}
          </div>
        </section>

        {/* Article Content */}
        <article className="py-12 md:py-20">
          <div className="max-w-3xl mx-auto px-4 article-content" dir="rtl">
            <style>{`
              .article-content h2 { font-size: 1.75rem; font-weight: 800; color: #111827; margin-top: 2.5rem; margin-bottom: 1rem; line-height: 1.3; }
              .article-content h3 { font-size: 1.35rem; font-weight: 700; color: #1f2937; margin-top: 2rem; margin-bottom: 0.75rem; }
              .article-content p { font-size: 1.125rem; color: #374151; line-height: 1.8; margin-bottom: 1.25rem; }
              .article-content ul, .article-content ol { margin-bottom: 1.25rem; padding-right: 1.5rem; }
              .article-content li { font-size: 1.125rem; color: #374151; line-height: 1.8; margin-bottom: 0.5rem; }
              .article-content a { color: #7c3aed; text-decoration: none; font-weight: 600; }
              .article-content a:hover { text-decoration: underline; }
              .article-content strong { color: #111827; font-weight: 700; }
              .article-content ol { list-style-type: decimal; }
              .article-content ul { list-style-type: disc; }
            `}</style>
            {children}
          </div>
        </article>

        {/* Internal Links - Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">כלים שיעזרו לך</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedProducts.map((product, idx) => (
                  <a key={idx} href={product.href} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-violet-100 transition-all text-center group">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-violet-600 transition-colors mb-2">{product.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{product.desc}</p>
                    <span className="text-violet-600 text-sm font-bold">{product.price}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Internal Links - Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">מאמרים נוספים</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedArticles.map((article, idx) => (
                  <a key={idx} href={article.href} className="p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all group">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-violet-600 transition-colors mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-500">{article.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Lead Form */}
        <section id="portal-lead-form" className="py-16 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4">
            <PortalLeadForm
              sourcePage={`blog-${canonical || 'article'}`}
              title="רוצה ייעוץ אישי?"
              subtitle="השאר פרטים ומומחה יחזור אליך עם תשובות מותאמות"
              ctaText="שלח פרטים וקבל ייעוץ חינם"
            />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-black mb-6">{ctaText || 'מוכנים להתחיל?'}</h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={SIGNUP_URL}>
                <Button className="h-14 px-10 text-lg rounded-2xl bg-white text-violet-700 hover:bg-gray-50 shadow-xl font-bold w-full sm:w-auto">
                  התחל עכשיו בחינם
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </a>
              <a href={`tel:${PORTAL_CTA.phone}`}>
                <Button variant="outline" className="h-14 px-8 text-lg rounded-2xl border-2 border-white text-white hover:bg-white/10 font-bold w-full sm:w-auto">
                  <Phone className="ml-2 h-5 w-5" />
                  שיחה עם נציג
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
