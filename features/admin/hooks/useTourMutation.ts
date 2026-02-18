
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Tour } from '../../tours/types';

export function useTourMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const isNew = !data.id || data.id === 'new';
      
      // 1. Core Tour Data
      const tourPayload = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        status: data.status,
        category_id: data.category_id,
        destination_id: data.destination_id,
        updated_at: new Date().toISOString()
      };

      let tourId = data.id;

      if (isNew) {
        const { data: newTour, error: insertError } = await supabase
          .from('tours')
          .insert(tourPayload)
          .select('id')
          .single();
        if (insertError) throw insertError;
        tourId = newTour.id;
      } else {
        const { error: updateError } = await supabase
          .from('tours')
          .update(tourPayload)
          .eq('id', tourId);
        if (updateError) throw updateError;
      }

      // 2. Sync Child Tables (Differencing Logic)
      // For a production-ready app, we replace child records to simplify the "Unit of Work"
      
      // Sync Itineraries
      if (data.itineraries) {
        await supabase.from('tour_itineraries').delete().eq('tour_id', tourId);
        if (data.itineraries.length > 0) {
          await supabase.from('tour_itineraries').insert(
            data.itineraries.map((it: any, index: number) => ({
              ...it,
              tour_id: tourId,
              sort_order: index
            }))
          );
        }
      }

      // Sync Gallery
      if (data.gallery) {
        await supabase.from('tour_gallery').delete().eq('tour_id', tourId);
        if (data.gallery.length > 0) {
          await supabase.from('tour_gallery').insert(
            data.gallery.map((g: any, index: number) => ({
              ...g,
              tour_id: tourId,
              sort_order: index
            }))
          );
        }
      }

      // Sync Highlights
      if (data.highlights) {
        await supabase.from('tour_highlights').delete().eq('tour_id', tourId);
        if (data.highlights.length > 0) {
          await supabase.from('tour_highlights').insert(
            data.highlights.map((h: any, index: number) => ({
              content: h.content || h,
              tour_id: tourId,
              sort_order: index
            }))
          );
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
