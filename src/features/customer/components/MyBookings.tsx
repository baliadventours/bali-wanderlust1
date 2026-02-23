import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../providers/AuthProvider';
import { Loader2, Calendar, MapPin, Clock, CreditCard } from 'lucide-react';

export const MyBookings: React.FC = () => {
  const { user } = useAuth();
  
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      // Filter for current user
      return data.data.bookings.filter((b: any) => b.userId === user?.id);
    },
    enabled: !!user?.id,
  });

  if (isLoading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  const bookings = bookingsData || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">My Bookings</h1>
        <p className="text-slate-500 font-medium">Manage your upcoming and past expeditions.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {bookings.map((booking: any) => (
          <div key={booking.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden">
              <img src={booking.tour.images.split(',')[0]} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-grow p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.status}
                    </span>
                    {booking.paid && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> Paid
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{booking.tour.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</div>
                  <div className="text-2xl font-black text-slate-900">${booking.price}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </div>
                  <div className="font-bold text-slate-700 text-sm">{booking.tour.location}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Duration
                  </div>
                  <div className="font-bold text-slate-700 text-sm">{booking.tour.duration} Days</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Booked On
                  </div>
                  <div className="font-bold text-slate-700 text-sm">{new Date(booking.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-end justify-end">
                  <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center">
            <div className="text-slate-300 font-black text-2xl mb-2">No bookings yet</div>
            <p className="text-slate-400 font-medium mb-8">Your next adventure is just a few clicks away.</p>
            <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black hover:bg-emerald-700 transition-all">
              Browse Expeditions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
