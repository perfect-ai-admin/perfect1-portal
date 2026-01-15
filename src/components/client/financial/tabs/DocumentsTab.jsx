import React, { useState } from 'react';
import { FileText, Download, Copy, Trash2, Send, MoreVertical, Filter, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

export default function DocumentsTab({ data }) {
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all',
  });

  // Mock documents
  const documents = [
    {
      id: 1,
      date: '15.01.2025',
      type: 'חשבונית מס',
      number: '001',
      customer: 'דני כץ',
      amount: '₪500',
      status: 'שולם',
    },
    {
      id: 2,
      date: '14.01.2025',
      type: 'קבלה',
      number: '002',
      customer: 'מיכל לוי',
      amount: '₪1,200',
      status: 'פתוח',
    },
    {
      id: 3,
      date: '13.01.2025',
      type: 'חשבונית מס',
      number: '003',
      customer: 'אברהם כהן',
      amount: '₪350',
      status: 'נשלח',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'שולם':
        return 'bg-green-100 text-green-800';
      case 'פתוח':
        return 'bg-yellow-100 text-yellow-800';
      case 'נשלח':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">מסמכים</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
            <Filter className="w-4 h-4" />
            סינון
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">ייצא</span>
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="text-right px-4 py-2 font-semibold text-gray-900">תאריך</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-900">סוג</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-900">מספר</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-900">לקוח</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-900">סכום</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-900">סטטוס</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-900">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-900">{doc.date}</td>
                <td className="px-4 py-3 text-gray-900">{doc.type}</td>
                <td className="px-4 py-3 text-gray-900 font-mono">{doc.number}</td>
                <td className="px-4 py-3 text-gray-900">{doc.customer}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{doc.amount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <DocumentActions docId={doc.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden space-y-2">
        {documents.map(doc => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-gray-200 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.type} #{doc.number}</p>
                <p className="text-xs text-gray-600 truncate">{doc.customer}</p>
                <p className="text-xs text-gray-500 mt-1">{doc.date}</p>
              </div>
              <DocumentActions docId={doc.id} />
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                {doc.status}
              </span>
              <span className="font-medium text-gray-900">{doc.amount}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function DocumentActions({ docId }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer">
          <FileText className="w-4 h-4 ml-2" />
          צפייה
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Send className="w-4 h-4 ml-2" />
          שליחה
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Download className="w-4 h-4 ml-2" />
          הורדה
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Copy className="w-4 h-4 ml-2" />
          שכפול
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer text-red-600">
          <Trash2 className="w-4 h-4 ml-2" />
          ביטול
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}