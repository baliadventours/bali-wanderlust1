
import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { Tour } from '../types';

export function useTourDetail(slug: string) {
  return useQuery({
    queryKey: ['tour', slug],
    queryFn: async () => {
      if (!isConfigured) {
        // Return dummy full data for preview
        await new Promise(r => setTimeout(r, 600));
        const dummyTour: Tour = {
          id: 'dummy-1',
          slug: 'grand-canyon-adventure',
          title: { en: 'Grand Canyon Ultimate Adventure' },
          description: { en: 'Experience the majesty of the Grand Canyon like never before. This multi-day trek takes you through hidden trails and offers stunning vistas of the Colorado River.' },
          summary: { en: 'The ultimate bucket-list experience for nature lovers.' },
          base_price_usd: 850,
          duration_minutes: 4320, // 3 days
          max_participants: 12,
          difficulty: 'intermediate',
          images: [
            'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200'
          ],
          is_published: true,
          category_id: 'cat-1',
          destination_id: 'dest-1',
          tour_type_id: 'type-1',
          avg_rating: 4.9,
          review_count: 128,
          highlights: ['Helicopter flight over the canyon', 'Rafting on the Colorado River', 'Sunset dinner at the rim'],
          inclusions: ['All meals', 'Professional guide', 'Camping equipment', 'Park entrance fees'],
          exclusions: ['Flights to Arizona', 'Personal insurance', 'Gratuities'],
          itineraries: [
            { id: 'i1', day_number: 1, title: { en: 'Arrival & Rim Walk' }, description: { en: 'Arrive at the South Rim and enjoy a guided sunset walk.' } },
            { id: 'i2', day_number: 2, title: { en: 'Into the Canyon' }, description: { en: 'Descend the Bright Angel trail for a lunch by the river.' } },
            { id: 'i3', day_number: 3, title: { en: 'Helicopter Finale' }, description: { en: 'A morning helicopter tour followed by departure.' } }
          ],
          availability: [
            { id: 's1', start_time: '2024-07-15T08:00:00Z', end_time: '2024-07-18T17:00:00Z', available_spots: 8, total_spots: 12, status: 'active' },
            { id: 's2', start_time: '2024-08-01T08:00:00Z', end_time: '2024-08-04T17:00:00Z', available_spots: 4, total_spots: 12, status: 'active' },
            { id: 's3', start_time: '2024-12-24T08:00:00Z', end_time: '2024-12-27T17:00:00Z', available_spots: 2, total_spots: 12, status: 'active' }
          ],
          seasonal_rules: [
            { id: 'r1', start_date: '2024-12-20', end_date: '2025-01-05', multiplier: 1.25 } // Holiday peak
          ],
          addons: [
            { id: 'a1', title: { en: 'Professional Photo Package' }, unit_price_usd: 150 },
            { id: 'a2', title: { en: 'Luxury Sleeping Bag Upgrade' }, unit_price_usd: 45 }
          ],
          reviews: [
            { id: 'rev1', customer_id: 'u1', rating: 5, comment: 'Absolutely life changing. The guides were incredible.', created_at: '2024-01-10T12:00:00Z', profiles: { full_name: 'John Doe', avatar_url: '' } }
          ]
        };
        return dummyTour;
      }

      const { data, error } = await supabase
        .from('tours')
        .select(`
          *,
          category:tour_categories(name),
          destination:destinations(name),
          tour_type:tour_types(name),
          itineraries(*),
          availability:tour_availability(*),
          seasonal_rules:seasonal_pricing_rules(*),
          reviews(*, profiles(full_name, avatar_url))
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Tour;
    },
    enabled: !!slug,
  });
}
