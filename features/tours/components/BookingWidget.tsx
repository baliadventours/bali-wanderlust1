
import React, { useState, useMemo } from 'react';
import { Calendar, Users, ChevronDown, CheckCircle, Info, Sparkles } from 'lucide-react';
import { Tour, AvailabilitySlot, SeasonalRule, TourAddon } from '../types';
import { format } from 'date-fns';

interface BookingWidgetProps {
  tour: Tour;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({ tour }) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [participants, setParticipants] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const selectedSlot = useMemo(() => 
    tour.availability?.find(s => s.id === selectedSlotId), 
    [tour.availability, selectedSlotId]
  );

  // Price Calculation Logic
  const priceDetails = useMemo(() => {
    if (!selectedSlot) return null;

    let basePrice = selectedSlot.price_override_usd || tour.base_price_usd;
    
    // Apply seasonal rules
    const slotDate = new Date(selectedSlot.start_time);
    const applicableRule = tour.seasonal_rules?.find(rule => {
      const start = new Date(rule.start_date);
      const end = new Date(rule.end_date);
      return slotDate >= start && slotDate <= end;
    });

    if (applicableRule) {
      if (applicableRule.fixed_override_usd) {
        basePrice = applicableRule.fixed_override_usd;
      } else {
        basePrice *= applicableRule.multiplier;
      }
    }

    const addonTotal = tour.addons
      ?.filter(a => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.unit_price_usd, 0) || 0;

    const subtotal = basePrice * participants;
    const total = subtotal + addonTotal;

    return {
      perPerson: basePrice,
      subtotal,
      addonTotal,
      total,
      isPeak: !!applicableRule && (applicableRule.multiplier > 1)
    };
  }, [selectedSlot, tour, participants, selectedAddons]);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sticky top-24">
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-3xl font-extrabold text-slate-900">${tour.base_price_usd}</span>
        <span className="text-slate-500 text-sm italic">per person</span>
      </div>

      <div className="space-y-4 mb-6">
        {/* Date Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Select Date
          </label>
          <div className="relative">
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
            >
              <option value="">Choose a slot...</option>
              {tour.availability?.map(slot => (
                <option key={slot.id} value={slot.id} disabled={slot.status !== 'active'}>
                  {format(new Date(slot.start_time), 'MMM d, yyyy')} ({slot.available_spots} left)
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Participants */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Users className="w-3 h-3" /> Participants
          </label>
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
            <button 
              onClick={() => setParticipants(Math.max(1, participants - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50"
            >
              -
            </button>
            <span className="flex-grow text-center font-bold text-slate-900">{participants}</span>
            <button 
              onClick={() => setParticipants(Math.min(tour.max_participants, participants + 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Add-ons */}
      {tour.addons && tour.addons.length > 0 && (
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Optional Add-ons</label>
          <div className="space-y-2">
            {tour.addons.map(addon => (
              <button 
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${selectedAddons.includes(addon.id) ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedAddons.includes(addon.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                    {selectedAddons.includes(addon.id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-xs font-medium text-slate-700">{addon.title?.en}</span>
                </div>
                <span className="text-xs font-bold text-slate-900">+${addon.unit_price_usd}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Summary */}
      {priceDetails && (
        <div className="border-t border-slate-100 pt-6 mb-6 space-y-2">
          {priceDetails.isPeak && (
            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" />
              Peak season pricing applies to this date.
            </div>
          )}
          <div className="flex justify-between text-sm text-slate-600">
            <span>${priceDetails.perPerson.toFixed(2)} x {participants} guests</span>
            <span>${priceDetails.subtotal.toFixed(2)}</span>
          </div>
          {priceDetails.addonTotal > 0 && (
            <div className="flex justify-between text-sm text-slate-600">
              <span>Add-ons</span>
              <span>+${priceDetails.addonTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-2">
            <span>Total</span>
            <span className="text-indigo-600">${priceDetails.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <button 
        disabled={!selectedSlotId}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-5 h-5" />
        Book Adventure Now
      </button>
      
      <p className="text-center text-xs text-slate-400 mt-4">
        No payment required until next step.
      </p>
    </div>
  );
};
