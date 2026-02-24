import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import Container from '../../../components/Container';

const AnalyticsDashboard: React.FC = () => {
  // Fetch stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Aggregate queries
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_amount_usd, created_at')
        .eq('status', 'confirmed');

      const { data: bookingCounts } = await supabase
        .from('bookings')
        .select('status');

      const { data: customerCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'customer');

      const totalRevenue = revenueData?.reduce((sum, b) => sum + b.total_amount_usd, 0) || 0;
      const totalBookings = bookingCounts?.length || 0;
      const totalCustomers = customerCount || 0;

      // Group revenue by month for chart
      const revenueByMonth = revenueData?.reduce((acc: any, b) => {
        const month = new Date(b.created_at).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + b.total_amount_usd;
        return acc;
      }, {});

      const chartData = Object.keys(revenueByMonth || {}).map(month => ({
        name: month,
        revenue: revenueByMonth[month]
      }));

      return {
        totalRevenue,
        totalBookings,
        totalCustomers,
        chartData
      };
    }
  });

  if (isLoading) return <div className="p-20 text-center">Loading Analytics...</div>;

  const cards = [
    { title: 'Total Revenue', value: `$${stats?.totalRevenue.toLocaleString() || 0}`, icon: DollarSign, trend: '+12.5%', isUp: true },
    { title: 'Total Bookings', value: stats?.totalBookings.toString() || '0', icon: Calendar, trend: '+5.2%', isUp: true },
    { title: 'Active Customers', value: stats?.totalCustomers.toString() || '0', icon: Users, trend: '+18.1%', isUp: true },
    { title: 'Conversion Rate', value: '3.2%', icon: TrendingUp, trend: '+0.4%', isUp: true },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <Container>
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">Business Analytics</h1>
            <p className="text-slate-500 font-medium text-lg">Real-time performance metrics for TourSphere.</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all">Export CSV</button>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all">Refresh Data</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {cards.map((card) => (
            <div key={card.title} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <card.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-black ${card.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {card.trend}
                  {card.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
              </div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{card.title}</p>
              <h3 className="text-3xl font-black text-slate-900">{card.value}</h3>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8">Revenue Overview</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontWeight: 800, color: '#0f172a'}}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8">Bookings by Status</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="revenue" fill="#0f172a" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AnalyticsDashboard;
