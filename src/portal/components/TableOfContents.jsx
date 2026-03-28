import React, { useState, useEffect } from 'react';
import { List } from 'lucide-react';

export default function TableOfContents({ items = [] }) {
  const [activeId, setActiveId] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="bg-portal-bg rounded-2xl border border-gray-200 p-6 mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full md:cursor-default"
      >
        <List className="w-5 h-5 text-portal-teal" />
        <span className="font-bold text-lg text-portal-navy">תוכן העמוד</span>
      </button>
      <nav className={`mt-4 ${isOpen || 'hidden md:block'}`}>
        <ol className="space-y-2 list-none">
          {items.map((item, index) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  setIsOpen(false);
                }}
                className={`block py-1.5 px-3 rounded-lg text-base transition-colors ${
                  activeId === item.id
                    ? 'bg-portal-teal/10 text-portal-teal font-medium'
                    : 'text-gray-600 hover:text-portal-navy hover:bg-gray-100'
                }`}
              >
                {index + 1}. {item.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
