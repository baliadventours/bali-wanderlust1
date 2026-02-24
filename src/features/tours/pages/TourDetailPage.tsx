import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Users, Star, Loader2, ShieldCheck, CheckCircle2, Calendar } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabase';
import { getTourBySlug } from '../api';
import { calculateBookingPrice } from '../../../services/pricingService';
import Container from '../../../components/Container';

const TourDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [participants, setParticipants] = useState([
    { type: 'adult' as const, count: 1 },
    { type: 'child' as const, count: 0 }
  ]);

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour', slug],
    queryFn: () => getTourBySlug(slug!)
  });

  const { data: priceData } = useQuery({
    queryKey: ['price', tour?.id, selectedDate, participants],
    queryFn: () => calculateBookingPrice(tour!.id, selectedDate, participants),
    enabled: !!tour && !!selectedDate
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!tour) return <div className="p-20 text-center font-black text-2xl">Tour not found</div>;

  const images = tour.tour_images.map(img => img.url);
  const primaryImage = images[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800';
  const title = i18n.language === 'id' ? tour.title_id : tour.title_en;
  const description = i18n.language === 'id' ? tour.description_id : tour.description_en;

  const [isBooking, setIsBooking] = useState(false);

  const handleBookNow = async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    const totalParticipants = participants.reduce((s, p) => s + p.count, 0);
    if (totalParticipants === 0) {
      alert('Please select at least one participant');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate(`/${i18n.language}/login`);
      return;
    }

    setIsBooking(true);
    try {
      const participantArray = participants.filter(p => p.count > 0);

      const { data: bookingId, error } = await supabase.rpc('reserve_slots', {
        p_tour_id: tour.id,
        p_date: selectedDate,
        p_participants: participantArray,
        p_customer_id: user.id
      });

      if (error) throw error;

      navigate(`/${i18n.language}/checkout/${tour.id}?date=${selectedDate}&p=${JSON.stringify(participantArray)}&bid=${bookingId}`);
    } catch (error: any) {
      console.error('Booking failed:', error);
      alert(error.message || 'Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="bg-white pb-32">
      <Helmet>
        <title>{title} | TourSphere</title>
        <meta name="description" content={description?.substring(0, 160)} />
        <meta property="og:title" content={`${title} | TourSphere`} />
        <meta property="og:description" content={description?.substring(0, 160)} />
        <meta property="og:image" content={primaryImage} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": title,
            "image": images,
            "description": description,
            "offers": {
              "@type": "Offer",
              "priceCurrency": "USD",
              "price": tour.base_price_usd
            }
          })}
        </script>
      </Helmet>
      
      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 h-[70vh] gap-2 p-2">
        <div className="h-full rounded-3xl overflow-hidden">
          <img src={primaryImage} className="w-full h-full object-cover" alt={title} />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2 h-full">
          <div className="rounded-3xl overflow-hidden">
            <img src={images[1] || primaryImage} className="w-full h-full object-cover" alt={title} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-3xl overflow-hidden">
              <img src={images[2] || primaryImage} className="w-full h-full object-cover" alt={title} />
            </div>
            <div className="rounded-3xl overflow-hidden bg-slate-900 flex items-center justify-center text-white font-black text-2xl">
              + {Math.max(0, images.length - 3)} Photos
            </div>
          </div>
        </div>
      </div>

      <Container className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-20">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                {tour.difficulty}
              </span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-black">4.9 (120 reviews)</span>
              </div>
            </div>
            <h1 className="text-6xl font-black text-slate-900 leading-tight tracking-tighter">
              {title}
            </h1>
            <div className="flex flex-wrap gap-10 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tour.duration')}</div>
                  <div className="font-bold text-slate-900">{Math.round(tour.duration_minutes / 1440)} Days</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tour.group_size')}</div>
                  <div className="font-bold text-slate-900">Up to {tour.max_participants} People</div>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-3xl font-black text-slate-900 mb-6">{t('tour.about_expedition')}</h2>
            <p className="text-slate-600 text-xl leading-relaxed font-medium">
              {description}
            </p>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-900">{t('tour.whats_included')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                'Professional local guides',
                'All transportation during the tour',
                'Premium accommodation',
                'Most meals and snacks',
                'Specialized equipment',
                'National park entrance fees'
              ].map(item => (
                <div key={item} className="flex items-center gap-4 text-slate-600 font-bold">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-10 space-y-10">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('tour.price_per_person')}</div>
                <div className="text-5xl font-black text-slate-900">${tour.base_price_usd}</div>
              </div>
              <div className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-lg">Best Value</div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Select Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                {participants.map((p, idx) => (
                  <div key={p.type} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="font-bold capitalize">{p.type}</span>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          const newP = [...participants];
                          newP[idx].count = Math.max(0, newP[idx].count - 1);
                          setParticipants(newP);
                        }}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black"
                      >-</button>
                      <span className="font-black w-4 text-center">{p.count}</span>
                      <button 
                        onClick={() => {
                          const newP = [...participants];
                          newP[idx].count += 1;
                          setParticipants(newP);
                        }}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black"
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>

              {priceData && (
                <div className="pt-6 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between font-black text-2xl">
                    <span>{t('checkout.total')}</span>
                    <span>${priceData.total}</span>
                  </div>
                </div>
              )}

              <button 
                onClick={handleBookNow}
                disabled={isBooking}
                className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
              >
                {isBooking ? <Loader2 className="animate-spin" /> : <>{t('tour.book_expedition')} <CheckCircle2 className="w-6 h-6" /></>}
              </button>
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-6">
              <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <span>Free cancellation up to 30 days before</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TourDetailPage;
