import { supabase } from '../../lib/supabase';
import { Tour, TourImage } from '../../lib/types';

export const getTours = async (page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('tours')
    .select('*, tour_images(*)', { count: 'exact' })
    .eq('is_active', true)
    .range(from, to)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tours:', error);
    throw error;
  }
  return {
    data: data as (Tour & { tour_images: TourImage[] })[],
    count
  };
};

export const getTourBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('tours')
    .select('*, tour_images(*)')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching tour by slug:', error);
    throw error;
  }
  return data as (Tour & { tour_images: TourImage[] });
};
