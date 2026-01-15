import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InvoiceGenerator from '../financial/InvoiceGenerator';
import BudgetRecommendationEngine from '../financial/BudgetRecommendationEngine';
import ReportsSection from '../financial/ReportsSection';
import FINBOTAuthButton from '../financial/FINBOTAuthButton';
import DocumentScanner from '../financial/DocumentScanner';
import BankSyncComponent from '../financial/BankSyncComponent';
import VATReportingComponent from '../financial/VATReportingComponent';
import { FileText, DollarSign, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';
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
      {/* FINBOT Connection */}
      <FINBOTAuthButton onAuthSuccess={() => console.log('FINBOT connected')} />
      {/* FINBOT Connection Banner - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md p-4 md:p-6 text-white">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <h2 className="text-lg md:text-2xl font-bold mb-2">ניהול כספים עם FINBOT</h2>
            <p className="text-sm md:text-base opacity-90 mb-3">
              מערכת מקצועית לניהול חשבוניות, הוצאות ודיווחים - עם דיוק של 97%
            </p>
            <ul className="space-y-1 text-xs md:text-sm opacity-90">
              <li className="flex items-center gap-2">✓ חשבוניות מקצועיות</li>
              <li className="flex items-center gap-2">✓ סריקת קבלות</li>
              <li className="flex items-center gap-2">✓ דיווחי מע"מ</li>
              <li className="flex items-center gap-2">✓ סנכרון בנק</li>
            </ul>
            <Button 
              size="sm" 
              className="bg-white text-blue-600 hover:bg-gray-100 w-full mt-3"
            >
              <ExternalLink className="w-4 h-4 ml-2" />
              התחבר ל-FINBOT
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-4 h-auto p-1"
          <TabsTrigger value="invoices" className="text-xs md:text-base flex-col gap-1 py-2">
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">חשבוניות</span>
            <span className="md:hidden">חשבוניות</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs md:text-base flex-col gap-1 py-2">
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">סריקה</span>
            <span className="md:hidden">סריקה</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="text-xs md:text-base flex-col gap-1 py-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden md:inline">בנק</span>
            <span className="md:hidden">בנק</span>
          </TabsTrigger>
          <TabsTrigger value="vat" className="hidden md:flex text-xs md:text-base flex-col gap-1 py-2">
            <FileText className="w-4 h-4" />
            מע"ם
          </TabsTrigger>
          <TabsTrigger value="reports" className="hidden md:flex text-xs md:text-base flex-col gap-1 py-2">
            <TrendingUp className="w-4 h-4" />
            דוחות
          </TabsTrigger>
          <TabsTrigger value="budget" className="hidden md:flex text-xs md:text-base flex-col gap-1 py-2">
            <DollarSign className="w-4 h-4" />
            תקציב
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <DocumentScanner onScanComplete={(result) => console.log('Scan complete:', result)} />
        </TabsContent>

        <TabsContent value="bank" className="space-y-6">
          <BankSyncComponent />
        </TabsContent>

        <TabsContent value="vat" className="space-y-6">
          <VATReportingComponent />
        </TabsContent>

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
          <ReportsSection />
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <BudgetRecommendationEngine
            recommendations={[
              {
                id: '1',
                type: 'savings_opportunity',
                title: 'הזדמנות לחיסכון בהוצאות',
                description: 'זיהינו שאתה מוציא 20% יותר על ציוד השנה. שקול לעבור לספק אחר או לנהל מלאי טוב יותר.',
                primaryActionLabel: 'הצג חלופות',
                primaryAction: 'view_alternatives'
              },
              {
                id: '2',
                type: 'tax_optimization',
                title: 'הטבות מס לפני סוף השנה',
                description: 'יש לך הזדמנות לנצל הטבות מס על הוצאות ציוד עד ₪5,000 לפני סוף דצמבר.',
                primaryActionLabel: 'ראה פירוט',
                primaryAction: 'view_tax_details'
              }
            ]}
            onDismiss={(id) => console.log('Dismissed:', id)}
            onAction={(id, action) => console.log('Action:', id, action)}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}