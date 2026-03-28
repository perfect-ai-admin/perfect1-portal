import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { getSignupUrl } from '@/components/utils/tracking';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          <div className="max-w-3xl mx-auto px-4 prose prose-lg prose-gray prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-violet-600 prose-a:no-underline hover:prose-a:underline" dir="rtl">
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

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-black mb-6">{ctaText || 'מוכנים להתחיל?'}</h2>
            <a href={SIGNUP_URL}>
              <Button className="h-14 px-10 text-lg rounded-2xl bg-white text-violet-700 hover:bg-gray-50 shadow-xl font-bold">
                התחל עכשיו בחינם
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
