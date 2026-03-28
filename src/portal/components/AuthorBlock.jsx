import React from 'react';
import { Calendar, Clock, User } from 'lucide-react';

export default function AuthorBlock({ author, publishDate, updatedDate, readTime }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-portal-text-light py-4 border-b border-gray-100 mb-8">
      {author && (
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4" />
          <span>{author.name || author}</span>
        </div>
      )}
      {publishDate && (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(updatedDate || publishDate)}</span>
        </div>
      )}
      {readTime && (
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{readTime} דקות קריאה</span>
        </div>
      )}
    </div>
  );
}
