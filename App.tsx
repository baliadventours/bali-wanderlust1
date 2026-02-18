
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './providers/AuthProvider';
import { PublicLayout, DashboardLayout } from './components/layout/Layouts';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { TourListingPage } from './features/tours/components/TourListingPage';
import { TourDetailPage } from './features/tours/components/TourDetailPage';
import { CheckoutPage } from './features/booking/components/CheckoutPage';
import { BookingSuccessPage } from './features/booking/components/BookingSuccessPage';

// Admin Components
import { AdminOverview } from './features/admin/components/AdminOverview';
import { TourManagement } from './features/admin/components/TourManagement';
import { TourEditor } from './features/admin/components/TourEditor';
import { BookingManagement } from './features/admin/components/BookingManagement';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Placeholder Pages
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
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
