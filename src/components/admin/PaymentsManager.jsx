import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PlansManager from './PlansManager';

export default function PaymentsManager() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await base44.functions.invoke('adminListPayments');
            if (response.data) {
                setPayments(response.data.payments || []);
            }
        } catch (error) {
            console.error("Failed to fetch payments", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(payment => 
        payment.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.amount?.toString().includes(searchTerm)
    );

    const exportCSV = () => {
        const headers = ["Date", "Amount", "Currency", "Product", "Status", "User ID", "Method"];
        const rows = filteredPayments.map(p => [
            format(new Date(p.created_date), 'yyyy-MM-dd HH:mm'),
            p.amount,
            p.currency,
            p.product_name,
            p.status,
            p.user_id,
            p.payment_method
        ]);
        
        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "payments_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="payments" className="w-full">
                <TabsList>
                    <TabsTrigger value="payments">רשימת תשלומים</TabsTrigger>
                    <TabsTrigger value="plans">ניהול מסלולים</TabsTrigger>
                </TabsList>

                <TabsContent value="payments">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>היסטוריית תשלומים</CardTitle>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="חיפוש..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pr-8"
                                    />
                                </div>
                                <Button variant="outline" onClick={exportCSV}>
                                    <Download className="w-4 h-4 ml-2" />
                                    ייצוא CSV
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">תאריך</TableHead>
                                        <TableHead className="text-right">מוצר</TableHead>
                                        <TableHead className="text-right">סכום</TableHead>
                                        <TableHead className="text-right">סטטוס</TableHead>
                                        <TableHead className="text-right">משתמש</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">טוען...</TableCell>
                                        </TableRow>
                                    ) : filteredPayments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">לא נמצאו תשלומים</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPayments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{format(new Date(payment.created_date), 'dd/MM/yyyy HH:mm')}</TableCell>
                                                <TableCell>{payment.product_name}</TableCell>
                                                <TableCell>₪{payment.amount}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(payment.status)}>
                                                        {payment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{payment.user_id}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="plans">
                    <PlansManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}