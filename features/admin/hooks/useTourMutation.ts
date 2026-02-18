
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';

export function useTourMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      if (!isConfigured) {
        await new Promise(r => setTimeout(r, 800));
        return { id: data.id || 'mock-id' };
      }

      const isNew = !data.id || data.id === 'create';
      const tourPayload = { 
        title: data.title, 
        slug: data.slug,
        status: data.status,
        description: data.description,
        category_id: data.category_id,
        destination_id: data.destination_id,
        important_info: data.important_info,
        booking_policy: data.booking_policy,
        updated_at: new Date().toISOString()
      };

      let tourId = data.id;

      if (isNew) {
        const { data: newTour, error } = await supabase.from('tours').insert(tourPayload).select('id').single();
        if (error) throw error;
        tourId = newTour.id;
      } else {
        const { error } = await supabase.from('tours').update(tourPayload).eq('id', tourId);
        if (error) throw error;
      }

      // Sync Related Child Tables
      const syncTable = async (table: string, items: any[], mapFn: (item: any) => any) => {
        await supabase.from(table).delete().eq('tour_id', tourId);
        if (items && items.length > 0) {
          const payload = items.map((i, idx) => ({ ...mapFn(i), tour_id: tourId, sort_order: idx }));
          const { error } = await supabase.from(table).insert(payload);
          if (error) throw error;
        }
      };

      await Promise.all([
        syncTable('tour_itineraries', data.itineraries, i => ({ title: i.title, description: i.description, day_number: i.day_number, time_label: i.time_label, image_url: i.image_url })),
        syncTable('tour_gallery', data.gallery, g => ({ image_url: g.image_url })),
        syncTable('tour_highlights', data.highlights, h => ({ content: h.content })),
        syncTable('tour_faq', data.faqs, f => ({ question: f.question, answer: f.answer })),
        syncTable('tour_inclusions', data.inclusions, i => ({ content: i.content, type: i.type })),
        syncTable('tour_reviews', data.reviews, r => ({ reviewer_name: r.reviewer_name, rating: Number(r.rating), comment: r.comment })),
        syncTable('tour_fact_values', data.facts, f => ({ fact_id: f.fact_id, value: f.value })),
        syncTable('tour_pricing_packages', data.pricing_packages, p => ({ package_name: p.package_name, base_price: Number(p.base_price), min_people: Number(p.min_people), max_people: Number(p.max_people) }))
      ]);

      // Sync Related Tours Join Table
      if (data.related_tour_ids) {
        await supabase.from('related_tours').delete().eq('tour_id', tourId);
        if (data.related_tour_ids.length > 0) {
          const rtPayload = data.related_tour_ids.map((rid: string) => ({ tour_id: tourId, related_tour_id: rid }));
          await supabase.from('related_tours').insert(rtPayload);
        }
      }

      return { id: tourId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tour-detail'] });
    }
  });
}
