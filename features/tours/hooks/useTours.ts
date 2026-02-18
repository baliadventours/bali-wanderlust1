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
        
        // Define 20 Bali specific tours for the preview with localized content
        const baliTours: Tour[] = [
          {
            id: 'b1', slug: 'ubud-jungle-highlights',
            title: { en: 'Ubud Jungle & Sacred Monkey Forest', es: 'Selva de Ubud y Bosque de Monos' },
            description: { en: 'Explore the lush heart of Bali with a visit to the Tegalalang Rice Terrace.' },
            base_price_usd: 45, duration_minutes: 480, max_participants: 10, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-cul', destination_id: 'bali', tour_type_id: 't-pho', status: 'published',
            avg_rating: 4.9, review_count: 1205, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b2', slug: 'mt-batur-sunrise',
            title: { en: 'Mount Batur Active Volcano Sunrise Trek', es: 'Caminata al Amanecer Monte Batur' },
            description: { en: 'Hike to the summit of an active volcano and watch the sunrise.' },
            base_price_usd: 65, duration_minutes: 600, max_participants: 15, difficulty: 'intermediate',
            images: ['https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-hik', status: 'published',
            avg_rating: 4.8, review_count: 850, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b3', slug: 'nusa-penida-best',
            title: { en: 'Nusa Penida: Kelingking & Crystal Bay', es: 'Nusa Penida: Lo Mejor' },
            description: { en: 'The ultimate day trip to the most famous coastline in the world.' },
            base_price_usd: 85, duration_minutes: 720, max_participants: 8, difficulty: 'intermediate',
            images: ['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-pho', status: 'published',
            avg_rating: 4.9, review_count: 2100, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b4', slug: 'uluwatu-kecak',
            title: { en: 'Uluwatu Temple Sunset & Fire Dance', es: 'Uluwatu y Danza de Fuego' },
            description: { en: 'A dramatic performance on a cliff edge overlooking the Indian Ocean.' },
            base_price_usd: 35, duration_minutes: 300, max_participants: 20, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1558005530-d7c4ec1630aa?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-cul', destination_id: 'bali', tour_type_id: 't-spi', status: 'published',
            avg_rating: 4.7, review_count: 540, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b5', slug: 'gate-of-heaven',
            title: { en: 'Lempuyang Temple: Gate of Heaven', es: 'Templo Lempuyang' },
            description: { en: 'Get the iconic photo between the Hindu gates.' },
            base_price_usd: 55, duration_minutes: 600, max_participants: 10, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1537953391648-762d01df3c14?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-cul', destination_id: 'bali', tour_type_id: 't-pho', status: 'published',
            avg_rating: 4.5, review_count: 980, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b6', slug: 'ayung-rafting',
            title: { en: 'Ayung River White Water Rafting', es: 'Rafting en el Río Ayung' },
            description: { en: 'Paddle through wild rapids and past hidden waterfalls.' },
            base_price_usd: 50, duration_minutes: 240, max_participants: 30, difficulty: 'intermediate',
            images: ['https://images.unsplash.com/photo-1530122622335-d40394391ea5?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-wat', status: 'published',
            avg_rating: 4.6, review_count: 1100, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b7', slug: 'tirta-empul-blessing',
            title: { en: 'Spiritual Holy Water Temple Blessing', es: 'Bendición Espiritual' },
            description: { en: 'Participate in a traditional purification ritual.' },
            base_price_usd: 40, duration_minutes: 360, max_participants: 6, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-wel', destination_id: 'bali', tour_type_id: 't-spi', status: 'published',
            avg_rating: 4.9, review_count: 320, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b8', slug: 'tanah-lot-sunset',
            title: { en: 'Tanah Lot Temple Sunset Expedition', es: 'Atardecer en Tanah Lot' },
            description: { en: 'Visit the temple on the sea, one of Bali\'s icons.' },
            base_price_usd: 30, duration_minutes: 300, max_participants: 15, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-cul', destination_id: 'bali', tour_type_id: 't-pho', status: 'published',
            avg_rating: 4.7, review_count: 720, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b9', slug: 'lovina-dolphins',
            title: { en: 'Lovina Dolphin Watching & Snorkeling', es: 'Delfines en Lovina' },
            description: { en: 'A sunrise boat trip to see wild dolphins.' },
            base_price_usd: 45, duration_minutes: 480, max_participants: 12, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-wat', status: 'published',
            avg_rating: 4.4, review_count: 430, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b10', slug: 'cave-dinner',
            title: { en: 'Luxury Romantic Dinner in a Cave', es: 'Cena Romántica en Cueva' },
            description: { en: 'An exclusive candlelight dinner inside a natural cave.' },
            base_price_usd: 450, duration_minutes: 180, max_participants: 2, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-lux', destination_id: 'bali', tour_type_id: 't-spi', status: 'published',
            avg_rating: 5.0, review_count: 15, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b11', slug: 'breakfast-orangutan',
            title: { en: 'Breakfast with Orangutans', es: 'Desayuno con Orangutanes' },
            description: { en: 'Start your day with the kings of the jungle.' },
            base_price_usd: 75, duration_minutes: 180, max_participants: 20, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-cul', destination_id: 'bali', tour_type_id: 't-foo', status: 'published',
            avg_rating: 4.8, review_count: 210, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b12', slug: 'canggu-surf',
            title: { en: 'Canggu Surf Private Lesson', es: 'Clase de Surf en Canggu' },
            description: { en: 'Master the waves of the Indian Ocean.' },
            base_price_usd: 40, duration_minutes: 120, max_participants: 4, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-wat', status: 'published',
            avg_rating: 4.9, review_count: 89, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b13', slug: 'sekumpul-trek',
            title: { en: 'Sekumpul Waterfall Trekking', es: 'Trekking Sekumpul' },
            description: { en: 'Visit Bali\'s tallest and most majestic waterfall.' },
            base_price_usd: 60, duration_minutes: 480, max_participants: 8, difficulty: 'advanced',
            images: ['https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-hik', status: 'published',
            avg_rating: 4.9, review_count: 156, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b14', slug: 'seminyak-food',
            title: { en: 'Seminyak Night Market Tour', es: 'Tour Gastronómico Seminyak' },
            description: { en: 'Eat like a local in the heart of Seminyak.' },
            base_price_usd: 35, duration_minutes: 180, max_participants: 12, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-cul', destination_id: 'bali', tour_type_id: 't-foo', status: 'published',
            avg_rating: 4.7, review_count: 67, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b15', slug: 'sidemen-valley',
            title: { en: 'Sidemen Valley Traditional Trek', es: 'Caminata Sidemen' },
            description: { en: 'Walk through the untouched rice terraces of East Bali.' },
            base_price_usd: 40, duration_minutes: 300, max_participants: 10, difficulty: 'intermediate',
            images: ['https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-wel', destination_id: 'bali', tour_type_id: 't-hik', status: 'published',
            avg_rating: 4.9, review_count: 34, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b16', slug: 'balinese-cooking',
            title: { en: 'Ubud Traditional Cooking Class', es: 'Clase de Cocina Ubud' },
            description: { en: 'Learn the secrets of Balinese spices.' },
            base_price_usd: 45, duration_minutes: 240, max_participants: 15, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-cul', destination_id: 'bali', tour_type_id: 't-foo', status: 'published',
            avg_rating: 5.0, review_count: 128, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b17', slug: 'atv-adventure',
            title: { en: 'Bali ATV Quad Bike Adventure', es: 'Aventura en ATV' },
            description: { en: 'Ride through jungles, tunnels, and mud.' },
            base_price_usd: 55, duration_minutes: 180, max_participants: 20, difficulty: 'intermediate',
            images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-wat', status: 'published',
            avg_rating: 4.6, review_count: 88, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b18', slug: 'jatiluwih-cycling',
            title: { en: 'Jatiluwih UNESCO Rice Terrace Cycling', es: 'Ciclismo en Jatiluwih' },
            description: { en: 'E-bike tour through spectacular scenery.' },
            base_price_usd: 65, duration_minutes: 240, max_participants: 10, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-hik', status: 'published',
            avg_rating: 4.9, review_count: 56, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b19', slug: 'menjangan-snorkel',
            title: { en: 'Menjangan Island Snorkeling', es: 'Snorkel en Menjangan' },
            description: { en: 'Discover the best marine life in Bali.' },
            base_price_usd: 95, duration_minutes: 600, max_participants: 8, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1544551763-47a15950c57f?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-adv', destination_id: 'bali', tour_type_id: 't-wat', status: 'published',
            avg_rating: 4.8, review_count: 22, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
          },
          {
            id: 'b20', slug: 'heli-tour',
            title: { en: 'Bali Helicopter Coastline Flight', es: 'Helicóptero por Bali' },
            description: { en: 'Breathtaking aerial views of Uluwatu and Tanah Lot.' },
            base_price_usd: 550, duration_minutes: 20, max_participants: 4, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1464037862834-ee5772642398?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'cat-lux', destination_id: 'bali', tour_type_id: 't-pho', status: 'published',
            avg_rating: 5.0, review_count: 8, destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } }
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
          {id: 'iceland', name: {en: 'Iceland', es: 'Islandia'}},
          {id: 'japan', name: {en: 'Japan', es: 'Japón'}},
          {id: 'italy', name: {en: 'Italy', es: 'Italia'}},
          {id: 'peru', name: {en: 'Peru', es: 'Perú'}}
        ], 
        tourTypes: [
          {id: 't-hik', name: {en: 'Hiking', es: 'Senderismo'}},
          {id: 't-wat', name: {en: 'Water Sports', es: 'Deportes Acuáticos'}},
          {id: 't-foo', name: {en: 'Foodie', es: 'Gastronomía'}},
          {id: 't-pho', name: {en: 'Photography', es: 'Fotografía'}},
          {id: 't-spi', name: {en: 'Spiritual', es: 'Espiritual'}},
          {id: 't-wel', name: {en: 'Wellness', es: 'Bienestar'}}
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
