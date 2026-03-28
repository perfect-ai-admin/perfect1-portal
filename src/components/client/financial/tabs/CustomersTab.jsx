import React, { useState } from 'react';
import { Plus, Phone, Mail, Search, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import useActiveAccountingProvider from '../../../hooks/useActiveAccountingProvider';
import { entities, invokeFunction } from '@/api/supabaseClient';

export default function CustomersTab({ data }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', id_number: '', address: '', city: '' });
  const queryClient = useQueryClient();
  const { fn, providerId, isConnected, isLoading: providerLoading } = useActiveAccountingProvider();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['accounting-customers', providerId || 'none'],
    queryFn: async () => {
      const custs = await entities.AccountingCustomer.filter({ provider: providerId }, '-created_date', 500);
      if (custs?.length > 0) return custs;
      return entities.FinbotCustomer.filter({ provider: providerId }, '-created_date', 500);
    },
    enabled: !providerLoading && isConnected && !!providerId,
    refetchOnWindowFocus: true,
  });

  const syncMutation = useMutation({
    mutationFn: () => {
      return invokeFunction('acctSyncPull', { resource: 'customers' });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['accounting-customers', providerId || 'none'] });
      toast.success(`סונכרנו ${res?.synced_count || 0} לקוחות`);
    },
    onError: (err) => toast.error(err.message || 'שגיאה בסנכרון'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      return invokeFunction('acctCreateCustomer', data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['accounting-customers'] });
      toast.success('לקוח נוצר בהצלחה ונשמר במערכת החשבונות');
      setShowAddCustomer(false);
      setNewCustomer({ name: '', phone: '', email: '', id_number: '', address: '', city: '' });
    },
    onError: (err) => toast.error(err.message || 'שגיאה ביצירת לקוח'),
  });

  const filteredCustomers = customers.filter(c =>
    (c.name || '').includes(searchTerm) || (c.phone || '').includes(searchTerm) || (c.email || '').includes(searchTerm)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">לקוחות</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
            {syncMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span className="hidden md:inline">סנכרן</span>
          </Button>
          <Button size="sm" onClick={() => setShowAddCustomer(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">הוסף לקוח</span>
            <span className="md:hidden">הוסף</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="חיפוש לקוח..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm">{customers.length === 0 ? 'אין לקוחות עדיין. חבר מערכת חשבונות וסנכרן, או הוסף לקוח חדש.' : 'אין תוצאות לחיפוש'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCustomers.map((customer, idx) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => setSelectedCustomer(customer)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {customer.phone && (
                      <a href={`tel:${customer.phone}`} onClick={e => e.stopPropagation()} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />{customer.phone}
                      </a>
                    )}
                    {customer.email && (
                      <a href={`mailto:${customer.email}`} onClick={e => e.stopPropagation()} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Mail className="w-3 h-3" />{customer.email}
                      </a>
                    )}
                  </div>
                  {customer.id_number && <p className="text-xs text-gray-500 mt-1">ת.ז/ח.פ: {customer.id_number}</p>}
                </div>
                {customer.synced_at && (
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {new Date(customer.synced_at).toLocaleDateString('he-IL')}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{selectedCustomer?.name}</DialogTitle></DialogHeader>
          {selectedCustomer && (
            <div className="space-y-3 text-sm" dir="rtl">
              {selectedCustomer.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /><a href={`tel:${selectedCustomer.phone}`} className="text-blue-600 hover:underline">{selectedCustomer.phone}</a></div>}
              {selectedCustomer.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" /><a href={`mailto:${selectedCustomer.email}`} className="text-blue-600 hover:underline">{selectedCustomer.email}</a></div>}
              {selectedCustomer.id_number && <div><span className="text-gray-500">ת.ז/ח.פ:</span> {selectedCustomer.id_number}</div>}
              {selectedCustomer.address && <div><span className="text-gray-500">כתובת:</span> {selectedCustomer.address} {selectedCustomer.city}</div>}
              {selectedCustomer.notes && <div><span className="text-gray-500">הערות:</span> {selectedCustomer.notes}</div>}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setSelectedCustomer(null)}>סגור</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>הוסף לקוח חדש</DialogTitle></DialogHeader>
          <div className="space-y-3" dir="rtl">
            <div>
              <label className="block text-sm font-medium mb-1">שם *</label>
              <Input placeholder="שם מלא" value={newCustomer.name} onChange={e => setNewCustomer(p => ({...p, name: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">טלפון</label>
              <Input placeholder="050-1234567" value={newCustomer.phone} onChange={e => setNewCustomer(p => ({...p, phone: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">אימייל</label>
              <Input type="email" placeholder="email@example.com" value={newCustomer.email} onChange={e => setNewCustomer(p => ({...p, email: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ת.ז / ח.פ</label>
              <Input placeholder="מספר זיהוי" value={newCustomer.id_number} onChange={e => setNewCustomer(p => ({...p, id_number: e.target.value}))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddCustomer(false)}>ביטול</Button>
            <Button onClick={() => createMutation.mutate(newCustomer)} disabled={!newCustomer.name || createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              הוסף
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}