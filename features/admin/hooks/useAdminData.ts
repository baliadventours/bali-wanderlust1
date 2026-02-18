
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { Tour } from '../../tours/types';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      if (!isConfigured) {
        return { 
          bookingsCount: 42, 
          totalRevenue: 12500, 
          activeTours: 12,
          revenue: [
            { name: 'Jan', value: 2400 },
            { name: 'Feb', value: 1398 },
            { name: 'Mar', value: 9800 },
            { name: 'Apr', value: 3908 },
            { name: 'May', value: 4800 },
            { name: 'Jun', value: 3800 },
          ]
        };
      }
      const [bookings, tours] = await Promise.all([
        supabase.from('bookings').select('id, total_amount_usd'),
        supabase.from('tours').select('id', { count: 'exact' }).eq('is_published', true)
      ]);
      const totalRevenue = bookings.data?.reduce((sum, b) => sum + Number(b.total_amount_usd), 0) || 0;
      return {
        bookingsCount: bookings.data?.length || 0,
        totalRevenue,
        activeTours: tours.count || 0,
        revenue: [] 
      };
    }
  });
}

export function useAdminBookings() {
  return useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      if (!isConfigured) {
        return [
          {
            id: 'b-demo-1',
            created_at: new Date().toISOString(),
            status: 'confirmed',
            total_amount_usd: 450,
            customer: { full_name: 'Alice Wonder', email: 'alice@example.com' },
            tour: { title: { en: 'Ubud Jungle Adventure' } }
          }
        ];
      }
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:profiles(full_name, email),
          availability:tour_availability(tour:tours(title))
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      if (!isConfigured) {
        return [
          { id: 'u1', full_name: 'Admin User', email: 'admin@toursphere.com', role: 'admin', created_at: new Date().toISOString() }
        ];
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (!isConfigured) return { id, status };
      const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    }
  });
}

export function useAdminTour(id?: string) {
  return useQuery({
    queryKey: ['admin-tour-detail', id],
    queryFn: async () => {
      if (!id || id === 'create') return null;
      
      if (!isConfigured) {
        return {
          id,
          title: { en: 'Ubud Jungle & Sacred Monkey Forest' },
          slug: 'ubud-jungle-highlights',
          status: 'published',
          description: { en: 'Explore the lush heart of Bali with a visit to the Tegalalang Rice Terrace.' },
          category_id: 'cat-cul',
          destination_id: 'bali',
          important_info: { en: 'Wear comfortable shoes.' },
          booking_policy: { en: 'Cancel 24h before for full refund.' },
          itineraries: [
            { day_number: 1, title: { en: 'Forest Arrival' }, description: { en: 'Meet the monkeys.' }, image_url: 'https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=400' }
          ],
          gallery: [
            { image_url: 'https://images.unsplash.com/photo-1554443651-7871b058d867?auto=format&fit=crop&q=80&w=400' }
          ],
          highlights: [{ content: 'Visit Tegalalang' }],
          inclusions: [{ content: 'Hotel Transfer', type: 'include' }],
          faqs: [{ question: 'Is it safe?', answer: 'Yes, very.' }],
          reviews: [{ reviewer_name: 'John Doe', rating: 5, comment: 'Amazing!' }],
          facts: [{ fact_id: 'f-dur', value: '4 Hours' }],
          pricing_packages: [
            { package_name: 'Standard', base_price: 45, min_people: 1, max_people: 10 }
          ],
          related_tour_ids: []
        };
      }

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
          related_tours:related_tours(related_tour_id)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        related_tour_ids: data.related_tours?.map((rt: any) => rt.related_tour_id) || []
      };
    },
    enabled: !!id && id !== 'create',
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      if (!isConfigured) return { id, role };
      const { data, error } = await supabase.from('profiles').update({ role }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
}
