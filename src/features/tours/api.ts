import { supabase } from '../../lib/supabase';
import { Tour, TourImage } from '../../lib/types';

export const getTours = async () => {
  const { data, error } = await supabase
    .from('tours')
    .select('*, tour_images(*)')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching tours:', error);
    throw error;
  }
  return data as (Tour & { tour_images: TourImage[] })[];
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
