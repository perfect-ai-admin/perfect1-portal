import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SystemLogicMap() {
  const downloadMarkdown = () => {
    const markdown = document.getElementById('markdown-content').innerText;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SystemLogicMap.md';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black text-[#1E3A5F] mb-2">
                📚 מפת הלוגיקה של המערכת
              </h1>
              <p className="text-lg text-gray-600">
                תיעוד טכני מלא ומקיף - Perfect One System Logic Map
              </p>
            </div>
            <Button 
              onClick={downloadMarkdown}
              className="bg-[#27AE60] hover:bg-[#2ECC71]"
            >
              <Download className="w-5 h-5 ml-2" />
              הורד כ-Markdown
            </Button>
          </div>

          <div 
            id="markdown-content"
            className="prose prose-lg prose-slate max-w-none"
            style={{ direction: 'rtl' }}
          >
            <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-bold text-blue-900 mt-0">📖 איך להשתמש במסמך זה</h2>
              <p className="text-blue-800 mb-0">
                מסמך זה מכיל את כל מה שצריך כדי להבין, לתחזק, או לבנות מחדש את המערכת.
                <br/>
                כולל: קוד מלא, ארכיטקטורת DB, Setup Guide, Deployment, והגדרות סביבה.
              </p>
            </div>

            {/* הכל ייכתב כאן בהמשך */}
          </div>
        </div>
      </div>
    </div>
  );
}