
import React, { useState, useMemo } from 'react';
import { Calendar, Users, ChevronDown, CheckCircle, ShieldCheck, Tag } from 'lucide-react';
import { Tour } from '../types';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getTranslation, useFormattedPrice } from '../../../utils/currency';
import { useAppStore } from '../../../store/useAppStore';

interface BookingWidgetProps {
  tour: Tour;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({ tour }) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [participants, setParticipants] = useState(3);
  
  const { t } = useTranslation();
  const { language } = useAppStore();
  const formatPrice = useFormattedPrice();

  const selectedSlot = useMemo(() => 
    tour.availability?.find(s => s.id === selectedSlotId), 
    [tour.availability, selectedSlotId]
  );

  const price = tour.base_price_usd;
  const originalPrice = price * 1.1; // Dummy discount logic

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl p-8 sticky top-32 overflow-hidden">
      <div className="absolute top-0 right-0">
        <div className="bg-rose-500 text-white px-4 py-2 rounded-bl-2xl font-black text-xs uppercase tracking-widest">
          10% OFF
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-4xl font-black text-slate-900">{formatPrice(price)}</span>
        <span className="text-slate-400 text-sm font-bold line-through">{formatPrice(originalPrice)}</span>
      </div>
      <p className="text-slate-500 text-sm font-medium mb-8">per person</p>

      <div className="space-y-6 mb-10">
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Select Date</label>
          <div className="relative">
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black appearance-none focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
            >
              <option value="">Choose Date...</option>
              {tour.availability?.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {format(new Date(slot.start_time), 'EEEE, MMM d, yyyy')}
                </option>
              ))}
              <option value="dummy">Thursday, Feb 19, 2026</option>
            </select>
            <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Travelers</label>
          <div className="relative">
             <select 
               className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black appearance-none focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
               value={participants}
               onChange={(e) => setParticipants(Number(e.target.value))}
             >
               {[1,2,3,4,5,6,7,8,9,10].map(n => (
                 <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
               ))}
             </select>
             <Users className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-600 shadow-xl shadow-slate-100 transition-all mb-8">
        Check Availability
      </button>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-xs font-bold text-emerald-600">
           <CheckCircle className="w-4 h-4" />
           <span>Free cancellation</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
           <ShieldCheck className="w-4 h-4 text-indigo-500" />
           <span>Reserve Now & Pay Later</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
           <Tag className="w-4 h-4 text-amber-500" />
           <span>Best price guaranteed</span>
        </div>
      </div>
    </div>
  );
};
