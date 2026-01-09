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
        <article className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <header className="mb-12">
                <Link to={createPageUrl('Blog')}>
                  <Button variant="ghost" className="mb-6 hover:bg-gray-100">
                    <ArrowRight className="w-4 h-4 ml-2" />
                    חזרה לבלוג
                  </Button>
                </Link>

                {/* Category Badge */}
                <div className="mb-4">
                  <span className="inline-block px-4 py-1 bg-[#1E3A5F] text-white text-sm font-semibold rounded-full">
                    {post.category === 'osek-patur' ? 'עוסק פטור' : 
                     post.category === 'taxes' ? 'מיסים' :
                     post.category === 'professions' ? 'מקצועות' :
                     post.category === 'guides' ? 'מדריכים' : 'כללי'}
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tight">
                  {post.title}
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{post.author}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(post.created_date).toLocaleDateString('he-IL', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  {post.read_time && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">{post.read_time} דקות קריאה</span>
                    </div>
                  )}
                </div>

                {/* Social Share */}
                <div className="mt-6">
                  <SocialShare 
                    title={post.title}
                    excerpt={post.excerpt}
                    url={`https://perfect1.co.il/blog/${post.slug}`}
                  />
                </div>
              </header>

              {post.featured_image && (
                <figure className="mb-12">
                  <img
                    src={post.featured_image}
                    alt={`${post.title} | מדריך מקצועי לפתיחת עוסק פטור בישראל - Perfect One`}
                    loading="lazy"
                    width="1200"
                    height="630"
                    className="w-full h-[400px] md:h-[500px] object-cover rounded-3xl shadow-2xl"
                  />
                  <figcaption className="text-sm text-gray-500 text-center mt-3">
                    {post.title} - Perfect One
                  </figcaption>
                </figure>
              )}

              {/* Content - Premium Magazine Style */}
              <div className="bg-white mb-12">
                {/* Article Body with Premium Typography */}
                <div 
                  className="
                    prose prose-xl max-w-none
                    prose-headings:font-black prose-headings:text-gray-900 prose-headings:mb-4 prose-headings:mt-8
                    prose-h2:text-3xl prose-h2:border-b-4 prose-h2:border-[#1E3A5F] prose-h2:pb-3 prose-h2:mb-6
                    prose-h3:text-2xl prose-h3:text-[#1E3A5F]
                    prose-p:text-gray-700 prose-p:leading-[1.9] prose-p:mb-6 prose-p:text-lg
                    prose-strong:text-[#1E3A5F] prose-strong:font-bold
                    prose-a:text-[#1E3A5F] prose-a:font-semibold prose-a:underline prose-a:decoration-2
                    prose-ul:my-6 prose-ul:space-y-3
                    prose-li:text-gray-700 prose-li:leading-relaxed prose-li:text-lg
                    prose-blockquote:border-r-4 prose-blockquote:border-[#D4AF37] prose-blockquote:bg-amber-50 prose-blockquote:p-6 prose-blockquote:rounded-xl prose-blockquote:not-italic
                    prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[#1E3A5F]
                  "
                  style={{
                    fontFamily: "'Heebo', sans-serif",
                    wordSpacing: '0.05em',
                    letterSpacing: '0.01em'
                  }}
                >
                  <InternalLinker 
                    content={post.content.replace(/\n/g, '<br />')} 
                    currentPage="BlogPost" 
                  />
                </div>

                {/* Mid-Article Image (if exists) */}
                {post.featured_image && (
                  <figure className="my-12">
                    <img
                      src={post.featured_image}
                      alt={`${post.title} - המדריך המלא מאת Perfect One`}
                      loading="lazy"
                      width="1200"
                      height="600"
                      className="w-full h-[350px] md:h-[450px] object-cover rounded-2xl shadow-xl"
                    />
                  </figure>
                )}
                
                {/* SEO Internal Links Box - Premium Design */}
                <div className="mt-12 p-8 md:p-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl border-2 border-[#1E3A5F]/20 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900">מדריכים מומלצים</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-r-4 border-[#1E3A5F]">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">🎯</span>
                        <div>
                          <a href="/OsekPaturLanding" className="text-xl font-black text-[#1E3A5F] hover:underline decoration-2 block mb-2">
                            המדריך המלא לפתיחת עוסק פטור בישראל
                          </a>
                          <p className="text-gray-600 leading-relaxed">
                            כל מה שצריך לדעת על פתיחת עוסק פטור - תהליך, עלויות, דרישות וטיפים חשובים
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-r-4 border-[#3498DB]">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">💻</span>
                        <div>
                          <a href="/OsekPaturOnlineLanding" className="text-xl font-black text-[#1E3A5F] hover:underline decoration-2 block mb-2">
                            פתיחת עוסק פטור אונליין - 100% דיגיטלי
                          </a>
                          <p className="text-gray-600 leading-relaxed">
                            פתחו עוסק פטור אונליין בלי לצאת מהבית - תהליך מקוון מלא עם חתימה דיגיטלית
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-r-4 border-[#27AE60]">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">👥</span>
                        <div>
                          <a href="/Professions" className="text-xl font-black text-[#1E3A5F] hover:underline decoration-2 block mb-2">
                            מדריכים ייעודיים לפי מקצוע
                          </a>
                          <p className="text-gray-600 leading-relaxed">
                            מידע מפורט והתאמה אישית לכל מקצוע - מעצבים, צלמים, מאמנים ועוד
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Form - News Style */}
              <div className="mb-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 border-2 border-gray-200">
                <div className="text-center mb-6">
                  <h3 className="text-2xl md:text-3xl font-black text-[#1E3A5F] mb-2">
                    רוצה לפתוח עוסק פטור?
                  </h3>
                  <p className="text-gray-600 text-lg">השאר פרטים ונחזור אליך תוך שעות</p>
                </div>
                <LeadForm 
                  title=""
                  subtitle=""
                  sourcePage={`מאמר: ${post.title}`}
                  variant="inline"
                />
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-8 text-center text-white mb-12">
                <h3 className="text-2xl font-bold mb-4">מעוניין לפתוח עוסק פטור?</h3>
                <p className="text-white/90 mb-6">נשמח לעזור לך להתחיל את הדרך כעצמאי</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="https://wa.me/972502277087?text=היי, קראתי את המאמר ואשמח לקבל ייעוץ" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white">
                      <MessageCircle className="w-5 h-5 ml-2" />
                      דבר איתנו בווצאפ
                    </Button>
                  </a>
                  <a href="tel:0502277087">
                    <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[#1E3A5F]">
                      <Phone className="w-5 h-5 ml-2" />
                      0502277087
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">מאמרים נוספים</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.filter(p => p.id !== post.id).slice(0, 3).map((relatedPost) => (
                  <a 
                    key={relatedPost.id} 
                    href={`${createPageUrl('BlogPost')}?slug=${relatedPost.slug}`}
                    className="block"
                  >
                    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
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