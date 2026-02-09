import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileX2 } from 'lucide-react';
import CloseOsekTable from '../components/crm/CloseOsekTable';
import CloseOsekFormDialog from '../components/crm/CloseOsekFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CloseOsekPaturCRM() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['closeOsekPaturCRM'],
    queryFn: () => base44.entities.CloseOsekPaturCRM.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CloseOsekPaturCRM.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closeOsekPaturCRM'] });
      setDialogOpen(false);
      setEditRecord(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CloseOsekPaturCRM.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closeOsekPaturCRM'] });
      setDialogOpen(false);
      setEditRecord(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CloseOsekPaturCRM.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closeOsekPaturCRM'] });
      setDeleteTarget(null);
    },
  });

  const handleSave = (formData) => {
    if (editRecord) {
      updateMutation.mutate({ id: editRecord.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (rec) => {
    setEditRecord(rec);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditRecord(null);
    setDialogOpen(true);
  };

  const filtered = records.filter(r =>
    !search || r.full_name?.includes(search) || r.phone?.includes(search)
  );

  // Stats
  const total = records.length;
  const completedAll = records.filter(r =>
    r.income_tax_status === 'completed' && r.vat_status === 'completed' && r.national_insurance_status === 'completed'
  ).length;
  const inProcess = records.filter(r =>
    [r.income_tax_status, r.vat_status, r.national_insurance_status].some(s => s === 'in_process' || s === 'power_of_attorney_sent')
    && !(r.income_tax_status === 'completed' && r.vat_status === 'completed' && r.national_insurance_status === 'completed')
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileX2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">סגירת עוסק פטור - CRM</h1>
                <p className="text-sm text-gray-500">ניהול תפעול סגירת עוסק פטור ללקוחות</p>
              </div>
            </div>
          </div>
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" />
            הוסף לקוח
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-2xl font-black text-gray-900">{total}</p>
            <p className="text-xs text-gray-500 font-medium">סה"כ לקוחות</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-2xl font-black text-orange-600">{inProcess}</p>
            <p className="text-xs text-gray-500 font-medium">בתהליך</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-2xl font-black text-green-600">{completedAll}</p>
            <p className="text-xs text-gray-500 font-medium">הושלמו</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="חיפוש לפי שם או טלפון..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">טוען...</div>
        ) : (
          <CloseOsekTable records={filtered} onEdit={handleEdit} onDelete={setDeleteTarget} />
        )}

        {/* Form Dialog */}
        <CloseOsekFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          record={editRecord}
          onSave={handleSave}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />

        {/* Delete Confirm */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-right">מחיקת לקוח</AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                האם אתה בטוח שברצונך למחוק את {deleteTarget?.full_name}? לא ניתן לשחזר.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2">
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                מחק
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}