import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SearchBar({ placeholder = 'חפש מאמרים ומדריכים...', onSearch, className = '' }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-12 pr-10 pl-10 rounded-xl text-base border-gray-200 focus:border-portal-teal focus:ring-portal-teal"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          aria-label="נקה חיפוש"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
