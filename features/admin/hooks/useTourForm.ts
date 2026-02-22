
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { uploadToImgBB } from '../../../lib/imgbb';
import { Tour } from '../../tours/types';

export const useTourForm = (initialData?: Partial<Tour>) => {
  const queryClient = useQueryClient();
  
  const form = useForm({
    defaultValues: {
      title: '',
      slug: '',
      status: 'draft',
      description: '',
      itineraries: [],
      pricing_packages: [],
      gallery: [],
      highlights: [],
      inclusions: [],
      faqs: [],
      ...initialData
    }
  });

  const saveTour = useMutation({
    mutationFn: async (data: any) => {
      // 1. Save Core Tour
      const { data: tour, error: tourError } = await supabase
        .from('tours')
        .upsert({
          id: data.id,
          title: data.title,
          slug: data.slug,
          description: data.description,
          status: data.status,
          category_id: data.category_id,
          destination_id: data.destination_id
        })
        .select()
        .single();

      if (tourError) throw tourError;

      // 2. Parallelize Child Table Updates (Simplified for example)
      // In production, we'd delete existing and re-insert or use upsert logic
      await Promise.all([
        supabase.from('tour_itineraries').delete().eq('tour_id', tour.id),
        supabase.from('tour_pricing_packages').delete().eq('tour_id', tour.id),
        supabase.from('tour_gallery').delete().eq('tour_id', tour.id)
      ]);

      await Promise.all([
        supabase.from('tour_itineraries').insert(data.itineraries.map((it: any) => ({ ...it, tour_id: tour.id }))),
        supabase.from('tour_gallery').insert(data.gallery.map((g: any) => ({ ...g, tour_id: tour.id }))),
        // ... all other child tables
      ]);

      return tour;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    }
  });

  return { form, saveTour };
};
