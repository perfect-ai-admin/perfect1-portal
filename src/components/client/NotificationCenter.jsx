import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertTriangle, Info, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SAMPLE_NOTIFICATIONS = [
  {
    id: '1',
    type: 'success',
    title: 'חשבונית שולמה!',
    message: 'הלקוח "אבי כהן" שילם ₪2,500',
    time: 'לפני 5 דקות',
    unread: true
  },
  {
    id: '2',
    type: 'warning',
    title: 'תזכורת: מטרה חודשית',
    message: 'נותרו 7 ימים להגיע ליעד ההכנסות החודשי',
    time: 'לפני שעה',
    unread: true
  },
  {
    id: '3',
    type: 'info',
    title: 'המלצה חדשה',
    message: 'המנטור החכם שלך יש לו עצה לשיפור הרווחיות',
    time: 'לפני 3 שעות',
    unread: false
  }
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'achievement':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button 
          className="relative p-2 hover:bg-white/10 rounded-lg transition-all"
          aria-label={`התראות${unreadCount > 0 ? ` - ${unreadCount} התראות חדשות` : ''}`}
          aria-haspopup="true"
        >
          <Bell className="w-6 h-6" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
              aria-label={`${unreadCount} התראות חדשות`}
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">התראות</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs hover:underline opacity-90"
                  aria-label="סמן את כל ההתראות כנקראות"
                >
                  סמן הכל כנקרא
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            <AnimatePresence>
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                  <p>אין התראות חדשות</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`border-b border-gray-100 p-4 hover:bg-gray-50 transition-all cursor-pointer ${
                      notification.unread ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label={`הסר התראה: ${notification.title}`}
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
           {notifications.length > 0 && (
             <div className="bg-gray-50 p-3 text-center">
               <button 
                 className="text-sm text-blue-600 hover:underline font-medium"
                 aria-label="צפה בכל ההתראות"
               >
                 צפה בכל ההתראות
               </button>
             </div>
           )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}