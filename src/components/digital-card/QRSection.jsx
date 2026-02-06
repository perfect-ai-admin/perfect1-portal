import React, { useState } from 'react';
import { QrCode, Download, Share2 } from 'lucide-react';

export default function QRSection({ card, actions, primaryColor }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80">
      {/* Toggle row */}
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="w-full flex items-center justify-between py-1"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${primaryColor}10` }}>
            <QrCode className="w-4 h-4" style={{ color: primaryColor }} />
          </div>
          <span className="text-sm font-semibold text-gray-800">QR Code</span>
        </div>
        <span className="text-xs text-gray-400 font-medium">{expanded ? 'סגור' : 'הצג'}</span>
      </button>

      {/* Expanded QR */}
      {expanded && card.qr_image_url && (
        <div className="mt-4 flex flex-col items-center gap-4 pt-4 border-t border-gray-100">
          <div className="bg-white p-3 rounded-2xl shadow-inner border border-gray-50">
            <img src={card.qr_image_url} alt="QR Code" className="w-44 h-44 rounded-xl" />
          </div>
          <p className="text-xs text-gray-400">סרוק לשמירת איש קשר</p>
          <div className="flex gap-3">
            <a 
              href={card.qr_image_url} 
              download
              className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              הורד QR
            </a>
            <button 
              onClick={actions.share}
              className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              שתף
            </button>
          </div>
        </div>
      )}
    </div>
  );
}