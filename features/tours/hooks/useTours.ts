
import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { Tour, TourFilters } from '../types';

export function useTours(filters: TourFilters) {
  return useQuery({
    queryKey: ['tours', filters],
    queryFn: async () => {
      if (!isConfigured) {
        // Mock fallback for preview only
        return { data: [], count: 0 };
      }

      let query = supabase
        .from('tours')
        .select(`
          *,
          category:tour_categories(name),
          destination:destinations(name)
        `, { count: 'exact' });

      if (filters.keyword) {
        query = query.ilike('title->>en', `%${filters.keyword}%`);
      }
      if (filters.destinationId) {
        query = query.eq('destination_id', filters.destinationId);
      }
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      // Fix: Added tourTypeId filtering to match UI capability
      if (filters.tourTypeId) {
        query = query.eq('tour_type_id', filters.tourTypeId);
      }

      // Sort logic
      if (filters.sortBy === 'price_low') query = query.order('base_price_usd', { ascending: true });
      else if (filters.sortBy === 'price_high') query = query.order('base_price_usd', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      // Only published tours
      query = query.eq('status', 'published');
      
      const { data, count, error } = await query;
      if (error) throw error;
      return { data: data as Tour[], count: count || 0 };
    },
  });
}

// Fix: Updated useTourMetaData to fetch and return tour_types to resolve property missing error in UI
export function useTourMetaData() {
  return useQuery({
    queryKey: ['tour-metadata'],
    queryFn: async () => {
      if (!isConfigured) return { destinations: [], categories: [], tourTypes: [] };
      
      const [destRes, catRes, typeRes] = await Promise.all([
        supabase.from('destinations').select('id, name').order('slug'),
        supabase.from('tour_categories').select('id, name').order('slug'),
        supabase.from('tour_types').select('id, name').order('slug')
      ]);

      return {
        destinations: destRes.data || [],
        categories: catRes.data || [],
        tourTypes: typeRes.data || []
      };
    }
  });
}
