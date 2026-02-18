
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './providers/AuthProvider';
import { PublicLayout, DashboardLayout } from './components/layout/Layouts';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
    },
  },
});

// Lazy Loaded Features
const TourListingPage = lazy(() => import('./features/tours/components/TourListingPage').then(m => ({ default: m.TourListingPage })));
const TourDetailPage = lazy(() => import('./features/tours/components/TourDetailPage').then(m => ({ default: m.TourDetailPage })));
const CheckoutPage = lazy(() => import('./features/booking/components/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const BookingSuccessPage = lazy(() => import('./features/booking/components/BookingSuccessPage').then(m => ({ default: m.BookingSuccessPage })));

// Lazy Loaded Admin
const AdminOverview = lazy(() => import('./features/admin/components/AdminOverview').then(m => ({ default: m.AdminOverview })));
const TourManagement = lazy(() => import('./features/admin/components/TourManagement').then(m => ({ default: m.TourManagement })));
const TourEditor = lazy(() => import('./features/admin/components/TourEditor').then(m => ({ default: m.TourEditor })));
const BookingManagement = lazy(() => import('./features/admin/components/BookingManagement').then(m => ({ default: m.BookingManagement })));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
  </div>
);

const Home = () => (
  <div className="max-w-7xl mx-auto px-4 py-20 text-center">
    <h1 className="text-6xl font-extrabold text-slate-900 mb-6 leading-tight">Your Next <span className="text-indigo-600 underline decoration-indigo-200">Adventure</span> Starts Here.</h1>
    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">Explore premium curated tours and unforgettable experiences tailored to your dreams. Discover the world's best destinations.</p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link to="/tours" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-xl transition-all transform hover:-translate-y-1">Browse All Tours</Link>
      <Link to="/register" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 shadow-sm transition-all">Create Account</Link>
    </div>
  </div>
);

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
                <Route path="/login" element={<div className="p-20 text-center">Login Page Placeholder</div>} />
                <Route path="/register" element={<div className="p-20 text-center">Registration Page Placeholder</div>} />
                <Route path="/booking/success" element={<BookingSuccessPage />} />
              </Route>

              {/* Protected User Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<PublicLayout />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                </Route>
                
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<AdminOverview />} />
                  <Route path="/dashboard/bookings" element={<div className="p-8">My Bookings List (Customer View)</div>} />
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
