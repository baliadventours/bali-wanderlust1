import { supabase } from '../../lib/supabase';
import { Tour } from '../../lib/types';

export const adminGetTours = async () => {
  const { data, error } = await supabase
    .from('tours')
    .select('*, tour_images(*)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Admin error fetching tours:', error);
    throw error;
  }
  return data;
};

export const createTour = async (tourData: Partial<Tour>, images: string[]) => {
  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .insert([tourData])
    .select()
    .single();
  
  if (tourError) {
    console.error('Admin error creating tour:', tourError);
    throw tourError;
  }

  if (images.length > 0) {
    const imagePayload = images.map((url, index) => ({
      tour_id: tour.id,
      url,
      is_primary: index === 0
    }));
    const { error: imgError } = await supabase.from('tour_images').insert(imagePayload);
    if (imgError) {
      console.error('Admin error inserting tour images:', imgError);
      throw imgError;
    }
  }

  return tour;
};

export const updateTour = async (id: string, tourData: Partial<Tour>) => {
  const { data, error } = await supabase
    .from('tours')
    .update(tourData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Admin error updating tour:', error);
    throw error;
  }
  return data;
};

export const deleteTour = async (id: string) => {
  const { error } = await supabase.from('tours').delete().eq('id', id);
  if (error) {
    console.error('Admin error deleting tour:', error);
    throw error;
  }
};
