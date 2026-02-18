
import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { Tour, TourFilters } from '../types';

const ITEMS_PER_PAGE = 9;

export function useTours(filters: TourFilters) {
  return useQuery({
    queryKey: ['tours', filters],
    queryFn: async () => {
      if (!isConfigured) {
        // Return dummy data if Supabase is not configured
        await new Promise(r => setTimeout(r, 800));
        return {
          // Fix: Ensure dummy data matches all required properties of the Tour interface
          data: Array(6).fill(null).map((_, i) => ({
            id: `dummy-${i}`,
            slug: `tour-${i}`,
            title: { en: `Epic Adventure ${i + 1}` },
            description: { en: 'A curated premium experience exploring breathtaking landscapes.' },
            base_price_usd: 199 + (i * 50),
            duration_minutes: 120 + (i * 60),
            max_participants: 12,
            difficulty: 'beginner',
            images: [`https://picsum.photos/seed/${i+10}/600/400`],
            is_published: true,
            category_id: 'dummy-category-id',
            destination_id: 'dummy-destination-id',
            tour_type_id: 'dummy-type-id',
            avg_rating: 4.5,
            review_count: 12,
            destination: { name: { en: 'Placeholder' } }
          })) as Tour[],
          count: 24
        };
      }

      let query = supabase
        .from('tours')
        .select(`
          *,
          category:tour_categories(name),
          destination:destinations(name),
          tour_type:tour_types(name)
        `, { count: 'exact' });

      // Apply Filters
      if (filters.keyword) {
        // Search in titles (assuming 'en' key exists in JSONB)
        query = query.ilike('title->>en', `%${filters.keyword}%`);
      }
      if (filters.destinationId) {
        query = query.eq('destination_id', filters.destinationId);
      }
      if (filters.tourTypeId) {
        query = query.eq('tour_type_id', filters.tourTypeId);
      }
      if (filters.minPrice) {
        query = query.gte('base_price_usd', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('base_price_usd', filters.maxPrice);
      }
      if (filters.minDuration) {
        query = query.gte('duration_minutes', filters.minDuration);
      }
      if (filters.maxDuration) {
        query = query.lte('duration_minutes', filters.maxDuration);
      }
      
      // Default filter for published items
      query = query.eq('is_published', true).is('deleted_at', null);

      // Sorting
      const sort = filters.sortBy || 'newest';
      switch (sort) {
        case 'price_low':
          query = query.order('base_price_usd', { ascending: true });
          break;
        case 'price_high':
          query = query.order('base_price_usd', { ascending: false });
          break;
        case 'best_selling':
          // In a real app, you might have a sales_count column
          query = query.order('created_at', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Pagination
      const page = filters.page || 1;
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      return { data: data as Tour[], count: count || 0 };
    },
  });
}

export function useTourMetaData() {
  return useQuery({
    queryKey: ['tour-metadata'],
    queryFn: async () => {
      if (!isConfigured) return { destinations: [], tourTypes: [] };
      
      const [destRes, typeRes] = await Promise.all([
        supabase.from('destinations').select('id, name').is('deleted_at', null),
        supabase.from('tour_types').select('id, name')
      ]);

      return {
        destinations: destRes.data || [],
        tourTypes: typeRes.data || []
      };
    }
  });
}
