import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import RoleGuard from '../components/RoleGuard';

// Public Pages
const HomePage = React.lazy(() => import('../features/home/pages/HomePage'));
const TourListingPage = React.lazy(() => import('../features/tours/pages/TourListingPage'));
const TourDetailPage = React.lazy(() => import('../features/tours/pages/TourDetailPage'));
const CheckoutPage = React.lazy(() => import('../features/booking/pages/CheckoutPage'));
const LoginPage = React.lazy(() => import('../features/auth/pages/LoginPage'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('../features/admin/pages/AdminDashboard'));
const AnalyticsDashboard = React.lazy(() => import('../features/admin/pages/AnalyticsDashboard'));
const TourEditor = React.lazy(() => import('../features/admin/pages/TourEditor'));

const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/:lang" element={<HomePage />} />
          
          <Route path="/tours" element={<TourListingPage />} />
          <Route path="/:lang/tours" element={<TourListingPage />} />
          
          <Route path="/tours/:slug" element={<TourDetailPage />} />
          <Route path="/:lang/tours/:slug" element={<TourDetailPage />} />
          
          <Route path="/checkout/:tourId" element={<CheckoutPage />} />
          <Route path="/:lang/checkout/:tourId" element={<CheckoutPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/:lang/login" element={<LoginPage />} />
          
          <Route path="/about" element={<div className="p-20 text-center font-black text-4xl">About Us</div>} />
          <Route path="/contact" element={<div className="p-20 text-center font-black text-4xl">Contact Us</div>} />
        </Route>

        {/* Admin Routes */}
        <Route element={<RoleGuard requiredRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="tours/create" element={<TourEditor />} />
            <Route path="tours/edit/:id" element={<TourEditor />} />
            <Route path="bookings" element={<div className="p-10 font-black text-3xl">Bookings Management</div>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
