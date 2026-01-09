import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Clock, User, Calendar, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOOptimized from './SEOOptimized';
import LeadForm from '../components/forms/LeadForm';
import InternalLinker from '../components/seo/InternalLinker';
import SocialShare from '../components/blog/SocialShare';

export default function BlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  // Force re-render when URL changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => base44.entities.BlogPost.filter({ slug, published: true }),
    enabled: !!slug
  });

  const post = posts[0];

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ['related-posts', post?.category],
    queryFn: () => base44.entities.BlogPost.filter({ 
      category: post.category, 
      published: true 
    }, '-created_date', 3),
    enabled: !!post
  });

  if (isLoading) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F] mx-auto"></div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">מאמר לא נמצא</h1>
          <Link to={createPageUrl('Blog')}>
            <Button>חזרה לבלוג</Button>
          </Link>
        </div>
      </main>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      });
    }
  };

  // Enhanced Article Schema with full AEO support
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featured_image || "https://perfect1.co.il/default-blog.jpg",
    "author": {
      "@type": "Person",
      "name": post.author,
      "url": "https://perfect1.co.il/Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Perfect One",
      "url": "https://perfect1.co.il",
      "logo": {
        "@type": "ImageObject",
        "url": "https://perfect1.co.il/logo.png"
      },
      "sameAs": [
        "https://www.facebook.com/perfect1.co.il",
        "https://www.linkedin.com/company/perfect1",
        "https://www.instagram.com/perfect1.co.il"
      ]
    },
    "datePublished": post.created_date,
    "dateModified": post.updated_date || post.created_date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://perfect1.co.il/blog/${post.slug}`,
      "url": `https://perfect1.co.il/blog/${post.slug}`
    },
    "about": {
      "@type": "Thing",
      "name": "עוסק פטור בישראל",
      "description": post.category === 'osek-patur' ? 'עוסק פטור' : post.category
    },
    "isPartOf": {
      "@type": "Blog",
      "name": "בלוג Perfect One לעוסקים פטורים",
      "url": "https://perfect1.co.il/Blog",
      "publisher": {
        "@type": "Organization",
        "name": "Perfect One"
      }
    },
    "keywords": post.keywords?.join(', '),
    "articleSection": post.category,
    "wordCount": post.content?.split(' ').length || 0,
    "inLanguage": "he-IL"
  };

  return (
    <>
      <SEOOptimized
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        keywords={post.keywords?.join(', ')}
        canonical={`https://perfect1.co.il/blog/${post.slug}`}
        schema={articleSchema}
      />
      <main className="pt-20 bg-[#F8F9FA]">
        {/* Breadcrumb */}
        <section className="bg-white py-4 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link to={createPageUrl('Home')} className="hover:text-[#1E3A5F]">בית</Link>
              <span>/</span>
              <Link to={createPageUrl('Blog')} className="hover:text-[#1E3A5F]">בלוג</Link>
              <span>/</span>
              <span className="text-gray-800 font-medium">{post.title}</span>
            </div>
          </div>
        </section>

        {/* Article */}
        <article className="py-8 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <header className="mb-6">
                <Link to={createPageUrl('Blog')}>
                  <Button variant="ghost" size="sm" className="mb-4 hover:bg-gray-100">
                    <ArrowRight className="w-4 h-4 ml-2" />
                    חזרה לבלוג
                  </Button>
                </Link>

                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-[#1E3A5F] text-white text-xs font-bold rounded-full uppercase tracking-wide">
                    {post.category === 'osek-patur' ? 'עוסק פטור' : 
                     post.category === 'taxes' ? 'מיסים' :
                     post.category === 'professions' ? 'מקצועות' :
                     post.category === 'guides' ? 'מדריכים' : 'כללי'}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 leading-[1.15]">
                  {post.title}
                </h1>

                <p className="text-lg text-gray-600 mb-5 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-4 pb-4 mb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">{post.author}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(post.created_date).toLocaleDateString('he-IL', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  {post.read_time && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{post.read_time} דקות</span>
                    </div>
                  )}
                  <div className="mr-auto">
                    <SocialShare 
                      title={post.title}
                      excerpt={post.excerpt}
                      url={`https://perfect1.co.il/blog/${post.slug}`}
                    />
                  </div>
                </div>
              </header>

              {post.featured_image && (
                <figure className="mb-6">
                  <img
                    src={post.featured_image}
                    alt={`${post.title} | מדריך מקצועי לפתיחת עוסק פטור בישראל - Perfect One`}
                    loading="lazy"
                    width="1200"
                    height="630"
                    className="w-full h-[300px] md:h-[400px] object-cover rounded-2xl shadow-lg"
                  />
                  <figcaption className="text-xs text-gray-500 text-center mt-2">
                    {post.title} - Perfect One
                  </figcaption>
                </figure>
              )}

              {/* Content - Clean Professional Style */}
              <div className="bg-white">
                {/* Article Body */}
                <div 
                  className="
                    prose prose-lg max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mb-3 prose-headings:mt-6
                    prose-h2:text-2xl prose-h2:border-b-2 prose-h2:border-[#1E3A5F]/20 prose-h2:pb-2
                    prose-h3:text-xl prose-h3:text-[#1E3A5F]
                    prose-p:text-gray-700 prose-p:leading-[1.75] prose-p:mb-4 prose-p:text-base
                    prose-strong:text-[#1E3A5F] prose-strong:font-semibold
                    prose-a:text-[#1E3A5F] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                    prose-ul:my-4 prose-ul:space-y-2
                    prose-li:text-gray-700 prose-li:leading-relaxed prose-li:text-base
                    prose-blockquote:border-r-4 prose-blockquote:border-[#D4AF37] prose-blockquote:bg-amber-50/50 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-lg prose-blockquote:not-italic prose-blockquote:my-4
                    prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-[#1E3A5F]
                    prose-img:rounded-xl prose-img:shadow-md prose-img:my-6
                  "
                >
                  <InternalLinker 
                    content={post.content.replace(/\n/g, '<br />')} 
                    currentPage="BlogPost" 
                  />
                </div>
                
                {/* SEO Internal Links - Compact */}
                <div className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-[#1E3A5F]/10">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">📚</span>
                    מדריכים נוספים
                  </h3>
                  
                  <div className="space-y-2.5">
                    <div className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                      <a href="/OsekPaturLanding" className="text-base font-bold text-[#1E3A5F] hover:underline flex items-center gap-2">
                        <span>🎯</span>
                        המדריך המלא לפתיחת עוסק פטור בישראל
                      </a>
                    </div>

                    <div className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                      <a href="/OsekPaturOnlineLanding" className="text-base font-bold text-[#1E3A5F] hover:underline flex items-center gap-2">
                        <span>💻</span>
                        פתיחת עוסק פטור אונליין - 100% דיגיטלי
                      </a>
                    </div>

                    <div className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
                      <a href="/Professions" className="text-base font-bold text-[#1E3A5F] hover:underline flex items-center gap-2">
                        <span>👥</span>
                        מדריכים ייעודיים לפי מקצוע
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Form - Compact */}
              <div className="my-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-1">
                    רוצה לפתוח עוסק פטור?
                  </h3>
                  <p className="text-gray-600 text-sm">השאר פרטים ונחזור אליך תוך שעות</p>
                </div>
                <LeadForm 
                  title=""
                  subtitle=""
                  sourcePage={`מאמר: ${post.title}`}
                  variant="inline"
                  compact={true}
                />
              </div>

              {/* CTA - Compact */}
              <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-xl p-5 text-center text-white my-8">
                <h3 className="text-lg font-bold mb-2">מעוניין לפתוח עוסק פטור?</h3>
                <p className="text-white/90 text-sm mb-4">נשמח לעזור לך להתחיל</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="https://wa.me/972502277087?text=היי, קראתי את המאמר ואשמח לקבל ייעוץ" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white">
                      <MessageCircle className="w-4 h-4 ml-2" />
                      דבר איתנו בווצאפ
                    </Button>
                  </a>
                  <a href="tel:0502277087">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[#1E3A5F]">
                      <Phone className="w-4 h-4 ml-2" />
                      0502277087
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </article>

        {/* Related Posts - Compact */}
        {relatedPosts.length > 0 && (
          <section className="py-8 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">מאמרים נוספים שיעניינו אותך</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {relatedPosts.filter(p => p.id !== post.id).slice(0, 3).map((relatedPost) => (
                  <a 
                    key={relatedPost.id} 
                    href={`${createPageUrl('BlogPost')}?slug=${relatedPost.slug}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl p-4 hover:shadow-md transition-all border border-gray-200 h-full">
                      <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#1E3A5F]">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 leading-snug">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}