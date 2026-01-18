import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Award, 
  Star, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  Search,
  LayoutGrid,
  List,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const COURSES = [
  {
    id: 'marketing_101',
    category: 'beginner',
    title: 'שיווק לעצמאים 101',
    description: 'היסודות הקריטיים שכל בעל עסק חייב לדעת כדי להצליח.',
    duration: '15 דקות',
    lessons: 4,
    points: 100,
    progress: 0,
    image: 'bg-blue-100 text-blue-600',
    icon: GraduationCap,
    level: 'מתחיל'
  },
  {
    id: 'google_my_business',
    category: 'beginner',
    title: 'הגדרת Google Business',
    description: 'איך להופיע במפות של גוגל ולמשוך לקוחות מקומיים בחינם.',
    duration: '8 דקות',
    lessons: 2,
    points: 50,
    progress: 100,
    image: 'bg-green-100 text-green-600',
    icon: Search,
    level: 'מתחיל'
  },
  {
    id: 'social_mastery',
    category: 'growing',
    title: 'רשתות חברתיות ביעילות',
    description: 'סיסטם לניהול אינסטגרם ופייסבוק ב-20 דקות ביום.',
    duration: '12 דקות',
    lessons: 3,
    points: 150,
    progress: 30,
    image: 'bg-pink-100 text-pink-600',
    icon: Star,
    level: 'בינוני'
  },
  {
    id: 'email_marketing',
    category: 'growing',
    title: 'Email Marketing ברמה',
    description: 'בניית רשימת תפוצה ודיוור שמייצר מכירות.',
    duration: '10 דקות',
    lessons: 3,
    points: 120,
    progress: 0,
    image: 'bg-purple-100 text-purple-600',
    icon: BookOpen,
    level: 'בינוני'
  },
  {
    id: 'roi_analytics',
    category: 'advanced',
    title: 'מדידת ROI מתקדמת',
    description: 'איך לדעת בדיוק איזה שקל עובד ואיזה הולך לפח.',
    duration: '14 דקות',
    lessons: 5,
    points: 200,
    progress: 0,
    image: 'bg-orange-100 text-orange-600',
    icon: TrendingUp,
    level: 'מתקדם'
  },
  {
    id: 'automation_secrets',
    category: 'advanced',
    title: 'אוטומציה בשיווק',
    description: 'כלים שיעבדו בשבילך 24/7 ויחסכו לך זמן יקר.',
    duration: '16 דקות',
    lessons: 4,
    points: 250,
    progress: 0,
    image: 'bg-indigo-100 text-indigo-600',
    icon: Zap,
    level: 'מתקדם'
  }
];

export default function LearnSection() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const filteredCourses = COURSES.filter(course => {
    const matchesFilter = activeFilter === 'all' || course.category === activeFilter;
    const matchesSearch = course.title.includes(searchQuery) || course.description.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const totalPoints = COURSES.reduce((acc, curr) => acc + (curr.progress === 100 ? curr.points : 0), 0);
  const completedCourses = COURSES.filter(c => c.progress === 100).length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 md:p-10 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mb-2">
              <Award className="w-3 h-3 mr-1" />
              האקדמיה לשיווק
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold">ללמוד שיווק בכיף!</h2>
            <p className="text-indigo-100 max-w-lg text-sm md:text-base">
              הכלים, השיטות והידע שצריך כדי להזניק את העסק שלך.
              צפה בשיעורים קצרים וממוקדים.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[200px] border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-100">ההתקדמות שלך</span>
              <span className="text-lg font-bold">{totalPoints} נק'</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-200 mb-3">
              <CheckCircle2 className="w-3 h-3" />
              {completedCourses} מתוך {COURSES.length} קורסים הושלמו
            </div>
            <Progress value={(completedCourses / COURSES.length) * 100} className="h-2 bg-white/20" indicatorClassName="bg-yellow-400" />
          </div>
        </div>
        
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/30 rounded-full blur-2xl"></div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-gray-50/50 p-2 rounded-xl">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <FilterButton active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>הכל</FilterButton>
          <FilterButton active={activeFilter === 'beginner'} onClick={() => setActiveFilter('beginner')}>🌱 מתחיל</FilterButton>
          <FilterButton active={activeFilter === 'growing'} onClick={() => setActiveFilter('growing')}>🚀 צומח</FilterButton>
          <FilterButton active={activeFilter === 'advanced'} onClick={() => setActiveFilter('advanced')}>⚡ מתקדם</FilterButton>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="חיפוש שיעורים..." 
              className="pl-4 pr-9 bg-white border-gray-200 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeFilter + viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }
        >
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} viewMode={viewMode} />
          ))}
          
          {filteredCourses.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>לא נמצאו שיעורים התואמים את החיפוש</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FilterButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
        active 
          ? 'bg-gray-900 text-white shadow-md' 
          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function CourseCard({ course, viewMode }) {
  const Icon = course.icon;
  
  if (viewMode === 'list') {
    return (
      <div className="group bg-white border border-gray-100 hover:border-indigo-200 rounded-xl p-4 flex items-center gap-4 transition-all hover:shadow-md cursor-pointer">
        <div className={`w-16 h-16 rounded-lg ${course.image} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 truncate">{course.title}</h3>
            {course.progress === 100 && <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] h-5">הושלם</Badge>}
          </div>
          <p className="text-sm text-gray-500 truncate">{course.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.lessons} שיעורים</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {course.points} נק'</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button size="icon" variant="ghost" className="rounded-full">
            <Play className="w-5 h-5 text-indigo-600 fill-current" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white border border-gray-100 hover:border-indigo-200 rounded-2xl overflow-hidden transition-all hover:shadow-lg cursor-pointer flex flex-col h-full">
      <div className={`h-32 ${course.image} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon className="w-12 h-12 transform group-hover:scale-110 transition-transform duration-300" />
        <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900 shadow-sm backdrop-blur-sm">
          {course.level}
        </Badge>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{course.title}</h3>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
          {course.description}
        </p>
        
        <div className="space-y-4 mt-auto">
          {course.progress > 0 ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>התקדמות</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-1.5" />
            </div>
          ) : (
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
              <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {course.points} נק'</span>
            </div>
          )}
          
          <Button className="w-full bg-gray-50 hover:bg-indigo-50 text-gray-900 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
            {course.progress === 0 ? 'התחל ללמוד' : 'המשך ללמוד'}
            <Play className="w-4 h-4 mr-2 group-hover:fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}