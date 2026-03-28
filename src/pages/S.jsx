import React, { useEffect } from 'react';
import Home from './Home';

export default function S() {
  useEffect(() => {
    // הוספת פרמטרי UTM ל-URL הנוכחי מבלי לטעון מחדש את הדף
    const url = new URL(window.location.href);
    let changed = false;
    
    // הגדרת הערכים
    if (!url.searchParams.has('utm_source')) {
        url.searchParams.set('utm_source', 'shlomi');
        changed = true;
    }
    if (!url.searchParams.has('utm_medium')) {
        url.searchParams.set('utm_medium', 'direct_link');
        changed = true;
    }
    if (!url.searchParams.has('utm_campaign')) {
        url.searchParams.set('utm_campaign', 'shlomi_personal');
        changed = true;
    }

    if (changed) {
        window.history.replaceState(null, '', url.toString());
    }
  }, []);

  return <Home />;
}