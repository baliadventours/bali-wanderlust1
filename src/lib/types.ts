
export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
  created_at: string;
};

export type Tour = {
  id: string;
  title: { [key: string]: string };
  slug: string;
  description: { [key: string]: string } | null;
  base_price_usd: number;
  duration_minutes: number;
  max_participants: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
  created_at: string;
};

export type TourImage = {
  id: string;
  tour_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  customer_id: string;
  tour_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_amount_usd: number;
  created_at: string;
};
