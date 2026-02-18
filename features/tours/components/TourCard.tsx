
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Users, MapPin } from 'lucide-react';
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
    <div className="bg-white rounded-[10px] overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow duration-300 group">
      <Link to={`/tours/${tour.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img 
          src={tour.images?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=600'} 
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-[10px] text-[10px] font-bold text-emerald-600 shadow-sm uppercase tracking-wider">
          {tour.difficulty.toUpperCase()}
        </div>
      </Link>
      
      <div className="p-5">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
          <MapPin className="w-3 h-3" />
          <span>{destination}</span>
        </div>
        
        <Link to={`/tours/${tour.slug}`}>
          <h3 className="text-md font-bold text-slate-900 mb-3 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-4 text-xs text-slate-600 mb-5">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{duration}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span>Max {tour.max_participants}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto font-bold text-slate-900">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{tour.avg_rating || 5.0}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('common.from')}</span>
            <div className="text-lg font-bold text-emerald-600">{formatPrice(tour.base_price_usd)}</div>
          </div>
          <Link 
            to={`/tours/${tour.slug}`}
            className="bg-slate-900 text-white px-4 py-2 rounded-[10px] text-xs font-bold hover:bg-emerald-600 transition-colors"
          >
            {t('common.details')}
          </Link>
        </div>
      </div>
    </div>
  );
};
