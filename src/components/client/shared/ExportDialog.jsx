import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function ExportDialog({ data, filename = 'export' }) {
  const [format, setFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef(null);
  const initialFocusRef = useRef(null);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = drawerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) || [];

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    drawerRef.current?.addEventListener('keydown', handleKeyDown);
    initialFocusRef.current?.focus();

    return () => {
      drawerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (format === 'pdf') {
        await exportToPDF(data, filename);
      } else {
        await exportToCSV(data, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('שגיאה בייצוא הנתונים');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 ml-2" />
          ייצוא
        </Button>
      </DrawerTrigger>
      <DrawerContent dir="rtl" ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="export-title">
        <DrawerHeader>
          <DrawerTitle id="export-title" ref={initialFocusRef} tabIndex="-1">ייצוא נתונים</DrawerTitle>
          <DrawerDescription>
            בחר את הפורמט המועדף עליך
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 py-4">
        
        <RadioGroup value={format} onValueChange={setFormat} className="space-y-3">
          <div className="flex items-center space-x-2 space-x-reverse p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all cursor-pointer">
            <RadioGroupItem value="pdf" id="pdf" />
            <Label htmlFor="pdf" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold">PDF</p>
                  <p className="text-sm text-gray-600">מסמך מעוצב להדפסה</p>
                </div>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all cursor-pointer">
            <RadioGroupItem value="csv" id="csv" />
            <Label htmlFor="csv" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <Table className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold">CSV</p>
                  <p className="text-sm text-gray-600">לעיבוד באקסל</p>
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? 'מייצא...' : 'ייצא עכשיו'}
        </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

async function exportToPDF(data, filename) {
  // Mock PDF export - replace with actual jsPDF implementation
  console.log('Exporting to PDF:', data);
  await new Promise(resolve => setTimeout(resolve, 1000));
}

async function exportToCSV(data, filename) {
  // Create CSV content
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

function convertToCSV(data) {
  // Simple CSV conversion
  if (!data || !Array.isArray(data)) return '';
  
  const headers = Object.keys(data[0] || {}).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  return [headers, ...rows].join('\n');
}