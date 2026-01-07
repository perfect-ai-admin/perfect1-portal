import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Loader2 } from 'lucide-react';

export default function LeadsAdmin() {
  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 1000),
    initialData: []
  });

  const exportToCSV = () => {
    const headers = ['שם מלא', 'טלפון', 'מייל', 'מקור הגעה', 'קישור לווצאפ'];
    const rows = leads.map(lead => [
      lead.name || '',
      lead.phone || '',
      lead.email || '',
      lead.source_page || '',
      `https://wa.me/972${(lead.phone || '').replace(/^0/, '')}`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#1E3A5F]">לידים מהאתר ({leads.length})</h1>
          <Button onClick={exportToCSV} className="bg-[#27AE60] hover:bg-[#2ECC71]">
            <Download className="w-5 h-5 ml-2" />
            ייצא ל-CSV
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E3A5F] text-white">
                <tr>
                  <th className="px-4 py-3 text-right">שם מלא</th>
                  <th className="px-4 py-3 text-right">טלפון</th>
                  <th className="px-4 py-3 text-right">מייל</th>
                  <th className="px-4 py-3 text-right">מקור הגעה</th>
                  <th className="px-4 py-3 text-right">תאריך</th>
                  <th className="px-4 py-3 text-center">וואטסאפ</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr key={lead.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 font-medium">{lead.name}</td>
                    <td className="px-4 py-3">{lead.phone}</td>
                    <td className="px-4 py-3">{lead.email || '-'}</td>
                    <td className="px-4 py-3 text-sm">{lead.source_page || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(lead.created_date).toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={`https://wa.me/972${(lead.phone || '').replace(/^0/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#25D366] hover:text-[#128C7E]"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">איך להעביר לגוגל שיטס:</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. לחץ על "ייצא ל-CSV"</li>
            <li>2. פתח את הגוגל שיטס שלך</li>
            <li>3. File → Import → Upload → בחר את הקובץ שהורדת</li>
            <li>4. Insert new sheet → Import data</li>
          </ol>
        </div>
      </div>
    </div>
  );
}