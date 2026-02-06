import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProductFilters({ search, onSearchChange, typeFilter, onTypeChange, statusFilter, onStatusChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="חיפוש מוצרים..."
          className="pr-9 bg-white border-gray-200 rounded-xl h-10"
        />
      </div>
      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full sm:w-40 bg-white border-gray-200 rounded-xl h-10">
          <SelectValue placeholder="כל הסוגים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסוגים</SelectItem>
          <SelectItem value="landing_page">דפי נחיתה</SelectItem>
          <SelectItem value="logo">לוגואים</SelectItem>
          <SelectItem value="sticker">סטיקרים</SelectItem>
          <SelectItem value="presentation">מצגות</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-36 bg-white border-gray-200 rounded-xl h-10">
          <SelectValue placeholder="כל הסטטוסים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסטטוסים</SelectItem>
          <SelectItem value="active">פעיל</SelectItem>
          <SelectItem value="draft">טיוטה</SelectItem>
          <SelectItem value="archived">ארכיון</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}