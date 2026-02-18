import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { BlogPost } from '../types';

export function useBlog() {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      if (!isConfigured) {
        await new Promise(r => setTimeout(r, 600));
        return [
          {
            id: 'b1',
            slug: 'packing-for-iceland',
            title: { en: 'Ultimate Iceland Packing Guide' },
            excerpt: { en: 'Don’t let the cold ruin your trip. Here is exactly what to bring for your arctic adventure.' },
            // Add missing content property for TypeScript compatibility with BlogPost interface
            content: { en: 'This is the full content for the Iceland packing guide. It covers everything from thermal layers to waterproof boots.' },
            featured_image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800',
            category: 'Guides',
            reading_time_minutes: 8,
            created_at: new Date().toISOString()
          },
          {
            id: 'b2',
            slug: 'tokyo-food-secrets',
            title: { en: '5 Hidden Ramen Spots in Tokyo' },
            excerpt: { en: 'Discover the back-alley ramen shops where Tokyo locals actually eat.' },
            // Add missing content property for TypeScript compatibility with BlogPost interface
            content: { en: 'Ramen is an art form in Tokyo. Beyond the chains, these five spots offer the most authentic experience.' },
            featured_image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800',
            category: 'Food',
            reading_time_minutes: 5,
            created_at: new Date().toISOString()
          },
          {
            id: 'b3',
            slug: 'italy-off-season',
            title: { en: 'Why You Should Visit Italy in Winter' },
            excerpt: { en: 'Empty streets, lower prices, and cozy atmospheres make winter the secret best time to visit.' },
            // Add missing content property for TypeScript compatibility with BlogPost interface
            content: { en: 'Winter in Italy is magical. From the Christmas markets in Bolzano to the empty canals of Venice, it is the best time for slow travel.' },
            featured_image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=800',
            category: 'Travel Tips',
            reading_time_minutes: 6,
            created_at: new Date().toISOString()
          }
        ] as BlogPost[];
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, author:profiles(full_name, avatar_url)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    }
  });
}
