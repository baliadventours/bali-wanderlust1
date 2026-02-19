
export type TourStatus = 'draft' | 'published';
export type InclusionType = 'include' | 'exclude';

export interface TourCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Destination {
  id: string;
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

export interface SeasonalPricing {
  id?: string;
  package_id?: string;
  start_date: string;
  end_date: string;
  price: number;
}

export interface PricingPackage {
  id?: string;
  tour_id?: string;
  package_name: string;
  base_price: number;
  min_people: number;
  max_people: number;
  seasonal_pricing?: SeasonalPricing[];
}

export interface TourItinerary {
  id?: string;
  tour_id?: string;
  day_number?: number;
  time_label?: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  image_url?: string;
  sort_order?: number;
}

export interface TourFAQ {
  id?: string;
  tour_id?: string;
  question: string;
  answer: string;
}

export interface TourReview {
  id?: string;
  tour_id?: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at?: string;
}

export interface TourHighlight {
  id?: string;
  tour_id?: string;
  content: string;
  sort_order?: number;
}

export interface TourInclusion {
  id?: string;
  tour_id?: string;
  content: string;
  type: InclusionType;
}

// Added TourAvailabilitySlot interface to support booking features
export interface TourAvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  available_spots: number;
  total_spots: number;
  status: string;
  price_override_usd?: number;
}

// Added TourAddon interface to support product enhancements
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
  tour_type_id?: string; // Added to match hooks usage
  description: Record<string, string>;
  important_info?: Record<string, string>;
  booking_policy?: Record<string, string>;
  base_price_usd: number;
  duration_minutes: number;
  max_participants: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: TourStatus;
  images: string[];
  
  // Meta and status flags
  is_published?: boolean; // Added to support preview mode and filters
  avg_rating?: number; // Added for UI display
  review_count?: number; // Added for UI display
  
  // Relations
  category?: TourCategory;
  destination?: Destination;
  facts?: TourFactValue[];
  gallery?: { id?: string; image_url: string; sort_order?: number }[];
  highlights?: TourHighlight[];
  pricing_packages?: PricingPackage[];
  itineraries?: TourItinerary[];
  inclusions?: TourInclusion[];
  exclusions?: TourInclusion[]; // Added to distinguish from inclusions in UI
  faqs?: TourFAQ[];
  reviews?: TourReview[];
  availability?: TourAvailabilitySlot[]; // Added for booking widget
  addons?: TourAddon[]; // Added for checkout flow
  related_tour_ids?: string[];
}

export interface TourFilters {
  keyword?: string;
  destinationId?: string;
  categoryId?: string;
  tourTypeId?: string; // Added to support filtering by experience type
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
}
