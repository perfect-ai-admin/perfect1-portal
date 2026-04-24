import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';

// Author data is static — no dynamic fetch needed for single org author
const AUTHORS = {
  'perfect1-team': {
    name: 'צוות פרפקט וואן',
    role: 'מערכת מומחי עסקים ומיסוי',
    bio: 'צוות הליווי של פרפקט וואן כולל מומחים בתחום פתיחת עסקים, מיסוי עוסקים פטורים ומורשים, הנהלת חשבונות וחברות בעמ. הצוות מלווה מאות עצמאים בישראל מדי שנה.',
    credentials: 'הנחיות עבודה בהתאם לדיני מס ההכנסה, מעמ, וחוק הביטוח הלאומי. פעילים מול רשות המסים, משרד האוצר ורשם החברות.',
    expertise: [
      'פתיחת עוסק פטור',
      'עוסק מורשה',
      'חברה בעמ',
      'מס הכנסה',
      'מעמ',
      'ביטוח לאומי לעצמאים',
      'סגירת עסק',
      'מעבר בין סטטוסים',
    ],
  },
};

export default function AuthorPage() {
  const { slug } = useParams();
  const author = AUTHORS[slug];

  if (!author) {
    return (
      <div dir="rtl" className="portal-root">
        <PortalHeader />
        <main style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h1>הדף לא נמצא</h1>
          <Link to="/">חזרה לדף הבית</Link>
        </main>
        <PortalFooter />
      </div>
    );
  }

  const canonicalUrl = `https://www.perfect1.co.il/authors/${slug}`;

  const authorSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://www.perfect1.co.il/#organization',
    name: author.name,
    url: canonicalUrl,
    description: author.bio,
    knowsAbout: author.expertise,
    memberOf: {
      '@type': 'Organization',
      '@id': 'https://www.perfect1.co.il/#organization',
    },
  };

  return (
    <div dir="rtl" className="portal-root">
      <Helmet>
        <title>{author.name} — {author.role} | פרפקט וואן</title>
        <meta name="description" content={author.bio} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(authorSchema)}</script>
      </Helmet>

      <PortalHeader />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <nav aria-label="ניווט עמודים" style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
          <Link to="/">דף הבית</Link>
          <span style={{ margin: '0 0.5rem' }}>›</span>
          <span>מחבר</span>
        </nav>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1B2B4B', marginBottom: '0.5rem' }}>
          {author.name}
        </h1>
        <p style={{ color: '#14B8A6', fontWeight: 600, marginBottom: '1.5rem' }}>{author.role}</p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>אודות</h2>
          <p style={{ lineHeight: 1.8, color: '#374151' }}>{author.bio}</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>תחומי התמחות</h2>
          <ul style={{ listStyle: 'disc', paddingRight: '1.5rem', lineHeight: 2, color: '#374151' }}>
            {author.expertise.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>תעודות ואישורים</h2>
          <p style={{ lineHeight: 1.8, color: '#374151' }}>{author.credentials}</p>
        </section>

        <div style={{ background: '#F0FDFA', border: '1px solid #99F6E4', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: '1rem', color: '#1B2B4B' }}>רוצים ייעוץ אישי מצוות פרפקט וואן?</p>
          <Link
            to="/About"
            style={{ background: '#14B8A6', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}
          >
            צרו קשר
          </Link>
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
