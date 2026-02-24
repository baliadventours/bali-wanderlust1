import { supabase } from '../lib/supabase';
import { PriceType } from '../lib/types';

export const calculateBookingPrice = async (
  tourId: string,
  date: string,
  participants: { type: PriceType; count: number }[]
) => {
  const { data, error } = await supabase.rpc('calculate_price', {
    p_tour_id: tourId,
    p_date: date,
    p_participants: participants
  });

  if (error) {
    console.error('Error calculating price:', error);
    throw error;
  }

  return data as { total: number; breakdown: any[] };
};

export const checkAvailability = async (tourId: string, date: string, requestedSlots: number) => {
  const { data, error } = await supabase
    .from('tour_availability')
    .select('*')
    .eq('tour_id', tourId)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  if (!data) return true; // Default available if no record

  return (data.total_slots - data.booked_slots) >= requestedSlots;
};
