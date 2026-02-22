
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { Tour } from '../../tours/types';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const defaultStats = { 
        bookingsCount: 0, 
        totalRevenue: 0, 
        activeTours: 0,
        revenue: [
          { name: 'Jan', value: 0 }, { name: 'Feb', value: 0 }, { name: 'Mar', value: 0 },
          { name: 'Apr', value: 0 }, { name: 'May', value: 0 }, { name: 'Jun', value: 0 },
        ]
      };

      if (!isConfigured) {
        return { 
          ...defaultStats,
          bookingsCount: 42, totalRevenue: 12500, activeTours: 12,
          revenue: [{ name: 'Jan', value: 2400 }, { name: 'Feb', value: 1398 }, { name: 'Mar', value: 9800 }, { name: 'Apr', value: 3908 }, { name: 'May', value: 4800 }, { name: 'Jun', value: 3800 }]
        };
      }

      try {
        const [bookings, tours] = await Promise.all([
          supabase.from('bookings').select('id, total_amount_usd'),
          supabase.from('tours').select('id', { count: 'exact' }).eq('status', 'published')
        ]);
        const totalRevenue = bookings.data?.reduce((sum, b) => sum + Number(b.total_amount_usd), 0) || 0;
        return { bookingsCount: bookings.data?.length || 0, totalRevenue, activeTours: tours.count || 0, revenue: defaultStats.revenue };
      } catch (err) {
        return defaultStats;
      }
    }
  });
}

export function useAdminBookings() {
  return useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      if (!isConfigured) {
        return [{ id: 'b-demo-1', created_at: new Date().toISOString(), status: 'confirmed', total_amount_usd: 450, customer: { full_name: 'Alice Wonder', email: 'alice@example.com' }, tour: { title: { en: 'Ubud Jungle Adventure' } } }];
      }
      try {
        const { data, error } = await supabase.from('bookings').select(`*, customer:profiles(full_name, email), availability:tour_availability(tour:tours(title))`).order('created_at', { ascending: false });
        if (error) return [];
        return data || [];
      } catch (e) {
        return [];
      }
    }
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      if (!isConfigured) {
        return [{ id: 'u1', full_name: 'Admin User', email: 'admin@toursphere.com', role: 'admin', created_at: new Date().toISOString() }];
      }
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) return [];
        return data || [];
      } catch (e) {
        return [];
      }
    }
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const state = useAuthStore.getState();
      const isDemoAdmin = state.user?.email === 'admin@admin.com' && state.user?.id === '00000000-0000-0000-0000-000000000001';

      if (!isConfigured || isDemoAdmin) return { id, status };
      const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-bookings'] }); }
  });
}

export function useAdminTour(id?: string) {
  return useQuery({
    queryKey: ['admin-tour-detail', id],
    queryFn: async () => {
      if (!id || id === 'create') return null;
      
      if (!isConfigured) {
        // Mock data uses proper object shapes
        return {
          id,
          title: { en: 'Ubud Jungle & Sacred Monkey Forest' },
          slug: 'ubud-jungle-highlights',
          status: 'published',
          description: { en: 'Explore the lush heart of Bali.' },
          category_id: 'cat-cul',
          destination_id: 'bali',
          important_info: { en: 'Wear hiking boots.' },
          booking_policy: { en: 'Flexible cancellation.' },
          itineraries: [{ day_number: 1, title: { en: 'Arrival' }, description: { en: 'Settle in at the camp.' }, image_url: 'https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=400' }],
          gallery: [{ image_url: 'https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=400' }],
          highlights: [{ content: 'Sacred Monkey Forest visit' }],
          inclusions: [{ content: 'Private Guide', type: 'include' }],
          faqs: [{ question: 'Is gear provided?', answer: 'Yes, full gear is included.' }],
          reviews: [{ reviewer_name: 'Adventure Seekers', rating: 5, comment: 'Simply breathtaking.' }],
          facts: [{ fact_id: 'f-dur', value: '8 Hours' }],
          pricing_packages: [{ package_name: 'Standard', description: 'Base package', price_tiers: [{people: 1, price: 45}] }],
          related_tour_ids: []
        };
      }

      try {
        const { data, error } = await supabase
          .from('tours')
          .select(`
            *,
            itineraries:tour_itineraries(*),
            gallery:tour_gallery(*),
            highlights:tour_highlights(*),
            inclusions:tour_inclusions(*),
            faqs:tour_faq(*),
            reviews:tour_reviews(*),
            facts:tour_fact_values(*),
            pricing_packages:tour_pricing_packages(*),
            related_tours:related_tours!related_tours_tour_id_fkey(related_tour_id)
          `)
          .eq('id', id)
          .maybeSingle();

        // Fallback to simple query if joins fail (helps with schema mismatches)
        if (error) {
          console.warn("Complex join failed, falling back to simple tour fetch:", error);
          const { data: basic, error: basicError } = await supabase.from('tours').select('*').eq('id', id).maybeSingle();
          if (basicError || !basic) throw error || basicError;
          return { ...basic, title: typeof basic.title === 'string' ? { en: basic.title } : (basic.title || { en: '' }) };
        }
        
        if (!data) return null;
        
        const normalize = (val: any) => {
          if (!val) return { en: '' };
          if (typeof val === 'string') return { en: val };
          return val;
        };

        // Deep normalization layer to prevent UI crashes
        return {
          ...data,
          title: normalize(data.title),
          description: normalize(data.description),
          important_info: normalize(data.important_info),
          booking_policy: normalize(data.booking_policy),
          itineraries: (data.itineraries || []).map((it: any) => ({
            ...it,
            title: normalize(it.title),
            description: normalize(it.description)
          })),
          gallery: data.gallery || [],
          highlights: data.highlights || [],
          inclusions: data.inclusions || [],
          faqs: data.faqs || [],
          reviews: data.reviews || [],
          facts: data.facts || [],
          pricing_packages: (data.pricing_packages || []).map((p: any) => ({
            ...p,
            price_tiers: Array.isArray(p.price_tiers) ? p.price_tiers : []
          })),
          related_tour_ids: (data.related_tours || []).map((rt: any) => rt.related_tour_id)
        };
      } catch (err) {
        console.error("Critical Fetch Error in useAdminTour:", err);
        throw err;
      }
    },
    enabled: !!id && id !== 'create',
    retry: 1
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const state = useAuthStore.getState();
      const isDemoAdmin = state.user?.email === 'admin@admin.com' && state.user?.id === '00000000-0000-0000-0000-000000000001';

      if (!isConfigured || isDemoAdmin) return { id, role };
      const { data, error } = await supabase.from('profiles').update({ role }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); }
  });
}
