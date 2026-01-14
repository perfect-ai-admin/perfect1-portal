import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InvoiceGenerator from '../financial/InvoiceGenerator';
import { FileText, DollarSign, TrendingUp, AlertCircle, ExternalLink, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FinancialTab({ data }) {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

  const handleCreateInvoice = async (invoiceData) => {
    console.log('Creating invoice:', invoiceData);
    // Integration with FINBOT API
    setShowInvoiceForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* FINBOT Connection Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-3">ניהול כספים מתקדם עם FINBOT</h2>
            <p className="text-lg opacity-90 mb-4">
              מערכת מקצועית לניהול חשבוניות, הוצאות ודיווחים - עם דיוק של 97%
            </p>
            <ul className="space-y-2 text-sm opacity-90">
              <li className="flex items-center gap-2">✓ יצירת חשבוניות מקצועיות</li>
              <li className="flex items-center gap-2">✓ סריקת קבלות אוטומטית (OCR)</li>
              <li className="flex items-center gap-2">✓ דיווחי מע"מ אוטומטיים</li>
              <li className="flex items-center gap-2">✓ סנכרון עם הבנק</li>
            </ul>
          </div>
          <Button 
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <ExternalLink className="w-5 h-5 ml-2" />
            התחבר ל-FINBOT
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="invoices" className="text-base">
            <FileText className="w-4 h-4 ml-2" />
            חשבוניות
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-base">
            <TrendingUp className="w-4 h-4 ml-2" />
            דוחות
          </TabsTrigger>
          <TabsTrigger value="budget" className="text-base">
            <DollarSign className="w-4 h-4 ml-2" />
            תקציב
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          {!showInvoiceForm ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">החשבוניות שלי</h3>
                <Button onClick={() => setShowInvoiceForm(true)}>
                  <FileText className="w-5 h-5 ml-2" />
                  חשבונית חדשה
                </Button>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <FileText className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">טרם נוצרו חשבוניות</h3>
                <p className="text-gray-600 mb-6">התחל עם החשבונית הראשונה שלך</p>
                <Button size="lg" onClick={() => setShowInvoiceForm(true)}>
                  צור חשבונית ראשונה
                </Button>
              </div>
            </>
          ) : (
            <InvoiceGenerator onCreateInvoice={handleCreateInvoice} />
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <ReportCard
              title="דוח הכנסות"
              description="פירוט הכנסות לפי לקוחות ושירותים"
              icon={TrendingUp}
              color="from-green-500 to-green-600"
            />
            <ReportCard
              title="דוח הוצאות"
              description="ניתוח הוצאות לפי קטגוריות"
              icon={DollarSign}
              color="from-blue-500 to-blue-600"
            />
            <ReportCard
              title="רווח והפסד"
              description="P&L חודשי עם השוואה שנתית"
              icon={TrendingUp}
              color="from-purple-500 to-purple-600"
            />
            <ReportCard
              title="תזרים מזומנים"
              description="תחזית לעומת ביצוע בפועל"
              icon={TrendingDown}
              color="from-orange-500 to-orange-600"
            />
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">המלצת תקציב חכמה</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  על סמך הנתונים העסקיים שלך, אנחנו ממליצים להקצות עד <strong>₪3,000</strong> החודש להוצאות שיווק.
                  זה יהווה 10% מהכנסותיך - יחס בריא לעסק בשלב שלך.
                </p>
                <Button size="sm" variant="outline">
                  קרא עוד על התקציב המומלץ
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function ReportCard({ title, description, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer">
      <div className={`bg-gradient-to-r ${color} p-6 text-white`}>
        <Icon className="w-10 h-10 mb-3" />
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
      <div className="p-4 text-center">
        <Button variant="ghost" className="w-full">
          צפה בדוח
        </Button>
      </div>
    </div>
  );
}