
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Star, Clock, Users, MapPin, Check, X, 
  MessageCircle, Heart, Share2, Info, ChevronRight 
} from 'lucide-react';
import { useTourDetail } from '../hooks/useTourDetail';
import { BookingWidget } from './BookingWidget';
import { InquirySection } from '../../inquiries/components/InquirySection';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../../store/useAppStore';
import { getTranslation, useFormattedPrice } from '../../../utils/currency';

export const TourDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: tour, isLoading, error } = useTourDetail(slug || '');
  const [activeTab, setActiveTab] = useState<'itinerary' | 'reviews' | 'faq'>('itinerary');
  const { t } = useTranslation();
  const { language } = useAppStore();

  if (isLoading) return <div className="p-20 text-center">Loading...</div>;
  if (error || !tour) return <div className="p-20 text-center">Not found</div>;

  const title = getTranslation(tour.title, language);
  const description = getTranslation(tour.description, language);
  const destination = getTranslation(tour.destination?.name, language) || 'Global';
  const duration = Math.round(tour.duration_minutes / 60);

  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Tour",
    "name": title,
    "description": description,
    "image": tour.images,
    "tourDuration": `PT${duration}H`,
    "offers": {
      "@type": "Offer",
      "price": tour.base_price_usd,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "itinerary": tour.itineraries?.map(day => ({
      "@type": "HowToStep",
      "name": getTranslation(day.title, language),
      "text": getTranslation(day.description, language)
    }))
  };

  return (
    <div className="bg-white">
      <Helmet>
        <title>{`${title} | TourSphere Adventures`}</title>
        <meta name="description" content={description.slice(0, 160)} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description.slice(0, 160)} />
        <meta property="og:image" content={tour.images[0]} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link to="/tours" className="hover:text-indigo-600">Tours</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900">{title}</span>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3">{title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                <span className="font-bold text-slate-900">{tour.avg_rating || '5.0'}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{destination}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="aspect-[21/9] rounded-3xl overflow-hidden bg-slate-100">
          <img 
            src={tour.images[0]} 
            alt={title} 
            className="w-full h-full object-cover" 
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Overview</h2>
              <p className="text-slate-600 leading-relaxed text-lg mb-8">
                {description}
              </p>
              
              {/* Inquiry Section placed below description */}
              <div className="mt-12">
                <InquirySection tourId={tour.id} />
              </div>
            </section>

            <section>
              <div className="flex border-b border-slate-200 mb-8">
                <button 
                  onClick={() => setActiveTab('itinerary')}
                  className={`px-8 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'itinerary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                  Itinerary
                </button>
              </div>

              {activeTab === 'itinerary' && (
                <div className="space-y-8">
                  {tour.itineraries && tour.itineraries.length > 0 ? (
                    tour.itineraries.map((day) => (
                      <div key={day.id} className="relative pl-12">
                        <div className="absolute left-0 top-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {day.day_number}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{getTranslation(day.title, language)}</h3>
                        <p className="text-slate-600 leading-relaxed mb-4">{getTranslation(day.description, language)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No itinerary details available for this tour yet.</p>
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            <BookingWidget tour={tour} />
          </div>
        </div>
      </div>
    </div>
  );
};
