import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Briefcase, Building2, FolderX, BookOpen } from 'lucide-react';

const ICONS = { FileText, Briefcase, Building2, FolderX, BookOpen };

const COLOR_MAP = {
  teal: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
  blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
  red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  amber: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
};

export default function CategoryCard({ title, description, href, icon, color = 'teal', stats }) {
  const Icon = ICONS[icon] || FileText;
  const gradient = COLOR_MAP[color] || COLOR_MAP.teal;

  return (
    <Link
      to={href}
      className={`group relative block rounded-2xl bg-gradient-to-br ${gradient} text-white p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10" />

      <Icon className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 opacity-90" />
      <h3 className="text-xl sm:text-2xl font-bold mb-2">{title}</h3>
      <p className="text-white/80 text-base leading-relaxed mb-4">{description}</p>

      {stats && (
        <div className="text-sm text-white/60 mb-4">
          {stats.articles} מאמרים • {stats.guides} מדריכים
        </div>
      )}

      <div className="flex items-center gap-1 text-white font-medium group-hover:gap-2 transition-all">
        למידע מלא <ArrowLeft className="w-4 h-4" />
      </div>
    </Link>
  );
}
