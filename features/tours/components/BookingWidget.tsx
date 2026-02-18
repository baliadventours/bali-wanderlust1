
import React, { useState, useMemo } from 'react';
import { Calendar, Users, CheckCircle, ShieldCheck, Tag, Loader2 } from 'lucide-react';
import { Tour } from '../types';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useFormattedPrice } from '../../../utils/currency';

interface BookingWidgetProps {
  tour: Tour;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({ tour }) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [participants, setParticipants] = useState(3);
  
  const { t } = useTranslation();
  const formatPrice = useFormattedPrice();

  const price = tour.base_price_usd;
  const originalPrice = price * 1.2;

  return (
    <div className="bg-white border border-slate-200 rounded-[10px] shadow-xl p-8 sticky top-32 overflow-hidden">
      <div className="absolute top-0 right-0">
        <div className="bg-rose-500 text-white px-3 py-1.5 rounded-bl-[10px] font-bold text-[10px] uppercase tracking-widest">
          15% OFF
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold text-slate-900">{formatPrice(price)}</span>
        <span className="text-slate-400 text-sm font-medium line-through">{formatPrice(originalPrice)}</span>
      </div>
      <p className="text-slate-500 text-xs font-medium mb-8">per person</p>

      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Select Date</label>
          <div className="relative">
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-[10px] px-4 py-3 text-sm font-bold appearance-none focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
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
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Travelers</label>
          <div className="relative">
             <select 
               className="w-full bg-slate-50 border border-slate-200 rounded-[10px] px-4 py-3 text-sm font-bold appearance-none focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
               value={participants}
               onChange={(e) => setParticipants(Number(e.target.value))}
             >
               {[1,2,3,4,5,6,7,8,9,10].map(n => (
                 <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
               ))}
             </select>
             <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <button className="w-full bg-emerald-600 text-white py-4 rounded-[10px] font-bold text-md hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all mb-8">
        Check Availability
      </button>

      <div className="space-y-4 border-t border-slate-50 pt-6">
        <div className="flex items-center gap-3 text-xs font-bold text-emerald-600">
           <CheckCircle className="w-4 h-4" />
           <span>Free cancellation</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
           <ShieldCheck className="w-4 h-4 text-emerald-500" />
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
