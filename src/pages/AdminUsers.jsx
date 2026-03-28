import React from 'react';
import { auth, invokeFunction } from '@/api/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsers() {
  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => auth.me(),
  });

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await invokeFunction('adminListUsers');
      return res?.users || [];
    },
    enabled: currentUser?.role === 'admin', // Only fetch if admin
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  // Basic access control UI
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">גישה נדחתה</h1>
        <p className="text-gray-500 mt-2">דף זה מיועד למנהלי מערכת בלבד.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">ניהול משתמשים ולידים</h1>
          <div className="text-sm text-gray-500">
            סה"כ משתמשים: {users?.length || 0}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>רשימת משתמשים ומקורות הגעה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">שם מלא</TableHead>
                    <TableHead className="text-right">אימייל</TableHead>
                    <TableHead className="text-right">תאריך הרשמה</TableHead>
                    <TableHead className="text-right">מקור (Source)</TableHead>
                    <TableHead className="text-right">קמפיין (Campaign)</TableHead>
                    <TableHead className="text-right">דף מפנה (Referrer)</TableHead>
                    <TableHead className="text-right">תפקיד</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.created_date ? format(new Date(user.created_date), 'dd/MM/yyyy HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {user.utm_source ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {user.utm_source}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.utm_campaign ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {user.utm_campaign}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 truncate max-w-[200px]" title={user.ref_page}>
                        {user.ref_page || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!users?.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-gray-500">
                        לא נמצאו משתמשים
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}