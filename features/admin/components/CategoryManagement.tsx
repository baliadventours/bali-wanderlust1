
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured } from '../../../lib/supabase';
import { Plus, Trash2, Edit2, Loader2, Tags } from 'lucide-react';

export const CategoryManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '' });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      if (!isConfigured) return [{ id: '1', name: 'Adventure', slug: 'adventure' }];
      const { data, error } = await supabase.from('tour_categories').select('*').order('name');
      if (error) throw error;
      return data;
    }
  });

  const addMutation = useMutation({
    mutationFn: async (cat: any) => {
      if (!isConfigured) return cat;
      const { data, error } = await supabase.from('tour_categories').insert(cat).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setIsAdding(false);
      setNewCat({ name: '', slug: '' });
    }
  });

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Taxonomy</h1>
          <p className="text-slate-500 text-sm">Manage tour categories for better catalog organization.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all"
        >
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-end gap-4 animate-in slide-in-from-top-2">
          <div className="flex-grow space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category Name</label>
            <input 
              className="w-full p-3 bg-slate-50 border rounded-lg outline-none" 
              value={newCat.name}
              onChange={e => setNewCat({ ...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
            />
          </div>
          <div className="flex-grow space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slug</label>
            <input 
              className="w-full p-3 bg-slate-50 border rounded-lg outline-none" 
              value={newCat.slug}
              onChange={e => setNewCat({ ...newCat, slug: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsAdding(false)}
              className="p-3 text-slate-400 hover:text-slate-600 font-bold"
            >
              Cancel
            </button>
            <button 
              onClick={() => addMutation.mutate(newCat)}
              disabled={addMutation.isPending}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifier (Slug)</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {categories?.map((cat: any) => (
              <tr key={cat.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                  <Tags className="w-4 h-4 text-emerald-500" />
                  {cat.name}
                </td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{cat.slug}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="p-2 text-slate-300 hover:text-emerald-600"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-2 text-slate-300 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
