
import React, { useState } from 'react';
import { useTours } from '../../tours/hooks/useTours';
import { Plus, Edit3, Trash2, MapPin, Search, Copy, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCloneTour } from '../hooks/useTourMutation';
import { useFormattedPrice } from '../../../utils/currency';

export const TourManagement: React.FC = () => {
  const { data: toursData, isLoading } = useTours({});
  const cloneTour = useCloneTour();
  const [search, setSearch] = useState('');
  const formatPrice = useFormattedPrice();

  const getTitle = (title: any) => {
    if (!title) return 'Untitled Tour';
    if (typeof title === 'string') return title;
    return title.en || title.es || 'Untitled';
  };

  const getDest = (tour: any) => {
    const destName = tour.destination?.name;
    if (!destName) return 'Global';
    if (typeof destName === 'string') return destName;
    return destName.en || destName.es || 'Global';
  };

  const handleClone = async (id: string) => {
    if (window.confirm('Duplicate this tour as a new draft?')) {
      try {
        await cloneTour.mutateAsync(id);
      } catch (err) {
        alert('Cloning failed. Please check your permissions.');
      }
    }
  };

  const filtered = toursData?.data.filter(t => 
    getTitle(t.title).toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="p-10 text-center"><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Inventory...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Inventory</h1>
          <p className="text-slate-500 text-sm">Manage and scale your global catalog.</p>
        </div>
        <Link 
          to="/admin/tours/create"
          className="bg-slate-900 text-white px-6 py-3 rounded-[10px] font-bold text-sm hover:bg-emerald-600 transition-all shadow-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Expedition
        </Link>
      </div>

      <div className="bg-white p-4 rounded-[10px] border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter tours..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-[10px] text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered?.map((tour) => (
          <div key={tour.id} className="bg-white rounded-[10px] border border-slate-200 overflow-hidden group hover:border-emerald-200 transition-all">
            <div className="aspect-video relative overflow-hidden bg-slate-100">
              <img src={tour.images?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Tour" />
              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${tour.status === 'published' ? 'bg-emerald-50 text-white' : 'bg-slate-400 text-white'}`}>
                {tour.status?.toUpperCase() || 'DRAFT'}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                <MapPin className="w-3 h-3" /> {getDest(tour)}
              </div>
              <h3 className="text-md font-bold text-slate-900 mb-4 line-clamp-1">{getTitle(tour.title)}</h3>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="text-xs font-black text-slate-900">{formatPrice(tour.base_price_usd)}</div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleClone(tour.id)}
                    disabled={cloneTour.isPending}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                    title="Clone Product"
                  >
                    {cloneTour.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  </button>
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
