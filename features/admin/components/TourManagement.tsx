
import React from 'react';
import { useTours } from '../../tours/hooks/useTours';
import { Plus, Edit3, Trash2, Eye, MapPin, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TourManagement: React.FC = () => {
  const { data: toursData, isLoading } = useTours({});

  if (isLoading) return <div className="p-8">Loading tours...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Tour Inventory</h1>
          <p className="text-slate-500 text-sm">Create, publish, and manage your adventure catalog.</p>
        </div>
        <Link 
          to="/admin/tours/create"
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Tour
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toursData?.data.map((tour) => (
          <div key={tour.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden group shadow-sm hover:shadow-md transition-all">
            <div className="aspect-[16/9] relative overflow-hidden">
              <img src={tour.images[0]} alt={tour.title?.en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tour.is_published ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                {tour.is_published ? 'Published' : 'Draft'}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-2">
                <MapPin className="w-3 h-3" />
                {tour.destination?.name?.en || 'Worldwide'}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-1">{tour.title?.en}</h3>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <Link 
                    to={`/admin/tours/${tour.id}`}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Link to={`/tours/${tour.slug}`} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600">
                  <Eye className="w-4 h-4" />
                  Preview
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
