
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
        revenue: [] // Real implementation would aggregate data over time
      };
    }
  });
}

// Added useAdminBookings to fetch bookings for admin management
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
          },
          {
            id: 'b-demo-2',
            created_at: new Date().toISOString(),
            status: 'pending',
            total_amount_usd: 800,
            customer: { full_name: 'Bob Smith', email: 'bob@example.com' },
            tour: { title: { en: 'Mount Batur Trek' } }
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

// Added useAdminUsers to fetch user profiles for admin management
export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      if (!isConfigured) {
        return [
          { id: 'u1', full_name: 'Admin User', email: 'admin@toursphere.com', role: 'admin', created_at: new Date().toISOString() },
          { id: 'u2', full_name: 'John Customer', email: 'customer@example.com', role: 'customer', created_at: new Date().toISOString() }
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

// Added useUpdateBookingStatus for admin to confirm/cancel bookings
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (!isConfigured) return { id, status };
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    }
  });
}

// Added useAdminTour to fetch a single tour for the editor
export function useAdminTour(id?: string) {
  return useQuery({
    queryKey: ['admin-tour-detail', id],
    queryFn: async () => {
      if (!id || id === 'new') return null;
      if (!isConfigured) return null;
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && id !== 'new',
  });
}

// Added useUpdateTour to handle tour creation and updates
export function useUpdateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      if (!isConfigured) return { id, ...updates };
      let result;
      if (id === 'new') {
        result = await supabase.from('tours').insert(updates).select().single();
      } else {
        result = await supabase.from('tours').update(updates).eq('id', id).select().single();
      }
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tour-detail'] });
    }
  });
}

// Added useUpdateUserRole for admin to manage user permissions
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      if (!isConfigured) return { id, role };
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
}
