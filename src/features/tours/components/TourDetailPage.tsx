import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTour } from '../../tours/hooks/useTours';
import { Loader2, MapPin, Clock, Users, Star, ArrowLeft, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getTranslation } from '../../../lib/utils';

export const TourDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: tourData, isLoading } = useTour(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const tour = tourData?.data?.tour;

  if (!tour) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Tour not found</h2>
        <Link to="/tours" className="text-emerald-600 font-bold flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to Expeditions
        </Link>
      </div>
    );
  }

  const images = Array.isArray(tour.images) ? tour.images : tour.images?.split(',') || [];
  const startDates = Array.isArray(tour.start_dates) ? tour.start_dates : tour.start_dates?.split(',') || [];

  return (
    <div className="bg-white pb-20">
      {/* Hero Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 h-[60vh] gap-2 p-2">
        <div className="h-full rounded-2xl overflow-hidden">
          <img src={images[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200'} className="w-full h-full object-cover" alt={getTranslation(tour.title)} />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2 h-full">
          <div className="rounded-2xl overflow-hidden">
            <img src={images[1] || 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover" alt={getTranslation(tour.title)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl overflow-hidden">
              <img src={images[2] || 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=600'} className="w-full h-full object-cover" alt={tour.title} />
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center text-white font-black text-xl">
              + {images.length - 3 > 0 ? images.length - 3 : 0} Photos
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">{tour.difficulty}</span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-black">{tour.ratings_average}</span>
                <span className="text-slate-400 text-xs font-bold">({tour.ratings_quantity} reviews)</span>
              </div>
            </div>
            <h1 className="text-5xl font-black text-slate-900 mb-6 leading-tight">{getTranslation(tour.title)}</h1>
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</div>
                  <div className="font-bold text-slate-900">{tour.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</div>
                  <div className="font-bold text-slate-900">{tour.duration} Days</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Group Size</div>
                  <div className="font-bold text-slate-900">{tour.max_group_size} People</div>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-black text-slate-900 mb-4">About this expedition</h2>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              {getTranslation(tour.description)}
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">What's included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Professional local guides',
                'All transportation during the tour',
                'Premium accommodation',
                'Most meals and snacks',
                'Specialized equipment',
                'National park entrance fees'
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-slate-600 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price per person</div>
                <div className="text-4xl font-black text-slate-900">${tour.price}</div>
              </div>
              <div className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-lg">Best Value</div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Select Date</label>
              <div className="grid grid-cols-1 gap-2">
                {startDates.map((date: string) => (
                  <button key={date} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                        <span className="font-bold text-slate-700 group-hover:text-emerald-900">{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-emerald-500"></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Link 
              to={`/checkout?tourId=${tour.id}`} 
              className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg"
            >
              Book Expedition
            </Link>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                <Clock className="w-5 h-5 text-emerald-500" />
                <span>Free cancellation up to 30 days before</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
