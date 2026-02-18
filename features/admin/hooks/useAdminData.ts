
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
      return { revenue: [], bookingsCount: 0, totalRevenue: 0, pendingInquiries: 0, activeTours: 0 };
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
          customer:profiles(full_name, email),
          availability:tour_availability(tour:tours(title))
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}

export function useAdminTour(id?: string) {
  return useQuery({
    queryKey: ['admin-tour', id],
    queryFn: async () => {
      if (!id) return null;
      if (!isConfigured) {
        // Mock data for preview mode
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
