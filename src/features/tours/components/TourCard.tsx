import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, ArrowRight } from 'lucide-react';
import { Tour } from '../hooks/useTours';
import { getTranslation } from '../../../lib/utils';

interface TourCardProps {
  tour: Tour;
}

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const firstImage = (Array.isArray(tour.images) ? tour.images[0] : (tour.images as string)?.split(',')[0]) || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={firstImage} 
          alt={getTranslation(tour.title)} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest text-emerald-600">
          {tour.difficulty}
        </div>
        <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl text-white font-black">
          ${tour.price}
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center gap-1 text-amber-500 mb-3">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-black">{tour.ratings_average}</span>
          <span className="text-slate-400 text-xs font-bold">({tour.ratings_quantity})</span>
        </div>
        
        <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
          {getTranslation(tour.title)}
        </h3>
        
        <p className="text-slate-500 font-medium text-sm line-clamp-2 mb-6 flex-grow">
          {getTranslation(tour.description)}
        </p>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-8">
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold truncate">{tour.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold">{tour.duration} Days</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold">Up to {tour.max_group_size}</span>
          </div>
        </div>
        
        <Link 
          to={`/tours/${tour.id}`} 
          className="w-full bg-slate-50 text-slate-900 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 group-hover:bg-emerald-600 group-hover:text-white transition-all"
        >
          Explore Details <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
