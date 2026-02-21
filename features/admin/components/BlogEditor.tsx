import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const BlogEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{isEditing ? 'Edit Story' : 'Write New Story'}</h1>
          <p className="text-slate-500 text-sm">Craft engaging content for your travelers.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/blog')}
            className="px-6 py-3 rounded-[10px] font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button className="bg-emerald-600 text-white px-6 py-3 rounded-[10px] font-bold text-sm hover:bg-emerald-700 transition-all shadow-xl">
            {isEditing ? 'Update Story' : 'Publish Story'}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[10px] border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Story Title</label>
          <input 
            type="text" 
            placeholder="e.g., The Ultimate Guide to Bali"
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] outline-none focus:ring-2 focus:ring-emerald-500/20 text-lg font-bold transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
            <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all">
              <option value="Destinations">Destinations</option>
              <option value="Travel Tips">Travel Tips</option>
              <option value="Culture">Culture</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Featured Image URL</label>
            <input 
              type="text" 
              placeholder="https://images.unsplash.com/..."
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Excerpt</label>
          <textarea 
            rows={2}
            placeholder="A short summary of the story..."
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Content (Markdown)</label>
          <textarea 
            rows={15}
            placeholder="Write your story here..."
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all font-mono"
          />
        </div>
      </div>
    </div>
  );
};
