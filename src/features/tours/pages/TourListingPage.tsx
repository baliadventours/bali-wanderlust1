import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTours } from '../api';
import Container from '../../../components/Container';

const TourListingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data, isLoading, error } = useQuery({
    queryKey: ['tours', page],
    queryFn: () => getTours(page, limit)
  });

  const tours = data?.data;
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-black text-red-600">{t('common.error')}</h2>
        <p className="text-slate-500 font-medium">{t('common.retry_message') || 'Please try again later.'}</p>
        <button onClick={() => window.location.reload()} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold">{t('common.retry')}</button>
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">No expeditions found</h2>
        <p className="text-slate-500 font-medium">Check back later for new adventures.</p>
        <Link to="/" className="text-emerald-600 font-bold hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <div className="bg-white border-b border-slate-100 py-20">
        <Container>
          <h1 className="text-5xl font-black text-slate-900 mb-4">{t('common.tours')}</h1>
          <p className="text-slate-500 text-xl font-medium max-w-2xl">
            {t('home.hero_subtitle')}
          </p>
        </Container>
      </div>

      <Container className="mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {tours?.map((tour) => {
            const primaryImage = tour.tour_images.find(img => img.is_primary)?.url || tour.tour_images[0]?.url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800';
            const title = i18n.language === 'id' ? tour.title_id : tour.title_en;
            
            return (
              <Link 
                key={tour.id} 
                to={`/tours/${tour.slug}`}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={primaryImage} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={title}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    {tour.difficulty}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl text-white font-black">
                    ${tour.base_price_usd}
                  </div>
                </div>
                
                <div className="p-8 flex-grow space-y-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-black">4.9</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {title}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold">{Math.round(tour.duration_minutes / 1440)} Days</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold">Up to {tour.max_participants}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-20 flex justify-center items-center gap-4">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-4 rounded-2xl bg-white border border-slate-100 disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="font-black text-slate-900">
              {page} / {totalPages}
            </span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-4 rounded-2xl bg-white border border-slate-100 disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default TourListingPage;
