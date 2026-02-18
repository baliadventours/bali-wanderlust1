
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export function useTourMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const isNew = !data.id || data.id === 'create';
      const tourId = isNew ? (await supabase.from('tours').insert({ 
        title: data.title, 
        slug: data.slug,
        status: data.status,
        description: data.description,
        category_id: data.category_id,
        destination_id: data.destination_id,
        important_info: data.important_info,
        booking_policy: data.booking_policy
      }).select('id').single()).data?.id : data.id;

      if (!isNew) {
        await supabase.from('tours').update({
          title: data.title,
          slug: data.slug,
          status: data.status,
          description: data.description,
          category_id: data.category_id,
          destination_id: data.destination_id,
          important_info: data.important_info,
          booking_policy: data.booking_policy
        }).eq('id', tourId);
      }

      // Helper for Syncing Child Tables
      const syncTable = async (table: string, items: any[], mapFn: (item: any) => any) => {
        await supabase.from(table).delete().eq('tour_id', tourId);
        if (items?.length > 0) {
          await supabase.from(table).insert(items.map(i => ({ ...mapFn(i), tour_id: tourId })));
        }
      };

      await Promise.all([
        syncTable('tour_itineraries', data.itineraries, i => ({ title: i.title, description: i.description, day_number: i.day_number, image_url: i.image_url })),
        syncTable('tour_gallery', data.gallery, g => ({ image_url: g.image_url })),
        syncTable('tour_highlights', data.highlights, h => ({ content: h.content })),
        syncTable('tour_faq', data.faqs, f => ({ question: f.question, answer: f.answer })),
        syncTable('tour_inclusions', data.inclusions, i => ({ content: i.content, type: i.type })),
        syncTable('tour_reviews', data.reviews, r => ({ reviewer_name: r.reviewer_name, rating: r.rating, comment: r.comment })),
        syncTable('tour_fact_values', data.facts, f => ({ fact_id: f.fact_id, value: f.value })),
        // Pricing Packages sync logic is more complex in production, simplified here
        syncTable('tour_pricing_packages', data.pricing_packages, p => ({ package_name: p.package_name, base_price: p.base_price, min_people: p.min_people, max_people: p.max_people }))
      ]);

      return { id: tourId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tour-detail'] });
    }
  });
}
