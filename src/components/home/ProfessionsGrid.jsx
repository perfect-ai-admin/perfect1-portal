import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const categories = [
  { id: 'all', name: 'הכל', icon: '🌟' },
  { id: 'creative', name: 'קריאייטיב', icon: '🎨' },
  { id: 'writing', name: 'כתיבה', icon: '✍️' },
  { id: 'tech', name: 'טכנולוגיה', icon: '💻' },
  { id: 'music', name: 'מוזיקה', icon: '🎵' },
  { id: 'health', name: 'בריאות', icon: '💪' },
  { id: 'cosmetics', name: 'קוסמטיקה', icon: '💄' },
  { id: 'delivery', name: 'שליחים', icon: '🛵' },
  { id: 'services', name: 'שירותים', icon: '🏠' },
  { id: 'food', name: 'מזון', icon: '🍳' },
  { id: 'education', name: 'חינוך', icon: '📚' }
];

export default function ProfessionsGrid({ showAll = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const data = await base44.entities.Profession.list();
        setProfessions(data || []);
      } catch (error) {
        console.error('Error fetching professions:', error);
        setProfessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessions();
  }, []);

  const filteredProfessions = professions.filter(prof => {
    const matchesSearch = prof.name.includes(searchTerm);
    const matchesCategory = activeCategory === 'all' || prof.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedProfessions = showAll ? filteredProfessions : filteredProfessions.slice(0, 12);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">טוען מקצועות...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-4">
            בחר את המקצוע שלך
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            יש לנו ניסיון בפתיחת עוסקים פטורים למגוון רחב של מקצועות
          </p>
        </motion.div>

        {/* Search & Filter */}
        <div className="mb-10 space-y-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="חפש מקצוע..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-12 h-14 rounded-full border-gray-200 shadow-sm text-lg"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-4 ${
                  activeCategory === cat.id 
                    ? 'bg-[#1E3A5F] text-white' 
                    : 'border-gray-200 hover:border-[#1E3A5F]'
                }`}
              >
                <span className="ml-2">{cat.icon}</span>
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence mode="popLayout">
            {displayedProfessions.map((prof, index) => (
              <motion.div
                key={prof.slug}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
              >
                <Link 
                  to={createPageUrl('ProfessionPage') + `?slug=${prof.slug}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <div className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-transparent hover:shadow-elegant-hover transition-all duration-300 text-center h-full">
                    <div 
                      className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${prof.color}20` }}
                    >
                      {prof.icon}
                    </div>
                    <h3 className="font-medium text-gray-800 text-sm group-hover:text-[#1E3A5F] transition-colors">
                      {prof.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View All */}
        {!showAll && filteredProfessions.length > 12 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link to={createPageUrl('Professions')}>
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-full px-8 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white"
              >
                צפה בכל המקצועות ({professions.length})
                <ArrowLeft className="mr-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}