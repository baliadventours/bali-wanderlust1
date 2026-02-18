
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { useTours, useTourMetaData } from '../hooks/useTours';
import { TourCard } from './TourCard';
import { TourFilters } from '../types';

export const TourListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { data: metaData } = useTourMetaData();

  // Extract filters from URL
  const filters: TourFilters = {
    keyword: searchParams.get('q') || '',
    destinationId: searchParams.get('destination') || '',
    tourTypeId: searchParams.get('type') || '',
    minPrice: Number(searchParams.get('minPrice')) || undefined,
    maxPrice: Number(searchParams.get('maxPrice')) || undefined,
    sortBy: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  };

  const { data, isLoading, isPlaceholderData } = useTours(filters);

  // Update URL params helper
  const updateParams = useCallback((newParams: Record<string, string | number | undefined | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });
    // Reset to page 1 if any filter other than page changes
    if (!newParams.page) nextParams.set('page', '1');
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  // Debounced search handler
  const [searchTerm, setSearchTerm] = useState(filters.keyword);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.keyword) {
        updateParams({ q: searchTerm });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, updateParams, filters.keyword]);

  const totalPages = Math.ceil((data?.count || 0) / 9);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search & Mobile Filter Toggle */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search tours, adventures, experiences..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsMobileFiltersOpen(true)}
          className="md:hidden flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-4 rounded-2xl font-bold text-slate-700 shadow-sm"
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </button>
        <div className="hidden md:block min-w-[200px]">
          <select 
            className="w-full py-4 px-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
            value={filters.sortBy}
            onChange={(e) => updateParams({ sort: e.target.value })}
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="best_selling">Popularity</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Destinations</h3>
            <div className="space-y-2">
              <button 
                onClick={() => updateParams({ destination: '' })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!filters.destinationId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                All Destinations
              </button>
              {metaData?.destinations.map((dest: any) => (
                <button 
                  key={dest.id}
                  onClick={() => updateParams({ destination: dest.id })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filters.destinationId === dest.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {dest.name?.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Price Range</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  className="w-1/2 p-2 text-sm border border-slate-200 rounded-lg"
                  value={filters.minPrice || ''}
                  onChange={(e) => updateParams({ minPrice: e.target.value })}
                />
                <input 
                  type="number" 
                  placeholder="Max" 
                  className="w-1/2 p-2 text-sm border border-slate-200 rounded-lg"
                  value={filters.maxPrice || ''}
                  onChange={(e) => updateParams({ maxPrice: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Experience Type</h3>
            <div className="space-y-2">
              <button 
                onClick={() => updateParams({ type: '' })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!filters.tourTypeId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                All Types
              </button>
              {metaData?.tourTypes.map((type: any) => (
                <button 
                  key={type.id}
                  onClick={() => updateParams({ type: type.id })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filters.tourTypeId === type.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {type.name?.en}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Tour Grid */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                  <div className="aspect-[4/3] bg-slate-100 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
                  <div className="h-10 bg-slate-100 rounded-lg" />
                </div>
              ))}
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.data.map(tour => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button 
                    disabled={filters.page === 1}
                    onClick={() => updateParams({ page: (filters.page || 1) - 1 })}
                    className="p-2 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => updateParams({ page: i + 1 })}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${filters.page === i + 1 ? 'bg-indigo-600 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    disabled={filters.page === totalPages}
                    onClick={() => updateParams({ page: (filters.page || 1) + 1 })}
                    className="p-2 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No tours found</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
              <button 
                onClick={() => setSearchParams({})}
                className="text-indigo-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Filters</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              {/* Reuse sidebar logic here or extract to component */}
              <div>
                <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">Sort By</h3>
                <select 
                  className="w-full p-3 border border-slate-200 rounded-xl"
                  value={filters.sortBy}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="best_selling">Popularity</option>
                </select>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">Destination</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => updateParams({ destination: '' })} className={`p-2 text-xs rounded-lg border ${!filters.destinationId ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200'}`}>All</button>
                  {metaData?.destinations.map((dest: any) => (
                    <button key={dest.id} onClick={() => updateParams({ destination: dest.id })} className={`p-2 text-xs rounded-lg border ${filters.destinationId === dest.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200'}`}>{dest.name?.en}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100">
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition-colors"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
