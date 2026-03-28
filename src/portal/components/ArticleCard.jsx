import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

export default function ArticleCard({ title, description, href, readTime, category }) {
  return (
    <Link
      to={href}
      className="group block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-portal-teal/30 transition-all duration-300"
    >
      {category && (
        <span className="text-xs font-medium text-portal-teal bg-portal-teal/10 px-2.5 py-1 rounded-full">
          {category}
        </span>
      )}
      <h3 className="text-lg font-bold text-portal-navy mt-3 mb-2 group-hover:text-portal-teal transition-colors leading-snug">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">{description}</p>
      )}
      <div className="flex items-center justify-between">
        {readTime && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {readTime} דק׳
          </span>
        )}
        <span className="text-portal-teal text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
          קרא עוד <ArrowLeft className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
