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
            title: { en: 'Arctic Northern Lights Expedition', es: 'Expedición Ártica de Luces del Norte' },
            description: { en: 'Experience the magic of the Aurora Borealis in the Icelandic wilderness.' },
            base_price_usd: 1250, duration_minutes: 4320, max_participants: 12, difficulty: 'intermediate',
            images: ['https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'c1', destination_id: 'des1', tour_type_id: 't1',
            avg_rating: 4.9, review_count: 56, destination: { name: { en: 'Iceland', es: 'Islandia' } }
          },
          {
            id: 'd2', slug: 'tokyo-food-odyssey',
            title: { en: 'Tokyo Midnight Food Odyssey', es: 'Odisea Gastronómica de Medianoche en Tokio' },
            description: { en: 'Eat like a local at hidden gems across Shinjuku and Shibuya.' },
            base_price_usd: 185, duration_minutes: 240, max_participants: 8, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'c2', destination_id: 'des2', tour_type_id: 't2',
            avg_rating: 4.8, review_count: 124, destination: { name: { en: 'Japan', es: 'Japón' } }
          },
          {
            id: 'd3', slug: 'amalfi-sailing-week',
            title: { en: 'Amalfi Coast Sailing Week', es: 'Semana de Navegación por la Costa Amalfitana' },
            description: { en: 'Luxury sailing adventure along the most beautiful coastline in the world.' },
            base_price_usd: 3200, duration_minutes: 10080, max_participants: 6, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'c3', destination_id: 'des3', tour_type_id: 't3',
            avg_rating: 5.0, review_count: 32, destination: { name: { en: 'Italy', es: 'Italia' } }
          },
          {
            id: 'd4', slug: 'inca-trail-trek',
            title: { en: 'Inca Trail to Machu Picchu', es: 'Camino Inca a Machu Picchu' },
            description: { en: 'The legendary trek through the Andes mountains.' },
            base_price_usd: 750, duration_minutes: 5760, max_participants: 15, difficulty: 'advanced',
            images: ['https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'c1', destination_id: 'des4', tour_type_id: 't1',
            avg_rating: 5.0, review_count: 89, destination: { name: { en: 'Peru', es: 'Perú' } }
          },
          {
            id: 'd5', slug: 'kyoto-zen-retreat',
            title: { en: 'Kyoto Zen & Forest Bathing', es: 'Retiro Zen y Baño de Bosque en Kioto' },
            description: { en: 'A peaceful journey through Arashiyama bamboo groves.' },
            base_price_usd: 220, duration_minutes: 360, max_participants: 10, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'c2', destination_id: 'des2', tour_type_id: 't4',
            avg_rating: 4.7, review_count: 42, destination: { name: { en: 'Japan', es: 'Japón' } }
          },
          {
            id: 'd6', slug: 'blue-lagoon-vip',
            title: { en: 'Ultimate Blue Lagoon Luxury', es: 'Lujo Definitivo en el Blue Lagoon' },
            description: { en: 'Private lounge and exclusive access to volcanic waters.' },
            base_price_usd: 450, duration_minutes: 180, max_participants: 4, difficulty: 'beginner',
            images: ['https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=800'],
            is_published: true, category_id: 'c3', destination_id: 'des1', tour_type_id: 't4',
            avg_rating: 4.9, review_count: 215, destination: { name: { en: 'Iceland', es: 'Islandia' } }
          }
        ];
        
        // Filter logic for preview mode
        let filtered = [...dummyTours];
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
          {id: 'des1', name: {en: 'Iceland', es: 'Islandia'}},
          {id: 'des2', name: {en: 'Japan', es: 'Japón'}},
          {id: 'des3', name: {en: 'Italy', es: 'Italia'}},
          {id: 'des4', name: {en: 'Peru', es: 'Perú'}}
        ], 
        tourTypes: [
          {id: 't1', name: {en: 'Hiking', es: 'Senderismo'}},
          {id: 't2', name: {en: 'Foodie', es: 'Gastronomía'}},
          {id: 't3', name: {en: 'Sailing', es: 'Navegación'}},
          {id: 't4', name: {en: 'Wellness', es: 'Bienestar'}}
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
