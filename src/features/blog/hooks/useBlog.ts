import { useQuery } from '@tanstack/react-query';

export const useBlog = () => {
  return useQuery({
    queryKey: ['blog'],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: '1',
          slug: 'exploring-the-peaks',
          title: { en: 'Exploring the Peaks of Patagonia' },
          featured_image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
          category: 'Adventure',
        },
        {
          id: '2',
          slug: 'hidden-gems-bali',
          title: { en: 'Hidden Gems of Bali: Beyond the Beaches' },
          featured_image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
          category: 'Culture',
        },
        {
          id: '3',
          slug: 'sustainable-travel-tips',
          title: { en: '10 Tips for Sustainable Travel in 2026' },
          featured_image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
          category: 'Sustainability',
        }
      ];
    },
  });
};
