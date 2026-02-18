
import React, { useState } from 'react';
import { useTours } from '../../tours/hooks/useTours';
import { Plus, Edit3, Trash2, Eye, MapPin, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TourManagement: React.FC = () => {
  const { data: toursData, isLoading } = useTours({});
  const [search, setSearch] = useState('');

  const filtered = toursData?.data.filter(t => 
    t.title.en.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="p-8">Loading tours...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Inventory</h1>
          <p className="text-slate-500 text-sm">Manage your global expedition catalog.</p>
        </div>
        <Link 
          to="/admin/tours/create"
          className="bg-slate-900 text-white px-6 py-3 rounded-[10px] font-bold text-sm hover:bg-emerald-600 transition-all shadow-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Tour
        </Link>
      </div>

      <div className="bg-white p-4 rounded-[10px] border border-slate-200 flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by tour name..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-[10px] text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-[10px] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
          <Filter className="w-3 h-3" /> All Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered?.map((tour) => (
          <div key={tour.id} className="bg-white rounded-[10px] border border-slate-200 overflow-hidden group hover:border-emerald-200 transition-all">
            <div className="aspect-video relative overflow-hidden bg-slate-100">
              <img src={tour.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={tour.title.en} />
              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${tour.is_published ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                {tour.is_published ? 'Live' : 'Draft'}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                <MapPin className="w-3 h-3" /> {(tour.destination?.name as Record<string, string>)?.en || 'Global'}
              </div>
              <h3 className="text-md font-bold text-slate-900 mb-4 line-clamp-1">{tour.title.en}</h3>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="text-xs font-black text-slate-900">${tour.base_price_usd}</div>
                <div className="flex gap-2">
                  <Link to={`/admin/tours/${tour.id}`} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all">
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
