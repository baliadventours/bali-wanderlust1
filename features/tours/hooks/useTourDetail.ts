
import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { Tour } from '../types';

export function useTourDetail(slug: string) {
  return useQuery({
    queryKey: ['tour', slug],
    queryFn: async () => {
      if (!isConfigured) {
        await new Promise(r => setTimeout(r, 600));
        
        const tourDataMap: Record<string, Partial<Tour>> = {
          'mt-batur-sunrise': {
            title: { en: 'Mount Batur Active Volcano Sunrise Trek' },
            base_price_usd: 65,
            duration_minutes: 600,
            difficulty: 'intermediate',
            description: { en: 'An unforgettable early morning hike to the summit of Mount Batur, an active volcano with breathtaking views. Witness a celestial sunrise above the clouds.' },
            images: ['https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=1200', 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200'],
            highlights: [
              'Celestial sunrise views over Mt Agung and Mt Rinjani', 
              'Breakfast cooked with real volcanic steam', 
              'Licensed professional local hiking guides'
            ],
            itineraries: [
              { id: 'i1', day_number: 1, title: { en: '02:00 AM - Pickup' }, description: { en: 'Early morning pickup via private transport.' } },
              { id: 'i2', day_number: 2, title: { en: '03:30 AM - Base Camp' }, description: { en: 'Safety briefing and distribution of gear.' } },
              { id: 'i3', day_number: 3, title: { en: '06:00 AM - The Summit Reach' }, description: { en: 'Reach the peak just in time for the sunrise.' } }
            ],
            inclusions: ['Hotel pickup', 'Licensed guide', 'Breakfast', 'Gear'],
            availability: [
              { 
                id: 's1', 
                start_time: new Date(Date.now() + 86400000).toISOString(), 
                end_time: new Date(Date.now() + 86400000 + 14400000).toISOString(),
                available_spots: 12, 
                total_spots: 15, 
                status: 'active' 
              }
            ]
          },
          'ubud-jungle-highlights': {
            title: { en: 'Ubud Jungle & Sacred Monkey Forest' },
            base_price_usd: 45,
            duration_minutes: 480,
            difficulty: 'beginner',
            description: { en: 'Explore the lush heart of Bali with a visit to the monkey forest sanctuary.' },
            images: ['https://images.unsplash.com/photo-1554443651-7871b058d867?w=1200'],
            highlights: ['Monkey Forest visit', 'Tegalalang Rice Terrace', 'Jungle Walk'],
            availability: [
              { 
                id: 's2', 
                start_time: new Date(Date.now() + 172800000).toISOString(), 
                end_time: new Date(Date.now() + 172800000 + 14400000).toISOString(),
                available_spots: 8, 
                total_spots: 10, 
                status: 'active' 
              }
            ]
          }
        };

        const match = tourDataMap[slug] || tourDataMap['mt-batur-sunrise'];

        const dummyTour: Tour = {
          id: `dummy-${slug}`,
          slug: slug,
          title: match.title || { en: 'Untitled Adventure' },
          description: match.description || { en: 'No description available.' },
          base_price_usd: match.base_price_usd || 0,
          duration_minutes: match.duration_minutes || 0,
          max_participants: 12,
          difficulty: (match.difficulty as any) || 'beginner',
          images: match.images || [],
          status: 'published',
          is_published: true,
          avg_rating: 4.8,
          review_count: 109,
          destination: { id: 'bali', slug: 'bali', name: { en: 'Bali' } },
          highlights: match.highlights || [],
          inclusions: match.inclusions || ['Safety equipment', 'Guide'],
          itineraries: match.itineraries || [],
          availability: match.availability || []
        };
        return dummyTour;
      }

      const { data, error } = await supabase
        .from('tours')
        .select(`
          *,
          destination:destinations(name),
          itineraries:tour_itineraries(*),
          availability:tour_availability(*),
          highlights:tour_highlights(*),
          inclusions:tour_inclusions(*),
          faqs:tour_faq(*)
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error) return null;
      return data as Tour;
    },
    enabled: !!slug,
  });
}
