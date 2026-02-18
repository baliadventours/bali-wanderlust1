
export type TourStatus = 'draft' | 'published';
export type InclusionType = 'include' | 'exclude';

export interface TourCategory {
  id: string;
  name: Record<string, string>;
  slug: string;
}

export interface Destination {
  id: string;
  name: Record<string, string>;
  slug: string;
}

export interface TourFact {
  id: string;
  name: string;
  icon?: string;
}

export interface TourFactValue {
  id: string;
  fact_id: string;
  value: string;
  fact?: TourFact;
}

export interface TourPricingPackage {
  id: string;
  package_name: string;
  base_price: number;
  min_people: number;
  max_people: number;
  seasonal_pricing?: SeasonalPricing[];
}

export interface SeasonalPricing {
  id: string;
  start_date: string;
  end_date: string;
  price: number;
}

export interface TourItinerary {
  id: string;
  day_number?: number;
  time_label?: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  image_url?: string;
}

export interface TourInclusion {
  id: string;
  content: string;
  type: InclusionType;
}

export interface TourFAQ {
  id: string;
  question: Record<string, string>;
  answer: Record<string, string>;
}

export interface TourReview {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface TourAvailability {
  id: string;
  start_time: string;
  end_time: string;
  available_spots: number;
  total_spots: number;
  status: string;
  price_override_usd?: number;
  tour?: Tour;
}

export interface TourAddon {
  id: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  unit_price_usd: number;
}

export interface Tour {
  id: string;
  title: Record<string, string>;
  slug: string;
  category_id?: string;
  destination_id?: string;
  description: Record<string, string>;
  important_info?: Record<string, string>;
  booking_policy?: Record<string, string>;
  status: TourStatus;
  created_at: string;
  updated_at: string;
  
  // Custom properties used in UI and hooks
  base_price_usd: number;
  duration_minutes: number;
  max_participants: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  images: string[];
  is_published: boolean;
  avg_rating?: number;
  review_count?: number;
  
  // Relations
  category?: TourCategory;
  destination?: Destination;
  facts?: TourFactValue[];
  gallery?: { id: string; image_url: string; sort_order: number }[];
  highlights?: string[];
  pricing_packages?: TourPricingPackage[];
  itineraries?: TourItinerary[];
  inclusions?: string[];
  exclusions?: string[];
  faqs?: TourFAQ[];
  reviews?: TourReview[];
  related_tours?: Tour[];
  availability?: TourAvailability[];
  addons?: TourAddon[];
  tour_type?: { id: string; name: Record<string, string> };
}

export interface TourFilters {
  keyword?: string;
  destinationId?: string;
  tourTypeId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
}
