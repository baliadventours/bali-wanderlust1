import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Users, Star, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getTourBySlug } from '../api';
import Container from '../../../components/Container';

const TourDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour', slug],
    queryFn: () => getTourBySlug(slug!)
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

  return (
    <div className="bg-white pb-32">
      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 h-[70vh] gap-2 p-2">
        <div className="h-full rounded-3xl overflow-hidden">
          <img src={primaryImage} className="w-full h-full object-cover" alt={tour.title.en} />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2 h-full">
          <div className="rounded-3xl overflow-hidden">
            <img src={images[1] || primaryImage} className="w-full h-full object-cover" alt={tour.title.en} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-3xl overflow-hidden">
              <img src={images[2] || primaryImage} className="w-full h-full object-cover" alt={tour.title.en} />
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
              {tour.title.en}
            </h1>
            <div className="flex flex-wrap gap-10 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</div>
                  <div className="font-bold text-slate-900">{Math.round(tour.duration_minutes / 1440)} Days</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Group Size</div>
                  <div className="font-bold text-slate-900">Up to {tour.max_participants} People</div>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-3xl font-black text-slate-900 mb-6">About this expedition</h2>
            <p className="text-slate-600 text-xl leading-relaxed font-medium">
              {tour.description?.en}
            </p>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-900">What's included</h2>
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
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price per person</div>
                <div className="text-5xl font-black text-slate-900">${tour.base_price_usd}</div>
              </div>
              <div className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-lg">Best Value</div>
            </div>

            <Link 
              to={`/checkout/${tour.id}`} 
              className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
            >
              Book Expedition
            </Link>

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
