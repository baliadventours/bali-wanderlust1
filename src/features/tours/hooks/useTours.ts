import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { LocalizedString } from '../../../lib/utils';

export interface Tour {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  price: number;
  duration: number;
  location: string;
  max_group_size: number;
  difficulty: string;
  ratings_average: number;
  ratings_quantity: number;
  images: string[];
  start_dates: string[];
  created_at: string;
}

export const useTours = (filters: any) => {
  return useQuery({
    queryKey: ['tours', filters],
    queryFn: async () => {
      let query = supabase.from('tours').select('*');

      if (filters?.keyword) {
        query = query.ilike('title', `%${filters.keyword}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: { tours: data } };
    },
  });
};

export const useTour = (id: string) => {
  return useQuery({
    queryKey: ['tour', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data: { tour: data } };
    },
    enabled: !!id,
  });
};
