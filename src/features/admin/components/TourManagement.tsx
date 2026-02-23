import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, MapPin, Clock, Users, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Tour {
  id: string;
  title: string;
  price: number;
  duration: number;
  location: string;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
}

export const TourManagement: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: toursData, isLoading, error } = useQuery({
    queryKey: ['admin-tours'],
    queryFn: async () => {
      const response = await fetch('/api/tours');
      if (!response.ok) throw new Error('Failed to fetch tours');
      return response.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tours/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete tour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
    }
  });

  const tours = toursData?.data?.tours || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-center gap-4 text-red-700">
        <AlertCircle className="w-6 h-6" />
        <p className="font-bold">Error loading tours. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Tour Inventory</h1>
          <p className="text-slate-500 font-medium">Manage your expedition catalog and pricing.</p>
        </div>
        <Link 
          to="/admin/tours/create" 
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" /> Create New Tour
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tour Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Location & Duration</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Capacity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tours.map((tour: Tour) => (
                <tr key={tour.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-6">
                    <div className="font-black text-slate-900 mb-1">{tour.title}</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                        tour.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                        tour.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {tour.difficulty}
                      </span>
                      <span className="text-xs font-bold text-slate-400">Rating: {tour.ratingsAverage}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm mb-1">
                      <MapPin className="w-4 h-4 text-emerald-600" /> {tour.location}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
                      <Clock className="w-4 h-4" /> {tour.duration} Days
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                      <Users className="w-4 h-4 text-emerald-600" /> Max {tour.maxGroupSize}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-lg font-black text-slate-900">${tour.price}</div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/admin/tours/${tour.id}`}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this tour?')) {
                            deleteMutation.mutate(tour.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
        
        {tours.length === 0 && (
          <div className="p-20 text-center">
            <div className="text-slate-300 font-black text-2xl mb-2">No tours found</div>
            <p className="text-slate-400 font-medium mb-8">Start by creating your first expedition.</p>
            <Link 
              to="/admin/tours/create" 
              className="inline-flex bg-emerald-600 text-white px-8 py-4 rounded-xl font-black hover:bg-emerald-700 transition-all shadow-lg"
            >
              Add Tour
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
