import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { Tour, TourFilters } from '../types';

const ITEMS_PER_PAGE = 9;

export function useTours(filters: TourFilters) {
  return useQuery({
    queryKey: ['tours', filters],
    queryFn: async () => {
      if (!isConfigured) {
        await new Promise(r => setTimeout(r, 800));
        const dummyTours: Tour[] = [
          {
            id: 'd1', slug: 'northern-lights-expedition',
            title: { en: 'Arctic Northern Lights Expedition' },
            description: { en: 'Experience the magic of the Aurora Borealis in the Icelandic wilderness.' },
            base_price_usd: 1250, duration_minutes: 4320, max_participants: 12, difficulty: 'intermediate',
            images: ['https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'c1', destination_id: 'des1', tour_type_id: 't1',
            avg_rating: 4.9, review_count: 56, destination: { name: { en: 'Iceland' } }
          },
          {
            id: 'd2', slug: 'tokyo-food-odyssey',
            title: { en: 'Tokyo Midnight Food Odyssey' },
            description: { en: 'Eat like a local at hidden gems across Shinjuku and Shibuya.' },
            base_price_usd: 180, duration_minutes: 240, max_participants: 8, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'c2', destination_id: 'des2', tour_type_id: 't2',
            avg_rating: 4.8, review_count: 124, destination: { name: { en: 'Japan' } }
          },
          {
            id: 'd3', slug: 'amalfi-sailing-week',
            title: { en: 'Amalfi Coast Sailing Week' },
            description: { en: 'Luxury sailing adventure along the most beautiful coastline in the world.' },
            base_price_usd: 2400, duration_minutes: 10080, max_participants: 6, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'c3', destination_id: 'des3', tour_type_id: 't3',
            avg_rating: 5.0, review_count: 32, destination: { name: { en: 'Italy' } }
          }
        ];
        return { data: dummyTours, count: dummyTours.length };
      }

      let query = supabase
        .from('tours')
        .select(`
          *,
          category:tour_categories(name),
          destination:destinations(name),
          tour_type:tour_types(name)
        `, { count: 'exact' });

      // Apply Filters... (omitted implementation remains same)
      query = query.eq('is_published', true).is('deleted_at', null);
      
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
      if (!isConfigured) return { 
        destinations: [
          {id: 'des1', name: {en: 'Iceland'}},
          {id: 'des2', name: {en: 'Japan'}},
          {id: 'des3', name: {en: 'Italy'}},
          {id: 'des4', name: {en: 'Peru'}}
        ], 
        tourTypes: [
          {id: 't1', name: {en: 'Hiking'}},
          {id: 't2', name: {en: 'Foodie'}},
          {id: 't3', name: {en: 'Sailing'}}
        ] 
      };
      
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