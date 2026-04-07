import { useLocation } from 'react-router-dom';
import { PORTAL_CATEGORIES } from '../config/navigation';

export function useBreadcrumbs(articleTitle) {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'בית', href: '/' }];

  if (parts.length >= 1) {
    const category = PORTAL_CATEGORIES.find(c => c.id === parts[0]);
    if (category) {
      breadcrumbs.push({ label: category.title, href: `/${category.id}` });
    }
  }

  if (parts.length >= 2 && articleTitle) {
    breadcrumbs.push({ label: articleTitle });
  }

  return breadcrumbs;
}
