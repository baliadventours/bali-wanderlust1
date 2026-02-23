import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Loader2, MapPin, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Tour } from '../../../lib/types';

const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: tours, isLoading } = useQuery({
    queryKey: ['admin-tours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Tour[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tours').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
    }
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Tour Inventory</h1>
          <p className="text-slate-500 font-medium">Manage your expedition catalog and pricing.</p>
        </div>
        <Link 
          to="/admin/tours/create" 
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" /> Create New Tour
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Tour Details</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Price</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tours?.map((tour) => (
              <tr key={tour.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-8">
                  <div className="flex items-center gap-4">
                    <img src={tour.images?.[0]} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                    <div>
                      <div className="font-black text-slate-900 text-lg">{tour.title.en}</div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                        <MapPin className="w-4 h-4" /> {tour.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-8">
                  <div className="flex items-center gap-1 font-black text-slate-900 text-lg">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> {tour.base_price_usd}
                  </div>
                </td>
                <td className="px-8 py-8">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Published
                  </span>
                </td>
                <td className="px-8 py-8 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      to={`/admin/tours/edit/${tour.id}`}
                      className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this tour?')) {
                          deleteMutation.mutate(tour.id);
                        }
                      }}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
