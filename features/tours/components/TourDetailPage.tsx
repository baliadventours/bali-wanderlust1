
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Star, Clock, MapPin, Check, X, 
  Heart, Share2, Info, ChevronRight,
  Loader2, ArrowLeft, SearchX, CheckCircle, ShieldCheck, RefreshCw, Umbrella, MessageCircle
} from 'lucide-react';
import { useTourDetail } from '../hooks/useTourDetail';
import { BookingWidget } from './BookingWidget';
import { InquirySection } from '../../inquiries/components/InquirySection';
import { useAppStore } from '../../../store/useAppStore';
import { getTranslation } from '../../../utils/currency';

export const TourDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: tour, isLoading, error } = useTourDetail(slug || '');
  const [activeSection, setActiveSection] = useState('overview');
  const { language } = useAppStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Preparing Adventure...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-12 rounded-[10px] shadow-xl border border-slate-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-slate-50 rounded-[10px] flex items-center justify-center mx-auto mb-6 text-slate-300">
            <SearchX className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Tour Not Found</h2>
          <button onClick={() => navigate('/tours')} className="mt-8 w-full bg-slate-900 text-white py-3 rounded-[10px] font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all">
            <ArrowLeft className="w-4 h-4" /> Browse Other Tours
          </button>
        </div>
      </div>
    );
  }

  const title = getTranslation(tour.title, language);
  const description = getTranslation(tour.description, language);
  const destination = getTranslation(tour.destination?.name as Record<string, string>, language) || 'Ubud, Bali';

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'expect', label: 'Expect' },
    { id: 'included', label: 'Included' },
    { id: 'info', label: 'Info' }
  ];

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{`${title} | TourSphere`}</title>
      </Helmet>

      {/* Breadcrumb & Title */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                  <Star className="w-4 h-4 fill-emerald-600" />
                  <span>{tour.avg_rating || '5.0'}</span>
                  <span className="text-slate-400 font-medium">({tour.review_count || 0})</span>
                </div>
                <span className="text-slate-200">|</span>
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-4 h-4" />
                  <span>{destination}</span>
                </div>
                <span className="text-slate-200">|</span>
                <div className="flex items-center gap-1 text-slate-500">
                   <Clock className="w-4 h-4" />
                   <span>{Math.round(tour.duration_minutes / 60)}h</span>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><Heart className="w-5 h-5" /></button>
                <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"><Share2 className="w-5 h-5" /></button>
             </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Grid - 10px radius */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[450px]">
          <div className="col-span-2 row-span-2 rounded-[10px] overflow-hidden bg-slate-100">
            <img src={tour.images?.[0]} className="w-full h-full object-cover" alt="Main" />
          </div>
          <div className="col-span-1 row-span-1 rounded-[10px] overflow-hidden bg-slate-100">
            <img src={tour.images?.[1] || tour.images?.[0]} className="w-full h-full object-cover" alt="G1" />
          </div>
          <div className="col-span-1 row-span-1 rounded-[10px] overflow-hidden bg-slate-100">
            <img src={tour.images?.[2] || tour.images?.[0]} className="w-full h-full object-cover" alt="G2" />
          </div>
          <div className="col-span-1 row-span-1 rounded-[10px] overflow-hidden bg-slate-100">
            <img src={tour.images?.[3] || tour.images?.[0]} className="w-full h-full object-cover" alt="G3" />
          </div>
          <div className="col-span-1 row-span-1 rounded-[10px] overflow-hidden bg-slate-100 relative group cursor-pointer">
            <img src={tour.images?.[0]} className="w-full h-full object-cover brightness-50" alt="G4" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-lg font-bold">+{Math.max(0, (tour.images?.length || 0) - 4)}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest">More photos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-20 z-40 bg-white border-b border-slate-100 mb-10">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto no-scrollbar">
          {sections.map(s => (
            <button 
              key={s.id}
              onClick={() => {
                setActiveSection(s.id);
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`py-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${activeSection === s.id ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-900'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            <section id="overview" className="scroll-mt-40">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Overview</h2>
              <p className="text-slate-600 leading-relaxed mb-8">{description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex gap-4 p-5 bg-slate-50 rounded-[10px]">
                  <RefreshCw className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Free cancellation</h4>
                    <p className="text-slate-500 text-xs">Cancel up to 24 hours in advance.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 bg-slate-50 rounded-[10px]">
                  <Clock className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Duration</h4>
                    <p className="text-slate-500 text-xs">{Math.round(tour.duration_minutes / 60)} hours of activity.</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-[10px] border border-emerald-100 flex items-start gap-4">
                <Umbrella className="w-5 h-5 text-emerald-600 mt-1" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-900">Rainy day? No worries!</h4>
                  <p className="text-emerald-700 text-xs">Bad weather? We'll reschedule or refund. That's our promise.</p>
                </div>
              </div>
            </section>

            <section id="highlights" className="scroll-mt-40">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Highlights</h2>
              <ul className="grid grid-cols-1 gap-4">
                {tour.highlights?.map((h: any, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{typeof h === 'string' ? h : h.content}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section id="itinerary" className="scroll-mt-40">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Itinerary</h2>
              <div className="space-y-6">
                {tour.itineraries?.map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-900 border border-slate-200">
                        {item.day_number}
                      </div>
                      <div className="w-px h-full bg-slate-100 mt-2" />
                    </div>
                    <div className="pb-8">
                      <h4 className="font-bold text-slate-900 mb-2">{getTranslation(item.title as Record<string, string>, language)}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{getTranslation(item.description as Record<string, string>, language)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="included" className="scroll-mt-40 border-t border-slate-100 pt-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Included</h4>
                  <ul className="space-y-3">
                    {tour.inclusions?.map((inc: any, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                        <Check className="w-4 h-4 text-emerald-500" /> {typeof inc === 'string' ? inc : inc.content}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Not included</h4>
                  <ul className="space-y-3">
                    {tour.exclusions?.map((exc: any, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                        <X className="w-4 h-4 text-rose-400" /> {typeof exc === 'string' ? exc : exc.content}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Help/Inquiry Footer */}
            <div className="bg-slate-900 text-white p-8 rounded-[10px] flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Got questions? We're here to help.</h3>
                <p className="text-slate-400 text-sm">Our travel experts are ready to assist you.</p>
              </div>
              <button className="bg-white text-slate-900 px-6 py-3 rounded-[10px] font-bold text-sm flex items-center gap-2 hover:bg-emerald-50 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Chat with us
              </button>
            </div>

            <InquirySection tourId={tour.id} />
          </div>

          {/* Sticky Widget */}
          <div className="lg:col-span-1">
             <BookingWidget tour={tour} />
          </div>
        </div>
      </div>
    </div>
  );
};
