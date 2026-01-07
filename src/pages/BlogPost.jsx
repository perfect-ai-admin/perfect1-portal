import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Clock, User, Calendar, Share2, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOOptimized from './SEOOptimized';
import LeadForm from '../components/forms/LeadForm';
import InternalLinker from '../components/seo/InternalLinker';

export default function BlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  // Force re-render when URL changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const { data: posts = [] } = useQuery({
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

  return (
    <>
      <SEOOptimized
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        keywords={post.keywords?.join(', ')}
        canonical={`https://perfect1.co.il/blog/${post.slug}`}
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
        <article className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <header className="mb-8">
                <Link to={createPageUrl('Blog')}>
                  <Button variant="ghost" className="mb-6">
                    <ArrowRight className="w-4 h-4 ml-2" />
                    חזרה לבלוג
                  </Button>
                </Link>

                <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.created_date).toLocaleDateString('he-IL')}</span>
                  </div>
                  {post.read_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{post.read_time} דקות קריאה</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="mr-auto"
                  >
                    <Share2 className="w-4 h-4 ml-2" />
                    שתף
                  </Button>
                </div>

                {post.featured_image && (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg mb-8"
                  />
                )}
              </header>

              {/* Content */}
              <div className="bg-white rounded-2xl shadow-elegant p-8 md:p-12 mb-12 border border-gray-100">
                <InternalLinker 
                  content={post.content.replace(/\n/g, '<br />')} 
                  currentPage="BlogPost" 
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