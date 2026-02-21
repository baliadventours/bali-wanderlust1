
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, Users, Ticket, ChevronLeft, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useCheckout } from '../hooks/useCheckout';
import { format } from 'date-fns';
import { useAppStore } from '../../../store/useAppStore';
import { useFormattedPrice } from '../../../utils/currency';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tourId = searchParams.get('tourId') || '';
  const availabilityId = searchParams.get('slotId') || '';

  const {
    tour,
    selectedSlot,
    participants,
    setParticipants,
    selectedAddons,
    setSelectedAddons,
    couponCode,
    setCouponCode,
    appliedDiscount,
    applyCoupon,
    pricing,
    initiateCheckout,
    isLoading
  } = useCheckout(tourId, availabilityId);

  const { currency } = useAppStore();
  const formatPrice = useFormattedPrice();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!tour || !selectedSlot) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center px-4">
        <h1 className="text-2xl font-bold mb-4">Invalid checkout session</h1>
        <button onClick={() => navigate('/tours')} className="text-indigo-600 font-bold hover:underline">Return to tours</button>
      </div>
    );
  }

  const handleAddParticipant = () => {
    if (participants.length < tour.max_participants) {
      setParticipants([...participants, { full_name: '', email: '' }]);
    }
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const next = [...participants];
    next[index] = { ...next[index], [field]: value };
    setParticipants(next);
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleCheckout = () => {
    initiateCheckout.mutate({
      tour_id: tour.id,
      availability_id: selectedSlot.id,
      participants,
      addon_ids: selectedAddons,
      coupon_code: appliedDiscount?.code,
      currency_code: currency.code
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to tour details
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Participants */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                  1
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Guest Details</h2>
              </div>

              <div className="space-y-6">
                {participants.map((p, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-900">Guest #{idx + 1} {idx === 0 && <span className="text-xs text-indigo-600 ml-2">(Primary)</span>}</h3>
                      {idx > 0 && (
                        <button onClick={() => handleRemoveParticipant(idx)} className="text-xs text-red-500 font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="John Doe"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={p.full_name}
                          onChange={(e) => updateParticipant(idx, 'full_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="john@example.com"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={p.email}
                          onChange={(e) => updateParticipant(idx, 'email', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {participants.length < tour.max_participants && (
                  <button 
                    onClick={handleAddParticipant}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Add Another Guest
                  </button>
                )}
              </div>
            </section>

            {/* Step 2: Extras */}
            {tour.addons && tour.addons.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                    2
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Enhance Your Trip</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tour.addons.map(addon => (
                    <button 
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-5 rounded-2xl border text-left transition-all flex justify-between items-start ${selectedAddons.includes(addon.id) ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">{addon.title?.en}</div>
                        <div className="text-xs text-slate-500">{addon.description?.en || 'Available for this tour'}</div>
                      </div>
                      <div className="font-extrabold text-indigo-600 text-sm">+{formatPrice(addon.unit_price_usd)}</div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 text-white rounded-3xl shadow-2xl p-8 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Booking Summary</h2>
              
              <div className="space-y-6 pb-6 border-b border-white/10">
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Tour</h3>
                  <p className="font-bold">{tour.title?.en}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Date & Time</h3>
                  <p className="font-medium text-indigo-200">{format(new Date(selectedSlot.start_time), 'EEEE, MMMM do, yyyy')}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Guests</h3>
                  <p className="font-medium">{participants.length} Participant(s)</p>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="py-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Base Price ({participants.length}x)</span>
                  <span className="font-medium">{formatPrice(pricing.base)}</span>
                </div>
                {pricing.addons > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Add-ons Total</span>
                    <span className="font-medium text-emerald-400">+{formatPrice(pricing.addons)}</span>
                  </div>
                )}
                {pricing.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Discount Applied</span>
                    <span className="font-medium text-indigo-400">-{formatPrice(pricing.discount)}</span>
                  </div>
                )}
                <div className="pt-4 flex justify-between items-baseline">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-3xl font-extrabold text-indigo-400">{formatPrice(pricing.total)}</span>
                </div>
              </div>

              {/* Coupon Input */}
              <div className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Coupon code"
                  className="flex-grow bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white/20 transition-all uppercase placeholder:text-white/30"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button 
                  onClick={() => applyCoupon.mutate(couponCode)}
                  disabled={applyCoupon.isPending || !!appliedDiscount}
                  className="bg-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {applyCoupon.isPending ? '...' : 'Apply'}
                </button>
              </div>
              {appliedDiscount && (
                <p className="text-[10px] text-indigo-300 font-bold mt-2 uppercase">Coupon "{appliedDiscount.code}" applied!</p>
              )}

              <button 
                onClick={handleCheckout}
                disabled={initiateCheckout.isPending}
                className="w-full bg-white text-slate-900 mt-8 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {initiateCheckout.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    Secure Checkout
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                <ShieldCheck className="w-3 h-3" />
                SSL Secured Payment via Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
