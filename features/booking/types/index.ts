
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';

export interface BookingParticipant {
  full_name: string;
  email?: string;
  passport_number?: string;
}

export interface CreateBookingPayload {
  tour_id: string;
  availability_id: string;
  participants: BookingParticipant[];
  addon_ids: string[];
  coupon_code?: string;
  currency_code: string;
}

export interface BookingSummary {
  tour_title: string;
  start_time: string;
  participants_count: number;
  base_total: number;
  addons_total: number;
  discount_total: number;
  final_total: number;
  currency: string;
}
