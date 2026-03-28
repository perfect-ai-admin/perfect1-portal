import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import SchemaMarkup from './SchemaMarkup';

export default function Breadcrumbs({ items = [] }) {
  const allItems = [
    { label: 'ראשי', href: '/opening-business-israel' },
    ...items,
  ];

  return (
    <>
      <SchemaMarkup type="breadcrumb" breadcrumbs={allItems} />
      <nav aria-label="breadcrumb" className="py-3">
        <ol className="flex items-center flex-wrap gap-1 text-sm text-portal-text-light">
          {allItems.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronLeft className="w-4 h-4" />}
              {index === 0 && <Home className="w-4 h-4 ml-1" />}
              {item.href && index < allItems.length - 1 ? (
                <Link
                  to={item.href}
                  className="hover:text-portal-teal transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-portal-navy font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
