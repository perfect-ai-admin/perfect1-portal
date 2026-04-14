import React from 'react';
import { Building2, Clock, Users, TrendingUp } from 'lucide-react';

const ICON_MAP = {
  building: Building2,
  clock: Clock,
  users: Users,
  trending: TrendingUp,
};

const DEFAULT_STATS = [
  { icon: 'building', value: '1,200+', label: 'חברות נפתחו בסיוענו' },
  { icon: 'clock', value: '7 ימים', label: 'זמן ממוצע לתעודת התאגדות' },
  { icon: 'users', value: '98%', label: 'לקוחות מרוצים' },
  { icon: 'trending', value: '2026', label: 'מחירים עדכניים' },
];

export default function StatsBar({ section }) {
  const stats = section?.stats || DEFAULT_STATS;

  return (
    <div id={section?.id} className="scroll-mt-24">
      <div className="bg-portal-navy rounded-2xl p-5 sm:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => {
            const Icon = ICON_MAP[stat.icon] || Building2;
            return (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5 text-portal-teal" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/60 mt-0.5">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
