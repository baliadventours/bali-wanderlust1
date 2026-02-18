
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';

export function useSubmitInquiry() {
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (payload: { tour_id: string; subject: string; message: string }) => {
      if (!isConfigured) {
        await new Promise(r => setTimeout(r, 600));
        return { success: true };
      }

      const { error } = await supabase.from('inquiries').insert({
        customer_id: user?.id,
        tour_id: payload.tour_id,
        subject: payload.subject,
        message: payload.message,
        status: 'open'
      });

      if (error) throw error;
      return { success: true };
    }
  });
}

export function useAdminInquiries() {
  return useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => {
      if (!isConfigured) {
        return Array(5).fill(null).map((_, i) => ({
          id: `inq-${i}`,
          created_at: new Date().toISOString(),
          subject: 'Question about group size',
          message: 'Can we bring a child under 5?',
          status: 'open',
          customer: { full_name: 'Jane Smith', email: 'jane@example.com' },
          tour: { title: { en: 'Ubud Jungle Tour' } }
        }));
      }

      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          customer:profiles(full_name, email),
          tour:tours(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
}
