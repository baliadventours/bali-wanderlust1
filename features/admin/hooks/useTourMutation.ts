
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

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication Required");

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
        max_participants: Number(data.max_participants || 10),
        difficulty: data.difficulty || 'beginner',
        images: data.images || [],
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

      const syncTable = async (table: string, items: any[], mapFn: (item: any) => any) => {
        await supabase.from(table).delete().eq('tour_id', tourId);
        if (items && items.length > 0) {
          const payload = items.map((i, idx) => ({ ...mapFn(i), tour_id: tourId, sort_order: idx }));
          await supabase.from(table).insert(payload);
        }
      };

      await Promise.all([
        syncTable('tour_itineraries', data.itineraries || [], i => ({ title: i.title, description: i.description, day_number: i.day_number, time_label: i.time_label, image_url: i.image_url })),
        syncTable('tour_gallery', data.gallery || [], g => ({ image_url: g.image_url })),
        syncTable('tour_highlights', data.highlights || [], h => ({ content: h.content })),
        syncTable('tour_faq', data.faqs || [], f => ({ question: f.question, answer: f.answer })),
        syncTable('tour_inclusions', data.inclusions || [], i => ({ content: i.content, type: i.type })),
        syncTable('tour_fact_values', data.facts || [], f => ({ fact_id: f.fact_id, value: f.value })),
        syncTable('tour_pricing_packages', data.pricing_packages || [], p => ({ package_name: p.package_name, description: p.description, price_tiers: p.price_tiers || [], base_price: p.base_price, min_people: p.min_people, max_people: p.max_people }))
      ]);

      return { id: tourId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    }
  });
}

export function useCloneTour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tourId: string) => {
      if (!isConfigured) {
        await new Promise(r => setTimeout(r, 800));
        return { id: 'mock-clone' };
      }

      // 1. Fetch full original tour data
      const { data: tour, error: fetchError } = await supabase
        .from('tours')
        .select(`
          *,
          itineraries:tour_itineraries(*),
          gallery:tour_gallery(*),
          highlights:tour_highlights(*),
          inclusions:tour_inclusions(*),
          faqs:tour_faq(*),
          facts:tour_fact_values(*),
          pricing_packages:tour_pricing_packages(*)
        `)
        .eq('id', tourId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Insert new tour record (cloned)
      const clonedTitle = { ...tour.title, en: `${tour.title.en} (Copy)` };
      const clonedSlug = `${tour.slug}-copy-${Date.now().toString().slice(-4)}`;
      
      const { data: newTour, error: insertError } = await supabase
        .from('tours')
        .insert({
          ...tour,
          id: undefined,
          title: clonedTitle,
          slug: clonedSlug,
          status: 'draft',
          created_at: undefined,
          updated_at: undefined
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      const newId = newTour.id;

      // 3. Duplicate related child records
      const duplicateChild = async (table: string, items: any[]) => {
        if (!items || items.length === 0) return;
        const payload = items.map(i => ({ ...i, id: undefined, tour_id: newId }));
        await supabase.from(table).insert(payload);
      };

      await Promise.all([
        duplicateChild('tour_itineraries', tour.itineraries),
        duplicateChild('tour_gallery', tour.gallery),
        duplicateChild('tour_highlights', tour.highlights),
        duplicateChild('tour_inclusions', tour.inclusions),
        duplicateChild('tour_faq', tour.faqs),
        duplicateChild('tour_fact_values', tour.facts),
        duplicateChild('tour_pricing_packages', tour.pricing_packages)
      ]);

      return { id: newId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    }
  });
}
const { data: newTour } = await supabase
  .from("tours")
  .insert([tourData])
  .select()
  .single()

for (const pkg of packages) {
  const { data: newPackage } = await supabase
    .from("tour_packages")
    .insert([{ ...pkg, tour_id: newTour.id }])
    .select()
    .single()

  const tiers = pkg.pricing_tiers.map(t => ({
    ...t,
    package_id: newPackage.id
  }))

  await supabase.from("package_pricing_tiers").insert(tiers)
}
