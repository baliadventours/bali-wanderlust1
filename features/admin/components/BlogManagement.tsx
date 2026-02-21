
import React from 'react';
import { useBlog } from '../../blog/hooks/useBlog';
import { Plus, Edit3, Trash2, Eye, Calendar, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export const BlogManagement: React.FC = () => {
  const { data: posts, isLoading } = useBlog();

  if (isLoading) return <div className="p-8">Loading journal...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Travel Journal</h1>
          <p className="text-slate-500 text-sm">Create and publish stories to inspire your travelers.</p>
        </div>
        <Link to="/admin/blog/create" className="bg-slate-900 text-white px-6 py-3 rounded-[10px] font-bold text-sm hover:bg-emerald-600 transition-all shadow-xl inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Write New Story
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {posts?.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-[10px] border border-slate-200 flex items-center gap-6 group hover:border-emerald-200 transition-colors">
            <div className="w-32 h-20 rounded-[8px] overflow-hidden bg-slate-100 flex-shrink-0">
              <img src={post.featured_image} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                {/* // Fixed: Changed post.author_id to post.author to match BlogPost interface definition */}
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${post.author ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                  {post.category}
                </span>
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <h3 className="text-md font-bold text-slate-900">{post.title.en}</h3>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link to={`/admin/blog/${post.id}`} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">
                <Edit3 className="w-4 h-4" />
              </Link>
              <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
