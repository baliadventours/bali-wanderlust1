
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
        base_price_usd: Number(data.base_price_usd || 0),
        duration_minutes: Number(data.duration_minutes || 0),
        max_participants: Number(data.max_participants || 0),
        difficulty: data.difficulty || 'Moderate',
        images: data.images || [],
        is_published: data.status === 'published',
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

      // Sync Related Child Tables logic...
      // Helper to sync simple arrays
      const syncSimple = async (table: string, items: any[], mapFn: (item: any) => any) => {
        await supabase.from(table).delete().eq('tour_id', tourId);
        if (items && items.length > 0) {
          const payload = items.map((i, idx) => ({ ...mapFn(i), tour_id: tourId, sort_order: idx }));
          const { error } = await supabase.from(table).insert(payload);
          if (error) throw error;
        }
      };

      await Promise.all([
        syncSimple('tour_itineraries', data.itineraries || [], i => ({ title: i.title, description: i.description, day_number: i.day_number, time_label: i.time_label, image_url: i.image_url })),
        syncSimple('tour_gallery', data.gallery || [], g => ({ image_url: g.image_url })),
        syncSimple('tour_highlights', data.highlights || [], h => ({ content: h.content })),
        syncSimple('tour_faq', data.faqs || [], f => ({ question: f.question, answer: f.answer })),
        syncSimple('tour_inclusions', data.inclusions || [], i => ({ content: i.content, type: i.type })),
        syncSimple('tour_reviews', data.reviews || [], r => ({ reviewer_name: r.reviewer_name, rating: Number(r.rating), comment: r.comment })),
        syncSimple('tour_fact_values', data.facts || [], f => ({ fact_id: f.fact_id, value: f.value })),
      ]);

      return { id: tourId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tour-detail'] });
    }
  });
}
