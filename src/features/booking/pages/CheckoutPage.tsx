import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import Container from '../../../components/Container';
import { Booking, Tour, TourImage } from '../../../lib/types';

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  const bookingId = searchParams.get('bid');

  const { data: booking, isLoading: isBookingLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, tours(*, tour_images(*))')
        .eq('id', bookingId)
        .single();
      if (error) throw error;
      return data as (Booking & { tours: Tour & { tour_images: TourImage[] } });
    },
    enabled: !!bookingId
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Initiate payment via Edge Function
      const { data, error } = await supabase.functions.invoke('initiate-payment', {
        body: { bookingId: booking?.id }
      });

      if (error) throw error;

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert('Payment initiated. Please follow the instructions.');
      }
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isBookingLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;
  if (!booking) return <div className="p-20 text-center">Booking not found</div>;

  const tour = booking.tours!;
  const title = i18n.language === 'id' ? tour.title_id : tour.title_en;

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <Container>
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <h2 className="text-3xl font-black text-slate-900">{t('checkout.title')}</h2>
              
              <div className="space-y-6">
                <p className="text-slate-500 font-medium">
                  Your booking is reserved. Please complete the payment to confirm your expedition.
                </p>
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-amber-800 text-sm font-bold">
                    Reserved until: {new Date(booking.expires_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-400 text-sm font-bold px-4">
              <Shield className="w-5 h-5" />
              <span>Your payment information is encrypted and secure.</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
              <h3 className="text-2xl font-black text-slate-900">{t('checkout.summary')}</h3>
              
              <div className="flex gap-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={tour.tour_images?.[0]?.url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">{title}</h4>
                  <p className="text-slate-400 font-bold">{Math.round(tour.duration_minutes / 1440)} Days Expedition</p>
                  <p className="text-emerald-600 font-black text-xs uppercase tracking-widest mt-2">{booking.booking_date}</p>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-50">
                {booking.pricing_breakdown.map((item: any) => (
                  <div key={item.type} className="flex justify-between text-slate-500 font-bold">
                    <span>{item.count}x {item.type}</span>
                    <span>${item.subtotal}</span>
                  </div>
                ))}
                <div className="flex justify-between text-slate-900 text-2xl font-black pt-4 border-t border-slate-100">
                  <span>{t('checkout.total')}</span>
                  <span>${booking.total_amount_usd}</span>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <>{t('checkout.complete_payment')} <CreditCard className="w-6 h-6" /></>}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CheckoutPage;
