import { supabase } from '../../lib/supabase';

export const createBooking = async (bookingData: {
  customer_id: string;
  tour_id: string;
  total_amount_usd: number;
}) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([{ ...bookingData, status: 'pending' }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
  return data;
};

export const getMyBookings = async (customerId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, tours(*)')
    .eq('customer_id', customerId);
  
  if (error) {
    console.error('Error fetching my bookings:', error);
    throw error;
  }
  return data;
};
