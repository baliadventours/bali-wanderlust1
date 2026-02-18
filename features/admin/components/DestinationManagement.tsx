
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Edit2, Loader2, Globe } from 'lucide-react';

export const DestinationManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newDest, setNewDest] = useState({ name: '', slug: '' });

  const { data: destinations, isLoading } = useQuery({
    queryKey: ['admin-destinations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('destinations').select('*').order('name');
      if (error) throw error;
      return data || [{ id: '1', name: 'Bali', slug: 'bali' }];
    }
  });

  const addMutation = useMutation({
    mutationFn: async (dest: any) => {
      const { data, error } = await supabase.from('destinations').insert(dest).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-destinations'] });
      setIsAdding(false);
      setNewDest({ name: '', slug: '' });
    }
  });

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Global Destinations</h1>
          <p className="text-slate-500 text-sm">Organize expeditions by geographical hubs.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all"><Plus className="w-4 h-4" /> New Hub</button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-end gap-4 animate-in slide-in-from-top-2">
          <div className="flex-grow space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hub Name</label>
            <input className="w-full p-3 bg-slate-50 border rounded-lg outline-none" value={newDest.name} onChange={e => setNewDest({ ...newDest, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} />
          </div>
          <div className="flex-grow space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slug</label>
            <input className="w-full p-3 bg-slate-50 border rounded-lg outline-none" value={newDest.slug} onChange={e => setNewDest({ ...newDest, slug: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsAdding(false)} className="p-3 text-slate-400 hover:text-slate-600 font-bold">Cancel</button>
            <button onClick={() => addMutation.mutate(newDest)} disabled={addMutation.isPending} className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50">Save Hub</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination Hub</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifier</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {destinations?.map((d: any) => (
              <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3"><Globe className="w-4 h-4 text-emerald-500" /> {d.name}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{d.slug}</td>
                <td className="px-6 py-4 text-right space-x-2">
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
