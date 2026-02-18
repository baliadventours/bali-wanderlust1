import React from 'react';
import { useBlog } from '../hooks/useBlog';
import { Link } from 'react-router-dom';
import { Clock, Tag, ChevronRight } from 'lucide-react';
import { getTranslation } from '../../../utils/currency';
import { useAppStore } from '../../../store/useAppStore';

export const BlogListingPage: React.FC = () => {
  const { data: posts, isLoading } = useBlog();
  const { language } = useAppStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-4">Travel Stories</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Expert tips, local guides, and inspiration for your next global adventure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts?.map((post) => (
          <article key={post.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
            <Link to={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden">
              <img 
                src={post.featured_image} 
                alt={getTranslation(post.title, language)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute top-4 left-4">
                <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                  {post.category}
                </span>
              </div>
            </Link>
            <div className="p-8">
              <div className="flex items-center gap-4 text-xs text-slate-400 font-bold mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.reading_time_minutes} min read
                </div>
              </div>
              <Link to={`/blog/${post.slug}`}>
                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {getTranslation(post.title, language)}
                </h2>
              </Link>
              <p className="text-slate-500 text-sm line-clamp-3 mb-6">
                {getTranslation(post.excerpt, language)}
              </p>
              <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                Read Story
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};