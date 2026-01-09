import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft } from 'lucide-react';

export default function Breadcrumbs({ items }) {
  // items format: [{ label: 'בית', url: 'Home' }, { label: 'שירותים', url: 'Services' }, { label: 'פתיחת עוסק פטור' }]
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.url && { "item": `https://perfect1.co.il${createPageUrl(item.url)}` })
    }))
  };

  React.useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(breadcrumbSchema);
    script.id = 'breadcrumb-schema';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('breadcrumb-schema');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [items]);

  return (
    <nav className="bg-transparent py-1" dir="rtl">
      <ol className="flex items-center gap-2 text-xs">
           {items.map((item, index) => (
             <li key={index} className="flex items-center gap-2">
               {item.url ? (
                 <Link 
                   to={createPageUrl(item.url)}
                   className="text-white/70 hover:text-white transition-colors"
                 >
                   {item.label}
                 </Link>
               ) : (
                 <span className="text-white font-medium">{item.label}</span>
               )}
               {index < items.length - 1 && (
                 <ChevronLeft className="w-4 h-4 text-white/50" />
               )}
             </li>
           ))}
        </ol>
    </nav>
  );
}