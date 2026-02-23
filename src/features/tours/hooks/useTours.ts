import { useQuery } from '@tanstack/react-query';

export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  images: string;
  startDates: string;
}

export const useTours = (filters: any) => {
  return useQuery({
    queryKey: ['tours', filters],
    queryFn: async () => {
      const response = await fetch('/api/tours');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
  });
};

export const useTour = (id: string) => {
  return useQuery({
    queryKey: ['tour', id],
    queryFn: async () => {
      const response = await fetch(`/api/tours/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    enabled: !!id,
  });
};
