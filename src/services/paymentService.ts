import { supabase } from '../lib/supabase';
import { PaymentProvider } from '../lib/types';

export const initiatePayment = async (bookingId: string, provider: PaymentProvider, amount: number) => {
  // 1. Create a pending payment record
  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      booking_id: bookingId,
      provider,
      amount,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;

  // 2. Call Supabase Edge Function to get payment URL/token
  const { data, error: functionError } = await supabase.functions.invoke('initiate-payment', {
    body: { paymentId: payment.id, provider, amount, bookingId }
  });

  if (functionError) throw functionError;

  return data; // Should contain redirect URL or token
};

export const verifyPayment = async (paymentId: string) => {
  const { data, error } = await supabase.functions.invoke('verify-payment', {
    body: { paymentId }
  });

  if (error) throw error;
  return data;
};
