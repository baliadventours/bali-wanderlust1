
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DollarSign, Calendar, Users, Package, ArrowUpRight, Clock, UserPlus } from 'lucide-react';
import { useAdminStats, useAdminBookings, useAdminUsers } from '../hooks/useAdminData';
import { format } from 'date-fns';
import { useFormattedPrice } from '../../../utils/currency';

const KPI = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-[12px] ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-emerald-600 text-[10px] font-black flex items-center gap-0.5">
        <ArrowUpRight className="w-3 h-3" /> +12%
      </span>
    </div>
    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
    <p className="text-2xl font-black text-slate-900">{value}</p>
  </div>
);

export const AdminOverview: React.FC = () => {
  const { data: stats } = useAdminStats();
  const { data: bookings } = useAdminBookings();
  const { data: users } = useAdminUsers();
  const formatPrice = useFormattedPrice();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Intelligence</h1>
          <p className="text-slate-500 text-sm">Platform performance and live operational metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI title="Total Revenue" value={formatPrice(stats?.totalRevenue || 0)} icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
        <KPI title="Active Bookings" value={stats?.bookingsCount} icon={Calendar} color="bg-indigo-50 text-indigo-600" />
        <KPI title="Live Tours" value={stats?.activeTours} icon={Package} color="bg-amber-50 text-amber-600" />
        <KPI title="Total Travelers" value={users?.length || 0} icon={Users} color="bg-rose-50 text-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[10px] border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" /> Revenue Stream
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="#ecfdf5" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" /> Recent Bookings
            </h3>
            <div className="space-y-4">
              {bookings?.slice(0, 5).map((b: any) => (
                <div key={b.id} className="flex items-center justify-between group">
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{b.customer?.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{format(new Date(b.created_at), 'MMM d, HH:mm')}</p>
                  </div>
                  <span className="text-xs font-black text-slate-900">{formatPrice(b.total_amount_usd)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-500" /> New Travelers
            </h3>
            <div className="space-y-4">
              {users?.slice(0, 5).map((u: any) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {u.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{u.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-medium capitalize">{u.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
