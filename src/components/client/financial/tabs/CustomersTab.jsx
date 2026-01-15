import React, { useState } from 'react';
import { Plus, Phone, Mail, FileText, Bell, MoreVertical, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function CustomersTab({ data }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const customers = [
    { id: 1, name: 'דני כץ', phone: '050-1234567', email: 'danny@email.com', status: 'עם מסמכים פתוחים' },
    { id: 2, name: 'מיכל לוי', phone: '052-9876543', email: 'michal@email.com', status: 'עדכני' },
    { id: 3, name: 'אברהם כהן', phone: '051-5555555', email: 'avraham@email.com', status: 'עם מסמכים פתוחים' },
  ];

  const filteredCustomers = customers.filter(c =>
    c.name.includes(searchTerm) || c.phone.includes(searchTerm)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">לקוחות</h2>
        <Button onClick={() => setShowAddCustomer(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">הוסף לקוח</span>
          <span className="md:hidden">הוסף</span>
        </Button>
      </div>

      {/* Search */}
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

      {/* Customers List */}
      <div className="space-y-2">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-sm">אין לקוחות להצגה</p>
          </div>
        ) : (
          filteredCustomers.map((customer, idx) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => setSelectedCustomer(customer)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <a
                      href={`tel:${customer.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {customer.phone}
                    </a>
                    <a
                      href={`mailto:${customer.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      {customer.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      customer.status === 'עדכני' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {customer.status}
                    </span>
                  </div>

                  <DropdownMenu onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer">
                        <FileText className="w-4 h-4 ml-2" />
                        הפק מסמך
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <FileText className="w-4 h-4 ml-2" />
                        צפה במסמכים
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Bell className="w-4 h-4 ml-2" />
                        שלח תזכורת
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedCustomer.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <a href={`tel:${selectedCustomer.phone}`} className="text-sm text-blue-600 hover:underline">
                  {selectedCustomer.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <a href={`mailto:${selectedCustomer.email}`} className="text-sm text-blue-600 hover:underline">
                  {selectedCustomer.email}
                </a>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">קיצורי דרך</p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <FileText className="w-4 h-4" />
                    הפק מסמך ללקוח
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <FileText className="w-4 h-4" />
                    צפה במסמכים
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 text-orange-600" size="sm">
                    <Bell className="w-4 h-4" />
                    שלח תזכורת
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                סגור
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>הוסף לקוח חדש</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">שם *</label>
                <input
                  type="text"
                  placeholder="שם מלא"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">טלפון *</label>
                <input
                  type="tel"
                  placeholder="050-1234567"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">אימייל</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowAddCustomer(false)}>
                ביטול
              </Button>
              <Button onClick={() => setShowAddCustomer(false)}>
                הוסף
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}