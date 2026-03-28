import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEOHead from '@/components/seo/SEOHead';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';
import Breadcrumbs from '../components/Breadcrumbs';
import ArticleCard from '../components/ArticleCard';
import PortalLeadForm from '../components/PortalLeadForm';
import WhatsAppButton from '../components/WhatsAppButton';
import StickyMobileCTA from '../components/StickyMobileCTA';
import SchemaMarkup from '../components/SchemaMarkup';
import { usePortalContent } from '../hooks/usePortalContent';

export default function CategoryHubPage({ category }) {
  const { content, loading, error } = usePortalContent(category, null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-portal-teal/20 border-t-portal-teal rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <p>הדף לא נמצא</p>
      </div>
    );
  }

  const { title, description, metaTitle, metaDescription, color, subcategories = [], articles = [], faq = [] } = content;

  const colorMap = {
    teal: 'from-teal-600 to-teal-700',
    blue: 'from-blue-600 to-blue-700',
    indigo: 'from-indigo-600 to-indigo-700',
    red: 'from-red-600 to-red-700',
    amber: 'from-amber-600 to-amber-700',
  };
  const gradient = colorMap[color] || colorMap.teal;

  return (
    <>
      <SEOHead
        title={metaTitle || `${title} | פרפקט וואן`}
        description={metaDescription || description}
        canonical={`/${category}`}
        keywords={content.keywords?.join(', ')}
      />
      <SchemaMarkup type="category" data={content} faqItems={faq} breadcrumbs={[{ label: title }]} />
      <PortalHeader />

      <main className="pt-16 md:pt-[72px]">
        {/* Hero */}
        <section className={`py-16 md:py-24 bg-gradient-to-br ${gradient} text-white`}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="mb-4"><Breadcrumbs items={[{ label: title }]} /></div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">{title}</h1>
            <p className="text-xl text-white/80 max-w-2xl leading-relaxed">{description}</p>
          </div>
        </section>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <section className="py-12 md:py-16 bg-white">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="portal-h2 mb-8">נושאים בקטגוריה</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subcategories.map((sub, i) => (
                  <Link
                    key={i}
                    to={sub.href || `/${category}/${sub.slug}`}
                    className="group flex items-center justify-between p-5 bg-portal-bg rounded-xl border border-gray-100 hover:border-portal-teal/30 hover:shadow-md transition-all"
                  >
                    <div>
                      <h3 className="font-bold text-portal-navy group-hover:text-portal-teal transition-colors">{sub.title}</h3>
                      {sub.count && <span className="text-sm text-gray-400">{sub.count} מאמרים</span>}
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-portal-teal transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <section className="py-12 md:py-16 bg-portal-bg">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="portal-h2 mb-8">מאמרים ומדריכים</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ArticleCard
                      title={article.title}
                      description={article.description}
                      href={`/${category}/${article.slug}`}
                      readTime={article.readTime}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Lead Form */}
        <section id="portal-lead-form" className="py-16 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            <PortalLeadForm
              sourcePage={`category-${category}`}
              title="צריך עזרה? השאר פרטים"
              subtitle="מומחה יחזור אליך עם כל המידע שתצטרך"
              ctaText="שלח פרטים"
            />
          </div>
        </section>

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="py-12 md:py-16 bg-portal-bg">
            <div className="max-w-3xl mx-auto px-4">
              <h2 className="portal-h2 text-center mb-8">שאלות נפוצות</h2>
              <Accordion type="single" collapsible className="space-y-3">
                {faq.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-xl border border-gray-200 px-6 overflow-hidden">
                    <AccordionTrigger className="text-right font-bold text-lg text-portal-navy hover:no-underline py-5">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-base leading-relaxed pb-5">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}
      </main>

      <PortalFooter />
      <WhatsAppButton />
      <StickyMobileCTA />
    </>
  );
}
