
import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { Tour, TourFilters } from '../types';

export function useTours(filters: TourFilters) {
  return useQuery({
    queryKey: ['tours', filters],
    queryFn: async () => {
      if (!isConfigured) {
        await new Promise(r => setTimeout(r, 800));
        
        const baliTours: Tour[] = [
          {
            id: 'b1', slug: 'mt-batur-sunrise',
            title: { en: 'Mount Batur Active Volcano Sunrise Trek' },
            description: { en: 'Hike to the summit of an active volcano and watch the sunrise.' },
            base_price_usd: 65, duration_minutes: 600, max_participants: 15, difficulty: 'intermediate',
            images: ['https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800'],
            is_published: true, status: 'published', avg_rating: 4.8, review_count: 850, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b2', slug: 'ubud-jungle-highlights',
            title: { en: 'Ubud Jungle & Sacred Monkey Forest' },
            description: { en: 'Explore the lush heart of Bali with a visit to the monkey forest.' },
            base_price_usd: 45, duration_minutes: 480, max_participants: 10, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1554443651-7871b058d867?w=800'],
            is_published: true, status: 'published', avg_rating: 4.9, review_count: 1205, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b3', slug: 'nusa-penida-best',
            title: { en: 'Nusa Penida: Kelingking & Crystal Bay' },
            description: { en: 'The ultimate day trip to the most famous coastline.' },
            base_price_usd: 85, duration_minutes: 720, max_participants: 8, difficulty: 'intermediate',
            images: ['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800'],
            is_published: true, status: 'published', avg_rating: 4.9, review_count: 2100, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b4', slug: 'uluwatu-sunset',
            title: { en: 'Uluwatu Temple Sunset' },
            description: { en: 'Dramatic performance on a cliff.' },
            base_price_usd: 35, duration_minutes: 300, max_participants: 20, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1558005530-d7c4ec1630aa?w=800'],
            is_published: true, status: 'published', avg_rating: 4.7, review_count: 540, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          }
        ];
        
        let filtered = [...baliTours];
        if (filters.keyword) {
          const kw = filters.keyword.toLowerCase();
          filtered = filtered.filter(t => t.title.en.toLowerCase().includes(kw));
        }
        
        return { data: filtered, count: filtered.length };
      }

      let query = supabase
        .from('tours')
        .select(`*, destination:destinations(name)`, { count: 'exact' });

      if (filters.keyword) query = query.ilike('title->>en', `%${filters.keyword}%`);
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
        destinations: [{id: 'bali', name: {en: 'Bali'}}], 
        tourTypes: [{id: '1', name: {en: 'Hiking'}}] 
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
