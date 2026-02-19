
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { useTours, useTourMetaData } from '../hooks/useTours';
import { TourCard } from './TourCard';
import { TourFilters } from '../types';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../../store/useAppStore';
import { getTranslation } from '../../../utils/currency';

export const TourListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { data: metaData } = useTourMetaData();
  const { t } = useTranslation();
  const { language } = useAppStore();

  const filters: TourFilters = {
    keyword: searchParams.get('q') || '',
    destinationId: searchParams.get('destination') || '',
    tourTypeId: searchParams.get('type') || '',
    minPrice: Number(searchParams.get('minPrice')) || undefined,
    maxPrice: Number(searchParams.get('maxPrice')) || undefined,
    sortBy: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  };

  const { data, isLoading } = useTours(filters);

  const updateParams = useCallback((newParams: Record<string, string | number | undefined | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });
    if (!newParams.page) nextParams.set('page', '1');
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

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
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder={t('common.search')}
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
          {t('common.filters')}
        </button>
        <div className="hidden md:block min-w-[200px]">
          <select 
            className="w-full py-4 px-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
            value={filters.sortBy}
            onChange={(e) => updateParams({ sort: e.target.value })}
          >
            <option value="newest">{t('common.newest')}</option>
            <option value="price_low">{t('common.price_low')}</option>
            <option value="price_high">{t('common.price_high')}</option>
            <option value="best_selling">{t('common.popularity')}</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">{t('common.destinations')}</h3>
            <div className="space-y-2">
              <button 
                onClick={() => updateParams({ destination: '' })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!filters.destinationId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {t('common.all_destinations')}
              </button>
              {/* Fix: Added optional chaining to prevent runtime errors when metaData is loading */}
              {metaData?.destinations?.map((dest: any) => (
                <button 
                  key={dest.id}
                  onClick={() => updateParams({ destination: dest.id })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filters.destinationId === dest.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {getTranslation(dest.name, language)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">{t('common.price_range')}</h3>
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
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">{t('common.experience_type')}</h3>
            <div className="space-y-2">
              <button 
                onClick={() => updateParams({ type: '' })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!filters.tourTypeId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {t('common.all_types')}
              </button>
              {/* Fix: Added optional chaining to resolve Property 'tourTypes' does not exist error and handle potential undefined loading state */}
              {metaData?.tourTypes?.map((type: any) => (
                <button 
                  key={type.id}
                  onClick={() => updateParams({ type: type.id })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filters.tourTypeId === type.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {getTranslation(type.name, language)}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-grow">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                  <div className="aspect-[4/3] bg-slate-100 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-2/3 mb-2" />
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
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
