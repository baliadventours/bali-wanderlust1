import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CreditCard, Shield, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import Container from '../../../components/Container';
import { Tour, TourImage } from '../../../lib/types';
import { calculateBookingPrice } from '../../../services/pricingService';

const CheckoutPage: React.FC = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  const date = searchParams.get('date') || '';
  const participantsStr = searchParams.get('p') || '[]';
  const participants = JSON.parse(participantsStr);

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour-checkout', tourId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*, tour_images(*)')
        .eq('id', tourId)
        .single();
      if (error) throw error;
      return data as (Tour & { tour_images: TourImage[] });
    }
  });

  const { data: priceData } = useQuery({
    queryKey: ['price-checkout', tourId, date, participants],
    queryFn: () => calculateBookingPrice(tourId!, date, participants),
    enabled: !!tourId && !!date
  });

  const handleBooking = async () => {
    setIsProcessing(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        alert('Please sign in to book an expedition.');
        navigate('/login');
        return;
      }

      const { error } = await supabase.from('bookings').insert({
        customer_id: user.id,
        vendor_id: tour?.vendor_id,
        tour_id: tourId,
        booking_date: date,
        total_amount_usd: priceData?.total || tour?.base_price_usd,
        pricing_breakdown: priceData?.breakdown || {},
        status: 'pending'
      });

      if (error) {
        console.error('Booking error:', error);
        throw error;
      }
      
      alert('Booking successful! We will contact you soon.');
      navigate('/tours');
    } catch (error: any) {
      console.error('Booking failed:', error);
      alert(`Booking failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;
  if (!tour) return <div className="p-20 text-center">Tour not found</div>;

  const title = i18n.language === 'id' ? tour.title_id : tour.title_en;

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <Container>
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <h2 className="text-3xl font-black text-slate-900">{t('checkout.title')}</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Expiry</label>
                    <input type="text" placeholder="MM/YY" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">CVC</label>
                    <input type="text" placeholder="123" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-bold" />
                  </div>
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
                  <p className="text-emerald-600 font-black text-xs uppercase tracking-widest mt-2">{date}</p>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-50">
                {priceData?.breakdown.map((item: any) => (
                  <div key={item.type} className="flex justify-between text-slate-500 font-bold">
                    <span>{item.count}x {item.type}</span>
                    <span>${item.subtotal}</span>
                  </div>
                ))}
                <div className="flex justify-between text-slate-900 text-2xl font-black pt-4 border-t border-slate-100">
                  <span>{t('checkout.total')}</span>
                  <span>${priceData?.total || tour.base_price_usd}</span>
                </div>
              </div>

              <button 
                onClick={handleBooking}
                disabled={isProcessing}
                className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <>{t('checkout.complete_booking')} <CheckCircle2 className="w-6 h-6" /></>}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CheckoutPage;
