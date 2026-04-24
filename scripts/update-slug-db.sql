-- Update seo_published_articles table slugs after rename (run once)
-- Execute via Supabase Dashboard → SQL Editor

UPDATE seo_published_articles
SET slug = 'complete-guide'
WHERE category = 'osek-murshe' AND slug = 'hamadrikh-hamaleh-leryishui-osek-murshe-beyisrael';

UPDATE seo_published_articles
SET slug = 'why-choose'
WHERE category = 'osek-murshe' AND slug = 'why-choose-osek-murshe-advantages-and-disadvantages';

UPDATE seo_published_articles
SET slug = 'full-tax-guide'
WHERE category = 'osek-murshe' AND slug = 'taxes-for-osek-murshe-all-you-need-to-know';

UPDATE seo_published_articles
SET slug = 'requirements'
WHERE category = 'osek-murshe' AND slug = 'requirments-for-opening-osek-murshe';
