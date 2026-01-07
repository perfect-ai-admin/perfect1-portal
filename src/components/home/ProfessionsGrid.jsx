import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';

const categories = [
  { id: 'all', name: 'הכל', icon: '🌟' },
  { id: 'creative', name: 'קריאייטיב', icon: '🎨' },
  { id: 'writing', name: 'כתיבה', icon: '✍️' },
  { id: 'tech', name: 'טכנולוגיה', icon: '💻' },
  { id: 'music', name: 'מוזיקה', icon: '🎵' },
  { id: 'health', name: 'בריאות', icon: '💪' },
  { id: 'cosmetics', name: 'קוסמטיקה', icon: '💄' },
  { id: 'services', name: 'שירותים', icon: '🏠' },
  { id: 'food', name: 'מזון', icon: '🍳' },
  { id: 'education', name: 'חינוך', icon: '📚' }
];

const professions = [
  // Creative
  { name: 'מעצב גרפי', slug: 'meatzev-grafi', icon: '🎨', color: '#FF6B6B', category: 'creative' },
  { name: 'צלם', slug: 'tzalam', icon: '📸', color: '#4ECDC4', category: 'creative' },
  { name: 'אנימטור', slug: 'animator', icon: '🎬', color: '#9B59B6', category: 'creative' },
  { name: 'מאייר', slug: 'mayer', icon: '🖌️', color: '#E74C3C', category: 'creative' },
  { name: 'עורך וידאו', slug: 'orech-video', icon: '🎥', color: '#3498DB', category: 'creative' },
  { name: 'מעצב פנים', slug: 'meatzev-pnim', icon: '🏠', color: '#E67E22', category: 'creative' },
  { name: 'מעצב אופנה', slug: 'meatzev-ofna', icon: '👗', color: '#FF69B4', category: 'creative' },
  { name: 'צלם מוצרים', slug: 'tzalam-mutzarim', icon: '📷', color: '#00CED1', category: 'creative' },
  { name: 'מעצב תכשיטים', slug: 'meatzev-tachshitim', icon: '💎', color: '#FFD700', category: 'creative' },
  { name: 'אומן קעקועים', slug: 'oman-kaakuim', icon: '🎭', color: '#8B0000', category: 'creative' },
  
  // Writing
  { name: 'קופירייטר', slug: 'copywriter', icon: '✍️', color: '#F39C12', category: 'writing' },
  { name: 'כותב תוכן', slug: 'kotev-tochen', icon: '📝', color: '#1ABC9C', category: 'writing' },
  { name: 'מתרגם', slug: 'metargem', icon: '🌐', color: '#34495E', category: 'writing' },
  { name: 'סופר', slug: 'sofer', icon: '📚', color: '#8E44AD', category: 'writing' },
  { name: 'בלוגר', slug: 'blogger', icon: '💻', color: '#16A085', category: 'writing' },
  { name: 'כותב טכני', slug: 'kotev-techni', icon: '📄', color: '#2C3E50', category: 'writing' },
  { name: 'כותב קריאייטיב', slug: 'kotev-creative', icon: '✨', color: '#9B59B6', category: 'writing' },
  { name: 'עורך ספרים', slug: 'orech-sfarim', icon: '📖', color: '#6C5CE7', category: 'writing' },
  
  // Tech
  { name: 'מפתח אתרים', slug: 'mefateach-atarim', icon: '💻', color: '#2ECC71', category: 'tech' },
  { name: 'מעצב UX/UI', slug: 'meatzev-ux-ui', icon: '🖼️', color: '#E91E63', category: 'tech' },
  { name: 'מנהל מדיה חברתית', slug: 'menahel-social', icon: '📱', color: '#00BCD4', category: 'tech' },
  { name: 'מומחה SEO', slug: 'momche-seo', icon: '📈', color: '#FF9800', category: 'tech' },
  { name: 'מומחה אקסל', slug: 'momche-excel', icon: '📊', color: '#217346', category: 'tech' },
  { name: 'מפתח אפליקציות', slug: 'mefateach-apps', icon: '📲', color: '#5C6BC0', category: 'tech' },
  { name: 'מומחה אוטומציה', slug: 'momche-automation', icon: '⚙️', color: '#607D8B', category: 'tech' },
  { name: 'מנהל גוגל', slug: 'menahel-google-ads', icon: '🎯', color: '#4285F4', category: 'tech' },
  { name: 'מנהל פייסבוק', slug: 'menahel-facebook-ads', icon: '📘', color: '#1877F2', category: 'tech' },
  { name: 'אנליסט נתונים', slug: 'data-analyst', icon: '📉', color: '#00BFA5', category: 'tech' },
  
  // Music
  { name: 'מוזיקאי', slug: 'muzikai', icon: '🎵', color: '#673AB7', category: 'music' },
  { name: 'מפיק מוזיקלי', slug: 'mafik-muzikali', icon: '🎧', color: '#FF5722', category: 'music' },
  { name: 'מורה למוזיקה', slug: 'more-lemuzika', icon: '🎹', color: '#9C27B0', category: 'music' },
  { name: 'תקליטן', slug: 'dj', icon: '🎛️', color: '#E040FB', category: 'music' },
  { name: 'זמר', slug: 'zamar', icon: '🎤', color: '#F44336', category: 'music' },
  { name: 'מורה לאומנות', slug: 'more-leomanut', icon: '🎭', color: '#795548', category: 'music' },
  
  // Health
  { name: 'מאמן כושר', slug: 'meamen-kosher', icon: '💪', color: '#E53935', category: 'health' },
  { name: 'מטפל אלטרנטיבי', slug: 'metapel-alternativy', icon: '🧘', color: '#4CAF50', category: 'health' },
  { name: 'יועץ תזונה', slug: 'yoetz-tzona', icon: '🥗', color: '#8BC34A', category: 'health' },
  { name: 'מורה יוגה', slug: 'more-yoga', icon: '🧘‍♀️', color: '#9C27B0', category: 'health' },
  { name: 'מורה פילאטיס', slug: 'more-pilates', icon: '🤸', color: '#E91E63', category: 'health' },
  { name: 'מסאז\'יסט', slug: 'masagist', icon: '💆', color: '#00BCD4', category: 'health' },
  { name: 'רפלקסולוג', slug: 'reflexolog', icon: '🦶', color: '#009688', category: 'health' },
  { name: 'מאמן אישי', slug: 'meamen-ishi', icon: '🏋️', color: '#FF5722', category: 'health' },
  
  // Cosmetics
  { name: 'מאפרת', slug: 'makeup-artist', icon: '💄', color: '#FF69B4', category: 'cosmetics' },
  { name: 'קוסמטיקאית', slug: 'cosmetician', icon: '✨', color: '#DDA0DD', category: 'cosmetics' },
  { name: 'מניקוריסטית', slug: 'manicurist', icon: '💅', color: '#FF1493', category: 'cosmetics' },
  { name: 'מעצבת גבות', slug: 'eyebrow-stylist', icon: '👁️', color: '#CD853F', category: 'cosmetics' },
  { name: 'מעצבת ריסים', slug: 'lash-artist', icon: '👀', color: '#8B4789', category: 'cosmetics' },
  { name: 'מעצבת שיער', slug: 'hair-stylist', icon: '💇', color: '#FF6347', category: 'cosmetics' },
  
  // Services
  { name: 'עוזר וירטואלי', slug: 'ozer-virtuali', icon: '👩‍💼', color: '#607D8B', category: 'services' },
  { name: 'מנהל פרויקטים', slug: 'menahel-projects', icon: '📋', color: '#00BCD4', category: 'services' },
  { name: 'יועץ עסקי', slug: 'yoetz-iski', icon: '💼', color: '#455A64', category: 'services' },
  { name: 'נהג הובלות', slug: 'nahag-hovalot', icon: '🚚', color: '#795548', category: 'services' },
  { name: 'איש תחזוקה', slug: 'ish-tachzuka', icon: '🔧', color: '#78909C', category: 'services' },
  { name: 'מנקה בתים', slug: 'menake-batim', icon: '🧹', color: '#4DD0E1', category: 'services' },
  { name: 'גנן', slug: 'ganan', icon: '🌱', color: '#66BB6A', category: 'services' },
  { name: 'אינסטלטור', slug: 'instalator', icon: '🔧', color: '#1565C0', category: 'services' },
  { name: 'חשמלאי', slug: 'chashmlay', icon: '⚡', color: '#FFC107', category: 'services' },
  { name: 'טכנאי מיזוג', slug: 'technay-mizug', icon: '❄️', color: '#03A9F4', category: 'services' },
  
  // Food
  { name: 'שף פרטי', slug: 'chef-prati', icon: '👨‍🍳', color: '#FF7043', category: 'food' },
  { name: 'קונדיטור', slug: 'konditor', icon: '🧁', color: '#FF80AB', category: 'food' },
  { name: 'ברמן', slug: 'barman', icon: '🍸', color: '#5D4037', category: 'food' },
  { name: 'קייטרינג', slug: 'catering', icon: '🍽️', color: '#FF5722', category: 'food' },
  { name: 'מארגן אירועים', slug: 'meragen-eruim', icon: '🎉', color: '#E91E63', category: 'food' },
  { name: 'אפייה ביתית', slug: 'afiya-betit', icon: '🥐', color: '#FFAB91', category: 'food' },
  
  // Education
  { name: 'מורה פרטי', slug: 'more-prati', icon: '📖', color: '#3F51B5', category: 'education' },
  { name: 'מדריך ילדים', slug: 'madrich-yeladim', icon: '🎈', color: '#FF9800', category: 'education' },
  { name: 'קואוצ\'ר', slug: 'coach', icon: '🎯', color: '#009688', category: 'education' },
  { name: 'מורה לשפות', slug: 'more-lesfatot', icon: '🗣️', color: '#673AB7', category: 'education' },
  { name: 'מדריך טיולים', slug: 'madrich-tiyulim', icon: '🧭', color: '#4CAF50', category: 'education' },
  { name: 'מדריך ספורט', slug: 'madrich-sport', icon: '⚽', color: '#F44336', category: 'education' }
];

export default function ProfessionsGrid({ showAll = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProfessions = professions.filter(prof => {
    const matchesSearch = prof.name.includes(searchTerm);
    const matchesCategory = activeCategory === 'all' || prof.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedProfessions = showAll ? filteredProfessions : filteredProfessions.slice(0, 12);

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