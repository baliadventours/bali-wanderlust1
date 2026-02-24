
export type UserRole = 'customer' | 'admin';
export type BookingStatus = 'awaiting_payment' | 'confirmed' | 'cancelled' | 'expired' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';
export type PaymentProvider = 'midtrans' | 'paypal' | 'bank_transfer';
export type PriceType = 'adult' | 'child' | 'group';

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
};

export type Tour = {
  id: string;
  title_en: string;
  title_id: string;
  slug: string;
  description_en: string | null;
  description_id: string | null;
  base_price_usd: number;
  duration_minutes: number;
  max_participants: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
  created_at: string;
  tour_images: TourImage[];
};

export type TourImage = {
  id: string;
  tour_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
};

export type TourAvailability = {
  id: string;
  tour_id: string;
  date: string;
  total_slots: number;
  booked_slots: number;
};

export type TourPricing = {
  id: string;
  tour_id: string;
  date: string | null;
  min_group_size: number;
  max_group_size: number | null;
  price_per_person: number;
  price_type: PriceType;
};

export type Booking = {
  id: string;
  customer_id: string;
  tour_id: string;
  booking_date: string;
  status: BookingStatus;
  total_amount_usd: number;
  pricing_breakdown: any;
  expires_at: string;
  created_at: string;
  tours?: Tour;
};

export type Payment = {
  id: string;
  booking_id: string;
  provider: PaymentProvider;
  transaction_id: string | null;
  amount: number;
  status: PaymentStatus;
  payment_details: any;
  created_at: string;
};
