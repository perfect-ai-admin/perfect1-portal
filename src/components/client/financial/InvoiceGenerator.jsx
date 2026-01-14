import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Send, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export default function InvoiceGenerator({ onCreateInvoice }) {
  const [step, setStep] = useState('templates'); // templates, form, preview, sending, sent
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    notes: '',
    paymentTerms: 'שוטף + 30'
  });

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeLineItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateLineItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
  };

  const handleSubmit = async () => {
    setStep('sending');
    try {
      await onCreateInvoice(formData);
      setStep('sent');
    } catch (error) {
      alert('שגיאה ביצירת החשבונית: ' + error.message);
      setStep('form');
    }
  };

  if (step === 'templates') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">צור חשבונית חדשה</h2>
          <p className="text-gray-600">בחר תבנית או התחל מאפס</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500"
            onClick={() => setStep('form')}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">חשבונית פשוטה</h3>
            <p className="text-gray-600">התחל מאפס עם טופס נקי</p>
          </Card>
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500 opacity-50">
            <h3 className="text-xl font-bold text-gray-900 mb-2">מהחשבונית הקודמת</h3>
            <p className="text-gray-600">שכפל את החשבונית האחרונה</p>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">החשבונית נשלחה בהצלחה! 🎉</h2>
        <p className="text-gray-600 mb-8">הלקוח קיבל את החשבונית באימייל</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setStep('templates')}>
            <Plus className="w-5 h-5 ml-2" />
            חשבונית נוספת
          </Button>
          <Button variant="outline">
            <Download className="w-5 h-5 ml-2" />
            הורד PDF
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">פרטי החשבונית</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setStep('templates')}>
            ביטול
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStep('preview')}>
            <Eye className="w-4 h-4 ml-2" />
            תצוגה מקדימה
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Client Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">פרטי לקוח</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="שם הלקוח *"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            />
            <Input
              type="email"
              placeholder="אימייל לקוח *"
              value={formData.clientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
            />
          </div>
          <Textarea
            placeholder="כתובת לקוח (אופציונלי)"
            value={formData.clientAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
            rows={2}
          />
        </div>

        {/* Invoice Dates */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">תאריכים</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 block mb-2">תאריך חשבונית</label>
              <Input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-2">תאריך לתשלום</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">פריטים</h3>
            <Button size="sm" variant="outline" onClick={addLineItem}>
              <Plus className="w-4 h-4 ml-2" />
              הוסף פריט
            </Button>
          </div>
          
          {formData.items.map((item, index) => (
            <div key={index} className="grid md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-6">
                <Input
                  placeholder="תיאור *"
                  value={item.description}
                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  type="number"
                  placeholder="כמות"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  min="1"
                />
              </div>
              <div className="md:col-span-3">
                <Input
                  type="number"
                  placeholder="מחיר ליחידה"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
              {formData.items.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLineItem(index)}
                  className="md:col-span-1 text-red-600 hover:text-red-700"
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-700">סה"כ לתשלום:</span>
            <span className="text-3xl font-bold text-gray-900">
              ₪{calculateTotal().toLocaleString('he-IL')}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600">הערות (אופציונלי)</label>
          <Textarea
            placeholder="הערות נוספות לחשבונית..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            maxLength={500}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 h-12"
            disabled={!formData.clientName || !formData.clientEmail || formData.items.some(i => !i.description)}
          >
            <Send className="w-5 h-5 ml-2" />
            שלח חשבונית
          </Button>
        </div>
      </div>
    </div>
  );
}