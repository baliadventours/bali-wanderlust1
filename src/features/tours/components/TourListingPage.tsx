import React, { useState } from 'react';
import { useTours } from '../hooks/useTours';
import { TourCard } from './TourCard';
import { Loader2, Search, Filter } from 'lucide-react';
import { getTranslation } from '../../../lib/utils';

export const TourListingPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: toursData, isLoading } = useTours({});

  const filteredTours = toursData?.data?.tours?.filter((tour: any) => 
    getTranslation(tour.title).toLowerCase().includes(search.toLowerCase()) ||
    tour.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-black text-slate-900 mb-4">Expeditions</h1>
          <p className="text-slate-500 text-xl font-medium max-w-2xl">Discover our hand-crafted journeys designed for the curious and the brave.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by destination or tour name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500 font-bold transition-all"
            />
          </div>
          <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
            <Filter className="w-5 h-5" /> Filters
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        {isLoading ? (
          <div className="py-40 flex justify-center">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours?.map((tour: any) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
            {filteredTours?.length === 0 && (
              <div className="col-span-full py-40 text-center">
                <div className="text-slate-300 font-black text-2xl mb-2">No expeditions found</div>
                <p className="text-slate-400 font-medium">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
