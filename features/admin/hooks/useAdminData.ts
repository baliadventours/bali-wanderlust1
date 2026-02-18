
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { Tour } from '../../tours/types';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      if (!isConfigured) {
        return {
          revenue: [
            { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 },
            { name: 'Mar', value: 5000 }, { name: 'Apr', value: 8000 },
            { name: 'May', value: 7500 }, { name: 'Jun', value: 12000 }
          ],
          bookingsCount: 142,
          totalRevenue: 45200,
          pendingInquiries: 8,
          activeTours: 24
        };
      }
      
      const [bookings, inquiries, tours] = await Promise.all([
        supabase.from('bookings').select('id, total_amount_usd'),
        supabase.from('inquiries').select('id', { count: 'exact' }).eq('status', 'open'),
        supabase.from('tours').select('id', { count: 'exact' }).eq('is_published', true)
      ]);

      const totalRevenue = bookings.data?.reduce((sum, b) => sum + Number(b.total_amount_usd), 0) || 0;

      return {
        revenue: [
          { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 },
          { name: 'Mar', value: 5000 }, { name: 'Apr', value: 8000 },
          { name: 'May', value: 7500 }, { name: 'Jun', value: totalRevenue }
        ],
        bookingsCount: bookings.data?.length || 0,
        totalRevenue,
        pendingInquiries: inquiries.count || 0,
        activeTours: tours.count || 0
      };
    }
  });
}

export function useAdminBookings() {
  return useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      if (!isConfigured) {
        return Array(8).fill(null).map((_, i) => ({
          id: `b-${i}`,
          created_at: new Date().toISOString(),
          status: i % 3 === 0 ? 'confirmed' : 'pending',
          total_amount_usd: 250 + (i * 100),
          customer: { full_name: 'John Doe', email: 'john@example.com' },
          tour: { title: { en: 'Grand Canyon Adventure' } }
        }));
      }
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:profiles(full_name, id),
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
      if (!isConfigured) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      if (!isConfigured) return;
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
}

export function useAdminTour(id?: string) {
  return useQuery({
    queryKey: ['admin-tour', id],
    queryFn: async () => {
      if (!id) return null;
      if (!isConfigured) {
        return {
          id,
          title: { en: 'Grand Canyon Adventure' },
          base_price_usd: 899,
          max_participants: 12,
          is_published: false,
          images: [],
          itineraries: [],
        } as Partial<Tour>;
      }

      const { data, error } = await supabase
        .from('tours')
        .select(`
          *,
          itineraries:tour_itineraries(*),
          availability:tour_availability(*),
          addons:tour_addons(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Tour;
    },
    enabled: !!id,
  });
}

export function useUpdateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tour> }) => {
      if (!isConfigured) return;
      const { error } = await supabase.from('tours').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-tour', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    }
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (!isConfigured) return;
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    }
  });
}
