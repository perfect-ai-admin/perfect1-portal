/**
 * SubdomainPage.jsx
 *
 * Resolves a subdomain to a digital card or landing page and renders it.
 * The subdomain (e.g., "studio-dana" from studio-dana.one-pai.com) is used
 * to look up the corresponding content via Supabase Edge Functions.
 *
 * Priority: digital card first, then landing page.
 */

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Globe } from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';
import { getSubdomain } from '@/utils/subdomain';

// Lazy-load the public card and landing page renderers
const DynamicLandingPage = React.lazy(() =>
  import('@/components/landing-page/DynamicLandingPage')
);

export default function SubdomainPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentType, setContentType] = useState(null); // 'card' | 'landing_page'
  const [data, setData] = useState(null);

  const subdomain = getSubdomain(window.location.hostname);

  useEffect(() => {
    if (!subdomain) {
      setError('subdomain-not-found');
      setLoading(false);
      return;
    }

    resolveSubdomain(subdomain);
  }, [subdomain]);

  async function resolveSubdomain(sub) {
    try {
      // Try to resolve via the new Edge Function
      const res = await invokeFunction('resolveSubdomain', { subdomain: sub });

      if (res?.success) {
        setContentType(res.type); // 'card' or 'landing_page'
        setData(res.data);
        setLoading(false);
        return;
      }

      setError('not-found');
    } catch (err) {
      console.error('SubdomainPage resolve error:', err);
      setError('not-found');
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-500 text-sm">...loading</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold mb-3 text-gray-900">הדף לא נמצא</h1>
        <p className="text-gray-500 max-w-sm mb-6">
          לא מצאנו עסק בכתובת הזו. יתכן שהכתובת שגויה או שהדף עדיין לא פורסם.
        </p>
        <a
          href="https://one-pai.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Globe className="w-4 h-4" />
          לדף הבית
        </a>
      </div>
    );
  }

  // Render digital card
  if (contentType === 'card' && data) {
    return <PublicCardView card={data} />;
  }

  // Render landing page
  if (contentType === 'landing_page' && data) {
    return (
      <React.Suspense
        fallback={
          <div className="fixed inset-0 bg-white flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
          </div>
        }
      >
        <div className="fixed inset-0 z-[9999] bg-white overflow-auto">
          <DynamicLandingPage data={data} />
        </div>
      </React.Suspense>
    );
  }

  return null;
}

/**
 * PublicCardView - Renders a public digital business card.
 * Standalone full-screen component for subdomain display.
 */
function PublicCardView({ card }) {
  // Track view
  useEffect(() => {
    if (card?.id) {
      invokeFunction('trackCardClick', {
        card_id: card.id,
        action: 'view',
        source: 'subdomain',
      }).catch(() => {});
    }
  }, [card?.id]);

  const actions = {
    call: () => window.open(`tel:${card.phone}`),
    whatsapp: () =>
      window.open(
        `https://wa.me/${(card.phone || '').replace(/[^0-9+]/g, '')}`,
        '_blank'
      ),
    email: () => window.open(`mailto:${card.email}`),
    website: () => window.open(card.website_url, '_blank'),
    instagram: () => window.open(card.instagram_url, '_blank'),
    facebook: () => window.open(card.facebook_url, '_blank'),
    waze: () => window.open(card.waze_url, '_blank'),
  };

  const gradient = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';

  return (
    <div className="fixed inset-0 bg-gray-950 flex items-center justify-center overflow-auto" dir="rtl">
      <div className="w-full max-w-md mx-auto">
        {/* Cover / Header */}
        <div className="relative">
          <div className="h-40 w-full rounded-t-2xl" style={{ background: gradient }}>
            {card.cover_data_url && (
              <img
                src={card.cover_data_url}
                alt="cover"
                className="w-full h-full object-cover rounded-t-2xl opacity-60"
              />
            )}
          </div>

          <div className="flex flex-col items-center -mt-14 relative z-10 px-4">
            {card.logo_data_url || card.logo_url ? (
              <img
                src={card.logo_data_url || card.logo_url}
                alt={card.full_name}
                className="w-24 h-24 rounded-full border-4 border-gray-900 object-cover bg-gray-800 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-gray-900 bg-gray-700 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                {card.full_name?.charAt(0) || '?'}
              </div>
            )}

            <h1 className="text-white font-bold text-xl mt-4">{card.full_name}</h1>
            {card.profession && (
              <p className="text-gray-400 text-sm mt-1">{card.profession}</p>
            )}
            {card.services?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                {card.services.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3 px-6 mt-8">
          {card.phone && (
            <button
              onClick={actions.call}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">📞</span>
              <span className="text-[10px] text-gray-400">חיוג</span>
            </button>
          )}
          {card.phone && (
            <button
              onClick={actions.whatsapp}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">💬</span>
              <span className="text-[10px] text-gray-400">וואטסאפ</span>
            </button>
          )}
          {card.email && (
            <button
              onClick={actions.email}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">📧</span>
              <span className="text-[10px] text-gray-400">אימייל</span>
            </button>
          )}
          {card.website_url && (
            <button
              onClick={actions.website}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">🌐</span>
              <span className="text-[10px] text-gray-400">אתר</span>
            </button>
          )}
          {card.instagram_url && (
            <button
              onClick={actions.instagram}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">📸</span>
              <span className="text-[10px] text-gray-400">אינסטגרם</span>
            </button>
          )}
          {card.facebook_url && (
            <button
              onClick={actions.facebook}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">👤</span>
              <span className="text-[10px] text-gray-400">פייסבוק</span>
            </button>
          )}
          {card.waze_url && (
            <button
              onClick={actions.waze}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">🗺️</span>
              <span className="text-[10px] text-gray-400">ניווט</span>
            </button>
          )}
        </div>

        {/* Save Contact Button */}
        <div className="px-6 mt-8 pb-8">
          <button
            onClick={() => {
              // Generate vCard
              const vcard = [
                'BEGIN:VCARD',
                'VERSION:3.0',
                `FN:${card.full_name || ''}`,
                card.phone ? `TEL:${card.phone}` : '',
                card.email ? `EMAIL:${card.email}` : '',
                card.website_url ? `URL:${card.website_url}` : '',
                card.profession ? `TITLE:${card.profession}` : '',
                'END:VCARD',
              ]
                .filter(Boolean)
                .join('\n');

              const blob = new Blob([vcard], { type: 'text/vcard' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${card.full_name || 'contact'}.vcf`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>📥</span>
            שמור באנשי קשר
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pb-6">
          <a
            href="https://one-pai.com"
            className="text-gray-600 text-xs hover:text-gray-400 transition-colors"
          >
            Powered by One-Pai
          </a>
        </div>
      </div>
    </div>
  );
}
