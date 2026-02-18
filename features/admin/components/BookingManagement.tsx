
import React from 'react';
import { useAdminBookings, useUpdateBookingStatus } from '../hooks/useAdminData';
import { 
  MoreVertical, Download, Search, Filter, 
  CheckCircle2, XCircle, Clock, ExternalLink 
} from 'lucide-react';
import { format } from 'date-fns';
import Papa from 'papaparse';

export const BookingManagement: React.FC = () => {
  const { data: bookings, isLoading } = useAdminBookings();
  const updateStatus = useUpdateBookingStatus();

  const handleExport = () => {
    if (!bookings) return;
    const csvData = bookings.map(b => ({
      ID: b.id,
      Date: format(new Date(b.created_at), 'yyyy-MM-dd'),
      Customer: b.customer?.full_name,
      Email: b.customer?.email,
      Tour: b.tour?.title?.en || b.availability?.tour?.title?.en,
      Amount: b.total_amount_usd,
      Status: b.status
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookings_export_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  if (isLoading) return <div className="p-8">Loading bookings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Bookings</h1>
          <p className="text-slate-500 text-sm">Review, approve, or refund customer transactions.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by customer or booking ID..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tour</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings?.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">#{booking.id.slice(-8)}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                      {format(new Date(booking.created_at), 'MMM d, HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{booking.customer?.full_name}</div>
                    <div className="text-xs text-slate-500">{booking.customer?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 truncate max-w-[200px]">
                      {booking.tour?.title?.en || booking.availability?.tour?.title?.en}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-slate-900">${booking.total_amount_usd}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                      booking.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {booking.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                      {booking.status === 'pending' && <Clock className="w-3 h-3" />}
                      {booking.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                      {booking.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus.mutate({ id: booking.id, status: 'confirmed' })}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Confirm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
