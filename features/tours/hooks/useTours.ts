
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
        
        // Match the 10 tours defined in SQL seed exactly
        const baliTours: Tour[] = [
          {
            id: 'b1', slug: 'ubud-jungle-highlights',
            title: { en: 'Ubud Jungle & Sacred Monkey Forest' },
            description: { en: 'Explore the lush heart of Bali with a visit to the Tegalalang Rice Terrace.' },
            base_price_usd: 45, duration_minutes: 480, max_participants: 10, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-cul', destination_id: 'bali', tour_type_id: 't-pho', status: 'published',
            avg_rating: 4.9, review_count: 1205, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b2', slug: 'mt-batur-sunrise',
            title: { en: 'Mount Batur Active Volcano Sunrise Trek' },
            description: { en: 'Hike to the summit of an active volcano and watch the sunrise.' },
            base_price_usd: 65, duration_minutes: 600, max_participants: 15, difficulty: 'intermediate',
            images: ['https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-hik', status: 'published',
            avg_rating: 4.8, review_count: 850, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b3', slug: 'nusa-penida-best',
            title: { en: 'Nusa Penida: Kelingking & Crystal Bay' },
            description: { en: 'The ultimate day trip to the most famous coastline in the world.' },
            base_price_usd: 85, duration_minutes: 720, max_participants: 8, difficulty: 'intermediate',
            images: ['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-pho', status: 'published',
            avg_rating: 4.9, review_count: 2100, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b4', slug: 'uluwatu-kecak',
            title: { en: 'Uluwatu Temple Sunset & Fire Dance' },
            description: { en: 'A dramatic performance on a cliff edge overlooking the Indian Ocean.' },
            base_price_usd: 35, duration_minutes: 300, max_participants: 20, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1558005530-d7c4ec1630aa?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-cul', destination_id: 'bali', tour_type_id: 't-spi', status: 'published',
            avg_rating: 4.7, review_count: 540, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b5', slug: 'gate-of-heaven',
            title: { en: 'Lempuyang Temple: Gate of Heaven' },
            description: { en: 'Get the iconic photo between the Hindu gates.' },
            base_price_usd: 55, duration_minutes: 600, max_participants: 10, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1537953391648-762d01df3c14?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-cul', destination_id: 'bali', tour_type_id: 't-pho', status: 'published',
            avg_rating: 4.5, review_count: 980, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b6', slug: 'ayung-rafting',
            title: { en: 'Ayung River White Water Rafting' },
            description: { en: 'Paddle through wild rapids and past hidden waterfalls.' },
            base_price_usd: 50, duration_minutes: 240, max_participants: 30, difficulty: 'intermediate',
            images: ['https://images.unsplash.com/photo-1530122622335-d40394391ea5?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-wat', status: 'published',
            avg_rating: 4.6, review_count: 1100, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b7', slug: 'tirta-empul-blessing',
            title: { en: 'Spiritual Holy Water Temple Blessing' },
            description: { en: 'Participate in a traditional purification ritual.' },
            base_price_usd: 40, duration_minutes: 360, max_participants: 6, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-wel', destination_id: 'bali', tour_type_id: 't-spi', status: 'published',
            avg_rating: 4.9, review_count: 320, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b8', slug: 'tanah-lot-sunset',
            title: { en: 'Tanah Lot Temple Sunset Expedition' },
            description: { en: 'Visit the temple on the sea, one of Bali\'s icons.' },
            base_price_usd: 30, duration_minutes: 300, max_participants: 15, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-cul', destination_id: 'bali', tour_type_id: 't-pho', status: 'published',
            avg_rating: 4.7, review_count: 720, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b9', slug: 'lovina-dolphins',
            title: { en: 'Lovina Dolphin Watching & Snorkeling' },
            description: { en: 'A sunrise boat trip to see wild dolphins.' },
            base_price_usd: 45, duration_minutes: 480, max_participants: 12, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-wat', status: 'published',
            avg_rating: 4.4, review_count: 430, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b10', slug: 'balinese-cooking',
            title: { en: 'Ubud Traditional Cooking Class' },
            description: { en: 'Learn the secrets of Balinese spices.' },
            base_price_usd: 45, duration_minutes: 240, max_participants: 15, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-cul', destination_id: 'bali', tour_type_id: 't-foo', status: 'published',
            avg_rating: 5.0, review_count: 128, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          }
        ];
        
        // Filter logic for preview mode
        let filtered = [...baliTours];
        if (filters.keyword) {
          const kw = filters.keyword.toLowerCase();
          filtered = filtered.filter(t => 
            t.title.en.toLowerCase().includes(kw) || 
            t.description.en.toLowerCase().includes(kw)
          );
        }
        if (filters.destinationId) {
          filtered = filtered.filter(t => t.destination_id === filters.destinationId);
        }
        
        return { data: filtered, count: filtered.length };
      }

      let query = supabase
        .from('tours')
        .select(`
          *,
          category:tour_categories(name),
          destination:destinations(name),
          tour_type:tour_types(name)
        `, { count: 'exact' });

      // Apply basic filters for production
      if (filters.keyword) query = query.ilike('title->>en', `%${filters.keyword}%`);
      if (filters.destinationId) query = query.eq('destination_id', filters.destinationId);
      if (filters.tourTypeId) query = query.eq('tour_type_id', filters.tourTypeId);
      if (filters.minPrice) query = query.gte('base_price_usd', filters.minPrice);
      if (filters.maxPrice) query = query.lte('base_price_usd', filters.maxPrice);

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
          {id: 'bali', name: {en: 'Bali', es: 'Bali'}},
          {id: 'iceland', name: {en: 'Iceland', es: 'Islandia'}}
        ], 
        tourTypes: [
          {id: '71000000-0000-0000-0000-000000000001', name: {en: 'Hiking', es: 'Senderismo'}},
          {id: '71000000-0000-0000-0000-000000000002', name: {en: 'Water Sports', es: 'Deportes Acuáticos'}},
          {id: '71000000-0000-0000-0000-000000000003', name: {en: 'Spiritual', es: 'Espiritual'}}
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
