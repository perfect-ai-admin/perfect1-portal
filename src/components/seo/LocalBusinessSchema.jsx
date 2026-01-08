import React from 'react';

/**
 * LocalBusinessSchema - Schema.org למיקום עסקי
 * משפר SEO מקומי ו-GBP
 */
export default function LocalBusinessSchema({
  name = "Perfect One",
  description = "שירות מקצועי לפתיחת עוסקים פטורים בישראל",
  address = {
    streetAddress: "ישראל",
    addressLocality: "ארצי",
    addressRegion: "IL",
    postalCode: "",
    addressCountry: "IL"
  },
  geo = {
    latitude: "31.0461",
    longitude: "34.8516"
  },
  phone = "050-123-4567",
  email = "info@perfect1.co.il",
  priceRange = "₪₪",
  servicesOffered = [
    "פתיחת עוסק פטור",
    "ליווי חשבונאי",
    "ייעוץ מיסוי",
    "דוח שנתי"
  ],
  areasServed = [
    "תל אביב",
    "ירושלים",
    "חיפה",
    "באר שבע",
    "אשקלון",
    "אשדוד",
    "נתניה",
    "פתח תקווה",
    "ראשון לציון",
    "רחובות"
  ]
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": name,
    "description": description,
    "url": "https://perfect1.co.il",
    "telephone": phone,
    "email": email,
    "priceRange": priceRange,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "addressRegion": address.addressRegion,
      "postalCode": address.postalCode,
      "addressCountry": address.addressCountry
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": geo.latitude,
      "longitude": geo.longitude
    },
    "areaServed": areasServed.map(area => ({
      "@type": "City",
      "name": area,
      "containedInPlace": {
        "@type": "Country",
        "name": "ישראל"
      }
    })),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "שירותי עוסק פטור",
      "itemListElement": servicesOffered.map((service, index) => ({
        "@type": "Offer",
        "position": index + 1,
        "itemOffered": {
          "@type": "Service",
          "name": service
        }
      }))
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/perfect1.co.il",
      "https://www.linkedin.com/company/perfect1",
      "https://www.instagram.com/perfect1.co.il"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}