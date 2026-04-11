import React from 'react';
import { FileText, Download, ExternalLink, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentsPanel({ lead }) {
  // Primary: identity_file_url (from WhatsApp upload)
  // Fallback: file_url (from web form)
  const fileUrl = lead.identity_file_url || lead.file_url || lead.questionnaire_data?.file_url;
  const idNumber = lead.identity_id_number;
  const docType = lead.identity_document_type;
  const uploadedAt = lead.identity_uploaded_at;

  if (!fileUrl && !idNumber) return null;

  const isImage = fileUrl && /\.(jpg|jpeg|png|gif|webp)/i.test(fileUrl);
  const isPdf = fileUrl && /\.pdf/i.test(fileUrl);
  const fileName = fileUrl ? (fileUrl.split('/').pop() || 'מסמך') : '';

  const docTypeLabel = {
    license: 'רישיון נהיגה',
    passport: 'דרכון',
    parent_id: 'ת״ז הורה',
    national_id: 'תעודת זהות',
    national_id_text: 'מספר ת״ז (טקסט)',
    image_document: 'תמונת מסמך',
    document: 'מסמך',
  }[docType] || 'מסמך מזהה';

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-1.5">
        <FileText size={14} />
        מסמכים
      </h3>

      <div className="space-y-2">
        {/* ID Number (text) */}
        {idNumber && (
          <div className="flex items-center gap-3 bg-amber-50 rounded-lg p-3 border border-amber-100">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">מספר תעודת זהות</p>
              <p className="text-xs text-amber-700 font-mono">{idNumber.slice(0, 2) + '•'.repeat(Math.max(idNumber.length - 4, 3)) + idNumber.slice(-2)}</p>
            </div>
          </div>
        )}

        {/* File Document */}
        {fileUrl && (
          <>
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                {isImage ? <Image size={18} className="text-blue-500" /> : <FileText size={18} className="text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{docTypeLabel}</p>
                <p className="text-xs text-slate-400 truncate">{fileName}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => window.open(fileUrl, '_blank')}
                  title="פתח"
                >
                  <ExternalLink size={14} className="text-slate-500" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <a href={fileUrl} download title="הורד">
                    <Download size={14} className="text-slate-500" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Preview for images */}
            {isImage && (
              <div className="rounded-lg overflow-hidden border border-slate-200 cursor-pointer" onClick={() => window.open(fileUrl, '_blank')}>
                <img
                  src={fileUrl}
                  alt={docTypeLabel}
                  className="w-full h-32 object-cover hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
              </div>
            )}
          </>
        )}

        {uploadedAt && (
          <div className="text-[10px] text-slate-400 pt-1">
            הועלה: {new Date(uploadedAt).toLocaleString('he-IL')}
          </div>
        )}
      </div>
    </div>
  );
}
