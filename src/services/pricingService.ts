import { supabase } from '../lib/supabase';
import { PriceType } from '../lib/types';

export const calculateBookingPrice = async (
  tourId: string,
  date: string,
  participants: { type: PriceType; count: number }[]
) => {
  // 1. Fetch pricing rules for the tour and date
  const { data: pricingRules, error } = await supabase
    .from('tour_pricing')
    .select('*')
    .eq('tour_id', tourId)
    .or(`date.eq.${date},date.is.null`)
    .order('date', { ascending: false }); // Date-specific rules first

  if (error) throw error;

  let total = 0;
  const breakdown: any[] = [];
  const totalCount = participants.reduce((sum, p) => sum + p.count, 0);

  participants.forEach(p => {
    if (p.count <= 0) return;

    // Find best matching rule
    const rule = pricingRules?.find(r => 
      r.price_type === p.type && 
      (r.min_group_size <= totalCount) && 
      (!r.max_group_size || r.max_group_size >= totalCount)
    );

    const price = rule ? rule.price_per_person : 0; // Fallback or base price
    const subtotal = price * p.count;
    
    total += subtotal;
    breakdown.push({
      type: p.type,
      count: p.count,
      price_per_person: price,
      subtotal
    });
  });

  return { total, breakdown };
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
