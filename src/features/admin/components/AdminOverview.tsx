import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Compass, Calendar, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const { data: toursData } = useQuery({ queryKey: ['tours'], queryFn: () => fetch('/api/tours').then(res => res.json()) });
  const { data: bookingsData } = useQuery({ queryKey: ['bookings'], queryFn: () => fetch('/api/bookings').then(res => res.json()) });
  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: () => fetch('/api/users').then(res => res.json()) });

  const stats = [
    { label: 'Total Revenue', val: '$124,500', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%', up: true },
    { label: 'Active Tours', val: toursData?.results || 0, icon: Compass, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+2', up: true },
    { label: 'Total Bookings', val: bookingsData?.results || 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+18', up: true },
    { label: 'Total Users', val: usersData?.results || 0, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-3%', up: false },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">System Overview</h1>
        <p className="text-slate-500 font-medium">Real-time performance metrics and business insights.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-black ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {s.trend} {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 mb-1">{s.val}</div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900">Recent Bookings</h3>
            <button className="text-emerald-600 font-bold text-sm">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {bookingsData?.data?.bookings?.slice(0, 5).map((b: any) => (
              <div key={b.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-600">
                    {b.user.name?.[0] || b.user.email[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{b.user.name || b.user.email}</div>
                    <div className="text-xs font-medium text-slate-400">{b.tour.title}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900">${b.price}</div>
                  <div className="text-[10px] font-black uppercase text-emerald-600">{b.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Tours */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900">Popular Tours</h3>
            <button className="text-emerald-600 font-bold text-sm">Manage Tours</button>
          </div>
          <div className="divide-y divide-slate-50">
            {toursData?.data?.tours?.slice(0, 5).map((t: any) => (
              <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <img src={t.images.split(',')[0]} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  <div>
                    <div className="font-bold text-slate-900">{t.title}</div>
                    <div className="text-xs font-medium text-slate-400">{t.location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900">${t.price}</div>
                  <div className="text-[10px] font-black uppercase text-slate-400">{t.difficulty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
