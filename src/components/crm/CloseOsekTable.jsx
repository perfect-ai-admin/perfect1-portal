import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2, Phone } from 'lucide-react';
import { STATUS_CONFIG } from './CloseOsekStatusBadge';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'טרם התחיל' },
  { value: 'power_of_attorney_sent', label: 'נשלח ייפוי כוח' },
  { value: 'in_process', label: 'בתהליך סגירה' },
  { value: 'completed', label: 'הושלם' },
];

function InlineStatusSelect({ value, onChange }) {
  const config = STATUS_CONFIG[value] || STATUS_CONFIG.not_started;
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-7 text-[11px] font-semibold border rounded-full px-2 min-w-0 w-auto ${config.color}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function CloseOsekTable({ records, onEdit, onDelete, onStatusChange }) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg font-semibold mb-1">אין לקוחות עדיין</p>
        <p className="text-sm">הוסף לקוח חדש כדי להתחיל</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-xl bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-right font-bold">שם מלא</TableHead>
            <TableHead className="text-right font-bold">טלפון</TableHead>
            <TableHead className="text-center font-bold">מס הכנסה</TableHead>
            <TableHead className="text-center font-bold">מע"מ</TableHead>
            <TableHead className="text-center font-bold">ביטוח לאומי</TableHead>
            <TableHead className="text-right font-bold">הערות</TableHead>
            <TableHead className="text-center font-bold w-24">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map(rec => (
            <TableRow key={rec.id} className="hover:bg-blue-50/30 transition-colors">
              <TableCell className="font-semibold text-gray-900">{rec.full_name}</TableCell>
              <TableCell>
                <a href={`tel:${rec.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Phone className="w-3.5 h-3.5" />
                  {rec.phone}
                </a>
              </TableCell>
              <TableCell className="text-center">
                <InlineStatusSelect value={rec.income_tax_status || 'not_started'} onChange={val => onStatusChange(rec.id, 'income_tax_status', val)} />
              </TableCell>
              <TableCell className="text-center">
                <InlineStatusSelect value={rec.vat_status || 'not_started'} onChange={val => onStatusChange(rec.id, 'vat_status', val)} />
              </TableCell>
              <TableCell className="text-center">
                <InlineStatusSelect value={rec.national_insurance_status || 'not_started'} onChange={val => onStatusChange(rec.id, 'national_insurance_status', val)} />
              </TableCell>
              <TableCell className="text-gray-600 text-sm max-w-[200px] truncate">{rec.notes || '—'}</TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(rec)}>
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(rec)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}