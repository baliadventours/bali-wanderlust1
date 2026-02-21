
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { Calendar, MapPin, Clock, ArrowRight, Loader2, Plane } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useFormattedPrice } from '../../../utils/currency';

export const MyBookings: React.FC = () => {
  const { user } = useAuthStore();
  const formatPrice = useFormattedPrice();
  
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      if (!isConfigured) {
        return Array(3).fill(null).map((_, i) => ({
          id: `mb-${i}`,
          created_at: new Date().toISOString(),
          status: 'confirmed',
          total_amount_usd: 1250,
          availability: {
            start_time: new Date(2024, 6, 15).toISOString(),
            tour: {
              title: { en: 'Ubud Jungle Expedition' },
              images: ['https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=400'],
              destination: { name: { en: 'Bali' } }
            }
          }
        }));
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          availability:tour_availability(
            start_time,
            tour:tours(
              title,
              images,
              destination:destinations(name)
            )
          )
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-900">My Expeditions</h1>
        <p className="text-slate-500 font-medium">Track your upcoming and past adventures.</p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center">
          <Plane className="w-16 h-16 text-slate-100 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings yet</h3>
          <p className="text-slate-500 mb-8">Your next great story is waiting to be written.</p>
          <Link to="/tours" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 inline-block transition-all">
            Explore Tours
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all group">
              <div className="w-full md:w-64 aspect-video md:aspect-square bg-slate-100">
                <img 
                  src={booking.availability?.tour?.images?.[0]} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt="Tour"
                />
              </div>
              <div className="p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="text-lg font-black text-slate-900">{formatPrice(booking.total_amount_usd)}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{booking.availability?.tour?.title?.en}</h3>
                  
                  <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      {format(new Date(booking.availability?.start_time), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      {booking.availability?.tour?.destination?.name?.en}
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-slate-50 flex justify-between items-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    ID: #{booking.id.slice(-8)}
                  </div>
                  <button className="text-indigo-600 font-bold text-sm flex items-center gap-2 hover:translate-x-2 transition-transform">
                    View Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
