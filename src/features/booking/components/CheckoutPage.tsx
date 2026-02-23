import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTour } from '../../tours/hooks/useTours';
import { useAuth } from '../../../providers/AuthProvider';
import { Loader2, CreditCard, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tourId = searchParams.get('tourId');
  const { data: tourData, isLoading } = useTour(tourId || '');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const tour = tourData?.data?.tour;

  const handleBooking = async () => {
    if (!user || !tour) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: tour.id,
          userId: user.id,
          price: tour.price,
        }),
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        navigate('/booking/success');
      }
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;
  if (!tour) return <div className="p-20 text-center">Tour not found</div>;

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4">
        <Link to={`/tours/${tour.id}`} className="inline-flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Tour
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8">
              <h2 className="text-2xl font-black text-slate-900">Traveler Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                  <input type="text" defaultValue={user?.name} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 font-bold" readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                  <input type="email" defaultValue={user?.email} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 font-bold" readOnly />
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Payment Method</h2>
                <div className="flex gap-2">
                  <div className="h-8 w-12 bg-slate-100 rounded flex items-center justify-center text-[10px] font-black text-slate-400">VISA</div>
                  <div className="h-8 w-12 bg-slate-100 rounded flex items-center justify-center text-[10px] font-black text-slate-400">MC</div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">CVC</label>
                    <input type="text" placeholder="123" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 font-bold" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-8 sticky top-32">
              <h3 className="text-xl font-black text-slate-900">Order Summary</h3>
              
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={tour.images.split(',')[0]} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 line-clamp-1">{tour.title}</h4>
                  <p className="text-slate-400 text-sm font-bold">{tour.location}</p>
                  <p className="text-emerald-600 text-sm font-black mt-1">{tour.duration} Days</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>Subtotal</span>
                  <span>${tour.price}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>Service Fee</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-slate-900 text-xl font-black pt-4 border-t border-slate-100">
                  <span>Total</span>
                  <span>${tour.price}</span>
                </div>
              </div>

              <button 
                onClick={handleBooking}
                disabled={isProcessing}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <>Confirm & Pay <CheckCircle2 className="w-5 h-5" /></>}
              </button>

              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold">
                <Shield className="w-4 h-4" />
                <span>Encrypted & Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
