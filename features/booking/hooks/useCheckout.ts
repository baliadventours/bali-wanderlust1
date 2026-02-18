
import { useState, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { Tour, TourAddon } from '../../tours/types';
import { CreateBookingPayload } from '../types';

export function useCheckout(tourId: string, availabilityId: string) {
  const [participants, setParticipants] = useState([{ full_name: '', email: '' }]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; value: number; type: 'fixed' | 'percentage' } | null>(null);

  // Fetch tour and slot data for the summary
  const { data: tour, isLoading: isLoadingTour } = useQuery({
    queryKey: ['tour-checkout', tourId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*, availability:tour_availability(*), addons:tour_addons(*)')
        .eq('id', tourId)
        .single();
      if (error) throw error;
      return data as Tour;
    },
    enabled: !!tourId && isConfigured,
  });

  const selectedSlot = useMemo(() => 
    tour?.availability?.find(s => s.id === availabilityId),
    [tour, availabilityId]
  );

  // Calculate prices
  const pricing = useMemo(() => {
    if (!tour || !selectedSlot) return { base: 0, addons: 0, discount: 0, total: 0 };
    
    const basePrice = selectedSlot.price_override_usd || tour.base_price_usd;
    const baseTotal = basePrice * participants.length;
    
    const addonsTotal = tour.addons
      ?.filter(a => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.unit_price_usd, 0) || 0;

    let discountTotal = 0;
    if (appliedDiscount) {
      if (appliedDiscount.type === 'percentage') {
        discountTotal = baseTotal * (appliedDiscount.value / 100);
      } else {
        discountTotal = appliedDiscount.value;
      }
    }

    return {
      base: baseTotal,
      addons: addonsTotal,
      discount: discountTotal,
      total: Math.max(0, baseTotal + addonsTotal - discountTotal)
    };
  }, [tour, selectedSlot, participants.length, selectedAddons, appliedDiscount]);

  // Apply Coupon Mutation
  const applyCoupon = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();
      
      if (error) throw new Error('Invalid or expired coupon code');
      return data;
    },
    onSuccess: (data) => {
      setAppliedDiscount({ code: data.code, value: data.value, type: data.discount_type });
    }
  });

  // Create Checkout Session Mutation
  const initiateCheckout = useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: payload
      });
      if (error) throw error;
      return data; // { url: 'https://checkout.stripe.com/...' }
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    }
  });

  return {
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
    isLoading: isLoadingTour
  };
}
