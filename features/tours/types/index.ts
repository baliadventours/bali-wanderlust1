
export type TourStatus = 'draft' | 'published';
export type InclusionType = 'include' | 'exclude';

export interface TourCategory {
  id: string;
  // name can be a record for translations or a plain string
  name: Record<string, string> | string;
  slug: string;
}

export interface Destination {
  id: string;
  // name can be a record for translations or a plain string
  name: Record<string, string> | string;
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

export interface PricingPackage {
  id?: string;
  package_name: string;
  base_price: number;
  min_people: number;
  max_people: number;
  seasonal_pricing?: SeasonalPricing[];
}

export interface SeasonalPricing {
  id?: string;
  start_date: string;
  end_date: string;
  price: number;
}

export interface TourItinerary {
  id?: string;
  day_number?: number;
  time_label?: string;
  // title and description can be records for translations or plain strings
  title: Record<string, string> | string;
  description?: Record<string, string> | string;
  image_url?: string;
}

export interface TourFAQ {
  id?: string;
  question: string;
  answer: string;
}

export interface TourReview {
  id?: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at?: string;
}

// Added TourAddon interface to resolve checkout feature errors
export interface TourAddon {
  id: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  unit_price_usd: number;
}

// Added TourAvailability interface for the booking system
export interface TourAvailability {
  id: string;
  start_time: string;
  end_time: string;
  available_spots: number;
  total_spots: number;
  price_override_usd?: number;
  status: string;
}

export interface Tour {
  id: string;
  // Using Record<string, string> for localized content
  title: Record<string, string>;
  slug: string;
  category_id?: string;
  destination_id?: string;
  tour_type_id?: string;
  description: Record<string, string>;
  important_info?: Record<string, string>;
  booking_policy?: Record<string, string>;
  status: TourStatus;
  
  // Added missing operational properties
  is_published: boolean;
  base_price_usd: number;
  duration_minutes: number;
  max_participants: number;
  avg_rating?: number;
  review_count?: number;
  images: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // Relations
  category?: TourCategory;
  destination?: Destination;
  facts?: TourFactValue[];
  gallery?: { id?: string; image_url: string; sort_order?: number }[];
  // flexible types to support both legacy and hydrated data
  highlights?: any[];
  pricing_packages?: PricingPackage[];
  itineraries?: TourItinerary[];
  inclusions?: any[];
  exclusions?: any[];
  faqs?: TourFAQ[];
  reviews?: TourReview[];
  related_tour_ids?: string[];
  availability?: TourAvailability[];
  addons?: TourAddon[];
}

// Added missing TourFilters export
export interface TourFilters {
  keyword?: string;
  destinationId?: string;
  tourTypeId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
}
