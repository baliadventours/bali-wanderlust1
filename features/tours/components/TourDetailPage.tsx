
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, Clock, Users, MapPin, Check, X, 
  MessageCircle, Heart, Share2, Info, ChevronRight 
} from 'lucide-react';
import { useTourDetail } from '../hooks/useTourDetail';
import { BookingWidget } from './BookingWidget';
import { format } from 'date-fns';

export const TourDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: tour, isLoading, error } = useTourDetail(slug || '');
  const [activeTab, setActiveTab] = useState<'itinerary' | 'reviews' | 'faq'>('itinerary');
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/2 mb-4" />
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-video bg-slate-200 rounded-3xl" />
            <div className="h-40 bg-slate-200 rounded-3xl" />
          </div>
          <div className="h-96 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-40 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Tour not found</h1>
        <Link to="/tours" className="text-indigo-600 font-bold hover:underline">Back to all tours</Link>
      </div>
    );
  }

  const title = tour.title?.en || 'Untitled Tour';
  const destination = tour.destination?.name?.en || 'Hidden Gem';
  const duration = Math.round(tour.duration_minutes / 60);

  return (
    <div className="bg-white">
      {/* Hero / Header Section */}
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
                <span className="text-slate-500 font-normal">({tour.review_count} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{destination}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`p-3 rounded-full border transition-all ${isWishlisted ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-600' : ''}`} />
            </button>
            <button className="p-3 rounded-full border border-slate-200 text-slate-600 hover:border-slate-400 bg-white">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 aspect-[21/9] rounded-3xl overflow-hidden">
          <div className="md:col-span-2 h-full">
            <img src={tour.images[0]} alt="Hero" className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:flex flex-col gap-4">
            <img src={tour.images[1] || tour.images[0]} alt="Gallery 2" className="h-1/2 w-full object-cover" />
            <img src={tour.images[2] || tour.images[0]} alt="Gallery 3" className="h-1/2 w-full object-cover" />
          </div>
          <div className="hidden md:block h-full relative">
            <img src={tour.images[3] || tour.images[0]} alt="Gallery 4" className="w-full h-full object-cover" />
            <button className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
              Show all photos
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-8 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</span>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  {duration} Hours
                </div>
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Difficulty</span>
                <div className="flex items-center gap-2 font-bold text-slate-900 uppercase">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  {tour.difficulty}
                </div>
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Group Size</span>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Up to {tour.max_participants}
                </div>
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Language</span>
                <div className="font-bold text-slate-900">English</div>
              </div>
            </div>

            {/* Overview */}
            <section>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Overview</h2>
              <p className="text-slate-600 leading-relaxed text-lg mb-8">
                {tour.description?.en}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" /> What's included
                  </h3>
                  <ul className="space-y-3">
                    {tour.inclusions?.map((item, i) => (
                      <li key={i} className="text-slate-600 flex items-start gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-200 rounded-full mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <X className="w-5 h-5 text-red-500" /> Not included
                  </h3>
                  <ul className="space-y-3">
                    {tour.exclusions?.map((item, i) => (
                      <li key={i} className="text-slate-600 flex items-start gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-red-100 rounded-full mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Tabs (Itinerary, Reviews, FAQ) */}
            <section>
              <div className="flex border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setActiveTab('itinerary')}
                  className={`px-8 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'itinerary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                  Day-by-Day Itinerary
                </button>
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className={`px-8 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'reviews' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                  Guest Reviews ({tour.review_count})
                </button>
              </div>

              {activeTab === 'itinerary' && (
                <div className="space-y-8">
                  {tour.itineraries?.map((day, i) => (
                    <div key={day.id} className="relative pl-12">
                      {i !== tour.itineraries!.length - 1 && (
                        <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-200" />
                      )}
                      <div className="absolute left-0 top-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {day.day_number}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{day.title?.en}</h3>
                      <p className="text-slate-600 leading-relaxed mb-4">{day.description?.en}</p>
                      {day.image_url && (
                        <img src={day.image_url} alt={`Day ${day.day_number}`} className="w-full h-64 object-cover rounded-2xl" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-12 p-8 bg-slate-50 rounded-3xl mb-12">
                    <div className="text-center">
                      <div className="text-5xl font-extrabold text-slate-900 mb-2">{tour.avg_rating || '5.0'}</div>
                      <div className="flex justify-center mb-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                      </div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{tour.review_count} Reviews</div>
                    </div>
                    <div className="flex-grow space-y-2">
                      {[5, 4, 3, 2, 1].map(stars => (
                        <div key={stars} className="flex items-center gap-4 text-sm">
                          <span className="w-4 font-bold text-slate-900">{stars}</span>
                          <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: stars === 5 ? '85%' : stars === 4 ? '12%' : '1%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-8 divide-y divide-slate-100">
                    {tour.reviews?.map(rev => (
                      <div key={rev.id} className="pt-8 first:pt-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                            {rev.profiles?.avatar_url ? (
                              <img src={rev.profiles.avatar_url} alt={rev.profiles.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                {rev.profiles?.full_name?.charAt(0) || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{rev.profiles?.full_name}</div>
                            <div className="text-xs text-slate-500">{format(new Date(rev.created_at), 'MMM d, yyyy')}</div>
                          </div>
                          <div className="ml-auto flex">
                            {[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Inquiry Form */}
            <section className="p-8 bg-indigo-900 rounded-3xl text-white">
              <div className="flex items-start gap-6 mb-8">
                <div className="p-4 bg-white/10 rounded-2xl">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Have questions about this tour?</h2>
                  <p className="text-indigo-200">Our local experts are ready to help you plan the perfect trip.</p>
                </div>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Your Name" className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 placeholder:text-indigo-200 outline-none focus:bg-white/20" />
                <input type="email" placeholder="Email Address" className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 placeholder:text-indigo-200 outline-none focus:bg-white/20" />
                <textarea placeholder="Your Message" className="md:col-span-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 placeholder:text-indigo-200 h-32 outline-none focus:bg-white/20" />
                <button className="md:col-span-2 bg-white text-indigo-900 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                  Send Inquiry
                </button>
              </form>
            </section>
          </div>

          {/* Sidebar Booking Widget */}
          <div className="lg:col-span-1">
            <BookingWidget tour={tour} />
            
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-500" /> Cancellation Policy
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Free cancellation up to 48 hours before the start time. After that, 50% refund for cancellations up to 24 hours before start. No refunds within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
