import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Send, Eye, Download, CheckCircle, Link as LinkIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { finbotService } from './FINBOTService';

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
  
  const [previousClients, setPreviousClients] = useState([]);
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [paymentLink, setPaymentLink] = useState(null);
  const [autoReminder, setAutoReminder] = useState(true);

  // Load previous clients for autocomplete
  useEffect(() => {
    loadPreviousClients();
  }, []);

  const loadPreviousClients = async () => {
    try {
      const leads = await base44.entities.Lead.list('-created_date', 50);
      setPreviousClients(leads || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

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

  // Autocomplete handler
  const handleClientNameChange = (value) => {
    setFormData(prev => ({ ...prev, clientName: value }));
    
    if (value.length >= 2) {
      const matches = previousClients.filter(client => 
        client.name?.toLowerCase().includes(value.toLowerCase())
      );
      setClientSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Pre-fill from client record
  const selectClient = (client) => {
    setFormData(prev => ({
      ...prev,
      clientName: client.name,
      clientEmail: client.email || '',
      clientAddress: client.address || '',
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    setStep('sending');
    try {
      // Create invoice via FINBOT
      const invoice = await finbotService.createInvoice({
        ...formData,
        total: calculateTotal(),
        auto_reminder: autoReminder
      });
      
      setCreatedInvoice(invoice);
      
      // Generate payment link
      const linkData = await finbotService.createPaymentLink(
        invoice.id,
        calculateTotal()
      );
      setPaymentLink(linkData.payment_url);
      
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
        className="space-y-6 py-12"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">החשבונית נשלחה בהצלחה! 🎉</h2>
          <p className="text-gray-600 mb-8">הלקוח קיבל את החשבונית באימייל</p>
        </div>

        {/* Invoice Tracking */}
        {createdInvoice && (
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">מעקב חשבונית</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">מספר חשבונית:</span>
                <span className="font-bold text-gray-900">#{createdInvoice.id}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">סטטוס:</span>
                <span className="font-semibold text-blue-700">נשלח</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">תאריך שליחה:</span>
                <span className="font-medium text-gray-900">
                  {new Date(createdInvoice.sent_date).toLocaleDateString('he-IL')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Link */}
        {paymentLink && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3 mb-4">
              <LinkIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">קישור לתשלום</h3>
                <p className="text-sm text-gray-700 mb-3">שלח ללקוח להקלת התשלום:</p>
                <div className="bg-white rounded-lg p-3 border border-blue-200 break-all text-sm">
                  {paymentLink}
                </div>
              </div>
            </div>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(paymentLink);
                alert('הקישור הועתק ללוח!');
              }}
              variant="outline"
              className="w-full"
            >
              העתק קישור
            </Button>
          </div>
        )}

        {/* Auto Reminder Status */}
        {autoReminder && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-bold text-gray-900">תזכורת אוטומטית מופעלת</h3>
                <p className="text-sm text-gray-700">
                  אם הלקוח לא ישלם תוך 7 ימים, תישלח תזכורת אוטומטית באימייל
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button onClick={() => {
            setStep('templates');
            setCreatedInvoice(null);
            setPaymentLink(null);
          }}>
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
        {/* Client Details with Autocomplete */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">פרטי לקוח</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="clientName" className="text-sm font-semibold text-gray-700 mb-2 block">שם הלקוח *</label>
              <Input
                  id="clientName"
                  placeholder="שם הלקוח * (התחל להקליד...)"
                  value={formData.clientName}
                  onChange={(e) => handleClientNameChange(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  aria-required="true"
                  aria-autocomplete="list"
                  aria-controls="client-suggestions"
                />
              {/* Autocomplete Suggestions */}
              {showSuggestions && (
                <ul id="client-suggestions" className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto" role="listbox">
                  {clientSuggestions.map((client) => (
                    <li key={client.id} role="option">
                      <button
                        onClick={() => selectClient(client)}
                        className="w-full text-right px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                        aria-label={`בחר ${client.name}${client.email ? ` - ${client.email}` : ''}`}
                      >
                        <div className="font-medium text-gray-900">{client.name}</div>
                        {client.email && (
                          <div className="text-sm text-gray-600">{client.email}</div>
                        )}
                      </button>
                    </li>
                  ))}
                  </ul>
              )}
            </div>
            <div>
              <label htmlFor="clientEmail" className="text-sm font-semibold text-gray-700 mb-2 block">אימייל לקוח *</label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="אימייל לקוח *"
                value={formData.clientEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                aria-required="true"
              />
            </div>
          </div>
          <div>
            <label htmlFor="clientAddress" className="text-sm font-semibold text-gray-700 mb-2 block">כתובת לקוח (אופציונלי)</label>
            <Textarea
              id="clientAddress"
              placeholder="כתובת לקוח (אופציונלי)"
              value={formData.clientAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
              rows={2}
            />
          </div>
        </div>

        {/* Invoice Dates */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">תאריכים</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="invoiceDate" className="text-sm font-semibold text-gray-700 block mb-2">תאריך חשבונית</label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="text-sm font-semibold text-gray-700 block mb-2">תאריך לתשלום</label>
              <Input
                id="dueDate"
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
                <label htmlFor={`item-desc-${index}`} className="text-sm font-semibold text-gray-700 mb-1 block">תיאור *</label>
                <Input
                  id={`item-desc-${index}`}
                  placeholder="תיאור *"
                  value={item.description}
                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  aria-required="true"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor={`item-qty-${index}`} className="text-sm font-semibold text-gray-700 mb-1 block">כמות</label>
                <Input
                  id={`item-qty-${index}`}
                  type="number"
                  placeholder="כמות"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  min="1"
                />
              </div>
              <div className="md:col-span-3">
                <label htmlFor={`item-price-${index}`} className="text-sm font-semibold text-gray-700 mb-1 block">מחיר ליחידה</label>
                <Input
                  id={`item-price-${index}`}
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
          <label htmlFor="invoiceNotes" className="text-sm font-semibold text-gray-700">הערות (אופציונלי)</label>
          <Textarea
            id="invoiceNotes"
            placeholder="הערות נוספות לחשבונית..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            maxLength={500}
            rows={3}
          />
        </div>

        {/* Auto Reminder Setting */}
        <fieldset className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="autoReminder"
              checked={autoReminder}
              onChange={(e) => setAutoReminder(e.target.checked)}
              className="mt-1 w-5 h-5 text-purple-600"
            />
            <div className="flex-1">
              <label htmlFor="autoReminder" className="font-semibold text-gray-900 cursor-pointer">
                הפעל תזכורת אוטומטית
              </label>
              <p className="text-sm text-gray-700 mt-1">
                אם הלקוח לא ישלם תוך 7 ימים, תישלח תזכורת באימייל אוטומטית
              </p>
            </div>
          </div>
        </fieldset>

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