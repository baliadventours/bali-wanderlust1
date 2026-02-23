
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
// @ts-ignore - Suppressing QueryClient import error which can occur in some environments
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './providers/AuthProvider';
import { PublicLayout, DashboardLayout } from './components/layout/Layouts';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Loader2, ArrowRight } from 'lucide-react';
import { useTours } from './src/features/tours/hooks/useTours';
import { useBlog } from './src/features/blog/hooks/useBlog';
import { TourCard } from './src/features/tours/components/TourCard';
import { LoginForm, RegisterForm } from './src/features/auth/components/AuthForms';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    },
  },
});

// Lazy Loaded Features
const TourListingPage = lazy(() => import('./src/features/tours/components/TourListingPage').then(m => ({ default: m.TourListingPage })));
const TourDetailPage = lazy(() => import('./src/features/tours/components/TourDetailPage').then(m => ({ default: m.TourDetailPage })));
const BlogListingPage = lazy(() => import('./src/features/placeholders').then(m => ({ default: m.BlogListingPage })));
const CheckoutPage = lazy(() => import('./src/features/booking/components/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const BookingSuccessPage = lazy(() => import('./src/features/booking/components/BookingSuccessPage').then(m => ({ default: m.BookingSuccessPage })));
const MyBookings = lazy(() => import('./src/features/customer/components/MyBookings').then(m => ({ default: m.MyBookings })));
const SettingsPage = lazy(() => import('./src/features/placeholders').then(m => ({ default: m.SettingsPage })));

// Lazy Loaded Admin
const AdminOverview = lazy(() => import('./src/features/admin/components/AdminOverview').then(m => ({ default: m.AdminOverview })));
const TourManagement = lazy(() => import('./src/features/placeholders').then(m => ({ default: m.TourManagement })));
const TourEditor = lazy(() => import('./src/features/placeholders').then(m => ({ default: m.TourEditor })));
const BookingManagement = lazy(() => import('./src/features/placeholders').then(m => ({ default: m.BookingManagement })));
const UserManagement = lazy(() => import('./src/features/placeholders').then(m => ({ default: m.UserManagement })));
const CategoryManagement = lazy(() => import('./src/features/placeholders').then(m => ({ default: m.CategoryManagement })));
const DestinationManagement = lazy(() => import('./src/features/placeholders').then(m => ({ default: m.DestinationManagement })));
const FactManagement = lazy(() => import('./src/features/placeholders').then(m => ({ default: m.FactManagement })));
const BlogManagement = lazy(() => import('./src/features/placeholders').then(m => ({ default: m.BlogManagement })));
const BlogEditor = lazy(() => import('./src/features/placeholders').then(m => ({ default: m.BlogEditor })));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
  </div>
);

const Home = () => {
  const { data: toursData, isLoading: toursLoading } = useTours({});
  const { data: posts, isLoading: postsLoading } = useBlog();

  if (toursLoading && !toursData) return <LoadingFallback />;

  return (
    <div className="space-y-24 pb-20">
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover brightness-75 scale-105" 
            alt="Hero" 
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tight drop-shadow-2xl">
            Adventures <span className="text-emerald-400">Untamed.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-100 mb-12 max-w-2xl mx-auto font-medium drop-shadow-lg">
            Curated premium experiences across the world's most breathtaking landscapes. Your journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/tours" className="bg-emerald-600 text-white px-10 py-5 rounded-[10px] font-black text-lg hover:bg-emerald-700 shadow-2xl transition-all transform hover:-translate-y-1 flex items-center gap-2">
              Browse Expeditions <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/blog" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-[10px] font-black text-lg hover:bg-white/20 shadow-sm transition-all">
              Travel Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">Popular Expeditions</h2>
            <p className="text-slate-500 font-medium text-lg">Hand-picked adventures by our local experts.</p>
          </div>
          <Link to="/tours" className="hidden md:flex items-center gap-2 text-emerald-600 font-bold hover:translate-x-2 transition-transform">
            View All <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {toursData?.data?.slice(0, 3).map(tour => (
            <TourCard key={tour.id} tour={tour} />
          ))}
          {!toursLoading && (!toursData?.data || toursData.data.length === 0) && (
             <div className="col-span-full py-20 text-center text-slate-400 font-bold">No expeditions found matching your selection.</div>
          )}
        </div>
      </section>

      {/* Stats/Proof */}
      <section className="bg-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Destinations', val: '24+' },
            { label: 'Curated Tours', val: '150+' },
            { label: 'Happy Travelers', val: '12k+' },
            { label: 'Avg Rating', val: '4.9/5' }
          ].map(s => (
            <div key={s.label}>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">{s.val}</div>
              <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Teaser */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Wanderlust Journal</h2>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">Get the latest travel tips, gear reviews, and stories from the field.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {posts?.slice(0, 3).map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group space-y-4">
              <div className="aspect-[16/10] rounded-[10px] overflow-hidden border border-slate-100 shadow-sm">
                <img src={post.featured_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={post.slug} />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{post.category}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">{post.title.en}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/tours" element={<TourListingPage />} />
                <Route path="/tours/:slug" element={<TourDetailPage />} />
                <Route path="/blog" element={<BlogListingPage />} />
                <Route path="/login" element={<div className="py-20 px-4 flex justify-center"><LoginForm /></div>} />
                <Route path="/register" element={<div className="py-20 px-4 flex justify-center"><RegisterForm /></div>} />
                <Route path="/booking/success" element={<BookingSuccessPage />} />
              </Route>

              {/* Protected User Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<PublicLayout />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                </Route>
                
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<AdminOverview />} />
                  <Route path="/dashboard/bookings" element={<MyBookings />} />
                  <Route path="/dashboard/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Admin/Editor Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'editor']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin" element={<AdminOverview />} />
                  <Route path="/admin/tours" element={<TourManagement />} />
                  <Route path="/admin/tours/create" element={<TourEditor />} />
                  <Route path="/admin/tours/:id" element={<TourEditor />} />
                  <Route path="/admin/bookings" element={<BookingManagement />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/categories" element={<CategoryManagement />} />
                  <Route path="/admin/destinations" element={<DestinationManagement />} />
                  <Route path="/admin/facts" element={<FactManagement />} />
                  <Route path="/admin/blog" element={<BlogManagement />} />
                  <Route path="/admin/blog/create" element={<BlogEditor />} />
                  <Route path="/admin/blog/:id" element={<BlogEditor />} />
                  <Route path="/admin/pricing" element={<div className="p-8">Seasonal Pricing Rules Global Management</div>} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<div className="p-20 text-center font-bold text-2xl py-40 text-slate-400">404 - Page Not Found</div>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
