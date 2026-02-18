
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Users, MapPin } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Tour } from '../types';
import { getTranslation, useFormattedPrice } from '../../../utils/currency';
import { useAppStore } from '../../../store/useAppStore';
import { useTranslation } from 'react-i18next';

interface TourCardProps {
  tour: Tour;
}

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const { language } = useAppStore();
  const { t } = useTranslation();
  const formatPrice = useFormattedPrice();
  
  const title = getTranslation(tour.title, language);
  const destination = getTranslation(tour.destination?.name, language) || 'Global';
  const duration = Math.round(tour.duration_minutes / 60);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow duration-300 group">
      <Link to={`/tours/${tour.slug}`} className="block relative aspect-[4/3] overflow-hidden">
        <LazyLoadImage 
          src={tour.images?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=600'} 
          alt={title}
          effect="blur"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          wrapperClassName="w-full h-full block"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
          {tour.difficulty.toUpperCase()}
        </div>
      </Link>
      
      <div className="p-5">
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
          <MapPin className="w-3 h-3" />
          <span>{destination}</span>
        </div>
        
        <Link to={`/tours/${tour.slug}`}>
          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>{duration}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>Max {tour.max_participants}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-bold text-slate-900">{tour.avg_rating || 5.0}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <span className="text-sm text-slate-500 italic">{t('common.from')}</span>
            <div className="text-xl font-extrabold text-indigo-600">{formatPrice(tour.base_price_usd)}</div>
          </div>
          <Link 
            to={`/tours/${tour.slug}`}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-600 transition-colors"
          >
            {t('common.details')}
          </Link>
        </div>
      </div>
    </div>
  );
};
