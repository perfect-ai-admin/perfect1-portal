import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function QuickInvoiceButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    amount: '',
    description: ''
  });

  const handleQuickCreate = () => {
    if (!formData.clientName || !formData.amount) {
      toast.error('אנא מלא את כל השדות הנדרשים');
      return;
    }

    // Mock invoice creation
    toast.success('חשבונית נוצרה בהצלחה! 🎉');
    setShowDialog(false);
    setFormData({ clientName: '', amount: '', description: '' });
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDialog(true)}
        className="fixed bottom-24 md:bottom-8 left-8 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl p-4 hover:shadow-xl transition-all flex items-center gap-2 group"
      >
        <Zap className="w-6 h-6" />
        <span className="hidden group-hover:inline-block font-medium">חשבונית מהירה</span>
      </motion.button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              חשבונית מהירה
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              צור חשבונית פשוטה במהירות - אידיאלי ללקוחות חוזרים
            </p>

            <div>
              <Label htmlFor="clientName">שם הלקוח *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="למשל: אבי כהן"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="amount">סכום *</Label>
              <div className="relative mt-1">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">₪</span>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  className="pr-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">תיאור השירות</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="למשל: ייעוץ עסקי - 2 שעות"
                className="mt-1"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                💡 החשבונית תישלח ללקוח באימייל ותתועד אוטומטית במערכת
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleQuickCreate} className="flex-1">
                <Plus className="w-4 h-4 ml-2" />
                צור ושלח
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}