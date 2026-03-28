import React, { useState, useEffect } from 'react';
import { Send, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { finbotService } from './FINBOTService';
import { Badge } from '@/components/ui/badge';

export default function VATReportingComponent() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod());

  useEffect(() => {
    loadReport();
  }, [currentPeriod]);

  function getCurrentPeriod() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return `${year}-${month.toString().padStart(2, '0')}`;
  }

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await finbotService.getVATReport(currentPeriod);
      setReport(data);
    } catch (error) {
      console.error('Failed to load VAT report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('האם אתה בטוח שברצונך לשלוח את דוח המע"ם לרשויות?')) {
      return;
    }

    setSubmitting(true);
    try {
      await finbotService.submitVATReport(report);
      alert('הדוח נשלח בהצלחה!');
      loadReport();
    } catch (error) {
      alert('שגיאה בשליחת הדוח: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    // Generate and download PDF report
    alert('הורדת PDF בקרוב...');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="text-gray-500">טוען דוח מע"ם...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto text-yellow-600 mb-3" />
        <p className="text-gray-600">לא ניתן לטעון את הדוח</p>
      </div>
    );
  }

  const isSubmitted = report.submission_status === 'submitted';
  const isOverdue = report.is_overdue;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">דוח מע"ם</h2>
            <p className="text-white/90">תקופת דיווח: {currentPeriod}</p>
          </div>
          <Badge variant={isSubmitted ? 'default' : 'secondary'} className="bg-white/20">
            {isSubmitted ? 'הוגש' : 'ממתין'}
          </Badge>
        </div>
      </div>

      {/* Alert for Overdue */}
      {isOverdue && !isSubmitted && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-900">דוח באיחור!</p>
            <p className="text-sm text-red-700">יש לשלוח את הדוח בהקדם למניעת קנסות</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">סיכום מע"ם</h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">מע"ם עסקאות (פלט)</p>
            <p className="text-2xl font-bold text-blue-700">
              ₪{report.output_vat?.toLocaleString('he-IL') || 0}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">מע"ם תשומות (קלט)</p>
            <p className="text-2xl font-bold text-green-700">
              ₪{report.input_vat?.toLocaleString('he-IL') || 0}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">לתשלום/החזר</p>
            <p className={`text-2xl font-bold ${
              (report.output_vat - report.input_vat) > 0 ? 'text-red-700' : 'text-green-700'
            }`}>
              ₪{Math.abs(report.output_vat - report.input_vat).toLocaleString('he-IL')}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900">פירוט:</h4>
          {report.breakdown?.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{item.description}</span>
              <span className="font-semibold text-gray-900">
                ₪{item.amount.toLocaleString('he-IL')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSubmit}
            disabled={submitting || isSubmitted}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12"
          >
            {submitting ? (
              'שולח...'
            ) : isSubmitted ? (
              <>
                <CheckCircle className="w-5 h-5 ml-2" />
                הוגש בהצלחה
              </>
            ) : (
              <>
                <Send className="w-5 h-5 ml-2" />
                שלח לרשויות
              </>
            )}
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 h-12"
          >
            <Download className="w-5 h-5 ml-2" />
            הורד PDF
          </Button>
        </div>

        {isSubmitted && report.submission_date && (
          <p className="text-sm text-gray-600 text-center mt-4">
            הוגש בתאריך: {new Date(report.submission_date).toLocaleString('he-IL')}
          </p>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>שים לב:</strong> הדוח נוצר אוטומטי על בסיס כל החשבוניות וההוצאות שהוזנו במערכת. 
          ודא שכל הנתונים עודכנו לפני השליחה.
        </p>
      </div>
    </div>
  );
}