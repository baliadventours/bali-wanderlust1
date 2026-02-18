
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Loader2, ListTodo } from 'lucide-react';

export const FactManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newFact, setNewFact] = useState({ name: '', icon: '' });

  const { data: facts, isLoading } = useQuery({
    queryKey: ['admin-facts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tour_facts').select('*').order('name');
      if (error) throw error;
      return data || [{ id: '1', name: 'Duration', icon: 'clock' }];
    }
  });

  const addMutation = useMutation({
    mutationFn: async (fact: any) => {
      const { data, error } = await supabase.from('tour_facts').insert(fact).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-facts'] });
      setIsAdding(false);
      setNewFact({ name: '', icon: '' });
    }
  });

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Attribute Registry</h1>
          <p className="text-slate-500 text-sm">Define global metrics like Duration, Level, or Group Size.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all"><Plus className="w-4 h-4" /> Register Attribute</button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-end gap-4 animate-in slide-in-from-top-2">
          <div className="flex-grow space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attribute Name</label>
            <input className="w-full p-3 bg-slate-50 border rounded-lg outline-none" value={newFact.name} onChange={e => setNewFact({ ...newFact, name: e.target.value })} placeholder="e.g. Difficulty" />
          </div>
          <div className="flex-grow space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Icon Key (Lucide)</label>
            <input className="w-full p-3 bg-slate-50 border rounded-lg outline-none" value={newFact.icon} onChange={e => setNewFact({ ...newFact, icon: e.target.value })} placeholder="e.g. clock" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsAdding(false)} className="p-3 text-slate-400 hover:text-slate-600 font-bold">Cancel</button>
            <button onClick={() => addMutation.mutate(newFact)} disabled={addMutation.isPending} className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50">Create Attribute</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metric Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Icon Key</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {facts?.map((f: any) => (
              <tr key={f.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3"><ListTodo className="w-4 h-4 text-emerald-500" /> {f.name}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{f.icon || 'default'}</td>
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
