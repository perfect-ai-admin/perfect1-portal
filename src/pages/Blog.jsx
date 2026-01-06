import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, Clock, ArrowLeft, FileText, TrendingUp, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SEOOptimized from './SEOOptimized';

const categories = [
  { id: 'all', name: 'הכל', icon: BookOpen },
  { id: 'osek-patur', name: 'עוסק פטור', icon: FileText },
  { id: 'taxes', name: 'מיסים', icon: TrendingUp },
  { id: 'professions', name: 'מקצועות', icon: BookOpen },
  { id: 'guides', name: 'מדריכים', icon: FileText }
];

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-created_date'),
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SEOOptimized
        title="בלוג עצמאים - מדריכים וטיפים לעוסקים פטורים | Perfect One"
        description="מדריכים, טיפים ומאמרים לעצמאים ועוסקים פטורים בישראל. כל מה שצריך לדעת על פתיחת עוסק, מיסים, דיווחים ומקצועות עצמאיים."
        keywords="בלוג עצמאים, מדריך עוסק פטור, טיפים לעצמאים, מיסים לעצמאים, דיווחים לעוסק פטור"
        canonical="https://perfect1.co.il/blog"
      />
      <main className="pt-20 bg-[#F8F9FA]">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                בלוג עצמאים
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                מדריכים, טיפים ומאמרים לעוסקים פטורים ועצמאים בישראל
              </p>

              {/* Search */}
              <div className="max-w-xl mx-auto relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="חפש מאמרים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 pr-12 rounded-2xl text-lg border-0 shadow-xl"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full ${
                    selectedCategory === cat.id
                      ? 'bg-[#1E3A5F] hover:bg-[#2C5282]'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <cat.icon className="w-4 h-4 ml-2" />
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">לא נמצאו מאמרים</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, i) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      to={`${createPageUrl('BlogPost')}?slug=${post.slug}`}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden h-full flex flex-col">
                        {post.featured_image && (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold text-[#1E3A5F] bg-[#1E3A5F]/10 px-3 py-1 rounded-full">
                              {categories.find(c => c.id === post.category)?.name || post.category}
                            </span>
                            {post.read_time && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.read_time} דק'
                              </span>
                            )}
                          </div>
                          <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                            {post.title}
                          </h2>
                          <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500">{post.author}</span>
                            <Button variant="ghost" className="text-[#1E3A5F] hover:text-[#2C5282]">
                              קרא עוד
                              <ArrowLeft className="w-4 h-4 mr-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}