
import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { Tour } from '../types';

export function useTourDetail(slug: string) {
  return useQuery({
    queryKey: ['tour', slug],
    queryFn: async () => {
      if (!isConfigured) {
        await new Promise(r => setTimeout(r, 600));
        
        // Find the basic info from the 20 Bali tours (simulating a DB lookup in preview)
        // We'll use a simplified version of the list from useTours.ts
        const baliToursPreview: any[] = [
          { slug: 'ubud-jungle-highlights', title: { en: 'Ubud Jungle & Sacred Monkey Forest' }, base_price_usd: 45, images: ['https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'mt-batur-sunrise', title: { en: 'Mount Batur Sunrise Trek' }, base_price_usd: 65, images: ['https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'nusa-penida-best', title: { en: 'Nusa Penida Day Trip' }, base_price_usd: 85, images: ['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'uluwatu-sunset', title: { en: 'Uluwatu Sunset & Fire Dance' }, base_price_usd: 35, images: ['https://images.unsplash.com/photo-1558005530-d7c4ec1630aa?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'gate-of-heaven', title: { en: 'Lempuyang Gate of Heaven' }, base_price_usd: 55, images: ['https://images.unsplash.com/photo-1537953391648-762d01df3c14?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'tirta-empul-blessing', title: { en: 'Holy Water Blessing' }, base_price_usd: 40, images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'ayung-rafting', title: { en: 'Ayung White Water Rafting' }, base_price_usd: 50, images: ['https://images.unsplash.com/photo-1530122622335-d40394391ea5?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'tanah-lot-sunset', title: { en: 'Tanah Lot Sunset' }, base_price_usd: 30, images: ['https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'lovina-dolphins', title: { en: 'Lovina Dolphin Tour' }, base_price_usd: 45, images: ['https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'cave-dinner', title: { en: 'Romantic Cave Dinner' }, base_price_usd: 450, images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'breakfast-orangutan', title: { en: 'Breakfast with Orangutans' }, base_price_usd: 75, images: ['https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'canggu-surf', title: { en: 'Canggu Surf Lesson' }, base_price_usd: 40, images: ['https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'sekumpul-trek', title: { en: 'Sekumpul Waterfall Trek' }, base_price_usd: 60, images: ['https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'seminyak-food', title: { en: 'Seminyak Night Market' }, base_price_usd: 35, images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'sidemen-valley', title: { en: 'Sidemen Valley Trek' }, base_price_usd: 40, images: ['https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'cooking-class', title: { en: 'Ubud Cooking Class' }, base_price_usd: 45, images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'atv-adventure', title: { en: 'Bali ATV Quad Bike' }, base_price_usd: 55, images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'jatiluwih-cycling', title: { en: 'Jatiluwih UNESCO Cycling' }, base_price_usd: 65, images: ['https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'menjangan-snorkel', title: { en: 'Menjangan Snorkeling' }, base_price_usd: 95, images: ['https://images.unsplash.com/photo-1544551763-47a15950c57f?auto=format&fit=crop&q=80&w=1200'] },
          { slug: 'heli-tour', title: { en: 'Helicopter Coastline Flight' }, base_price_usd: 550, images: ['https://images.unsplash.com/photo-1464037862834-ee5772642398?auto=format&fit=crop&q=80&w=1200'] }
        ];

        const match = baliToursPreview.find(t => t.slug === slug);
        if (!match) return null;

        const dummyTour: Tour = {
          id: `dummy-${match.slug}`,
          slug: match.slug,
          title: match.title,
          description: { en: `Join us for an unforgettable ${match.title.en}. This experience is carefully crafted to bring you the best of the destination.` },
          base_price_usd: match.base_price_usd,
          duration_minutes: 480,
          max_participants: 12,
          difficulty: 'beginner',
          images: match.images,
          is_published: true,
          category_id: 'cat-1',
          destination_id: 'dest-1',
          tour_type_id: 'type-1',
          avg_rating: 4.9,
          review_count: 128,
          destination: { name: { en: 'Bali' } },
          itineraries: [
            { id: 'i1', day_number: 1, title: { en: 'Morning Pickup & Introduction' }, description: { en: 'Our guide picks you up from your hotel to start the day.' } },
            { id: 'i2', day_number: 2, title: { en: 'Main Activity' }, description: { en: 'The highlight of the tour. We spend 4-5 hours exploring the key locations.' } },
            { id: 'i3', day_number: 3, title: { en: 'Lunch & Return' }, description: { en: 'Enjoy local cuisine before being dropped back at your accommodation.' } }
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

      // Production fetch from Supabase
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

      if (error) {
        console.error("Supabase Error:", error);
        return null;
      }
      return data as Tour;
    },
    enabled: !!slug,
  });
}
