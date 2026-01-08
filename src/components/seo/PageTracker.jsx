import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * PageTracker - מעקב אחר דפים חדשים ועדכונים
 * רושם כל צפייה בדף ושולח התראה על דפים חדשים
 * 
 * Props:
 * - pageUrl: URL של הדף
 * - pageType: סוג הדף
 * - isNewPage: האם זה דף חדש
 */
export default function PageTracker({ 
  pageUrl, 
  pageType = 'page',
  isNewPage = false 
}) {
  useEffect(() => {
    const trackPage = async () => {
      try {
        const fullUrl = `https://perfect1.co.il${pageUrl}`;

        // בדיקה אם הדף כבר קיים ב-Sitemap
        const existing = await base44.entities.SitemapURL.filter({ url: fullUrl });

        if (existing.length === 0 && isNewPage) {
          // דף חדש - נוסיף ל-Sitemap
          await base44.entities.SitemapURL.create({
            url: fullUrl,
            type: pageType,
            priority: pageType === 'landing' ? 0.9 : 0.8,
            changefreq: 'weekly',
            lastmod: new Date().toISOString().split('T')[0],
            status: 'active'
          });

          // שליחת Ping לגוגל (רק לדפים חדשים)
          try {
            await fetch(`https://www.google.com/ping?sitemap=https://perfect1.co.il/sitemap-index`);
            console.log('✅ Google notified about new page:', fullUrl);
          } catch (pingError) {
            console.log('Ping failed (non-critical):', pingError);
          }
        } else if (existing.length > 0) {
          // דף קיים - עדכון lastmod
          await base44.entities.SitemapURL.update(existing[0].id, {
            lastmod: new Date().toISOString().split('T')[0]
          });
        }

      } catch (error) {
        console.error('PageTracker error:', error);
      }
    };

    trackPage();
  }, [pageUrl, pageType, isNewPage]);

  return null;
}

/**
 * שימוש בדף:
 * 
 * export default function MyNewPage() {
 *   return (
 *     <>
 *       <PageTracker 
 *         pageUrl="/my-new-page" 
 *         pageType="landing"
 *         isNewPage={true}
 *       />
 *       ... rest of page
 *     </>
 *   );
 * }
 */