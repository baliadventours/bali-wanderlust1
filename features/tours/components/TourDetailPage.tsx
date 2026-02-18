
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Star, Clock, Users, MapPin, Check, X, 
  MessageCircle, Heart, Share2, Info, ChevronRight,
  Loader2, ArrowLeft, SearchX, CheckCircle, ShieldCheck, RefreshCw, Umbrella
} from 'lucide-react';
import { useTourDetail } from '../hooks/useTourDetail';
import { BookingWidget } from './BookingWidget';
import { InquirySection } from '../../inquiries/components/InquirySection';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../../store/useAppStore';
import { getTranslation } from '../../../utils/currency';

export const TourDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: tour, isLoading, error } = useTourDetail(slug || '');
  const [activeSection, setActiveSection] = useState('overview');
  const { t } = useTranslation();
  const { language } = useAppStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Experience...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-200 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <SearchX className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Tour Not Found</h2>
          <button onClick={() => navigate('/tours')} className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all">
            <ArrowLeft className="w-5 h-5" /> Browse Other Tours
          </button>
        </div>
      </div>
    );
  }

  const title = getTranslation(tour.title, language);
  const description = getTranslation(tour.description, language);
  const destination = getTranslation(tour.destination?.name, language) || 'Bali';

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'included', label: 'Expect' },
    { id: 'info', label: 'Info' }
  ];

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{`${title} | TourSphere`}</title>
      </Helmet>

      {/* Header Info */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-500" />
                <span className="text-slate-900">{tour.avg_rating || '5.0'}</span>
                <span className="text-slate-400 font-medium">({tour.review_count})</span>
                <span className="mx-2 text-slate-200">|</span>
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{destination}</span>
                </div>
                <span className="mx-2 text-slate-200">|</span>
                <div className="flex items-center gap-1 text-slate-500">
                   <Clock className="w-3.5 h-3.5" />
                   <span>4 - 5</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-indigo-600"><Heart className="w-5 h-5" /></button>
                <button className="p-2 text-slate-400 hover:text-indigo-600"><Share2 className="w-5 h-5" /></button>
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900">{title}</h1>
        </div>
      </div>

      {/* Image Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
          <div className="col-span-2 row-span-2 rounded-[2rem] overflow-hidden bg-slate-100">
            <img src={tour.images[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" alt="Main" />
          </div>
          <div className="col-span-1 row-span-1 rounded-[2rem] overflow-hidden bg-slate-100">
            <img src={tour.images[1]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" alt="Gallery 1" />
          </div>
          <div className="col-span-1 row-span-1 rounded-[2rem] overflow-hidden bg-slate-100">
            <img src={tour.images[2]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" alt="Gallery 2" />
          </div>
          <div className="col-span-1 row-span-1 rounded-[2rem] overflow-hidden bg-slate-100">
            <img src={tour.images[3]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" alt="Gallery 3" />
          </div>
          <div className="col-span-1 row-span-1 rounded-[2rem] overflow-hidden bg-slate-100 relative cursor-pointer">
            <img src={tour.images[4] || tour.images[0]} className="w-full h-full object-cover brightness-50" alt="Gallery 4" />
            <div className="absolute inset-0 flex items-center justify-center text-white font-black text-lg">
              +6 more
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 mb-12">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          {sections.map(s => (
            <button 
              key={s.id}
              onClick={() => {
                setActiveSection(s.id);
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`py-6 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${activeSection === s.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-900'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-20">
            {/* Overview Section */}
            <section id="overview" className="scroll-mt-40">
              <h2 className="text-3xl font-black text-slate-900 mb-8">Overview</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-10">{description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="flex gap-4 p-6 bg-slate-50 rounded-3xl">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><RefreshCw className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900">Free cancellation</h4>
                    <p className="text-slate-500 text-sm">Cancel up to 24 hours in advance.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-6 bg-slate-50 rounded-3xl">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Clock className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900">Duration</h4>
                    <p className="text-slate-500 text-sm">4 - 5 hours of adventure.</p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 p-6 rounded-3xl flex items-start gap-4">
                <Umbrella className="w-6 h-6 text-indigo-600 mt-1" />
                <div>
                  <h4 className="font-bold text-indigo-900">Rainy day? No worries!</h4>
                  <p className="text-indigo-700 text-sm">Bad weather? We'll reschedule or give you a full refund. That's our rain-check promise.</p>
                </div>
              </div>
            </section>

            {/* Highlights Section */}
            <section id="highlights" className="scroll-mt-40">
              <h2 className="text-3xl font-black text-slate-900 mb-8">Highlights</h2>
              <ul className="space-y-4">
                {tour.highlights?.map((h, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="font-medium">{h}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Itinerary Section */}
            <section id="itinerary" className="scroll-mt-40">
              <h2 className="text-3xl font-black text-slate-900 mb-8">Itinerary</h2>
              <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {tour.itineraries?.map((item, idx) => (
                  <div key={idx} className="relative pl-12">
                    <div className="absolute left-0 top-0 w-10 h-10 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center font-black text-slate-900 z-10">
                      {item.day_number}
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{getTranslation(item.title, language)}</h4>
                    <p className="text-slate-500 leading-relaxed">{getTranslation(item.description, language)}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* What's Included */}
            <section id="included" className="scroll-mt-40 bg-slate-50 p-10 rounded-[2.5rem]">
              <h2 className="text-3xl font-black text-slate-900 mb-10">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h4 className="font-black text-emerald-600 uppercase tracking-widest text-xs mb-6">Included</h4>
                  <ul className="space-y-4">
                    {tour.inclusions?.map((inc, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700 text-sm font-bold">
                        <Check className="w-4 h-4 text-emerald-500" /> {inc}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-black text-rose-600 uppercase tracking-widest text-xs mb-6">Not included</h4>
                  <ul className="space-y-4">
                    {tour.exclusions?.map((exc, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                        <X className="w-4 h-4 text-rose-400" /> {exc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Inquiries */}
            <InquirySection tourId={tour.id} />
          </div>

          <div className="lg:col-span-1">
             <BookingWidget tour={tour} />
          </div>
        </div>
      </div>
    </div>
  );
};
