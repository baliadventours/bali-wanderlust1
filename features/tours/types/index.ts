
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ItineraryItem {
  id: string;
  day_number: number;
  title: Record<string, string>;
  description: Record<string, string>;
  location_name?: string;
  image_url?: string;
}

export interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  available_spots: number;
  total_spots: number;
  price_override_usd?: number;
  status: 'active' | 'cancelled' | 'sold_out';
}

export interface SeasonalRule {
  id: string;
  start_date: string;
  end_date: string;
  multiplier: number;
  fixed_override_usd?: number;
}

export interface TourAddon {
  id: string;
  title: Record<string, string>;
  unit_price_usd: number;
  description?: Record<string, string>;
}

export interface Review {
  id: string;
  customer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export interface Tour {
  id: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  summary?: Record<string, string>;
  base_price_usd: number;
  duration_minutes: number;
  max_participants: number;
  difficulty: DifficultyLevel;
  images: string[];
  is_published: boolean;
  category_id: string;
  destination_id: string;
  tour_type_id: string;
  avg_rating?: number;
  review_count?: number;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  category?: { name: Record<string, string> };
  destination?: { name: Record<string, string> };
  tour_type?: { name: Record<string, string> };
  itineraries?: ItineraryItem[];
  availability?: AvailabilitySlot[];
  seasonal_rules?: SeasonalRule[];
  addons?: TourAddon[];
  reviews?: Review[];
}

export interface TourFilters {
  keyword?: string;
  destinationId?: string;
  tourTypeId?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  sortBy?: string;
  page?: number;
}
