import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, UserCog, Loader2 } from 'lucide-react';
import UserProfileModal from './UserProfileModal';

export default function UsersTable(props) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // Use backend function to list users (supports bypass and admin check)
            const response = await base44.functions.invoke('adminListUsers', {
                bypassCode: props.loginData?.code,
                phone: props.loginData?.phone
            });
            
            if (response.data && response.data.users) {
                setUsers(response.data.users);
            } else {
                // Fallback for direct entity access if function fails or returns weird format
                const allUsers = await base44.entities.User.list();
                setUsers(allUsers);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            try {
                // Fallback try direct access
                const allUsers = await base44.entities.User.list();
                setUsers(allUsers);
            } catch (e) {
                console.error('Fallback failed:', e);
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
    );

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Search */}
            <div className="p-6 border-b">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="חפש לפי שם, אימייל או טלפון..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-right p-4 font-semibold text-gray-700">תאריך הצטרפות</th>
                            <th className="text-right p-4 font-semibold text-gray-700">שם</th>
                            <th className="text-right p-4 font-semibold text-gray-700">אימייל</th>
                            <th className="text-right p-4 font-semibold text-gray-700">מסע לקוח</th>
                            <th className="text-right p-4 font-semibold text-gray-700">טלפון</th>
                            <th className="text-right p-4 font-semibold text-gray-700">מסלול</th>
                            <th className="text-right p-4 font-semibold text-gray-700">סטטוס</th>
                            <th className="text-right p-4 font-semibold text-gray-700">מודולים</th>
                            <th className="text-right p-4 font-semibold text-gray-700">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 text-gray-600">
                                    {new Date(user.created_date).toLocaleDateString('he-IL')}
                                </td>
                                <td className="p-4">
                                    <div className="font-medium">{user.full_name}</div>
                                    {user.is_admin && (
                                        <Badge variant="outline" className="mt-1 text-xs">מנהל</Badge>
                                    )}
                                </td>
                                <td className="p-4 text-gray-600">{user.email}</td>
                                <td className="p-4">
                                    {user.has_started_journey ? (
                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                            התחיל תהליך
                                        </Badge>
                                    ) : (
                                        <span className="text-gray-400 text-sm">טרם התחיל</span>
                                    )}
                                </td>
                                <td className="p-4 text-gray-600">{user.phone || '-'}</td>
                                <td className="p-4">
                                    {user.current_plan_id ? (
                                        <Badge variant="outline">פלאן פעיל</Badge>
                                    ) : (
                                        <span className="text-gray-400">ללא מסלול</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <Badge 
                                        className={
                                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                                            user.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }
                                    >
                                        {user.status === 'active' ? 'פעיל' : 
                                         user.status === 'paused' ? 'מושהה' : 'חסום'}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        {user.marketing_enabled && (
                                            <Badge className="bg-purple-100 text-purple-800 text-xs">M</Badge>
                                        )}
                                        {user.mentor_enabled && (
                                            <Badge className="bg-blue-100 text-blue-800 text-xs">Me</Badge>
                                        )}
                                        {user.finance_enabled && (
                                            <Badge className="bg-green-100 text-green-800 text-xs">F</Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <UserCog className="w-4 h-4 ml-2" />
                                        ניהול
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        לא נמצאו משתמשים
                    </div>
                )}
            </div>

            {/* User Profile Modal */}
            {selectedUser && (
                <UserProfileModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onUpdate={loadUsers}
                />
            )}
        </div>
    );
}