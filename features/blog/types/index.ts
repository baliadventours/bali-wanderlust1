export interface BlogPost {
  id: string;
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  featured_image: string;
  category: string;
  reading_time_minutes: number;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url?: string;
  };
}