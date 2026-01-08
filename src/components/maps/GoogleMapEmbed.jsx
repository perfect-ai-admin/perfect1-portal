import React from 'react';
import { MapPin } from 'lucide-react';

/**
 * GoogleMapEmbed - הטמעת מפת גוגל
 * Props:
 * - address: כתובת העסק
 * - title: כותרת המפה
 * - height: גובה המפה (ברירת מחדל: 400px)
 */
export default function GoogleMapEmbed({ 
  address = "ישראל", 
  title = "Perfect One - פתיחת עוסק פטור",
  height = "400px",
  googleMapsUrl = "https://maps.google.com/maps?q=Israel&t=&z=8&ie=UTF8&iwloc=&output=embed"
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] p-4">
        <div className="flex items-center gap-3 text-white">
          <MapPin className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-white/90">{address}</p>
          </div>
        </div>
      </div>
      
      <div className="relative" style={{ height }}>
        <iframe
          src={googleMapsUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
        />
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <a 
          href="https://maps.google.com/?q=Perfect+One+Israel"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1E3A5F] hover:text-[#27AE60] font-bold text-sm inline-flex items-center gap-2 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          פתח במפות גוגל
        </a>
      </div>
    </div>
  );
}