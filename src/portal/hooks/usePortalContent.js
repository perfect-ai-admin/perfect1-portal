import { useState, useEffect } from 'react';
import categoriesData from '../../content/categories.json';

// Use import.meta.glob so Vite can statically analyze all content JSON files
const contentModules = import.meta.glob('../../content/**/*.json');

const contentCache = new Map();

export function usePortalContent(category, slug) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContent = async () => {
      const fileName = slug || '_category';
      const cacheKey = `${category}/${fileName}`;

      if (contentCache.has(cacheKey)) {
        setContent(contentCache.get(cacheKey));
        setLoading(false);
        return;
      }

      // Build the glob key that matches what import.meta.glob generated
      const globKey = `../../content/${category}/${fileName}.json`;
      const loader = contentModules[globKey];

      if (!loader) {
        setError(new Error(`Content not found: ${cacheKey}`));
        setLoading(false);
        return;
      }

      try {
        const module = await loader();
        const data = module.default;
        contentCache.set(cacheKey, data);
        setContent(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [category, slug]);

  return { content, loading, error };
}

export function useCategoryList() {
  // Direct static import — no async needed
  return { categories: categoriesData.categories, loading: false };
}
