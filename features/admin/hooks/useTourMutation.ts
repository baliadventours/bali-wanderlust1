
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';

export function useTourMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      if (!isConfigured) return { id: data.id || 'mock-id' };

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
        base_price_usd: Number(data.base_price_usd),
        duration_minutes: Number(data.duration_minutes),
        max_participants: Number(data.max_participants),
        updated_at: new Date().toISOString()
      };

      let tourId = data.id;

      // 1. Upsert Core Tour
      if (isNew) {
        const { data: newTour, error } = await supabase.from('tours').insert(tourPayload).select('id').single();
        if (error) throw error;
        tourId = newTour.id;
      } else {
        const { error } = await supabase.from('tours').update(tourPayload).eq('id', tourId);
        if (error) throw error;
      }

      // 2. Atomic Sync Helper for Arrays
      const syncTable = async (table: string, items: any[], mapFn: (item: any) => any) => {
        await supabase.from(table).delete().eq('tour_id', tourId);
        if (items?.length > 0) {
          const payload = items.map((i, idx) => ({ ...mapFn(i), tour_id: tourId, sort_order: idx }));
          const { error } = await supabase.from(table).insert(payload);
          if (error) throw error;
        }
      };

      // 3. Sync Child Tables
      await Promise.all([
        syncTable('tour_gallery', data.gallery || [], g => ({ image_url: g.image_url })),
        syncTable('tour_highlights', data.highlights || [], h => ({ content: h.content })),
        syncTable('tour_inclusions', data.inclusions || [], i => ({ content: i.content, type: i.type })),
        syncTable('tour_faq', data.faqs || [], f => ({ question: f.question, answer: f.answer })),
        syncTable('tour_reviews', data.reviews || [], r => ({ reviewer_name: r.reviewer_name, rating: r.rating, comment: r.comment })),
        syncTable('tour_fact_values', data.facts || [], f => ({ fact_id: f.fact_id, value: f.value })),
        syncTable('tour_itineraries', data.itineraries || [], i => ({ 
          day_number: i.day_number, 
          time_label: i.time_label, 
          title: i.title, 
          description: i.description, 
          image_url: i.image_url 
        })),
      ]);

      // 4. Complex Sync: Pricing Packages + Seasonal Pricing
      await supabase.from('tour_pricing_packages').delete().eq('tour_id', tourId);
      if (data.pricing_packages?.length > 0) {
        for (const pkg of data.pricing_packages) {
          const { data: newPkg, error: pkgError } = await supabase.from('tour_pricing_packages').insert({
            tour_id: tourId,
            package_name: pkg.package_name,
            base_price: Number(pkg.base_price),
            min_people: pkg.min_people,
            max_people: pkg.max_people
          }).select('id').single();

          if (pkgError) throw pkgError;

          if (pkg.seasonal_pricing?.length > 0) {
            const seasonal = pkg.seasonal_pricing.map((s: any) => ({
              package_id: newPkg.id,
              start_date: s.start_date,
              end_date: s.end_date,
              price: Number(s.price)
            }));
            await supabase.from('seasonal_pricing').insert(seasonal);
          }
        }
      }

      // 5. Junction Table: Related Tours
      await supabase.from('related_tours').delete().eq('tour_id', tourId);
      if (data.related_tour_ids?.length > 0) {
        const related = data.related_tour_ids.map((rid: string) => ({ tour_id: tourId, related_tour_id: rid }));
        await supabase.from('related_tours').insert(related);
      }

      return { id: tourId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tour-detail'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    }
  });
}
