import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { finbotService } from './FINBOTService';

export default function DocumentScanner({ onScanComplete }) {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResult(null);
      setError(null);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleScan = async () => {
    if (!file) return;

    setScanning(true);
    setError(null);

    try {
      const data = await finbotService.uploadDocument(file);
      
      // Wait for OCR processing (webhook will notify when done)
      // For now, show loading state
      setResult(data);
      
      if (onScanComplete) {
        onScanComplete(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">סריקת מסמכים (OCR)</h3>
        <p className="text-gray-600 mb-6">העלה קבלה או חשבונית לעיבוד אוטומטי עם דיוק 97%</p>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="font-medium text-gray-900">{file.name}</span>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 mb-2">גרור קובץ לכאן או לחץ לבחירה</p>
              <p className="text-sm text-gray-500">תומך ב-PDF, PNG, JPG</p>
            </>
          )}
        </div>

        {/* Actions */}
        {file && !result && (
          <div className="mt-4 flex gap-3">
            <Button
              onClick={handleScan}
              disabled={scanning}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  סורק...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 ml-2" />
                  סרוק מסמך
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setResult(null);
                setError(null);
              }}
            >
              ביטול
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">שגיאה בסריקה</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">סריקה הושלמה בהצלחה!</p>
                <p className="text-sm text-green-700">דיוק: {result.confidence_score}%</p>
              </div>
            </div>

            {/* Extracted Data */}
            {result.ocr_result && (
              <div className="bg-white rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-gray-900 mb-3">נתונים שחולצו:</h4>
                {Object.entries(result.ocr_result).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              variant="outline"
              className="w-full mt-4"
            >
              סרוק מסמך נוסף
            </Button>
          </motion.div>
        )}
      </div>

      {/* Supported Formats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>טיפ:</strong> למען דיוק מירבי, וודא שהמסמך ברור וקריא. המערכת תומכת בעברית ובאנגלית.
        </p>
      </div>
    </div>
  );
}