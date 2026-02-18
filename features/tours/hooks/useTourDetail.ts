import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { Tour } from '../types';

export function useTourDetail(slug: string) {
  return useQuery({
    queryKey: ['tour', slug],
    queryFn: async () => {
      if (!isConfigured) {
        await new Promise(r => setTimeout(r, 600));
        
        const baliToursPreview: any[] = [
          { 
            slug: 'ubud-jungle-highlights', 
            title: { en: 'Ubud Jungle & Sacred Monkey Forest' }, 
            base_price_usd: 45, 
            images: [
              'https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=1200',
              'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1530122622335-d40394391ea5?auto=format&fit=crop&q=80&w=600'
            ]
          },
          { 
            slug: 'mt-batur-sunrise', 
            title: { en: 'Mount Batur Sunrise Trek' }, 
            base_price_usd: 65, 
            images: [
              'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=1200',
              'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1537953391648-762d01df3c14?auto=format&fit=crop&q=80&w=600'
            ]
          },
          { 
            slug: 'ayung-rafting', 
            title: { en: 'White Water Rafting Ubud' }, 
            base_price_usd: 50, 
            images: [
              'https://images.unsplash.com/photo-1530122622335-d40394391ea5?auto=format&fit=crop&q=80&w=1200',
              'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=600',
              'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=600'
            ]
          },
          // ... all other 17 tours will match this logic
        ];

        const match = baliToursPreview.find(t => t.slug === slug) || baliToursPreview[0];

        const dummyTour: Tour = {
          id: `dummy-${match.slug}`,
          slug: match.slug,
          title: match.title,
          description: { 
            en: `Experience the thrill of ${match.title.en}. This adventure takes you through Bali's lush landscapes, offering breathtaking views and unforgettable moments. Perfect for families, solo travelers, and thrill-seekers alike. Our professional guides ensure your safety while you soak in the natural beauty of the island.`
          },
          base_price_usd: match.base_price_usd,
          duration_minutes: 360,
          max_participants: 12,
          difficulty: 'beginner',
          images: match.images,
          is_published: true,
          category_id: 'cat-1',
          destination_id: 'dest-1',
          tour_type_id: 'type-1',
          avg_rating: 4.8,
          review_count: 109,
          // Fix: Added missing id and slug to satisfy Destination type
          destination: { id: 'ubud-bali', slug: 'ubud-bali', name: { en: 'Ubud, Bali' } },
          highlights: [
            'Have a safe time rafting with the help of a trained guide.',
            'Take advantage of the free lunch spread.',
            'Get round-trip transfers from your Ubud hotel to make things easier for you.',
            'You will have access to changing rooms with towels and toiletries.'
          ],
          inclusions: [
            'Safety-approved Rafting equipment',
            'Professional River Guide',
            'Meal (Lunch Box)',
            'All Fees and Taxes',
            'Insurance Coverage',
            'Shampoo, bath soap, Towel, Locker, shower, and changing room'
          ],
          exclusions: [
            'Souvenir photos (available to purchase)',
            'Soft Drink'
          ],
          itineraries: [
            { id: 'i1', day_number: 1, title: { en: 'Arrival & Safety Briefing' }, description: { en: 'Arrive at the starting point, receive your equipment, and get a thorough safety briefing from our expert guides.' } },
            { id: 'i2', day_number: 2, title: { en: 'The Adventure Begins' }, description: { en: 'Set off on the river or trail for 2-3 hours of action-packed exploration.' } },
            { id: 'i3', day_number: 3, title: { en: 'Lunch & Relax' }, description: { en: 'Enjoy a delicious local buffet lunch while overlooking the jungle valley before heading back.' } }
          ],
          availability: [
            { id: 's1', start_time: '2025-07-15T08:00:00Z', end_time: '2025-07-15T17:00:00Z', available_spots: 8, total_spots: 12, status: 'active' },
            { id: 's2', start_time: '2025-08-01T08:00:00Z', end_time: '2025-08-01T17:00:00Z', available_spots: 4, total_spots: 12, status: 'active' }
          ],
          addons: [
            { id: 'a1', title: { en: 'Private Photographer' }, unit_price_usd: 120 },
            { id: 'a2', title: { en: 'VIP Lounge Access' }, unit_price_usd: 45 }
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
          itineraries:tour_itineraries(*),
          availability:tour_availability(*),
          seasonal_rules:seasonal_pricing_rules(*),
          addons:tour_addons(*),
          reviews:reviews(*, profiles(full_name, avatar_url))
        `)
        .eq('slug', slug)
        .single();

      if (error) return null;
      return data as Tour;
    },
    enabled: !!slug,
  });
}